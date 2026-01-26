using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ZarifCam.Models
{
    [Table("InstagramGonderileri")]
    public class InstagramGonderileri
    {
        [Key]
        public int GonderiID { get; set; }

        [Required]
        public int BolumID { get; set; }

        [StringLength(100)]
        public string InstagramGonderiID { get; set; }

        [StringLength(50)]
        public string GonderiTipi { get; set; } // 'resim', 'video', 'reels'

        public string Aciklama { get; set; }

        [StringLength(500)]
        public string KapakResim { get; set; }

        [StringLength(500)]
        public string VideoUrl { get; set; }

        [StringLength(500)]
        public string Link { get; set; }

        public int BegeniSayisi { get; set; } = 0;

        public int YorumSayisi { get; set; } = 0;

        public int PaylasimSayisi { get; set; } = 0;

        public string Etiketler { get; set; } // JSON formatında

        public string UrunEtiketleri { get; set; } // JSON formatında

        public DateTime? YayinTarihi { get; set; }

        public DateTime VeriCekmeTarihi { get; set; } = DateTime.Now;

        public int ManuelOncelik { get; set; } = 0;

        [DatabaseGenerated(DatabaseGeneratedOption.Computed)]
        public int OtomatikOncelik { get; set; }

        public bool AktifMi { get; set; } = true;

        // Navigation property
        [ForeignKey("BolumID")]
        public virtual AnaSayfaBolumleri AnaSayfaBolum { get; set; }
    }

    // Yardımcı sınıf
    public class UrunEtiket
    {
        public long UrunID { get; set; }
        public int X { get; set; }
        public int Y { get; set; }
        public string Aciklama { get; set; }
    }
}
