using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ZarifCam.Models
{
    [Table("KullaniciEtkilesimleri")]
    public class KullaniciEtkilesimleri
    {
        [Key]
        public long EtkilesimID { get; set; }

        public int? KullaniciID { get; set; }

        [StringLength(100)]
        public string OturumID { get; set; }

        [StringLength(45)]
        public string IPAdresi { get; set; }

        public int? BolumID { get; set; }

        public long? UrunID { get; set; }

        [Required]
        [StringLength(50)]
        public string Eylem { get; set; } // 'gosterim', 'tiklanma', 'hover', 'favori', 'sepete_ekle'

        [StringLength(500)]
        public string SayfaUrl { get; set; }

        [StringLength(500)]
        public string ReferansUrl { get; set; }

        [StringLength(50)]
        public string CihazTipi { get; set; } // 'masaustu', 'mobil', 'tablet'

        [StringLength(100)]
        public string Tarayici { get; set; }

        [DataType(DataType.Date)]
        public DateTime Tarih { get; set; } = DateTime.Today;

        [DataType(DataType.Time)]
        public TimeSpan Saat { get; set; } = DateTime.Now.TimeOfDay;

        public int? OturumSuresi { get; set; } // saniye

        public string EkVeri { get; set; } // JSON formatında

        // Navigation properties
        [ForeignKey("BolumID")]
        public virtual AnaSayfaBolumleri AnaSayfaBolum { get; set; }

        [ForeignKey("UrunID")]
        public virtual Urunler Urun { get; set; }
    }
}
