//using Microsoft.AspNetCore.Mvc;

//namespace ZarifCam.Controllers
//{
//    [ApiController]
//    [Route("api/slider")]
//    public class SliderController : Controller
//    {
//        private readonly ISliderService _sliderService;
//        public SliderController(ISliderService sliderService)
//        {
//            _sliderService = sliderService;
//        }
//        [HttpGet]
//        public async Task<IActionResult> Get()
//        {
//            var sliders = await _sliderService.GetActiveSlidersAsync();
//            return Ok(sliders);
//        }

//    }
//}
