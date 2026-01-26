namespace ZarifCam.Dtos.Kampanya
{
    public class KampanyaDto
    {
        public int Id { get; set; }
        public string Ad { get; set; }
        public string Aciklama { get; set; }
        public string GorselUrl { get; set; }
        public string Link { get; set; }
        public List<KampanyaKuralDto> Kurallar { get; set; }
    }

    public class KampanyaKuralDto
    {
        public int KampanyaKuralID { get; set; }
        public int UrunID { get; set; }
        public int? KoleksiyonID { get; set; }
        public int MinAdet { get; set; }
        public decimal? IndirimTutar { get; set; }
        public decimal? IndirimOrani { get; set; }
        public int Oncelik { get; set; }
        public bool AktifMi { get; set; }
    }

}
