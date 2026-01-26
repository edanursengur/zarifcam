using Microsoft.AspNetCore.Mvc;

namespace ZarifCam.Controllers
{
    public class AdminController : Controller
    {
        // GET: /admin
        [HttpGet]
        [Route("admin")]
        public IActionResult Index()
        {
            return View(); // Views/Admin/Index.cshtml
        }
        [HttpGet]
        [Route("admin/slider")] // Route URL ile metod eşleşmeli
        public IActionResult Slider()
        {
            return View(); // Views/Admin/Index.cshtml
        }
        [HttpGet]
        [Route("admin/UrunEkle")] // Route URL ile metod eşleşmeli
        public IActionResult UrunEkle()
        {
            return View(); // Views/Admin/Index.cshtml
        }
        [HttpGet]
        [Route("admin/UrunListesi")] // Route URL ile metod eşleşmeli
        public IActionResult UrunListesi()
        {
            return View(); // Views/Admin/Index.cshtml
        }
        [HttpGet]
        [Route("admin/UrunGuncelle")] // Route URL ile metod eşleşmeli
        public IActionResult UrunGuncelle()
        {
            return View(); // Views/Admin/Index.cshtml
        }
        [HttpGet]
        [Route("admin/KategoriYonetim")] // Route URL ile metod eşleşmeli
        public IActionResult KategoriEkle()
        {
            return View(); // Views/Admin/Index.cshtml
        }
    }
}
