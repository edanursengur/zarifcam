using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ZarifCam.Models
{
    [Table("UrunKar")]
    public class UrunKar
    {
        [Key]
        public int KarID { get; set; }

        public int? UrunID { get; set; }

        public int? RenkID { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal ToplamMaliyet { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal ToplamSatis { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal NetKar { get; set; } = 0;

        public int SatilanAdet { get; set; } = 0;

        public DateTime? HesaplamaTarihi { get; set; } = DateTime.Now;

        // Navigation properties
        [ForeignKey("UrunID")]
        public virtual Urunler Urun { get; set; }

        [ForeignKey("RenkID")]
        public virtual Renkler Renk { get; set; }
    }
}
