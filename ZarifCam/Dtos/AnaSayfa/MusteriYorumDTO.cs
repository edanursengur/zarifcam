namespace ZarifCam.Dtos.AnaSayfa
{
    // 11. Müşteri Yorum DTO
    public class MusteriYorumDTO
    {
        public int YorumID { get; set; }
        public string MusteriAdi { get; set; }
        public string MusteriUnvan { get; set; }
        public string MusteriResim { get; set; }
        public string Yorum { get; set; }
        public string KisaYorum { get; set; }
        public decimal Puan { get; set; }
        public DateTime Tarih { get; set; }
        public long? UrunID { get; set; }
        public string UrunAd { get; set; }
    }
}
