using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ZarifCam.Models
{
    [Table("AnaSayfaBolumleri")]
    public class AnaSayfaBolumleri
    {
        [Key]
        public int BolumID { get; set; }

        [Required]
        [StringLength(50)]
        public string BolumTipi { get; set; } // 'vurgulu_kategori', 'instagram', 'oneriler', 'kampanya', 'marka_hikayesi', 'guven_badgeleri'

        public int SiraNo { get; set; } = 0;

        public bool AktifMi { get; set; } = true;

        public DateTime? BaslangicTarihi { get; set; }

        public DateTime? BitisTarihi { get; set; }

        [StringLength(100)]
        public string GunlukSaatler { get; set; } // '09:00-23:00'

        public string HedefKitle { get; set; } // JSON formatında

        [StringLength(200)]
        public string Baslik { get; set; }

        [StringLength(500)]
        public string AltBaslik { get; set; }

        public string Aciklama { get; set; }

        [StringLength(50)]
        public string ButonYazi { get; set; }

        [StringLength(500)]
        public string ButonLink { get; set; }

        [StringLength(500)]
        public string ArkaplanResim { get; set; }

        [StringLength(500)]
        public string OnplanResim { get; set; }

        [StringLength(500)]
        public string VideoUrl { get; set; }

        public string StilAyarlari { get; set; } // JSON formatında

        public int GosterimSayisi { get; set; } = 0;

        public int TiklanmaSayisi { get; set; } = 0;

        public DateTime OlusturulmaTarihi { get; set; } = DateTime.Now;

        public DateTime? GuncellenmeTarihi { get; set; }

        public int? OlusturanKullaniciID { get; set; }
    }
}
