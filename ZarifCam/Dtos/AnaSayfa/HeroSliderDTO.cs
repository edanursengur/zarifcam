namespace ZarifCam.Dtos.AnaSayfa
{
    // 2. HeroSlider DTO
    public class HeroSliderDTO
    {
        public int Id { get; set; }
        public string Baslik { get; set; }
        public string Aciklama { get; set; }
        public string ButonText { get; set; }
        public string ButonLink { get; set; }
        public string MedyaUrl { get; set; }
        public string MedyaTipi { get; set; } // "image", "video"
        public int Sira { get; set; }
    }
}
