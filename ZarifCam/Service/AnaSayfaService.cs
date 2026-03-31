using Dapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Newtonsoft.Json;
using System.Data;
using System.Security.Claims;
using ZarifCam.Dtos.AnaSayfa;
using ZarifCam.Dtos.Kampanya;
using ZarifCam.IService;
using ZarifCam.Models;
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
        public async Task<IEnumerable<ProductSliderViewModel>> GetProductsAsync(
           int limit = 10,
           bool? sadecePaketler = null,
           bool? anaSayfadaOneCikanMi = null,
           int? kategoriId = null)
        {
            try
            {
                var sql = @"
    SELECT TOP (@Limit)
        U.TabloID AS Id,
        U.Ad,
        U.Slug,
        U.KisaAciklama,
        U.ModelKodu,
        R.Ad AS Renk,
        R.HexKodu AS RenkKodu,
        UF.Fiyat,
        UF.IndirimliFiyat,
        ISNULL(UF.IndirimliFiyat, UF.Fiyat) AS IndirimliFiyat,
        UF.Fiyat AS EskiFiyat,
        C.Ad AS KategoriAdi,
        C.Slug AS KategoriSlug,
        UM.GorselUrl AS AnaGorsel,
        UM2.GorselUrl AS HoverGorsel,
        U.PaketMi,
        U.PaketIcerigi,
        U.PaketAdeti,
        CASE 
            WHEN U.Ad LIKE '%Çok Satan%' THEN 1 
            ELSE 0 
        END AS CokSatanMi,
        CASE 
            WHEN US.MevcutAdet < 5 THEN 1 
            ELSE 0 
        END AS SinirliStokMu,
        CASE 
            WHEN UF.Fiyat > 1000 THEN 1 
            ELSE 0 
        END AS UcretsizKargoVarMi,
        US.MevcutAdet AS StokAdedi,
        12 AS TaksitSecenekleri
    FROM URUNLER U
    LEFT JOIN Kategori C ON U.KategoriId = C.TabloID
    LEFT JOIN UrunFiyatlari UF ON U.TabloID = UF.UrunId AND UF.AktifMi = 1
    LEFT JOIN UrunStok US ON U.TabloID = US.UrunID AND US.AktifMi = 1
    LEFT JOIN Urunmedyalari UM ON U.TabloID = UM.UrunId AND UM.AnaGorselMi = 1
    LEFT JOIN Urunmedyalari UM2 ON U.TabloID = UM2.UrunId AND UM2.HoverGorselMi = 1
    LEFT JOIN Urunrenk UR ON U.TabloID = UR.UrunID 
    LEFT JOIN Renkler R ON UR.RenkID = R.TabloID 
    WHERE U.AktifMi = 1 
        AND C.AktifMi = 1";

                var parameters = new DynamicParameters();
                parameters.Add("Limit", limit);
                parameters.Add("sadecePaketler", sadecePaketler ?? false);

                var whereConditions = new List<string>();

                if (anaSayfadaOneCikanMi.HasValue && anaSayfadaOneCikanMi.Value)
                {
                    whereConditions.Add("U.AnaSayfadaOneCikanMi = 1");
                }

                if (sadecePaketler.HasValue && sadecePaketler.Value)
                {
                    whereConditions.Add("U.PaketMi = 1");
                }

                if (kategoriId.HasValue && kategoriId.Value > 0)
                {
                    whereConditions.Add("U.KategoriId = @kategoriId");
                    parameters.Add("kategoriId", kategoriId.Value);
                }

                if (whereConditions.Any())
                {
                    sql += " AND " + string.Join(" AND ", whereConditions);
                }

                sql += @"
    GROUP BY 
        U.TabloID, U.Ad, U.Slug, U.KisaAciklama, U.ModelKodu, R.Ad, R.HexKodu,
        UF.Fiyat, UF.IndirimliFiyat,
        C.Ad, C.Slug,
        UM.GorselUrl, UM2.GorselUrl,
        U.OlusturulmaTarihi,
        US.MevcutAdet,
        U.PaketMi, U.PaketIcerigi, U.PaketAdeti,
        U.AnaSayfadaOneCikanMi
    ORDER BY 
        CASE WHEN @sadecePaketler = 1 THEN 0 ELSE 1 END,
        U.OlusturulmaTarihi DESC";

                using (var connection = CreateConnection())
                {
                    var products = await connection.QueryAsync<ProductSliderViewModel>(
                        sql,
                        parameters  // Doğrudan parameters nesnesini gönder
                    );

                    var groupedProducts = new List<ProductSliderViewModel>();
                    var seenModels = new HashSet<string>();

                    foreach (var product in products)
                    {
                        if (!string.IsNullOrEmpty(product.ModelKodu))
                        {
                            if (!seenModels.Contains(product.ModelKodu))
                            {
                                seenModels.Add(product.ModelKodu);
                                product.Renkler = await GetProductColorsByModelAsync(product.ModelKodu, product.Id);
                                groupedProducts.Add(product);
                            }
                        }
                        else
                        {
                            product.Renkler = await GetProductColorsAsync(product.Id);
                            groupedProducts.Add(product);
                        }
                    }

                    // Rating hesapla
                    foreach (var product in groupedProducts)
                    {
                        product.Rating = CalculateRandomRating(product.Id);
                    }

                    return groupedProducts;
                }
            }
            catch (Exception ex)
            {
                // Loglama yapabilirsiniz
                throw;
            }
        }
        public async Task<(List<ProductSliderViewModel> Items, int TotalCount)> GetProductsPagedAsync(
    int page = 1,
    int pageSize = 12,
    bool? sadecePaketler = null,
    bool? anaSayfadaOneCikanMi = null,
    int? kategoriId = null)
        {
            try
            {
                // TOPLAM SAYIYI BUL
                var countSql = @"
SELECT COUNT(DISTINCT U.TabloID)
FROM URUNLER U
LEFT JOIN Kategori C ON U.KategoriId = C.TabloID
WHERE U.AktifMi = 1 
    AND C.AktifMi = 1";

                var countParams = new DynamicParameters();
                var whereConditions = new List<string>();

                if (anaSayfadaOneCikanMi.HasValue && anaSayfadaOneCikanMi.Value)
                {
                    whereConditions.Add("U.AnaSayfadaOneCikanMi = 1");
                }

                if (sadecePaketler.HasValue && sadecePaketler.Value)
                {
                    whereConditions.Add("U.PaketMi = 1");
                }

                if (kategoriId.HasValue && kategoriId.Value > 0)
                {
                    whereConditions.Add("U.KategoriId = @kategoriId");
                    countParams.Add("kategoriId", kategoriId.Value);
                }

                if (whereConditions.Any())
                {
                    countSql += " AND " + string.Join(" AND ", whereConditions);
                }

                var totalCount = 0;
                using (var connection = CreateConnection())
                {
                    totalCount = await connection.ExecuteScalarAsync<int>(countSql, countParams);
                }

                // SAYFALI VERİLERİ ÇEK
                var offset = (page - 1) * pageSize;

                var sql = @"
SELECT * FROM (
    SELECT 
        U.TabloID AS Id,
        U.Ad,
        U.Slug,
        U.KisaAciklama,
        U.ModelKodu,
        R.Ad AS Renk,
        R.HexKodu AS RenkKodu,
        UF.Fiyat,
        UF.IndirimliFiyat,
        ISNULL(UF.IndirimliFiyat, UF.Fiyat) AS IndirimliFiyat,
        UF.Fiyat AS EskiFiyat,
        C.Ad AS KategoriAdi,
        C.Slug AS KategoriSlug,
        UM.GorselUrl AS AnaGorsel,
        UM2.GorselUrl AS HoverGorsel,
        U.PaketMi,
        U.PaketIcerigi,
        U.PaketAdeti,
        CASE WHEN U.Ad LIKE '%Çok Satan%' THEN 1 ELSE 0 END AS CokSatanMi,
        CASE WHEN US.MevcutAdet < 5 THEN 1 ELSE 0 END AS SinirliStokMu,
        CASE WHEN UF.Fiyat > 1000 THEN 1 ELSE 0 END AS UcretsizKargoVarMi,
        US.MevcutAdet AS StokAdedi,
        12 AS TaksitSecenekleri,
        ROW_NUMBER() OVER (ORDER BY 
            CASE WHEN @sadecePaketler = 1 THEN 0 ELSE 1 END,
            U.OlusturulmaTarihi DESC) AS RowNum
    FROM URUNLER U
    LEFT JOIN Kategori C ON U.KategoriId = C.TabloID
    LEFT JOIN UrunFiyatlari UF ON U.TabloID = UF.UrunId AND UF.AktifMi = 1
    LEFT JOIN UrunStok US ON U.TabloID = US.UrunID AND US.AktifMi = 1
    LEFT JOIN Urunmedyalari UM ON U.TabloID = UM.UrunId AND UM.AnaGorselMi = 1
    LEFT JOIN Urunmedyalari UM2 ON U.TabloID = UM2.UrunId AND UM2.HoverGorselMi = 1
    LEFT JOIN Urunrenk UR ON U.TabloID = UR.UrunID 
    LEFT JOIN Renkler R ON UR.RenkID = R.TabloID 
    WHERE U.AktifMi = 1 
        AND C.AktifMi = 1";

                var parameters = new DynamicParameters();
                parameters.Add("sadecePaketler", sadecePaketler ?? false);
                parameters.Add("PageSize", pageSize);
                parameters.Add("Offset", offset);

                var whereList = new List<string>();

                if (anaSayfadaOneCikanMi.HasValue && anaSayfadaOneCikanMi.Value)
                {
                    whereList.Add("U.AnaSayfadaOneCikanMi = 1");
                }

                if (sadecePaketler.HasValue && sadecePaketler.Value)
                {
                    whereList.Add("U.PaketMi = 1");
                }

                if (kategoriId.HasValue && kategoriId.Value > 0)
                {
                    whereList.Add("U.KategoriId = @kategoriId");
                    parameters.Add("kategoriId", kategoriId.Value);
                }

                if (whereList.Any())
                {
                    sql += " AND " + string.Join(" AND ", whereList);
                }

                sql += @"
) AS Tmp
WHERE RowNum BETWEEN @Offset + 1 AND @Offset + @PageSize
ORDER BY RowNum";

                using (var connection = CreateConnection())
                {
                    var products = await connection.QueryAsync<ProductSliderViewModel>(sql, parameters);

                    var groupedProducts = new List<ProductSliderViewModel>();
                    var seenModels = new HashSet<string>();

                    foreach (var product in products)
                    {
                        if (!string.IsNullOrEmpty(product.ModelKodu))
                        {
                            if (!seenModels.Contains(product.ModelKodu))
                            {
                                seenModels.Add(product.ModelKodu);
                                product.Renkler = await GetProductColorsByModelAsync(product.ModelKodu, product.Id);
                                groupedProducts.Add(product);
                            }
                        }
                        else
                        {
                            product.Renkler = await GetProductColorsAsync(product.Id);
                            groupedProducts.Add(product);
                        }
                    }

                    foreach (var product in groupedProducts)
                    {
                        product.Rating = CalculateRandomRating(product.Id);
                    }

                    return (groupedProducts, totalCount);
                }
            }
            catch (Exception ex)
            {
                throw;
            }
        }
        public async Task<ProductSliderViewModel> GetProductDetailAsync(long productId)
        {
            try
            {
                var sql = @"
        SELECT 
            U.TabloID AS Id,
            U.Ad,
            U.Slug,
            U.KisaAciklama,
            U.ModelKodu,
            UF.Fiyat,
            UF.IndirimliFiyat,
            ISNULL(UF.IndirimliFiyat, UF.Fiyat) AS IndirimliFiyat,
            UF.Fiyat AS EskiFiyat,
            C.Ad AS KategoriAdi,
            C.Slug AS KategoriSlug,
            UM.GorselUrl AS AnaGorsel,
            UM2.GorselUrl AS HoverGorsel,
            U.PaketMi,
            U.PaketIcerigi,
            U.PaketAdeti,
            CASE 
                WHEN U.OlusturulmaTarihi >= DATEADD(day, -30, GETDATE()) THEN 1 
                ELSE 0 
            END AS YeniMi,
            CASE 
                WHEN U.Ad LIKE '%Çok Satan%' THEN 1 
                ELSE 0 
            END AS CokSatanMi,
            CASE 
                WHEN US.MevcutAdet < 5 THEN 1 
                ELSE 0 
            END AS SinirliStokMu,
            CASE 
                WHEN UF.Fiyat > 1000 THEN 1 
                ELSE 0 
            END AS UcretsizKargoVarMi,
            US.MevcutAdet AS StokAdedi,
            12 AS TaksitSecenekleri
        FROM URUNLER U
        LEFT JOIN Kategori C ON U.KategoriId = C.TabloID
        LEFT JOIN UrunFiyatlari UF ON U.TabloID = UF.UrunId AND UF.AktifMi = 1
        LEFT JOIN UrunStok US ON U.TabloID = US.UrunID AND US.AktifMi = 1
        LEFT JOIN Urunmedyalari UM ON U.TabloID = UM.UrunId AND UM.AnaGorselMi = 1
        LEFT JOIN Urunmedyalari UM2 ON U.TabloID = UM2.UrunId AND UM2.HoverGorselMi = 1
        WHERE U.TabloID = @ProductId 
            AND U.AktifMi = 1
            AND C.AktifMi = 1
        GROUP BY 
            U.TabloID, U.Ad, U.Slug, U.KisaAciklama, U.ModelKodu,
            UF.Fiyat, UF.IndirimliFiyat,
            C.Ad, C.Slug,
            UM.GorselUrl, UM2.GorselUrl,
            U.OlusturulmaTarihi,
            US.MevcutAdet,
            U.PaketMi, U.PaketIcerigi, U.PaketAdeti";

                using (var connection = CreateConnection())
                {
                    var product = await connection.QueryFirstOrDefaultAsync<ProductSliderViewModel>(
                        sql,
                        new { ProductId = productId }
                    );

                    if (product != null)
                    {
                        // 1. Bu ürünün RENK BİLGİLERİNİ getir (Renkler listesi)
                        product.Renkler = await GetProductColorsAsync(productId);

                        // 2. Rating hesapla
                        product.Rating = CalculateRandomRating(productId);
                    }

                    return product;
                }
            }
            catch (Exception ex)
            {
                throw;
            }
        }
        public async Task<List<RenkViewModel>> GetProductColorsByModelAsync(string modelKodu, long currentProductId)
        {
            var sql = @"
    SELECT 
        U.TabloID AS Id,
        r.ad AS Ad,
        r.HexKodu AS HexKodu,
        US.MevcutAdet AS StokAdedi,
        CASE 
            WHEN U.TabloID = 39 THEN 1 
            ELSE 0 
        END AS SeciliMi
    FROM URUNLER U
    LEFT JOIN UrunStok US ON U.TabloID = US.UrunID AND US.AktifMi = 1
     LEFT JOIN Urunrenk UR ON U.TabloID = UR.UrunID 
LEFT JOIN Renkler R ON UR.RenkID = R.TabloID 
    WHERE U.ModelKodu = 1 
        AND U.AktifMi = 1
        AND (US.MevcutAdet > 0 OR US.MevcutAdet IS NULL)
    ORDER BY r.ad";

            using (var connection = CreateConnection())
            {
                var renkler = await connection.QueryAsync<RenkViewModel>(
                    sql,
                    new { ModelKodu = modelKodu, CurrentProductId = currentProductId }
                );
                return renkler.ToList();
            }
        }

        // Eski metodları koru (geriye uyumluluk için)
        public async Task<IEnumerable<ProductSliderViewModel>> OneCikanUrunleriGetirAsync(int limit = 10)
        {
            return await GetProductsAsync(limit, anaSayfadaOneCikanMi: true);
        }

        public async Task<IEnumerable<ProductSliderViewModel>> PaketleriGetirAsync(int limit = 10)
        {
            return await GetProductsAsync(limit, sadecePaketler: true);
        }

        private double CalculateRandomRating(long productId)
        {
            // Aynı productId için her zaman aynı rating'i döndür
            Random rnd = new Random(productId.GetHashCode());
            return Math.Round(rnd.NextDouble() * 2 + 3, 1);
        }

        public async Task<List<RenkViewModel>> GetProductColorsAsync(long productId)
        {
            var sql = @"
            SELECT 
                R.TabloID,
                R.Ad,
                R.HexKodu,
                US.MevcutAdet AS StokAdedi,
                CASE 
                    WHEN UR.RenkID = (SELECT TOP 1 RenkID FROM UrunRenk WHERE UrunID = @ProductId AND AktifMi = 1) 
                    THEN 1 ELSE 0 
                END AS SeciliMi
            FROM UrunRenk UR
            INNER JOIN Renkler R ON UR.RenkID = R.TabloID
            LEFT JOIN UrunStok US ON UR.UrunID = US.UrunID AND UR.RenkID = US.RenkID
            WHERE UR.UrunID = @ProductId 
                AND UR.AktifMi = 1
                AND (US.MevcutAdet > 0 OR US.MevcutAdet IS NULL)";

            using (var connection = CreateConnection())
            {
                var renkler = await connection.QueryAsync<RenkViewModel>(
                    sql,
                    new { ProductId = productId }
                );
                return renkler.ToList();
            }
        }

        //public async Task<ProductSliderViewModel> GetProductDetailAsync(long productId)
        //{
        //    var sql = @"
        //    SELECT 
        //        U.TabloID,
        //        U.Ad,
        //        U.Slug,

        //        U.KisaAciklama,
        //        UF.Fiyat,
        //        UF.IndirimliFiyat,
        //        C.Ad AS KategoriAdi,
        //        C.Slug AS KategoriSlug,
        //        UM.GorselUrl AS AnaGorsel,
        //        US.MevcutAdet AS StokAdedi
        //    FROM URUNLER U
        //    INNER JOIN Kategori C ON U.KategoriId = C.TabloID
        //    INNER JOIN UrunFiyatlari UF ON U.TabloID = UF.UrunId AND UF.AktifMi = 1
        //    LEFT JOIN UrunStok US ON U.TabloID = US.UrunID AND US.AktifMi = 1
        //    LEFT JOIN Urunmedyalari UM ON U.TabloID = UM.UrunId AND UM.AnaGorselMi = 1
        //    WHERE U.Id = @ProductId AND U.AktifMi = 1";

        //    using (var connection = CreateConnection())
        //    {
        //        var product = await connection.QueryFirstOrDefaultAsync<ProductSliderViewModel>(
        //            sql,
        //            new { ProductId = productId }
        //        );

        //        if (product != null)
        //        {
        //            product.Renkler = await GetProductColorsAsync(productId);
        //        }

        //        return product;
        //    }
        //}

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
 

            // Tüm verileri paralel olarak getir
            var tasks = new List<Task>
        {
            Task.Run(async () => await HeroSliderlariGetirAsync()),
            Task.Run(async () => await HizliErisimleriGetirAsync()),
            Task.Run(async () => await AnaSayfaKategorileriniGetirAsync()),
            Task.Run(async () => await OneCikanUrunleriGetirAsync()),
            //Task.Run(async () => await VurguluKategoriGetirAsync()),
            Task.Run(async () => await InstagramGonderileriniGetirAsync()),
            //Task.Run(async () => await KampanyaKartlariniGetirAsync()),
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
                //KampanyaKartlari = ((Task<List<KampanyaKartDTO>>)tasks[7]).Result,
                MarkaHikayesi = ((Task<MarkaHikayesiDTO>)tasks[8]).Result,
                GuvenBadgeleri = ((Task<List<GuvenBadgeDTO>>)tasks[9]).Result,
                MusteriYorumlari = ((Task<List<MusteriYorumDTO>>)tasks[10]).Result
            };
        }


        public async Task<List<KampanyaListeDTO>> GetAktifKampanyalarAsync(int limit = 10)
        {
            using var connection = new SqlConnection(_connectionString);
            try
            {
                var sql = @"
            SELECT TOP (@Limit)
                k.KampanyaID,
                k.Ad,
                kt.TipAdi,
                k.BaslangicTarihi,
                k.BitisTarihi,
                k.GorselUrl,
                k.Link,
                k.AktifMi,
                ISNULL(kr.MaxIndirimOrani, 0) as IndirimOrani,
                
                -- Kampanya Kartı Bilgileri
                kk.Baslik as KartBaslik,
                kk.Aciklama as KartAciklama,
                kk.ButonYazi as KartButonYazi,
                kk.ButonLink as KartButonLink,
                kk.ArkaplanResim as KartArkaplanResim,
                kk.OnplanResim as KartOnplanResim,
                kk.ArkaplanRengi as KartArkaplanRengi,
                
                -- Badge (Rozet) Metni
                ISNULL(kk.Baslik, 
                    CASE 
                        WHEN kt.TipID = 1 THEN CAST(ISNULL(kr.MaxIndirimOrani, 0) AS VARCHAR) + '%'
                        WHEN kt.TipID = 2 THEN '2 AL 1 ÖDE'
                        WHEN kt.TipID = 3 THEN 'HEDİYE'
                        ELSE 'FIRSAT'
                    END
                ) as BadgeText,
                
                -- Ana Metin
                ISNULL(kk.Aciklama,
                    CASE 
                        WHEN kt.TipID = 1 THEN '2. ÜRÜNE'
                        WHEN kt.TipID = 2 THEN 'Sevilen Hediyeler'
                        WHEN kt.TipID = 3 THEN 'ALIŞVERİŞE'
                        ELSE 'ÖZEL'
                    END
                ) as AnaMetin,
                
                -- Vurgu Metni
                CASE 
                    WHEN kt.TipID = 1 THEN 'İNDİRİM'
                    WHEN kt.TipID = 2 THEN 'KOMBO FIRSAT'
                    WHEN kt.TipID = 3 THEN 'HEDİYE FIRSATI'
                    ELSE 'FIRSAT'
                END as VurguMetni,
                
                -- Ürün Görseli - KampanyaKurallar'ndaki ilk ürünün medyası
                (
                    SELECT TOP 1 um.GorselURL
                    FROM KampanyaKurallar kkr
                    INNER JOIN Urunler u ON kkr.UrunID = u.TabloID
                    INNER JOIN UrunMedyalari um ON u.TabloID = um.UrunID
                    WHERE kkr.KampanyaID = k.KampanyaID
                      AND um.GorselURL IS NOT NULL
                    ORDER BY kkr.Oncelik, um.GosterimSirasi
                ) as UrunGorselUrl

            FROM Kampanyalar k
            INNER JOIN KampanyaTipleri kt ON k.TipID = kt.TipID
            
            -- Kampanya Kartları
            LEFT JOIN KampanyaKartlari kk ON k.KampanyaID = kk.KampanyaID AND kk.AktifMi = 1
            
            -- En yüksek indirim oranı
            LEFT JOIN (
                SELECT KampanyaID, MAX(IndirimOrani) as MaxIndirimOrani
                FROM KampanyaKurallar
                WHERE IndirimOrani > 0
                GROUP BY KampanyaID
            ) kr ON k.KampanyaID = kr.KampanyaID

            WHERE 
               k.BaslangicTarihi <= GETDATE() 
              AND k.BitisTarihi >= GETDATE()
              AND EXISTS (  -- Sadece kuralı olan kampanyalar
                  SELECT 1 FROM KampanyaKurallar kkr WHERE kkr.KampanyaID = k.KampanyaID
              )
";

                var kampanyalar = await connection.QueryAsync<KampanyaListeDTO>(
                    sql,
                    new { Limit = limit }
                );

                return kampanyalar.ToList();
            }
            catch (Exception)
            {
                throw;
            }
        }
    }
}
