using ZarifCam.Models;

namespace ZarifCam.IService
{
    public interface IKategoriService
    {
        Task<List<Kategori>> GetAllAsync();
        Task<List<Kategori>> GetAnaSayfaKategorileriAsync();
        Task<Kategori> GetBySlugAsync(string slug);
        Task<Kategori> GetByIdAsync(int id);
        Task<int> CreateAsync(Kategori kategori);
        Task UpdateAsync(Kategori kategori);
        Task DeleteAsync(int id);
        Task<List<Kategori>> GetTreeAsync();
    }
}
