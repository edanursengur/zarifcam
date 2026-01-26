//using Microsoft.AspNetCore.Mvc;
//using ZarifCam.Dtos;

//namespace ZarifCam.Controllers.Admin
//{
//    [ApiController]
//    [Route("api/admin/slider")]
//    public class SliderAdminController : ControllerBase
//    {
//        private readonly IAdminService _service;

//        public SliderAdminController(IAdminService service)
//        {
//            _service = service;
//        }

//        [HttpGet]
//        public async Task<IActionResult> GetAll()
//        {
//            var sliders = await _service.GetAllAsync();
//            return Ok(sliders);
//        }

//        [HttpGet("{id}")]
//        public async Task<IActionResult> Get(int id)
//        {
//            try
//            {
//                var slider = await _service.GetByIdAsync(id);
//                return Ok(slider);
//            }
//            catch (KeyNotFoundException)
//            {
//                return NotFound();
//            }
//        }

//        [HttpPost]
//        public async Task<IActionResult> Create([FromBody] SliderItemDto dto)
//        {
//            var created = await _service.CreateAsync(dto);
//            return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
//        }

//        [HttpPut("{id}")]
//        public async Task<IActionResult> Update(int id, [FromBody] SliderItemDto dto)
//        {
//            try
//            {
//                await _service.UpdateAsync(id, dto);
//                return NoContent();
//            }
//            catch (KeyNotFoundException)
//            {
//                return NotFound();
//            }
//        }

//        [HttpDelete("{id}")]
//        public async Task<IActionResult> Delete(int id)
//        {
//            try
//            {
//                await _service.DeleteAsync(id);
//                return NoContent();
//            }
//            catch (KeyNotFoundException)
//            {
//                return NotFound();
//            }
//        }
//    }
//}
