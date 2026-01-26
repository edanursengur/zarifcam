//using Microsoft.EntityFrameworkCore;
//using ZarifCam.Data;
//using ZarifCam.Dtos;
//using ZarifCam.Models;
//public interface IAdminService
//{
//    Task<List<SliderItemDto>> GetAllAsync();
//    Task<SliderItemDto> GetByIdAsync(int id);
//    Task<SliderItemDto> CreateAsync(SliderItemDto dto);
//    Task UpdateAsync(int id, SliderItemDto dto);
//    Task DeleteAsync(int id);
//}


//public class AdminService : IAdminService
//{
//    private readonly AppDbContext _context;

//    public AdminService(AppDbContext context)
//    {
//        _context = context;
//    }

//    public async Task<List<SliderItemDto>> GetAllAsync()
//    {
//        return await _context.SliderItems
//            .OrderBy(x => x.Order)
//            .Select(x => new SliderItemDto
//            {
//                Id = x.Id,
//                Title = x.Title,
//                Description = x.Description,
//                ImageUrl = x.ImageUrl,
//                ButtonText = x.ButtonText,
//                ButtonUrl = x.ButtonUrl,
//                Order = x.Order,
//                IsActive = x.IsActive
//            })
//            .ToListAsync();
//    }

//    public async Task<SliderItemDto> GetByIdAsync(int id)
//    {
//        var item = await _context.SliderItems.FindAsync(id);
//        if (item == null) throw new KeyNotFoundException("Slider bulunamadı");

//        return new SliderItemDto
//        {
//            Id = item.Id,
//            Title = item.Title,
//            Description = item.Description,
//            ImageUrl = item.ImageUrl,
//            ButtonText = item.ButtonText,
//            ButtonUrl = item.ButtonUrl,
//            Order = item.Order,
//            IsActive = item.IsActive
//        };
//    }

//    public async Task<SliderItemDto> CreateAsync(SliderItemDto dto)
//    {
//        var entity = new SliderItem
//        {
//            Title = dto.Title,
//            Description = dto.Description,
//            ImageUrl = dto.ImageUrl,
//            ButtonText = dto.ButtonText,
//            ButtonUrl = dto.ButtonUrl,
//            Order = dto.Order,
//            IsActive = dto.IsActive,
//            CreatedAt = DateTime.UtcNow
//        };

//        _context.SliderItems.Add(entity);
//        await _context.SaveChangesAsync();

//        dto.Id = entity.Id;
//        return dto;
//    }

//    public async Task UpdateAsync(int id, SliderItemDto dto)
//    {
//        var entity = await _context.SliderItems.FindAsync(id);
//        if (entity == null) throw new KeyNotFoundException("Slider bulunamadı");

//        entity.Title = dto.Title;
//        entity.Description = dto.Description;
//        entity.ImageUrl = dto.ImageUrl;
//        entity.ButtonText = dto.ButtonText;
//        entity.ButtonUrl = dto.ButtonUrl;
//        entity.Order = dto.Order;
//        entity.IsActive = dto.IsActive;

//        await _context.SaveChangesAsync();
//    }

//    public async Task DeleteAsync(int id)
//    {
//        var entity = await _context.SliderItems.FindAsync(id);
//        if (entity == null) throw new KeyNotFoundException("Slider bulunamadı");

//        _context.SliderItems.Remove(entity);
//        await _context.SaveChangesAsync();
//    }
//}
