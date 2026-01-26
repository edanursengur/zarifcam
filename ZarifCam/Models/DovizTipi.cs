namespace ZarifCam.Models
{
    public class DovizTipi
    {
        public long TabloID { get; set; }
        public string Kod { get; set; } = null!; // TRY, USD, EUR
        public string Ad { get; set; } = null!;
        public string Sembol { get; set; } = null!;
    }

}
