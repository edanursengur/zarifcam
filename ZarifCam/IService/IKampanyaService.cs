using ZarifCam.Models;

namespace ZarifCam.IService
{
    public interface IKampanyaService
    {
        Task<List<Kampanyalar>> GetAktifKampanyalarAsync();
        Task<Kampanyalar> GetByIdAsync(int id);
        Task<int> CreateAsync(Kampanyalar kampanya);
        Task UpdateAsync(Kampanyalar kampanya);
        Task DeleteAsync(int id);
        Task<List<KampanyaKartlari>> GetKampanyaKartlariAsync();
    }
}
