//using Microsoft.EntityFrameworkCore;
//using ZarifCam.Data;
//using ZarifCam.Dtos;
//public interface ISliderService
//{
//    Task<List<SliderItemDto>> GetActiveSlidersAsync();
//}

//public class SliderService : ISliderService
//{
//    private readonly AppDbContext _context;

//    public SliderService(AppDbContext context)
//    {
//        _context = context;
//    }

//    public async Task<List<SliderItemDto>> GetActiveSlidersAsync()
//    {
//        return await _context.SliderItems
//            .Where(x => x.IsActive)
//            .OrderBy(x => x.Order)
//            .Select(x => new SliderItemDto
//            {
//                Title = x.Title,
//                Description = x.Description,
//                ImageUrl = x.ImageUrl,
//                ButtonText = x.ButtonText,
//                ButtonUrl = x.ButtonUrl
//            })
//            .ToListAsync();
//    }
//}
