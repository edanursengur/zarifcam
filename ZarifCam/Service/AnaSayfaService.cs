using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Newtonsoft.Json;
using System.Data;
using System.Security.Claims;
using ZarifCam.Dtos.AnaSayfa;
using ZarifCam.IService;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;

namespace ZarifCam.Service
{
    // IAnaSayfaService.cs

    public class AnaSayfaService : IAnaSayfaService
    {
        private readonly string _connectionString;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public AnaSayfaService(IConfiguration configuration, IHttpContextAccessor httpContextAccessor)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection");
            _httpContextAccessor = httpContextAccessor;
        }
        // Helper method - Connection oluştur
        private SqlConnection CreateConnection()
        {
            var connection = new SqlConnection(_connectionString);
            connection.Open();
            return connection;
        }
        // 1. Hero Slider
        public async Task<List<HeroSliderDTO>> HeroSliderlariGetirAsync()
        {
            const string sql = @"
            SELECT 
                Id,
                Baslik,
                Aciklama,
                ButonText,
                ButonLink,
                MedyaUrl,
                CASE 
                    WHEN MedyaUrl LIKE '%.mp4%' OR MedyaUrl LIKE '%.webm%' THEN 'video'
                    ELSE 'image'
                END AS MedyaTipi,
                Sira
            FROM HeroSlider
            WHERE AktifMi = 1
            ORDER BY Sira";
            using var connection = CreateConnection();
            return (await connection.QueryAsync<HeroSliderDTO>(sql)).ToList();
        }

        // 2. Hızlı Erişim İkonları
        public async Task<List<HizliErisimDTO>> HizliErisimleriGetirAsync()
        {
            const string sql = @"
SELECT 
    IkonID,
    Ikon,
    Baslik,
    Aciklama,
    Link,
    SiraNo,
    ArkaplanResim
FROM HizliErisimIkonlari
WHERE AktifMi = 1
ORDER BY SiraNo";

            using var connection = CreateConnection();
            return (await connection.QueryAsync<HizliErisimDTO>(sql)).ToList();
        }
        // 3. Kategoriler (Slider için)
        public async Task<List<KategoriDTO>> AnaSayfaKategorileriniGetirAsync()
        {
            const string sql = @"
            SELECT 
                k.TabloID,
                k.Ad,
                k.Slug,
                k.GorselUrl,
                (SELECT COUNT(*) FROM Urunler u WHERE u.KategoriId = k.TabloID AND u.AktifMi = 1) AS UrunSayisi
            FROM Kategori k
            WHERE k.AktifMi = 1 
                AND k.AnaSayfadaGoster = 1
            ORDER BY k.Sira";
            using var connection = CreateConnection();

            return (await connection.QueryAsync<KategoriDTO>(sql)).ToList();
        }

        // 4. Öne Çıkan Ürünler
        public async Task<List<UrunDTO>> OneCikanUrunleriGetirAsync(int adet = 12)
        {
            const string sql = @"
            SELECT TOP (@adet)
                u.TabloID,
                u.Ad,
                u.Slug,
                u.KisaAciklama,
                k.Ad AS KategoriAd,
                u.KategoriId,
                u.OlusturulmaTarihi,
                -- Ana görsel
                (SELECT TOP 1 GorselUrl FROM UrunMedyalari WHERE UrunId = u.TabloID AND AnaGorselMi = 1) AS AnaGorsel,
                -- Hover görsel
                (SELECT TOP 1 GorselUrl FROM UrunMedyalari WHERE UrunId = u.TabloID AND HoverGorselMi = 1) AS HoverGorsel,
                -- Fiyat
                (SELECT TOP 1 Fiyat FROM UrunFiyatlari WHERE UrunId = u.TabloID AND AktifMi = 1 ORDER BY TabloID DESC) AS Fiyat,
                -- İndirimli fiyat
                (SELECT TOP 1 IndirimliFiyat FROM UrunFiyatlari WHERE UrunId = u.TabloID AND AktifMi = 1 AND IndirimliFiyat IS NOT NULL) AS IndirimliFiyat,
                -- Stok kontrolü
                CASE 
                    WHEN EXISTS (SELECT 1 FROM UrunStok WHERE UrunID = u.TabloID AND MevcutAdet > 0) THEN 1
                    ELSE 0
                END AS StoktaVar
            FROM Urunler u
            INNER JOIN Kategori k ON u.KategoriId = k.TabloID
            WHERE u.AktifMi = 1 
                AND u.AnaSayfadaOneCikanMi = 1
            ORDER BY u.OlusturulmaTarihi DESC";
            using var connection = CreateConnection();

            return (await connection.QueryAsync<UrunDTO>(sql, new { adet })).ToList();
        }

        // 5. Vurgulu Kategori
        public async Task<List<VurguluKategoriDTO>> VurguluKategorileriGetirAsync()
        {
            const string sql = @"
    SELECT 
        v.IcerikID,
        v.KoleksiyonAdi AS Baslik,
        v.Aciklama,
        b.ButonYazi,
        b.ButonLink,
        v.ResimUrl,
        v.VideoUrl,
        v.ArkaplanRengi,
        v.KategoriID,
        k.Ad AS KategoriAd,
        b.AltBaslik,
        v.SiraNo
    FROM VurguluKategoriIcerikleri v
    INNER JOIN AnaSayfaBolumleri b ON v.BolumID = b.BolumID
    LEFT JOIN Kategori k ON v.KategoriID = k.TabloID
    WHERE v.AktifMi = 1
        AND b.AktifMi = 1
        AND (b.BaslangicTarihi IS NULL OR b.BaslangicTarihi <= GETDATE())
        AND (b.BitisTarihi IS NULL OR b.BitisTarihi >= GETDATE())
    ORDER BY v.SiraNo";  // TOP 1 kaldırıldı

            using var connection = CreateConnection();
            var results = await connection.QueryAsync<VurguluKategoriDTO>(sql);

            // Liste döndür
            return results.ToList();
        }
        // 6. Instagram Gönderileri
        public async Task<List<InstagramGonderiDTO>> InstagramGonderileriniGetirAsync(int adet = 8)
        {
            const string sql = @"
            SELECT TOP (@adet)
                GonderiID,
                InstagramGonderiID,
                GonderiTipi,
                KapakResim,
                VideoUrl,
                Link,
                BegeniSayisi,
                YorumSayisi,
                LEFT(Aciklama, 100) AS KisaAciklama
            FROM InstagramGonderileri
            WHERE AktifMi = 1
                AND BolumID IN (SELECT BolumID FROM AnaSayfaBolumleri WHERE BolumTipi = 'instagram')
            ORDER BY OtomatikOncelik DESC, YayinTarihi DESC";
            using var connection = CreateConnection();

            var gonderiler = (await connection.QueryAsync<InstagramGonderiDTO>(sql, new { adet })).ToList();

            // Etiketleri parse et
            foreach (var gonderi in gonderiler)
            {
                const string etiketSql = @"
                SELECT JSON_VALUE(value, '$') AS Etiket
                FROM OPENJSON((SELECT Etiketler FROM InstagramGonderileri WHERE GonderiID = @GonderiID))
                WHERE JSON_VALUE(value, '$') IS NOT NULL";


                var etiketler = await connection.QueryAsync<string>(etiketSql, new { gonderi.GonderiID });
                gonderi.Etiketler = etiketler.ToList();
            }

            return gonderiler;
        }

        // 7. Kişisel Öneriler
        public async Task<List<UrunDTO>> KisiselOnerileriGetirAsync(int? kullaniciId, int adet = 6)
        {
            if (!kullaniciId.HasValue)
            {
                // Kullanıcı giriş yapmamışsa popüler ürünleri göster
                return await PopulerUrunleriGetirAsync(adet);
            }

            using var connection = CreateConnection();

            const string sql = @"
            EXEC sp_KisiselOnerileriGetir @KullaniciID = @kullaniciId, @Limit = @adet";

            var urunler = await connection.QueryAsync<UrunDTO>(sql, new { kullaniciId, adet });

            // Ürün görsellerini ve fiyatlarını ekle
            return await UrunDetaylariylaDoldurAsync(urunler.ToList());
        }

        private async Task<List<UrunDTO>> PopulerUrunleriGetirAsync(int adet)
        {
            const string sql = @"
            SELECT TOP (@adet)
                u.TabloID,
                u.Ad,
                u.Slug,
                u.KisaAciklama,
                k.Ad AS KategoriAd,
                u.KategoriId,
                u.OlusturulmaTarihi,
                (SELECT COUNT(*) FROM Siparisler s WHERE s.UrunID = u.TabloID) AS SiparisSayisi
            FROM Urunler u
            INNER JOIN Kategori k ON u.KategoriId = k.TabloID
            WHERE u.AktifMi = 1
            ORDER BY (SELECT COUNT(*) FROM Siparisler s WHERE s.UrunID = u.TabloID) DESC";
            using var connection = CreateConnection();

            var urunler = await connection.QueryAsync<UrunDTO>(sql, new { adet });
            return await UrunDetaylariylaDoldurAsync(urunler.ToList());
        }

        private async Task<List<UrunDTO>> UrunDetaylariylaDoldurAsync(List<UrunDTO> urunler)
        {
            if (!urunler.Any()) return urunler;

            var urunIds = urunler.Select(u => u.TabloID).ToList();

            // Görselleri getir
            const string gorselSql = @"
            SELECT 
                UrunId,
                GorselUrl,
                AnaGorselMi,
                HoverGorselMi
            FROM UrunMedyalari
            WHERE UrunId IN @urunIds
            ORDER BY UrunId, GosterimSirasi";

            using var connection = CreateConnection();

            var gorseller = await connection.QueryAsync<dynamic>(gorselSql, new { urunIds });

            // Fiyatları getir
            const string fiyatSql = @"
            SELECT 
                UrunId,
                Fiyat,
                IndirimliFiyat
            FROM UrunFiyatlari
            WHERE UrunId IN @urunIds AND AktifMi = 1";

            var fiyatlar = await connection.QueryAsync<dynamic>(fiyatSql, new { urunIds });

            foreach (var urun in urunler)
            {
                var urunGorseller = gorseller.Where(g => g.UrunId == urun.TabloID).ToList();
                urun.AnaGorsel = urunGorseller.FirstOrDefault(g => g.AnaGorselMi)?.GorselUrl;
                urun.HoverGorsel = urunGorseller.FirstOrDefault(g => g.HoverGorselMi)?.GorselUrl;

                var urunFiyat = fiyatlar.FirstOrDefault(f => f.UrunId == urun.TabloID);
                if (urunFiyat != null)
                {
                    urun.Fiyat = urunFiyat.Fiyat;
                    urun.IndirimliFiyat = urunFiyat.IndirimliFiyat;
                }
            }

            return urunler;
        }

        // 8. Kampanya Kartları
        public async Task<List<KampanyaKartDTO>> KampanyaKartlariniGetirAsync()
        {
            const string sql = @"
            SELECT 
                kk.KartID,
                kk.Baslik,
                kk.Aciklama,
                kk.ButonYazi,
                kk.ButonLink,
                kk.ArkaplanResim,
                kk.ArkaplanRengi,
                kk.KartTipi,
                kk.GeriSayimBitis,
                kk.IndirimOrani,
                kk.KategoriID,
                kat.Ad AS KategoriAd
            FROM KampanyaKartlari kk
            LEFT JOIN Kategori kat ON kk.KategoriID = kat.TabloID
            WHERE kk.AktifMi = 1
                AND kk.BolumID IN (SELECT BolumID FROM AnaSayfaBolumleri WHERE BolumTipi = 'kampanya')
                AND (kk.GeriSayimBitis IS NULL OR kk.GeriSayimBitis >= GETDATE())
            ORDER BY kk.SiraNo";
            using var connection = CreateConnection();

            return (await connection.QueryAsync<KampanyaKartDTO>(sql)).ToList();
        }

        // 9. Marka Hikayesi
        public async Task<MarkaHikayesiDTO> MarkaHikayesiniGetirAsync()
        {
            const string sql = @"
            SELECT TOP 1
                mh.HikayeID,
                mh.Baslik,
                mh.AltBaslik,
                mh.Icerik,
                mh.ResimUrl,
                mh.VideoUrl,
                mh.Buton1Yazi,
                mh.Buton1Link,
                mh.Buton2Yazi,
                mh.Buton2Link,
                mh.Yil,
                mh.UretilenUrun,
                mh.MutluMusteri
            FROM MarkaHikayesi mh
            INNER JOIN AnaSayfaBolumleri b ON mh.BolumID = b.BolumID
            WHERE mh.AktifMi = 1
                AND b.AktifMi = 1
                AND b.BolumTipi = 'marka_hikayesi'
            ORDER BY mh.SiraNo";
            using var connection = CreateConnection();

            return await connection.QueryFirstOrDefaultAsync<MarkaHikayesiDTO>(sql);
        }

        // 10. Güven Badgeleri
        public async Task<List<GuvenBadgeDTO>> GuvenBadgeleriniGetirAsync()
        {
            const string sql = @"
            SELECT 
                BadgeID,
                Ikon,
                Baslik,
                Aciklama,
                Link,
                IkonRenk,
                SiraNo
            FROM GuvenBadgeleri
            WHERE AktifMi = 1
                AND BolumID IN (SELECT BolumID FROM AnaSayfaBolumleri WHERE BolumTipi = 'guven_badgeleri')
            ORDER BY SiraNo";
            using var connection = CreateConnection();

            return (await connection.QueryAsync<GuvenBadgeDTO>(sql)).ToList();
        }

        // 11. Müşteri Yorumları
        public async Task<List<MusteriYorumDTO>> MusteriYorumlariniGetirAsync(int adet = 5)
        {
            const string sql = @"
            SELECT TOP (@adet)
                y.YorumID,
                y.MusteriAdi,
                y.MusteriUnvan,
                y.MusteriResim,
                y.Yorum,
                y.KisaYorum,
                y.Puan,
                y.Tarih,
                y.UrunID,
                u.Ad AS UrunAd
            FROM MusteriYorumlari y
            LEFT JOIN Urunler u ON y.UrunID = u.TabloID
            WHERE y.OnayliMi = 1
                AND y.OneCikanMi = 1
                AND y.BolumID IN (SELECT BolumID FROM AnaSayfaBolumleri WHERE BolumTipi = 'testimonial')
            ORDER BY y.Tarih DESC";
            using var connection = CreateConnection();

            return (await connection.QueryAsync<MusteriYorumDTO>(sql, new { adet })).ToList();
        }

        // 12. Tüm Ana Sayfa Verileri (Tek API çağrısı için)
        public async Task<AnaSayfaDTO> TumAnaSayfaVerileriniGetirAsync(int? kullaniciId = null)
        {
            // Kullanıcı ID'sini cookie'den al
            var kullaniciID = kullaniciId ?? GetKullaniciIdFromCookie();

            // Tüm verileri paralel olarak getir
            var tasks = new List<Task>
        {
            Task.Run(async () => await HeroSliderlariGetirAsync()),
            Task.Run(async () => await HizliErisimleriGetirAsync()),
            Task.Run(async () => await AnaSayfaKategorileriniGetirAsync()),
            Task.Run(async () => await OneCikanUrunleriGetirAsync()),
            //Task.Run(async () => await VurguluKategoriGetirAsync()),
            Task.Run(async () => await InstagramGonderileriniGetirAsync()),
            Task.Run(async () => await KisiselOnerileriGetirAsync(kullaniciID)),
            Task.Run(async () => await KampanyaKartlariniGetirAsync()),
            Task.Run(async () => await MarkaHikayesiniGetirAsync()),
            Task.Run(async () => await GuvenBadgeleriniGetirAsync()),
            Task.Run(async () => await MusteriYorumlariniGetirAsync())
        };

            await Task.WhenAll(tasks);

            return new AnaSayfaDTO
            {
                HeroSliderlar = ((Task<List<HeroSliderDTO>>)tasks[0]).Result,
                HizliErisimler = ((Task<List<HizliErisimDTO>>)tasks[1]).Result,
                Kategoriler = ((Task<List<KategoriDTO>>)tasks[2]).Result,
                OneCikanUrunler = ((Task<List<UrunDTO>>)tasks[3]).Result,
                //VurguluKategori = ((Task<List<VurguluKategoriDTO>>)tasks[4]).Result,
                InstagramGonderileri = ((Task<List<InstagramGonderiDTO>>)tasks[5]).Result,
                KisiselOneriler = ((Task<List<UrunDTO>>)tasks[6]).Result,
                KampanyaKartlari = ((Task<List<KampanyaKartDTO>>)tasks[7]).Result,
                MarkaHikayesi = ((Task<MarkaHikayesiDTO>)tasks[8]).Result,
                GuvenBadgeleri = ((Task<List<GuvenBadgeDTO>>)tasks[9]).Result,
                MusteriYorumlari = ((Task<List<MusteriYorumDTO>>)tasks[10]).Result
            };
        }

        private int? GetKullaniciIdFromCookie()
        {
            var httpContext = _httpContextAccessor.HttpContext;
            if (httpContext?.User?.Identity?.IsAuthenticated == true)
            {
                var userIdClaim = httpContext.User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int userId))
                {
                    return userId;
                }
            }
            return null;
        }
    }
}
