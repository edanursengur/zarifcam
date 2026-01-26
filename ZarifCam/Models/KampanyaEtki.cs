using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ZarifCam.Models
{
    [Table("KampanyaEtki")]
    public class KampanyaEtki
    {
        [Key]
        public int EtkiID { get; set; }

        public int? KampanyaID { get; set; }

        public int? UrunID { get; set; }

        public int SatilanAdet { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal ToplamIndirim { get; set; } = 0;

        [Column(TypeName = "decimal(18,2)")]
        public decimal KarFarki { get; set; } = 0;

        public DateTime? BaslangicTarihi { get; set; }

        public DateTime? BitisTarihi { get; set; }

        // Navigation properties
        [ForeignKey("KampanyaID")]
        public virtual Kampanyalar Kampanya { get; set; }

        [ForeignKey("UrunID")]
        public virtual Urunler Urun { get; set; }
    }
}
