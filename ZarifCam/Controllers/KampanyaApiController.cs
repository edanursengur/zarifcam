using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using ZarifCam.Dtos.Kampanya;
using ZarifCam.Models;
using ZarifCam.Services.Interfaces;

namespace KampanyaYonetim.Controllers
{
    [Route("api/kampanya")]
    [ApiController]
    public class KampanyaApiController : ControllerBase
    {
        private readonly IKampanyaService _kampanyaService;

        public KampanyaApiController(IKampanyaService kampanyaService)
        {
            _kampanyaService = kampanyaService;
        }

        // GET: api/kampanya/tipleri
        [HttpGet("tipleri")]
        public async Task<IActionResult> GetKampanyaTipleri()
        {
            try
            {
                var tipler = await _kampanyaService.GetAllKampanyaTipleriAsync();
                return Ok(tipler);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Kampanya tipleri yüklenirken hata oluştu", error = ex.Message });
            }
        }

        // GET: api/kampanya/urunler
        [HttpGet("urunler")]
        public async Task<IActionResult> GetUrunler()
        {
            try
            {
                var urunler = await _kampanyaService.GetUrunlerAsync();
                return Ok(urunler);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Ürünler yüklenirken hata oluştu", error = ex.Message });
            }
        }

        // POST: api/kampanya/olustur
        [HttpPost("olustur")]
        public async Task<IActionResult> CreateKampanya([FromBody] KampanyaOlusturDTO kampanyaDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { message = "Geçersiz form verisi", errors = ModelState });
            }

            try
            {
                var kampanyaId = await _kampanyaService.CreateKampanyaAsync(kampanyaDto);
                return Ok(new
                {
                    message = "Kampanya başarıyla oluşturuldu",
                    kampanyaId = kampanyaId,
                    redirectUrl = Url.Action("Detay", "Kampanya", new { id = kampanyaId })
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Kampanya oluşturulurken hata oluştu", error = ex.Message });
            }
        }

        // GET: api/kampanya/liste
        [HttpGet("liste")]
        public async Task<IActionResult> GetKampanyalar()
        {
            try
            {
                var kampanyalar = await _kampanyaService.GetAllKampanyalarAsync();
                return Ok(kampanyalar);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Kampanyalar yüklenirken hata oluştu", error = ex.Message });
            }
        }

        // GET: api/kampanya/detay/{id}
        [HttpGet("detay/{id}")]
        public async Task<IActionResult> GetKampanyaDetay(int id)
        {
            try
            {
                var kampanya = await _kampanyaService.GetKampanyaByIdAsync(id);
                if (kampanya == null)
                {
                    return NotFound(new { message = "Kampanya bulunamadı" });
                }
                return Ok(kampanya);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Kampanya detayı yüklenirken hata oluştu", error = ex.Message });
            }
        }

        // POST: api/kampanya/guncelle/{id}
        [HttpPost("guncelle/{id}")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> UpdateKampanya(int id, [FromBody] KampanyaOlusturDTO kampanyaDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new { message = "Geçersiz form verisi", errors = ModelState });
            }

            try
            {
                var kampanya = new Kampanyalar
                {
                    KampanyaID = id,
                    Ad = kampanyaDto.Ad,
                    Tip = kampanyaDto.Tip,
                    BaslangicTarihi = kampanyaDto.BaslangicTarihi,
                    BitisTarihi = kampanyaDto.BitisTarihi,
                    AktifMi = kampanyaDto.AktifMi,
                    GorselUrl = kampanyaDto.GorselUrl,
                    Link = kampanyaDto.Link
                };

                var result = await _kampanyaService.UpdateKampanyaAsync(kampanya);
                if (result)
                {
                    return Ok(new { message = "Kampanya başarıyla güncellendi" });
                }
                return BadRequest(new { message = "Kampanya güncellenirken hata oluştu" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Kampanya güncellenirken hata oluştu", error = ex.Message });
            }
        }

        // POST: api/kampanya/sil/{id}
        [HttpPost("sil/{id}")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteKampanya(int id)
        {
            try
            {
                var result = await _kampanyaService.DeleteKampanyaAsync(id);
                if (result)
                {
                    return Ok(new { message = "Kampanya başarıyla silindi" });
                }
                return BadRequest(new { message = "Kampanya silinirken hata oluştu" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Kampanya silinirken hata oluştu", error = ex.Message });
            }
        }

        // POST: api/kampanya/{kampanyaId}/urun-ekle
        [HttpPost("{kampanyaId}/urun-ekle")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> KampanyaUrunEkle(int kampanyaId, [FromBody] List<int> urunIds)
        {
            try
            {
                var result = await _kampanyaService.KampanyaUrunEkleAsync(kampanyaId, urunIds);
                if (result)
                {
                    return Ok(new { message = "Ürünler kampanyaya eklendi" });
                }
                return BadRequest(new { message = "Ürünler eklenirken hata oluştu" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Ürünler eklenirken hata oluştu", error = ex.Message });
            }
        }

        // POST: api/kampanya/{kampanyaId}/kural-ekle
        [HttpPost("{kampanyaId}/kural-ekle")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> KampanyaKuralEkle(int kampanyaId, [FromBody] KampanyaKuralDTO kural)
        {
            try
            {
                var result = await _kampanyaService.KampanyaKuralEkleAsync(kampanyaId, kural);
                if (result)
                {
                    return Ok(new { message = "Kural kampanyaya eklendi" });
                }
                return BadRequest(new { message = "Kural eklenirken hata oluştu" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Kural eklenirken hata oluştu", error = ex.Message });
            }
        }

        // POST: api/kampanya/{kampanyaId}/kart-ekle
        [HttpPost("{kampanyaId}/kart-ekle")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> KampanyaKartEkle(int kampanyaId, [FromBody] KampanyaKartDTO kart)
        {
            try
            {
                var result = await _kampanyaService.KampanyaKartEkleAsync(kampanyaId, kart);
                if (result)
                {
                    return Ok(new { message = "Kart kampanyaya eklendi" });
                }
                return BadRequest(new { message = "Kart eklenirken hata oluştu" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Kart eklenirken hata oluştu", error = ex.Message });
            }
        }
    }
}