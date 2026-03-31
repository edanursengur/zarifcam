using Dapper;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;
using ZarifCam.Dtos.AnaSayfa;
using ZarifCam.Dtos.Kampanya;
using ZarifCam.Models;
using ZarifCam.Services.Interfaces;
using Microsoft.Data.SqlClient;
namespace KampanyaYonetim.Services
{
    
    public class KampanyaService : IKampanyaService
    {
        private readonly string _connectionString;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public KampanyaService(IConfiguration configuration, IHttpContextAccessor httpContextAccessor)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
            _httpContextAccessor = httpContextAccessor;
        }

        private SqlConnection CreateConnection()
        {
            var connection = new SqlConnection(_connectionString);
            connection.Open();
            return connection;
        }

        // Tüm kampanyaları getir
        public async Task<IEnumerable<Kampanyalar>> GetAllKampanyalarAsync()
        {
            using (var connection = CreateConnection())
            {
                var sql = @"
                    SELECT k.*, kt.* 
                    FROM Kampanyalar k
                    LEFT JOIN KampanyaTipleri kt ON k.TipID = kt.TipID
                    WHERE k.AktifMi = 1
                    ORDER BY k.OlusturulmaTarihi DESC";

                var kampanyaDict = new Dictionary<int, Kampanyalar>();

                var kampanyalar = await connection.QueryAsync<Kampanyalar, KampanyaTipi, Kampanyalar>(
                    sql,
                    (kampanya, tip) =>
                    {
                        if (!kampanyaDict.TryGetValue(kampanya.KampanyaID, out var existingKampanya))
                        {
                            existingKampanya = kampanya;
                            existingKampanya.KampanyaTipi = tip;
                            kampanyaDict.Add(existingKampanya.KampanyaID, existingKampanya);
                        }
                        return existingKampanya;
                    },
                    splitOn: "TipID"
                );

                return kampanyaDict.Values.ToList();
            }
        }

        // ID'ye göre kampanya getir
        public async Task<Kampanyalar> GetKampanyaByIdAsync(int id)
        {
            using (var connection = CreateConnection())
            {
                var sql = @"
                    SELECT * FROM Kampanyalar WHERE KampanyaID = @Id;
                    
                    SELECT * FROM KampanyaKurallar 
                    WHERE KampanyaID = @Id AND AktifMi = 1 
                    ORDER BY Oncelik;
                    
                    SELECT * FROM KampanyaKartlari 
                    WHERE KampanyaID = @Id AND AktifMi = 1 
                    ORDER BY SiraNo;
                    
                    SELECT * FROM KampanyaEtki 
                    WHERE KampanyaID = @Id;";

                using (var multi = await connection.QueryMultipleAsync(sql, new { Id = id }))
                {
                    var kampanya = await multi.ReadSingleOrDefaultAsync<Kampanyalar>();
                    if (kampanya != null)
                    {
                        kampanya.Kurallar = (await multi.ReadAsync<KampanyaKurallar>()).ToList();
                        kampanya.Kartlar = (await multi.ReadAsync<KampanyaKartlari>()).ToList();
                    }
                    return kampanya;
                }
            }
        }

        // Yeni kampanya oluştur
        public async Task<int> CreateKampanyaAsync(KampanyaOlusturDTO kampanyaDto)
        {
            using (var connection = CreateConnection())
            using (var transaction = connection.BeginTransaction())
            {
                try
                {
                    // Ana kampanya kaydı
                    var kampanyaSql = @"
                        INSERT INTO Kampanyalar (Ad, TipID, BaslangicTarihi, BitisTarihi, AktifMi, 
                                                OlusturulmaTarihi, GorselUrl, Link, Tip)
                        VALUES (@Ad, @TipID, @BaslangicTarihi, @BitisTarihi, @AktifMi, 
                                GETDATE(), @GorselUrl, @Link, @TipID);
                        SELECT CAST(SCOPE_IDENTITY() as int);";

                    var kampanyaId = await connection.ExecuteScalarAsync<int>(
                        kampanyaSql,
                        new
                        {
                            kampanyaDto.Ad,
                            kampanyaDto.TipID,
                            kampanyaDto.BaslangicTarihi,
                            kampanyaDto.BitisTarihi,
                            kampanyaDto.AktifMi,
                            kampanyaDto.GorselUrl,
                            kampanyaDto.Link,
                           
                        },
                        transaction
                    );

                    // Kampanya kurallarını ekle
                    if (kampanyaDto.Kurallar != null && kampanyaDto.Kurallar.Any())
                    {
                        foreach (var kural in kampanyaDto.Kurallar)
                        {
                            await AddKampanyaKuralInternal(connection, transaction, kampanyaId, kural);
                        }
                    }

                    // Kampanya kartlarını ekle
                    if (kampanyaDto.Kartlar != null && kampanyaDto.Kartlar.Any())
                    {
                        int siraNo = 1;
                        foreach (var kart in kampanyaDto.Kartlar)
                        {
                            await AddKampanyaKartInternal(connection, transaction, kampanyaId, kart, siraNo++);
                        }
                    }

                    // Ürünleri KampanyaEtki tablosuna ekle
                    if (kampanyaDto.UrunIDs != null && kampanyaDto.UrunIDs.Any())
                    {
                        await AddUrunlerToKampanyaInternal(connection, transaction, kampanyaId, kampanyaDto.UrunIDs);
                    }

                    transaction.Commit();
                    return kampanyaId;
                }
                catch
                {
                    transaction.Rollback();
                    throw;
                }
            }
        }

        // Kampanya güncelle
        public async Task<bool> UpdateKampanyaAsync(Kampanyalar kampanya)
        {
            using (var connection = CreateConnection())
            {
                var sql = @"
                    UPDATE Kampanyalar 
                    SET Ad = @Ad, 
                        TipID = @TipID, 
                        BaslangicTarihi = @BaslangicTarihi, 
                        BitisTarihi = @BitisTarihi, 
                        AktifMi = @AktifMi, 
                        GorselUrl = @GorselUrl, 
                        Link = @Link,
                        Tip = @Tip
                    WHERE KampanyaID = @KampanyaID";

                var affectedRows = await connection.ExecuteAsync(sql, kampanya);
                return affectedRows > 0;
            }
        }

        // Kampanya sil (soft delete)
        public async Task<bool> DeleteKampanyaAsync(int id)
        {
            using (var connection = CreateConnection())
            using (var transaction = connection.BeginTransaction())
            {
                try
                {
                    // Ana kampanyayı pasif yap
                    var kampanyaSql = "UPDATE Kampanyalar SET AktifMi = 0 WHERE KampanyaID = @Id";
                    await connection.ExecuteAsync(kampanyaSql, new { Id = id }, transaction);

                    // İlişkili kuralları pasif yap
                    var kuralSql = "UPDATE KampanyaKurallar SET AktifMi = 0 WHERE KampanyaID = @Id";
                    await connection.ExecuteAsync(kuralSql, new { Id = id }, transaction);

                    // İlişkili kartları pasif yap
                    var kartSql = "UPDATE KampanyaKartlari SET AktifMi = 0 WHERE KampanyaID = @Id";
                    await connection.ExecuteAsync(kartSql, new { Id = id }, transaction);

                    transaction.Commit();
                    return true;
                }
                catch
                {
                    transaction.Rollback();
                    throw;
                }
            }
        }

        // Tüm kampanya tiplerini getir
        public async Task<IEnumerable<KampanyaTipi>> GetAllKampanyaTipleriAsync()
        {
            using (var connection = CreateConnection())
            {
                var sql = "SELECT * FROM KampanyaTipleri WHERE AktifMi = 1 ORDER BY SiraNo";
                return await connection.QueryAsync<KampanyaTipi>(sql);
            }
        }

        // Ürünleri getir (örnek - kendi ürün tablonuza göre düzenleyin)
        public async Task<IEnumerable<UrunDTO>> GetUrunlerAsync()
        {
            using (var connection = CreateConnection())
            {
                var sql = @"
            SELECT 
                TabloID,
                TabloID as UrunID,
                Ad as UrunAdi,
                Slug,
                KisaAciklama,
                Aciklama,
                AktifMi,
                KategoriId,
                ModelKodu,
                PaketMi,
                PaketAdeti,
                PaketIcerigi,
                OlusturulmaTarihi,
                GuncellemeTarihi
            FROM Urunler  -- Tablo adınızı kontrol edin
            WHERE AktifMi = 1
            ORDER BY Ad";

                try
                {
                    var result = await connection.QueryAsync<UrunDTO>(sql);
                    return result;
                }
                catch (SqlException ex)
                {
                    // Hata detaylarını görmek için
                    throw new Exception($"SQL Hatası: {ex.Message}. Tablo adını ve kolonları kontrol edin.", ex);
                }
            }
        }

        // Kampanya kurallarını getir
        public async Task<IEnumerable<KampanyaKurallar>> GetKampanyaKurallariAsync(int kampanyaId)
        {
            using (var connection = CreateConnection())
            {
                var sql = @"
                    SELECT k.*, u.UrunAdi 
                    FROM KampanyaKurallar k
                    LEFT JOIN Urunler u ON k.UrunID = u.UrunID
                    WHERE k.KampanyaID = @KampanyaId AND k.AktifMi = 1 
                    ORDER BY k.Oncelik";

                return await connection.QueryAsync<KampanyaKurallar>(sql, new { KampanyaId = kampanyaId });
            }
        }

        // Kampanya kartlarını getir
        public async Task<IEnumerable<KampanyaKartlari>> GetKampanyaKartlariAsync(int kampanyaId)
        {
            using (var connection = CreateConnection())
            {
                var sql = @"
                    SELECT * FROM KampanyaKartlari 
                    WHERE KampanyaID = @KampanyaId AND AktifMi = 1 
                    ORDER BY SiraNo";

                return await connection.QueryAsync<KampanyaKartlari>(sql, new { KampanyaId = kampanyaId });
            }
        }

        // Kampanyaya ürün ekle
        public async Task<bool> KampanyaUrunEkleAsync(int kampanyaId, List<int> urunIds)
        {
            using (var connection = CreateConnection())
            using (var transaction = connection.BeginTransaction())
            {
                try
                {
                    await AddUrunlerToKampanyaInternal(connection, transaction, kampanyaId, urunIds);
                    transaction.Commit();
                    return true;
                }
                catch
                {
                    transaction.Rollback();
                    return false;
                }
            }
        }

        // Kampanyaya kural ekle
        public async Task<bool> KampanyaKuralEkleAsync(int kampanyaId, KampanyaKuralDTO kural)
        {
            using (var connection = CreateConnection())
            using (var transaction = connection.BeginTransaction())
            {
                try
                {
                    await AddKampanyaKuralInternal(connection, transaction, kampanyaId, kural);
                    transaction.Commit();
                    return true;
                }
                catch
                {
                    transaction.Rollback();
                    return false;
                }
            }
        }

        // Kampanyaya kart ekle
        public async Task<bool> KampanyaKartEkleAsync(int kampanyaId, KampanyaKartDTO kart)
        {
            using (var connection = CreateConnection())
            using (var transaction = connection.BeginTransaction())
            {
                try
                {
                    // Mevcut maksimum SiraNo'yu bul
                    var maxSiraSql = "SELECT ISNULL(MAX(SiraNo), 0) + 1 FROM KampanyaKartlari WHERE KampanyaID = @KampanyaId";
                    var siraNo = await connection.ExecuteScalarAsync<int>(maxSiraSql, new { KampanyaId = kampanyaId }, transaction);

                    await AddKampanyaKartInternal(connection, transaction, kampanyaId, kart, siraNo);
                    transaction.Commit();
                    return true;
                }
                catch
                {
                    transaction.Rollback();
                    return false;
                }
            }
        }

        #region Private Methods

        private async Task AddKampanyaKuralInternal(SqlConnection connection, SqlTransaction transaction, int kampanyaId, KampanyaKuralDTO kural)
        {
            var kuralSql = @"
                INSERT INTO KampanyaKurallar (KampanyaID, UrunID, KoleksiyonID, MinAdet, 
                                             IndirimTutar, IndirimOrani, Oncelik, AktifMi)
                VALUES (@KampanyaID, @UrunID, @KoleksiyonID, @MinAdet, 
                        @IndirimTutar, @IndirimOrani, @Oncelik, 1)";

            await connection.ExecuteAsync(
                kuralSql,
                new
                {
                    KampanyaID = kampanyaId,
                    UrunID = kural.UrunID,
                    KoleksiyonID = kural.KoleksiyonID,
                    MinAdet = kural.MinAdet,
                    IndirimTutar = kural.IndirimTutar,
                    IndirimOrani = kural.IndirimOrani,
                    Oncelik = kural.Oncelik
                },
                transaction
            );
        }

        private async Task AddKampanyaKartInternal(SqlConnection connection, SqlTransaction transaction, int kampanyaId, KampanyaKartDTO kart, int siraNo)
        {
            var kartSql = @"
        INSERT INTO KampanyaKartlari (KampanyaID, Baslik, Aciklama, ButonYazi, ButonLink, 
                                     ArkaplanResim, OnplanResim, ArkaplanRengi, GeriSayimBaslangic, 
                                     GeriSayimBitis, KategoriID, UrunID, IndirimOrani, SiraNo, AktifMi)
        VALUES (@KampanyaID, @Baslik, @Aciklama, @ButonYazi, @ButonLink, 
                @ArkaplanResim, @OnplanResim, @ArkaplanRengi, @GeriSayimBaslangic, 
                @GeriSayimBitis, @KategoriID, @UrunID, @IndirimOrani, @SiraNo, 1)";

            await connection.ExecuteAsync(
                kartSql,
                new
                {
                    KampanyaID = kampanyaId,
                    Baslik = kart.Baslik,        // @Baslik parametresi için
                    kart.Aciklama,                // @Aciklama
                    kart.ButonYazi,                // @ButonYazi
                    kart.ButonLink,                // @ButonLink
                    kart.ArkaplanResim,            // @ArkaplanResim
                    kart.OnplanResim,              // @OnplanResim
                    kart.ArkaplanRengi,            // @ArkaplanRengi
                    kart.GeriSayimBaslangic,       // @GeriSayimBaslangic
                    kart.GeriSayimBitis,           // @GeriSayimBitis
                    kart.KategoriID,                // @KategoriID
                    kart.UrunID,                    // @UrunID
                    kart.IndirimOrani,              // @IndirimOrani
                    SiraNo = siraNo                  // @SiraNo
                },
                transaction
            );
        }
        private async Task AddUrunlerToKampanyaInternal(SqlConnection connection, SqlTransaction transaction, int kampanyaId, List<int> urunIds)
        {
            var etkiSql = @"
                IF NOT EXISTS (SELECT 1 FROM KampanyaEtki WHERE KampanyaID = @KampanyaID AND UrunID = @UrunID)
                BEGIN
                    INSERT INTO KampanyaEtki (KampanyaID, UrunID, SatilanAdet, ToplamIndirim, KarFarki)
                    VALUES (@KampanyaID, @UrunID, 0, 0, 0)
                END";

            foreach (var urunId in urunIds)
            {
                await connection.ExecuteAsync(
                    etkiSql,
                    new { KampanyaID = kampanyaId, UrunID = urunId },
                    transaction
                );
            }
        }

        #endregion
    }
}