using Microsoft.AspNetCore.Mvc;

namespace ZarifCam.Controllers
{
    public class UrunController : Controller
    {
        public IActionResult Detay(int id)
        {
            return View();
        }

        [Route("Urunler")]
        public IActionResult Urunler()
        {
            return View();
        }
        [Route("Detay/{urunID}")]
        public IActionResult Detay()
        {
            return View();
        }
    }
}
