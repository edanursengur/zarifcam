namespace ZarifCam.Models
{
    public class KampanyaTipi
    {
        public int TipID { get; set; }
        public string TipKodu { get; set; }
        public string TipAdi { get; set; }
        public string Aciklama { get; set; }
        public string Icon { get; set; }
        public string Renk { get; set; }
        public int SiraNo { get; set; }
        public bool AktifMi { get; set; }
        public DateTime OlusturulmaTarihi { get; set; }
    }
}
