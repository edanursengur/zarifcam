using Microsoft.AspNetCore.Mvc;
using ZarifCam.Data;
using ZarifCam.Models;

namespace ZarifCam.Controllers
{
    [ApiController]
    [Route("api/kategori")]
    public class KategoriApi : ControllerBase
    {
        private readonly IKategoiService _repo;

        public KategoriApi(IKategoiService repo)
        {
            _repo = repo;
        }

        [HttpGet]
        [Route("KategoriGet")]
        public async Task<IActionResult> Get()
        {
            var kategoriler = await _repo.AktifKategorileriGetirAsync();
            return Ok(kategoriler);
        }
    }
}
