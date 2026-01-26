using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ZarifCam.Models
{
    [Table("GuvenBadgeleri")]
    public class GuvenBadgeleri
    {
        [Key]
        public int BadgeID { get; set; }

        [Required]
        public int BolumID { get; set; }

        [Required]
        [StringLength(50)]
        public string Ikon { get; set; } // FontAwesome ikon class'ı

        [Required]
        [StringLength(100)]
        public string Baslik { get; set; }

        [StringLength(200)]
        public string Aciklama { get; set; }

        [StringLength(500)]
        public string Link { get; set; }

        public string PopupIcerik { get; set; }

        [StringLength(20)]
        public string RenkKodu { get; set; }

        [StringLength(20)]
        public string IkonRenk { get; set; }

        public int SiraNo { get; set; } = 0;

        public bool AktifMi { get; set; } = true;

        // Navigation property
        [ForeignKey("BolumID")]
        public virtual AnaSayfaBolumleri AnaSayfaBolum { get; set; }
    }
}
