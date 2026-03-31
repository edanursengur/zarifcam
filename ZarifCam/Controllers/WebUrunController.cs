using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using ZarifCam.Dtos.WebUrun;
using ZarifCam.Models;
using ZarifCam.Service;

namespace ZarifCam.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WebUrunController : Controller

    {
        private readonly IWebUrunService _webUrunService;

        public WebUrunController(IWebUrunService webUrunService)
        {
            _webUrunService = webUrunService;
        }
        [HttpGet("urun-kartlari")]
        public async Task<IActionResult> UrunKartlari([FromQuery] int page = 1, [FromQuery] int pageSize = 30)
        {
            var result = await _webUrunService.UrunKartlariniGetirAsync(page, pageSize);
            return Ok(result);
        }
        //[HttpGet("urunBilgiGet")]
        //public async Task<IActionResult> urunBilgiGet([FromQuery] int page = 1, [FromQuery] int pageSize = 30)
        //{
        //    var result = await _webUrunService.urunBilgiGet(page, pageSize);
        //    return Ok(result);
        //}

        [HttpGet("urun/{UrunID}")]
        public async Task<IActionResult> Detay(long UrunID)
        {
            var result = await _webUrunService.Detay(UrunID);
            return Ok(result);
        }
        [HttpGet("hero-slider")]
        public async Task<IActionResult> HeroSlider()
        {
            try
            {
                var result = await _webUrunService.AktifSliderlariGetirAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                // Geliştirme veya test ortamında hata detayını dön
                return StatusCode(500, new
                {
                    Message = "Sunucu hatası oluştu",
                    Error = ex.Message,
                    StackTrace = ex.StackTrace
                });
            }
        }

        [HttpGet("KategoriGet")]
        public async Task<IActionResult> KategoriGet()
        {
            try
            {


                var data = await _webUrunService.AnaSayfaKategorileriAsync();
                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    Message = "Sunucu hatası oluştu",
                    Error = ex.Message,
                    StackTrace = ex.StackTrace
                });
            }
        }
        [HttpPost("filtreli")]
        public async Task<IActionResult> Filtreli(
    [FromQuery] int page,
    [FromBody] UrunFiltreDto filtre)
        {
            var result = await _webUrunService.FiltreliUrunKartlariniGetirAsync(filtre, page);
            return Ok(result);
        }
        //[HttpGet("KampanyalariGetir")]
        //public async Task<IActionResult> KampanyalariGetir()
        //{
        //    var result = await _webUrunService.KampanyalariGetir();
        //    return Ok(result);
        //}
    }
}


