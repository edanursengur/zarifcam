using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ZarifCam.Models
{
    [Table("KisiselOneriKurallari")]
    public class KisiselOneriKurallari
    {
        [Key]
        public int KuralID { get; set; }

        [Required]
        public int BolumID { get; set; }

        [Required]
        [StringLength(100)]
        public string KuralAdi { get; set; }

        [Required]
        [StringLength(50)]
        public string KuralTipi { get; set; } // 'benzer_urun', 'birlikte_alinan', 'gecmis_alisveris', 'populer', 'mevsimsel'

        public string Parametreler { get; set; } // JSON formatında

        public string Filtreler { get; set; } // JSON formatında

        public int UrunSayisi { get; set; } = 6;

        public int? GosterimSuresi { get; set; } // saat cinsinden

        public int Agirlik { get; set; } = 1;

        [StringLength(50)]
        public string SiralamaKriteri { get; set; }

        public int TestGrupYuzdesi { get; set; } = 100;

        public decimal? BasariOrani { get; set; }

        public bool AktifMi { get; set; } = true;

        public DateTime OlusturulmaTarihi { get; set; } = DateTime.Now;

        // Navigation property
        [ForeignKey("BolumID")]
        public virtual AnaSayfaBolumleri AnaSayfaBolum { get; set; }
    }
}
