using ZarifCam.Dtos.Kampanya;

namespace ZarifCam.Dtos.AnaSayfa
{
    // DTO Klasörü

    // 1. Ana Sayfa Genel DTO
    public class AnaSayfaDTO
    {
        public List<HeroSliderDTO> HeroSliderlar { get; set; }
        public List<HizliErisimDTO> HizliErisimler { get; set; }
        public List<KategoriDTO> Kategoriler { get; set; }
        public List<UrunDTO> OneCikanUrunler { get; set; }
        public VurguluKategoriDTO VurguluKategori { get; set; }
        public List<InstagramGonderiDTO> InstagramGonderileri { get; set; }
        public List<UrunDTO> KisiselOneriler { get; set; }
        public List<KampanyaKartDTO> KampanyaKartlari { get; set; }
        public MarkaHikayesiDTO MarkaHikayesi { get; set; }
        public List<GuvenBadgeDTO> GuvenBadgeleri { get; set; }
        public List<MusteriYorumDTO> MusteriYorumlari { get; set; }
    }

   

  
  

   
   

  

  
}
