using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ZarifCam.Models
{
    [Table("MarkaHikayesi")]
    public class MarkaHikayesi
    {
        [Key]
        public int HikayeID { get; set; }

        [Required]
        public int BolumID { get; set; }

        [Required]
        [StringLength(200)]
        public string Baslik { get; set; }

        [StringLength(500)]
        public string AltBaslik { get; set; }

        public string Icerik { get; set; }

        [StringLength(500)]
        public string ResimUrl { get; set; }

        [StringLength(500)]
        public string VideoUrl { get; set; }

        public int? Yil { get; set; } // 35 yıllık deneyim gibi

        public int? UretilenUrun { get; set; }

        public int? MutluMusteri { get; set; }

        [StringLength(50)]
        public string Buton1Yazi { get; set; }

        [StringLength(500)]
        public string Buton1Link { get; set; }

        [StringLength(50)]
        public string Buton2Yazi { get; set; }

        [StringLength(500)]
        public string Buton2Link { get; set; }

        public int SiraNo { get; set; } = 0;

        public bool AktifMi { get; set; } = true;

        // Navigation property
        [ForeignKey("BolumID")]
        public virtual AnaSayfaBolumleri AnaSayfaBolum { get; set; }
    }
}
