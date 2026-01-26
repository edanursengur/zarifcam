using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ZarifCam.Models
{
    [Table("UrunFiyatlari")]
    public class UrunFiyatlari
    {
        [Key]
        public long TabloID { get; set; }

        [Required]
        public long UrunId { get; set; }

        [Required]
        public long DovizTipiId { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Fiyat { get; set; }

        public bool AktifMi { get; set; } = true;

        [Column(TypeName = "decimal(18,2)")]
        public decimal? IndirimliFiyat { get; set; }

        public DateTime? IndirimBaslangic { get; set; }

        public DateTime? IndirimBitis { get; set; }

        // Navigation properties
        [ForeignKey("UrunId")]
        public virtual Urunler Urun { get; set; }

        [ForeignKey("DovizTipiId")]
        public virtual DovizTipi DovizTipi { get; set; }
    }
}
