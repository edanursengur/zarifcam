namespace ZarifCam.Models
{
    public class UrunKoleksiyon
    {
        public long TabloID { get; set; }
        public long UrunId { get; set; }
        public Urunler Urun { get; set; } = null!;

        public long KoleksiyonId { get; set; }
        public Koleksiyon Koleksiyon { get; set; } = null!;
    }
}
