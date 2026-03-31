using Dapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using System.Data;
using System.Text;
using ZarifCam.Dtos.Kampanya;
using ZarifCam.Dtos.WebUrun;
using ZarifCam.Models;

namespace ZarifCam.Service
{
    public interface IWebUrunService
    {
        Task<List<UrunKartDto>> UrunKartlariniGetirAsync(int page, int pageSize);
        Task<UrunDetayDto> Detay(long urunId);
        Task<List<HeroSlider>> AktifSliderlariGetirAsync();
        Task<List<Kategori>> AnaSayfaKategorileriAsync();
        Task<List<UrunKartDto>> FiltreliUrunKartlariniGetirAsync(UrunFiltreDto filtre, int page);
        //Task<List<KampanyaDto>> KampanyalariGetir();

    }

    public class WebUrunService : IWebUrunService
    {
        private readonly IDbConnection _db;

        public WebUrunService(IConfiguration configuration)
        {
            _db = new SqlConnection(
                configuration.GetConnectionString("DefaultConnection")
            );
        }

        public async Task<List<UrunKartDto>> UrunKartlariniGetirAsync(int page, int pageSize)
        {
            var sql = @"
    WITH PagedUrunler AS (
        SELECT
            u.TabloID AS UrunId,
            u.Ad AS UrunAdi,
            u.KategoriID,
            k.Ad AS KategoriAdi,
            uf.Fiyat,
            dt.Sembol AS DovizSembol
        FROM ZarifCam.dbo.Urunler u
        LEFT JOIN ZarifCam.dbo.Kategori k ON k.TabloID = u.KategoriId
        JOIN ZarifCam.dbo.UrunFiyatlari uf ON uf.UrunId = u.TabloID AND uf.AktifMi = 1
        JOIN ZarifCam.dbo.DovizTipi dt ON dt.TabloID = uf.DovizTipiId
        WHERE u.AktifMi = 1
        ORDER BY u.TabloID
        OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY
    )
    SELECT
        p.*,
        um.GorselUrl
    FROM PagedUrunler p
    LEFT JOIN ZarifCam.dbo.UrunMedyalari um ON um.UrunID = p.UrunId
    ORDER BY p.UrunId, um.GosterimSirasi;
    ";

            var lookup = new Dictionary<long, UrunKartDto>();

            await _db.QueryAsync<UrunKartDto, string, UrunKartDto>(
                sql,
                (urun, gorselUrl) =>
                {
                    if (!lookup.TryGetValue(urun.UrunId, out var kart))
                    {
                        kart = urun;
                        kart.Gorseller = new List<string>();
                        lookup.Add(kart.UrunId, kart);
                    }

                    if (!string.IsNullOrEmpty(gorselUrl))
                        kart.Gorseller.Add(gorselUrl);

                    return kart;
                },
                new
                {
                    Offset = (page - 1) * pageSize,
                    PageSize = pageSize
                },
                splitOn: "GorselUrl"
            );

            return lookup.Values.ToList();
        }

        public async Task<UrunDetayDto> Detay(long urunId)
        {
            var sql = @"
            SELECT
                u.TabloID AS UrunId,
                u.Ad AS UrunAdi,
                k.Ad AS KategoriAdi,
                uf.Fiyat,
                dt.Sembol AS DovizSembol,
                u.Aciklama,
                u.KisaAciklama
            FROM ZarifCam.dbo.Urunler u
            JOIN ZarifCam.dbo.Kategori k ON k.TabloID = u.KategoriId
            JOIN ZarifCam.dbo.UrunFiyatlari uf ON uf.UrunId = u.TabloID AND uf.AktifMi = 1
            JOIN ZarifCam.dbo.DovizTipi dt ON dt.TabloID = uf.DovizTipiId
            WHERE u.AktifMi = 1 AND u.TabloID = @UrunId";

            var urun = await _db.QueryFirstOrDefaultAsync<UrunDetayDto>(sql, new { UrunId = urunId });

            // Görselleri al
            var medyalar = await _db.QueryAsync<string>(
                "SELECT GorselUrl FROM ZarifCam.dbo.UrunMedyalari WHERE UrunID = @UrunId ORDER BY GosterimSirasi",
                new { UrunId = urunId });

            urun.Medyalar = medyalar.ToList();

            // Meta verileri buraya ekle (örn: UrunMeta tablosu veya sabit)
            urun.Meta = new List<string> { "El yapımı cam",
                "Bulaşık makinesine uygun" };

            return urun;
        }
        public async Task<List<HeroSlider>> AktifSliderlariGetirAsync()
        {
            const string sql = @"
            SELECT 
                Id,
                Baslik,
                ButonText,
                ButonLink,
                MedyaUrl,
                Sira,
                AktifMi
            FROM  ZarifCam.dbo.HeroSlider
            WHERE AktifMi = 1
            ORDER BY Sira
        ";

            var result = await _db.QueryAsync<HeroSlider>(sql);
            return result.ToList();
        }
        public async Task<List<Kategori>> AnaSayfaKategorileriAsync()
        {
            var sql = @"
            SELECT 
                TabloID,
                Ad,
                Slug,
                GorselUrl,
                Sira
            FROM  ZarifCam.dbo.Kategori
            WHERE 
                AktifMi = 1
                AND AnaSayfadaGoster = 1
            ORDER BY Sira
        ";

            var result = await _db.QueryAsync<Kategori>(sql);
            return result.ToList();
        }
        public async Task<List<UrunKartDto>> FiltreliUrunKartlariniGetirAsync(UrunFiltreDto filtre, int page)
        {
            // ❗ Scroll için SABİT
            const int pageSize = 30;

            if (page <= 0)
                throw new ArgumentException("page 1’den küçük olamaz");

            int offset = (page - 1) * pageSize;

            var sql = new StringBuilder(@"
WITH PagedUrunler AS (
    SELECT
        u.TabloID AS UrunId,
        u.Ad AS UrunAdi,
        u.KategoriID,
        k.Ad AS KategoriAdi,
        uf.Fiyat,
        dt.Sembol AS DovizSembol,
        r.Ad AS RenkAdi
    FROM ZarifCam.dbo.Urunler u
    LEFT JOIN ZarifCam.dbo.Kategori k 
        ON k.TabloID = u.KategoriId
    JOIN ZarifCam.dbo.UrunFiyatlari uf 
        ON uf.UrunId = u.TabloID AND uf.AktifMi = 1
    JOIN ZarifCam.dbo.DovizTipi dt 
        ON dt.TabloID = uf.DovizTipiId
    LEFT JOIN ZarifCam.dbo.UrunRenk ur 
        ON ur.UrunID = u.TabloID
    LEFT JOIN ZarifCam.dbo.Renkler r 
        ON r.TabloID = ur.RenkID
    WHERE u.AktifMi = 1
");

            var parameters = new DynamicParameters();

            // 🔎 FİLTRELER
            if (filtre.KategoriId.HasValue)
            {
                sql.Append(" AND u.KategoriID = @KategoriId");
                parameters.Add("KategoriId", filtre.KategoriId);
            }

            if (filtre.RenkId.HasValue)
            {
                sql.Append(" AND ur.RenkID = @RenkId");
                parameters.Add("RenkId", filtre.RenkId);
            }

            if (filtre.MinFiyat.HasValue)
            {
                sql.Append(" AND uf.Fiyat >= @MinFiyat");
                parameters.Add("MinFiyat", filtre.MinFiyat);
            }

            if (filtre.MaxFiyat.HasValue)
            {
                sql.Append(" AND uf.Fiyat <= @MaxFiyat");
                parameters.Add("MaxFiyat", filtre.MaxFiyat);
            }

            // 📄 PAGINATION
            sql.Append(@"
    ORDER BY u.TabloID
    OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY
)
SELECT
    p.*,
    um.GorselUrl
FROM PagedUrunler p
LEFT JOIN ZarifCam.dbo.UrunMedyalari um 
    ON um.UrunID = p.UrunId
ORDER BY p.UrunId, um.GosterimSirasi;
");

            parameters.Add("Offset", offset);
            parameters.Add("PageSize", pageSize);

            var lookup = new Dictionary<long, UrunKartDto>();

            await _db.QueryAsync<UrunKartDto, string?, UrunKartDto>(
                sql.ToString(),
                (urun, gorselUrl) =>
                {
                    if (!lookup.TryGetValue(urun.UrunId, out var kart))
                    {
                        kart = urun;
                        kart.Gorseller = new List<string>();
                        lookup.Add(kart.UrunId, kart);
                    }

                    if (!string.IsNullOrEmpty(gorselUrl) &&
                        !kart.Gorseller.Contains(gorselUrl))
                    {
                        kart.Gorseller.Add(gorselUrl);
                    }

                    return kart;
                },
                parameters,
                splitOn: "GorselUrl"
            );

            return lookup.Values.ToList();
        }
//        public async Task<List<KampanyaDto>> KampanyalariGetir()
//        {
//            // Önce kampanyaları çek
//            var kampanyaQuery = @"
//        SELECT KampanyaID AS Id,
//               Ad,
//               Tip,
//               BaslangicTarihi,
//               BitisTarihi,
//               AktifMi,
//               OlusturulmaTarihi,
//               GorselUrl,
//Link
//        FROM Kampanyalar
//        WHERE AktifMi = 1
//          AND BaslangicTarihi <= GETDATE()
//          AND BitisTarihi >= GETDATE()
//        ORDER BY BaslangicTarihi DESC";

//            var kampanyalar = (await _db.QueryAsync<KampanyaDto>(kampanyaQuery)).ToList();

//            // Her kampanya için kurallarını çek
//            foreach (var kampanya in kampanyalar)
//            {
//                var kuralQuery = @"
//            SELECT KampanyaKuralID,
//                   UrunID,
//                   KoleksiyonID,
//                   MinAdet,
//                   IndirimTutar,
//                   IndirimOrani,
//                   Oncelik,
//                   AktifMi
//            FROM KampanyaKurallar
//            WHERE KampanyaID = @KampanyaID
//              AND AktifMi = 1
//            ORDER BY Oncelik DESC";

//                var kurallar = await _db.QueryAsync<KampanyaKuralDto>(kuralQuery, new { KampanyaID = kampanya.Id });
//                kampanya.Kurallar = kurallar.ToList();
//            }

//            return kampanyalar;
//        }

    }
}
