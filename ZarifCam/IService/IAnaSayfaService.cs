using ZarifCam.Dtos.AnaSayfa;

namespace ZarifCam.IService
{
    public interface IAnaSayfaService
    {
        Task<AnaSayfaDTO> TumAnaSayfaVerileriniGetirAsync(int? kullaniciId = null);
        Task<List<HeroSliderDTO>> HeroSliderlariGetirAsync();
        Task<List<HizliErisimDTO>> HizliErisimleriGetirAsync();
        Task<List<KategoriDTO>> AnaSayfaKategorileriniGetirAsync();
        Task<List<UrunDTO>> OneCikanUrunleriGetirAsync(int adet = 12);
        Task<List<VurguluKategoriDTO>> VurguluKategorileriGetirAsync();
        Task<List<InstagramGonderiDTO>> InstagramGonderileriniGetirAsync(int adet = 8);
        Task<List<UrunDTO>> KisiselOnerileriGetirAsync(int? kullaniciId, int adet = 6);
        Task<List<KampanyaKartDTO>> KampanyaKartlariniGetirAsync();
        Task<MarkaHikayesiDTO> MarkaHikayesiniGetirAsync();
        Task<List<GuvenBadgeDTO>> GuvenBadgeleriniGetirAsync();
        Task<List<MusteriYorumDTO>> MusteriYorumlariniGetirAsync(int adet = 5);
    }
}
