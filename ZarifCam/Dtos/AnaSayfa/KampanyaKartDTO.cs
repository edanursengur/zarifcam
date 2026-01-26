namespace ZarifCam.Dtos.AnaSayfa
{
    // 8. Kampanya Kart DTO
    public class KampanyaKartDTO
    {
        public int KartID { get; set; }
        public string Baslik { get; set; }
        public string Aciklama { get; set; }
        public string ButonYazi { get; set; }
        public string ButonLink { get; set; }
        public string ArkaplanResim { get; set; }
        public string ArkaplanRengi { get; set; }
        public string KartTipi { get; set; } // "gerisayim", "indirim", "kategori"
        public DateTime? GeriSayimBitis { get; set; }
        public decimal? IndirimOrani { get; set; }
        public int? KategoriID { get; set; }
        public string KategoriAd { get; set; }
    }
}
