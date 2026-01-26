using Microsoft.AspNetCore.Mvc;

namespace ZarifCam.Controllers
{
    public class KategoriController : Controller
    {
        [Route("/Kategori")]
        public IActionResult Kategori(int id)
        {
            return View();
        }
    }
}
