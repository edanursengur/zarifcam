namespace ZarifCam.Models
{
    public class Koleksiyon
    {
        public long TabloID { get; set; }
        public string Ad { get; set; } = null!;
        public string Slug { get; set; } = null!;
        public bool AktifMi { get; set; } = true;
    }

}
