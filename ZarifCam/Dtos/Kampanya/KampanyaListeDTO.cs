namespace ZarifCam.Dtos.Kampanya
{
    public class KampanyaListeDTO
    {
        public int KampanyaID { get; set; }
        public string Ad { get; set; }
        public string TipAdi { get; set; }
        public DateTime BaslangicTarihi { get; set; }
        public DateTime BitisTarihi { get; set; }
        public string GorselUrl { get; set; }
        public string Link { get; set; }
        public int? IndirimOrani { get; set; }

        // Kampanya Kartı Alanları
        public string KartBaslik { get; set; }
        public string KartAciklama { get; set; }
        public string KartButonYazi { get; set; }
        public string KartButonLink { get; set; }
        public string KartArkaplanResim { get; set; }
        public string KartOnplanResim { get; set; }
        public string KartArkaplanRengi { get; set; }

        // Görünen Alanlar
        public string BadgeText { get; set; } // Rozet metni (sağ üst)
        public string AnaMetin { get; set; } // Ana metin (orta)
        public string VurguMetni { get; set; } // Vurgu metni (alt)

        // Ürün Görseli
        public string UrunGorselUrl { get; set; }

        public int UrunSayisi { get; set; }
        public bool AktifMi { get; set; }
    }
}
