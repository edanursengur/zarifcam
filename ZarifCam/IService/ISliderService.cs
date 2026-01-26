using ZarifCam.Models;

namespace ZarifCam.IService
{
    public interface ISliderService
    {
        Task<List<HeroSlider>> GetAllAsync();
        Task<HeroSlider> GetByIdAsync(int id);
        Task<int> CreateAsync(HeroSlider slider);
        Task UpdateAsync(HeroSlider slider);
        Task DeleteAsync(int id);
        Task ReorderAsync(List<int> ids);
    }
}
