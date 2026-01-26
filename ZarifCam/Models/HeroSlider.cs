namespace ZarifCam.Models
{
    public class HeroSlider
    {
        public int Id { get; set; }

        public string MedyaUrl { get; set; }          // görsel / video yolu
        public string Baslik { get; set; }             // opsiyonel başlık
        public string Aciklama { get; set; }           // opsiyonel açıklama

        public string ButonText { get; set; }          // örn: "Keşfet"
        public string ButonLink { get; set; }          // örn: /Urunler

        public int Sira { get; set; }                  // slider sırası
        public bool AktifMi { get; set; }

        public DateTime OlusturmaTarihi { get; set; }
    }

}
