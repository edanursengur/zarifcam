using ZarifCam.Models;

namespace ZarifCam.IService
{
    public interface IUrunService
    {
        Task<List<Urunler>> GetAllAsync();
        Task<Urunler> GetByIdAsync(long id);
        Task<Urunler> GetBySlugAsync(string slug);
        Task<List<Urunler>> GetOneCikanUrunlerAsync(int count = 12);
        Task<List<Urunler>> GetYeniUrunlerAsync(int count = 12);
        Task<List<Urunler>> GetCokSatanlarAsync(int count = 12);
        Task<List<Urunler>> GetKategoriUrunleriAsync(int kategoriId, int page = 1, int pageSize = 24);
        Task<int> GetKategoriUrunSayisiAsync(int kategoriId);
        Task<List<Urunler>> SearchAsync(string query, int page = 1, int pageSize = 24);
    }
   
}
