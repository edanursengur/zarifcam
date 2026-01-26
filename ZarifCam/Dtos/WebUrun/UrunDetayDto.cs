namespace ZarifCam.Dtos.WebUrun
{
    public class UrunDetayDto
    {
        public int UrunId { get; set; }
        public string UrunAdi { get; set; }
        public string KategoriAdi { get; set; }
        public decimal Fiyat { get; set; }
        public string DovizSembol { get; set; }
        public string Aciklama { get; set; }
        public string KisaAciklama { get; set; }
        public List<string> Medyalar { get; set; } // görsel URL listesi
        public List<string> Meta { get; set; }     // örn: ["El yapımı cam", "Bulaşık makinesine uygun"]
    }

}
