using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ZarifCam.Models
{
    [Table("MusteriYorumlari")]
    public class MusteriYorumlari
    {
        [Key]
        public int YorumID { get; set; }

        [Required]
        public int BolumID { get; set; }

        [Required]
        [StringLength(100)]
        public string MusteriAdi { get; set; }

        [StringLength(100)]
        public string MusteriUnvan { get; set; }

        [StringLength(500)]
        public string MusteriResim { get; set; }

        [Required]
        public string Yorum { get; set; }

        [StringLength(500)]
        public string KisaYorum { get; set; } // slider'da gösterilecek kısa versiyon

        public decimal Puan { get; set; } = 5.0m;

        public long? UrunID { get; set; }

        [StringLength(50)]
        public string SiparisNo { get; set; }

        [StringLength(100)]
        public string Sehir { get; set; }

        public bool OnayliMi { get; set; } = false;

        public bool OneCikanMi { get; set; } = false;

        public DateTime Tarih { get; set; } = DateTime.Now;

        // Navigation properties
        [ForeignKey("BolumID")]
        public virtual AnaSayfaBolumleri AnaSayfaBolum { get; set; }

        [ForeignKey("UrunID")]
        public virtual Urunler Urun { get; set; }
    }
}
