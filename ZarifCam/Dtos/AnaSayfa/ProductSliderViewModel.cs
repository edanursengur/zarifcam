namespace ZarifCam.Dtos.AnaSayfa
{
    // ViewModels/ProductSliderViewModel.cs
    public class ProductSliderViewModel
    {
        public long Id { get; set; }
        public string Ad { get; set; }
        public string Slug { get; set; }
        public string KisaAciklama { get; set; }
        public string ModelKodu { get; set; }      // YENİ
        public string Renk { get; set; }            // YENİ - Ürünün kendi rengi
        public string RenkKodu { get; set; }
        public decimal Fiyat { get; set; }
        public decimal? IndirimliFiyat { get; set; }
        public decimal? EskiFiyat { get; set; }
        public double Rating { get; set; }
        public string AnaGorsel { get; set; }
        public string HoverGorsel { get; set; }
        public string KategoriAdi { get; set; }
        public string KategoriSlug { get; set; }
        public bool YeniMi { get; set; }
        public bool CokSatanMi { get; set; }
        public bool SinirliStokMu { get; set; }
        public bool UcretsizKargoVarMi { get; set; }
        public int StokAdedi { get; set; }
        public int TaksitSecenekleri { get; set; }
        public List<RenkViewModel> Renkler { get; set; }
        public List<RenkliUrunViewModel> RenkSecenekleri { get; set; }
    }

    public class RenkViewModel
    {
        public long Id { get; set; }
        public string Ad { get; set; }
        public string HexKodu { get; set; }
        public int StokAdedi { get; set; }
        public bool SeciliMi { get; set; }
    }
    public class RenkliUrunViewModel
    {
        public long Id { get; set; }
        public string Renk { get; set; }
        public string RenkKodu { get; set; }
        public string AnaGorsel { get; set; }
        public decimal Fiyat { get; set; }
        public decimal? IndirimliFiyat { get; set; }
        public int StokAdedi { get; set; }
        public string Slug { get; set; }
    }
}
