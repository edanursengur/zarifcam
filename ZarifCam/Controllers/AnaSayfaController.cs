using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using ZarifCam.Dtos.AnaSayfa;
using ZarifCam.Dtos.Kampanya;
using ZarifCam.IService;

namespace ZarifCam.Controllers
{
    // AnaSayfaController.cs
    [ApiController]
    [Route("api/[controller]")]
    public class AnaSayfaController : ControllerBase
    {
        private readonly IAnaSayfaService _anaSayfaService;
        private readonly ILogger<AnaSayfaController> _logger;

        public AnaSayfaController(IAnaSayfaService anaSayfaService, ILogger<AnaSayfaController> logger)
        {
            _anaSayfaService = anaSayfaService;
            _logger = logger;
        }

        // GET: api/anasayfa/tum
        [HttpGet("tum")]
        public async Task<IActionResult> TumAnaSayfaVerileriniGetir()
        {
            try
            {
                // Kullanıcı ID'sini al (giriş yapmışsa)
                int? kullaniciId = null;
                if (User.Identity.IsAuthenticated)
                {
                    var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                    if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int userId))
                    {
                        kullaniciId = userId;
                    }
                }

                var result = await _anaSayfaService.TumAnaSayfaVerileriniGetirAsync(kullaniciId);
                return Ok(new ApiResponse<AnaSayfaDTO>
                {
                    Success = true,
                    Data = result,
                    Message = "Ana sayfa verileri başarıyla getirildi."
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ana sayfa verileri getirilirken hata oluştu");
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "Ana sayfa verileri getirilirken bir hata oluştu."
                });
            }
        }

        // GET: api/anasayfa/heroslider
        [HttpGet("heroslider")]
        public async Task<IActionResult> HeroSliderlariGetir()
        {
            try
            {
                var result = await _anaSayfaService.HeroSliderlariGetirAsync();
                return Ok(new ApiResponse<List<HeroSliderDTO>>
                {
                    Success = true,
                    Data = result
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Hero slider'lar getirilirken hata oluştu");
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "Hero slider'lar getirilirken bir hata oluştu."
                });
            }
        }

        // GET: api/anasayfa/hizlierisim
        [HttpGet("hizlierisim")]
        public async Task<IActionResult> HizliErisimleriGetir()
        {
            try
            {
                var result = await _anaSayfaService.HizliErisimleriGetirAsync();
                return Ok(new ApiResponse<List<HizliErisimDTO>>
                {
                    Success = true,
                    Data = result
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Hızlı erişimler getirilirken hata oluştu");
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "Hızlı erişimler getirilirken bir hata oluştu."
                });
            }
        }

        // GET: api/anasayfa/kategoriler
        [HttpGet("kategoriler")]
        public async Task<IActionResult> AnaSayfaKategorileriniGetir()
        {
            try
            {
                var result = await _anaSayfaService.AnaSayfaKategorileriniGetirAsync();
                return Ok(new ApiResponse<List<KategoriDTO>>
                {
                    Success = true,
                    Data = result
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kategoriler getirilirken hata oluştu");
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "Kategoriler getirilirken bir hata oluştu."
                });
            }
        }

        // GET: api/anasayfa/onecikan-urunler
        [HttpGet("onecikan-urunler")]
        public async Task<IActionResult> OneCikanUrunleriGetir([FromQuery] int adet = 12)
        {
            try
            {
                var result = await _anaSayfaService.OneCikanUrunleriGetirAsync(adet);
                return Ok(new ApiResponse<List<ProductSliderViewModel>>
                {
                    Success = true,
                    Data = result.ToList()
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Öne çıkan ürünler getirilirken hata oluştu");
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "Öne çıkan ürünler getirilirken bir hata oluştu."
                });
            }
        }
        [HttpGet("urun-detay/{id}")]
        public async Task<IActionResult> GetProductDetail(long id)
        {
            try
            {
                var result = await _anaSayfaService.GetProductDetailAsync(id);

                if (result == null)
                {
                    return NotFound(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "Ürün bulunamadı"
                    });
                }

                return Ok(new ApiResponse<ProductSliderViewModel>
                {
                    Success = true,
                    Data = result
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ürün detayı getirilirken hata");
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "Ürün detayı getirilirken bir hata oluştu."
                });
            }
        }
        [HttpGet("ceyiz-paketleri")]
        public async Task<IActionResult> CeyizPaketleriGetir([FromQuery] int adet = 10)
        {
            try
            {
                var result = await _anaSayfaService.PaketleriGetirAsync(adet);
                return Ok(new ApiResponse<List<ProductSliderViewModel>>
                {
                    Success = true,
                    Data = result.ToList()
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Çeyiz paketleri getirilirken hata oluştu");
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "Çeyiz paketleri getirilirken bir hata oluştu."
                });
            }
        }

        [HttpGet("urunler")]
        public async Task<IActionResult> UrunleriGetir(
            [FromQuery] int adet = 12,
            [FromQuery] bool? sadecePaketler = null,
            [FromQuery] bool? anaSayfadaOneCikanMi = null,
             [FromQuery] int? kategoriId = null)      
        {
            try
            {
                var result = await _anaSayfaService.GetProductsAsync(adet, sadecePaketler, anaSayfadaOneCikanMi,kategoriId);
                return Ok(new ApiResponse<List<ProductSliderViewModel>>
                {
                    Success = true,
                    Data = result.ToList()
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ürünler getirilirken hata oluştu");
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "Ürünler getirilirken bir hata oluştu."
                });
            }
        }
        [HttpGet("urunler/sayfali")]
        public async Task<IActionResult> UrunlerieGetir(
        [FromQuery] int adet = 12,
        [FromQuery] bool? sadecePaketler = null,
        [FromQuery] bool? anaSayfadaOneCikanMi = null,
        [FromQuery] int? kategoriId = null)
        {
            try
            {
                var result = await _anaSayfaService.GetProductsAsync(adet, sadecePaketler, anaSayfadaOneCikanMi, kategoriId);
                return Ok(new ApiResponse<List<ProductSliderViewModel>>
                {
                    Success = true,
                    Data = result.ToList()
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ürünler getirilirken hata oluştu");
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "Ürünler getirilirken bir hata oluştu."
                });
            }
        }


        // ESKI ENDPOINT - AYNEN KALIYOR
        [HttpGet("urunler")]
        public async Task<IActionResult> UrunleriGsetir(
            [FromQuery] int adet = 12,
            [FromQuery] bool? sadecePaketler = null,
            [FromQuery] bool? anaSayfadaOneCikanMi = null,
            [FromQuery] int? kategoriId = null)
        {
            try
            {
                var result = await _anaSayfaService.GetProductsAsync(adet, sadecePaketler, anaSayfadaOneCikanMi, kategoriId);
                return Ok(new ApiResponse<List<ProductSliderViewModel>>
                {
                    Success = true,
                    Data = result.ToList()
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ürünler getirilirken hata oluştu");
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "Ürünler getirilirken bir hata oluştu."
                });
            }
        }
        // GET: api/anasayfa/vurgulu-kategori
        [HttpGet("vurgulu-kategoriler")]
        public async Task<IActionResult> VurguluKategorileriGetir()
        {
            try
            {
                var result = await _anaSayfaService.VurguluKategorileriGetirAsync();
                return Ok(new ApiResponse<List<VurguluKategoriDTO>>
                {
                    Success = true,
                    Data = result
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Vurgulu kategoriler getirilirken hata oluştu");
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "Vurgulu kategoriler getirilirken bir hata oluştu."
                });
            }
        }

        // GET: api/anasayfa/instagram
        [HttpGet("instagram")]
        public async Task<IActionResult> InstagramGonderileriniGetir([FromQuery] int adet = 8)
        {
            try
            {
                var result = await _anaSayfaService.InstagramGonderileriniGetirAsync(adet);
                return Ok(new ApiResponse<List<InstagramGonderiDTO>>
                {
                    Success = true,
                    Data = result
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Instagram gönderileri getirilirken hata oluştu");
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "Instagram gönderileri getirilirken bir hata oluştu."
                });
            }
        }

        // GET: api/anasayfa/kisisel-oneriler
        [HttpGet("kisisel-oneriler")]
        [Authorize] // Sadece giriş yapmış kullanıcılar
        public async Task<IActionResult> KisiselOnerileriGetir([FromQuery] int adet = 6)
        {
            try
            {
                var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);
                var result = await _anaSayfaService.KisiselOnerileriGetirAsync(userId, adet);
                return Ok(new ApiResponse<List<UrunDTO>>
                {
                    Success = true,
                    Data = result
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Kişisel öneriler getirilirken hata oluştu");
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "Kişisel öneriler getirilirken bir hata oluştu."
                });
            }
        }
        [HttpGet("aktifKampanyalar")]
        public async Task<IActionResult> GetAktifKampanyalar(int limit = 10)
        {
            try
            {
                var kampanyalar = await _anaSayfaService.GetAktifKampanyalarAsync(limit);
                return Ok(kampanyalar);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Kampanyalar yüklenirken hata oluştu", error = ex.Message });
            }
        }
        // GET: api/anasayfa/kampanya-kartlari
        //[HttpGet("kampanya-kartlari")]
        //public async Task<IActionResult> KampanyaKartlariniGetir()
        //{
        //    try
        //    {
        //        var result = await _anaSayfaService.KampanyaKartlariniGetirAsync();
        //        return Ok(new ApiResponse<List<KampanyaKartDTO>>
        //        {
        //            Success = true,
        //            Data = result
        //        });
        //    }
        //    catch (Exception ex)
        //    {
        //        _logger.LogError(ex, "Kampanya kartları getirilirken hata oluştu");
        //        return StatusCode(500, new ApiResponse<object>
        //        {
        //            Success = false,
        //            Message = "Kampanya kartları getirilirken bir hata oluştu."
        //        });
        //    }
        //}

        // GET: api/anasayfa/marka-hikayesi
        [HttpGet("marka-hikayesi")]
        public async Task<IActionResult> MarkaHikayesiniGetir()
        {
            try
            {
                var result = await _anaSayfaService.MarkaHikayesiniGetirAsync();
                return Ok(new ApiResponse<MarkaHikayesiDTO>
                {
                    Success = true,
                    Data = result
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Marka hikayesi getirilirken hata oluştu");
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "Marka hikayesi getirilirken bir hata oluştu."
                });
            }
        }

        // GET: api/anasayfa/guven-badgeleri
        [HttpGet("guven-badgeleri")]
        public async Task<IActionResult> GuvenBadgeleriniGetir()
        {
            try
            {
                var result = await _anaSayfaService.GuvenBadgeleriniGetirAsync();
                return Ok(new ApiResponse<List<GuvenBadgeDTO>>
                {
                    Success = true,
                    Data = result
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Güven badgeleri getirilirken hata oluştu");
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "Güven badgeleri getirilirken bir hata oluştu."
                });
            }
        }

        // GET: api/anasayfa/musteri-yorumlari
        [HttpGet("musteri-yorumlari")]
        public async Task<IActionResult> MusteriYorumlariniGetir([FromQuery] int adet = 5)
        {
            try
            {
                var result = await _anaSayfaService.MusteriYorumlariniGetirAsync(adet);
                return Ok(new ApiResponse<List<MusteriYorumDTO>>
                {
                    Success = true,
                    Data = result
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Müşteri yorumları getirilirken hata oluştu");
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "Müşteri yorumları getirilirken bir hata oluştu."
                });
            }
        }
    }

    // API Response Model
    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public T Data { get; set; }
        public List<string> Errors { get; set; }
    }

}
