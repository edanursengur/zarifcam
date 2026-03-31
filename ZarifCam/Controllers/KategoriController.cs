using Microsoft.AspNetCore.Mvc;

namespace ZarifCam.Controllers
{
    public class KategoriController : Controller
    {
        [Route("/kategori/{id}")]
        public IActionResult Kategori(int id)
        {
            return View();
        }
    }
}
