using Microsoft.AspNetCore.Mvc.Rendering;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ZarifCam.Dtos.AnaSayfa;
using ZarifCam.Dtos.Kampanya;
using ZarifCam.Models;

namespace ZarifCam.Services.Interfaces
{
    public interface IKampanyaService
    {
        Task<IEnumerable<Kampanyalar>> GetAllKampanyalarAsync();
        Task<Kampanyalar> GetKampanyaByIdAsync(int id);
        Task<int> CreateKampanyaAsync(KampanyaOlusturDTO kampanyaDto);
        Task<bool> UpdateKampanyaAsync(Kampanyalar kampanya);
        Task<bool> DeleteKampanyaAsync(int id);
        Task<IEnumerable<KampanyaTipi>> GetAllKampanyaTipleriAsync();
        Task<IEnumerable<UrunDTO>> GetUrunlerAsync();
        Task<IEnumerable<KampanyaKurallar>> GetKampanyaKurallariAsync(int kampanyaId);
        Task<IEnumerable<KampanyaKartlari>> GetKampanyaKartlariAsync(int kampanyaId);
        Task<bool> KampanyaUrunEkleAsync(int kampanyaId, List<int> urunIds);
        Task<bool> KampanyaKuralEkleAsync(int kampanyaId, KampanyaKuralDTO kural);
        Task<bool> KampanyaKartEkleAsync(int kampanyaId, KampanyaKartDTO kart);
    }
}