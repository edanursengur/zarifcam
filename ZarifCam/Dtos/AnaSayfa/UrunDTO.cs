namespace ZarifCam.Dtos.AnaSayfa
{
    // 5. Ürün DTO
    public class UrunDTO
    {
        public long TabloID { get; set; }
        public string Ad { get; set; }
        public string Slug { get; set; }
        public string KisaAciklama { get; set; }
        public decimal Fiyat { get; set; }
        public decimal? IndirimliFiyat { get; set; }
        public decimal IndirimOrani => IndirimliFiyat.HasValue
            ? Math.Round((1 - (IndirimliFiyat.Value / Fiyat)) * 100, 0)
            : 0;
        public string AnaGorsel { get; set; }
        public string HoverGorsel { get; set; }
        public int KategoriId { get; set; }
        public string KategoriAd { get; set; }
        public DateTime OlusturulmaTarihi { get; set; }
        public bool StoktaVar { get; set; }
    }

}
