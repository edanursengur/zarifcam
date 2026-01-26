using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ZarifCam.Models
{
    [Table("Kampanyalar")]
    public class Kampanyalar
    {
        [Key]
        public int KampanyaID { get; set; }

        [StringLength(200)]
        public string Ad { get; set; }

        [StringLength(50)]
        public string Tip { get; set; } // indirim, kargo, hediye, kupon

        public DateTime? BaslangicTarihi { get; set; }

        public DateTime? BitisTarihi { get; set; }

        public bool? AktifMi { get; set; } = true;

        public DateTime? OlusturulmaTarihi { get; set; } = DateTime.Now;

        [StringLength(200)]
        public string GorselUrl { get; set; }

        [StringLength(200)]
        public string Link { get; set; }

        // Ek alanlar
        [StringLength(1000)]
        public string Aciklama { get; set; }

        [Column(TypeName = "decimal(5,2)")]
        public decimal? IndirimOrani { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? IndirimTutari { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? MinAlisverisTutari { get; set; }

        public int? MaxKullanımSayisi { get; set; }

        public int? KullanılanSayisi { get; set; } = 0;

        [StringLength(50)]
        public string KuponKodu { get; set; }

        // Navigation property
        public virtual ICollection<KampanyaKurallar> Kurallar { get; set; }
    }
}
