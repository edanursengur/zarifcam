namespace ZarifCam.Dtos.AnaSayfa
{

    // 6. Vurgulu Kategori DTO
    public class VurguluKategoriDTO
    {
        public int IcerikID { get; set; }
        public string Baslik { get; set; }
        public string AltBaslik { get; set; }
        public string Aciklama { get; set; }
        public string ButonYazi { get; set; }
        public string ButonLink { get; set; }
        public string ResimUrl { get; set; }
        public string VideoUrl { get; set; }
        public string ArkaplanRengi { get; set; }
        public Dictionary<string, string> Ozellikler { get; set; }
        public int KategoriID { get; set; }
        public string KategoriAd { get; set; }
    }
}
