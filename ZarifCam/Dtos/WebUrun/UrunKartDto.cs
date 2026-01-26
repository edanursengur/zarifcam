namespace ZarifCam.Dtos.WebUrun
{
    public class UrunKartDto
    {
        public long UrunId { get; set; }
        public long? RenkID { get; set; }
        public long? KategoriID { get; set; }
        public string UrunAdi { get; set; } = null!;
        public string KategoriAdi { get; set; } = null!;
        public decimal Fiyat { get; set; }
        public string DovizSembol { get; set; } = null!;
        public List<string> Gorseller { get; set; } = new();
        public string? RenkAdi { get; set; }

    }

}
