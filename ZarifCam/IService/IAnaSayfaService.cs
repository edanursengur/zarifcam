using ZarifCam.Dtos.AnaSayfa;
using ZarifCam.Dtos.Kampanya;

namespace ZarifCam.IService
{
    public interface IAnaSayfaService
    {
        Task<AnaSayfaDTO> TumAnaSayfaVerileriniGetirAsync(int? kullaniciId = null);
        public Task<IEnumerable<ProductSliderViewModel>> GetProductsAsync(
    int limit = 10,
    bool? sadecePaketler = null,
    bool? anaSayfadaOneCikanMi = null, int? kategoriId = null);
        public Task<IEnumerable<ProductSliderViewModel>> PaketleriGetirAsync(int limit = 10);

        Task<List<HeroSliderDTO>> HeroSliderlariGetirAsync();
        Task<List<HizliErisimDTO>> HizliErisimleriGetirAsync();
        public  Task<(List<ProductSliderViewModel> Items, int TotalCount)> GetProductsPagedAsync(
  int page = 1,
  int pageSize = 12,
  bool? sadecePaketler = null,
  bool? anaSayfadaOneCikanMi = null,
  int? kategoriId = null)
            ;
        Task<List<KategoriDTO>> AnaSayfaKategorileriniGetirAsync();
        public Task<IEnumerable<ProductSliderViewModel>> OneCikanUrunleriGetirAsync(int limit = 10);

        Task<List<VurguluKategoriDTO>> VurguluKategorileriGetirAsync();
        Task<List<InstagramGonderiDTO>> InstagramGonderileriniGetirAsync(int adet = 8);
        Task<List<UrunDTO>> KisiselOnerileriGetirAsync(int? kullaniciId, int adet = 6);
        //Task<List<KampanyaKartDto>> KampanyaKartlariniGetirAsync();
        Task<MarkaHikayesiDTO> MarkaHikayesiniGetirAsync();
        Task<List<GuvenBadgeDTO>> GuvenBadgeleriniGetirAsync();
        Task<List<MusteriYorumDTO>> MusteriYorumlariniGetirAsync(int adet = 5);
        public Task<ProductSliderViewModel> GetProductDetailAsync(long productId);
        Task<List<KampanyaListeDTO>> GetAktifKampanyalarAsync(int limit = 10);

    }
}
