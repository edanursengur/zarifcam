namespace ZarifCam.Dtos.AnaSayfa
{
    // 9. Marka Hikayesi DTO
    public class MarkaHikayesiDTO
    {
        public int HikayeID { get; set; }
        public string Baslik { get; set; }
        public string AltBaslik { get; set; }
        public string Icerik { get; set; }
        public string ResimUrl { get; set; }
        public string VideoUrl { get; set; }
        public string Buton1Yazi { get; set; }
        public string Buton1Link { get; set; }
        public string Buton2Yazi { get; set; }
        public string Buton2Link { get; set; }
        public int? Yil { get; set; }
        public int? UretilenUrun { get; set; }
        public int? MutluMusteri { get; set; }
    }
}
