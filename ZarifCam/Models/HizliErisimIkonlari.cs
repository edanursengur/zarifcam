using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ZarifCam.Models
{
    [Table("HizliErisimIkonlari")]
    public class HizliErisimIkonlari
    {
        [Key]
        public int IkonID { get; set; }

        [Required]
        public int BolumID { get; set; }

        [Required]
        [StringLength(50)]
        public string Ikon { get; set; } // FontAwesome class

        [Required]
        [StringLength(100)]
        public string Baslik { get; set; }

        [StringLength(200)]
        public string Aciklama { get; set; }

        [Required]
        [StringLength(500)]
        public string Link { get; set; }

        [StringLength(50)]
        public string LinkTipi { get; set; } // 'kategori', 'sayfa', 'kampanya', 'urun_listesi'

        [StringLength(500)]
        public string ArkaplanResim { get; set; }

        [StringLength(500)]
        public string IkonResim { get; set; }

        public int TiklanmaSayisi { get; set; } = 0;

        public int SiraNo { get; set; } = 0;

        public bool AktifMi { get; set; } = true;

        // Navigation property
        [ForeignKey("BolumID")]
        public virtual AnaSayfaBolumleri AnaSayfaBolum { get; set; }
    }
}
