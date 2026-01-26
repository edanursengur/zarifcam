namespace ZarifCam.Models
{
    public class UrunFiyat
    {
        public long TabloID { get; set; }
        public long UrunId { get; set; }
        public Urunler Urun { get; set; } = null!;

        public long DovizTipiId { get; set; }
        public DovizTipi DovizTipi { get; set; } = null!;

        public decimal Fiyat { get; set; }
        public bool AktifMi { get; set; }
    }

}
