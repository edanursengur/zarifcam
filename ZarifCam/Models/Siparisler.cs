using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ZarifCam.Models
{
    [Table("Siparisler")]
    public class Siparisler
    {
        [Key]
        [StringLength(50)]
        public string SiparisNo { get; set; }

        public int? UrunID { get; set; }

        public int? RenkID { get; set; }

        public int Adet { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? SatisFiyati { get; set; }

        public int? DovizTipiID { get; set; }

        [StringLength(50)]
        public string Platform { get; set; }

        public int? KampanyaID { get; set; }

        public DateTime Tarih { get; set; } = DateTime.Now;

        // Ek alanlar (Opsiyonel)
        [StringLength(100)]
        public string MusteriAdi { get; set; }

        [StringLength(100)]
        public string MusteriEmail { get; set; }

        [StringLength(20)]
        public string MusteriTelefon { get; set; }

        [StringLength(500)]
        public string TeslimatAdresi { get; set; }

        [StringLength(50)]
        public string Durum { get; set; } = "Beklemede"; // Beklemede, Hazırlanıyor, Kargoda, TeslimEdildi, İptal

        // Navigation properties
        [ForeignKey("UrunID")]
        public virtual Urunler Urun { get; set; }

        [ForeignKey("RenkID")]
        public virtual Renkler Renk { get; set; }

        [ForeignKey("DovizTipiID")]
        public virtual DovizTipi DovizTipi { get; set; }

        [ForeignKey("KampanyaID")]
        public virtual Kampanyalar Kampanya { get; set; }
    }
}
