using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using ZarifCam.Dtos.Kampanya;
using ZarifCam.Services.Interfaces;

namespace KampanyaYonetim.Controllers
{
    public class KampanyaController : Controller
    {
        private readonly IKampanyaService _kampanyaService;

        public KampanyaController(IKampanyaService kampanyaService)
        {
            _kampanyaService = kampanyaService;
        }

        // GET: Kampanya
        public async Task<IActionResult> Index()
        {
            var kampanyalar = await _kampanyaService.GetAllKampanyalarAsync();
            return View(kampanyalar);
        }

        // GET: Kampanya/Detay/5
        public async Task<IActionResult> Detay(int id)
        {
            var kampanya = await _kampanyaService.GetKampanyaByIdAsync(id);
            if (kampanya == null)
            {
                return NotFound();
            }
            return View(kampanya);
        }

        // GET: Kampanya/Olustur
        public async Task<IActionResult> Olustur()
        {
            ViewBag.KampanyaTipleri = await _kampanyaService.GetAllKampanyaTipleriAsync();
            ViewBag.Urunler = await _kampanyaService.GetUrunlerAsync();
            return View();
        }

        // POST: Kampanya/Olustur
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Olustur(KampanyaOlusturDTO kampanyaDto)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    var kampanyaId = await _kampanyaService.CreateKampanyaAsync(kampanyaDto);
                    TempData["Basari"] = "Kampanya başarıyla oluşturuldu.";
                    return RedirectToAction(nameof(Detay), new { id = kampanyaId });
                }
                catch (Exception ex)
                {
                    ModelState.AddModelError("", "Kampanya oluşturulurken bir hata oluştu: " + ex.Message);
                }
            }

            ViewBag.KampanyaTipleri = await _kampanyaService.GetAllKampanyaTipleriAsync();
            ViewBag.Urunler = await _kampanyaService.GetUrunlerAsync();
            return View(kampanyaDto);
        }

        // GET: Kampanya/Duzenle/5
        public async Task<IActionResult> Duzenle(int id)
        {
            var kampanya = await _kampanyaService.GetKampanyaByIdAsync(id);
            if (kampanya == null)
            {
                return NotFound();
            }

            ViewBag.KampanyaTipleri = await _kampanyaService.GetAllKampanyaTipleriAsync();
            return View(kampanya);
        }

        // POST: Kampanya/Sil/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Sil(int id)
        {
            var result = await _kampanyaService.DeleteKampanyaAsync(id);
            if (result)
            {
                TempData["Basari"] = "Kampanya başarıyla silindi.";
            }
            else
            {
                TempData["Hata"] = "Kampanya silinirken bir hata oluştu.";
            }
            return RedirectToAction(nameof(Index));
        }
    }
}