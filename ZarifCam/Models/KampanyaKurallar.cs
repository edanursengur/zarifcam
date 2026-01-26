using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ZarifCam.Models
{
    [Table("KampanyaKurallar")]
    public class KampanyaKurallar
    {
        [Key]
        public int KampanyaKuralID { get; set; }

        public int? KampanyaID { get; set; }

        public int? UrunID { get; set; }

        public int? KoleksiyonID { get; set; }

        public int? MinAdet { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? IndirimTutar { get; set; }

        [Column(TypeName = "decimal(5,2)")]
        public decimal? IndirimOrani { get; set; }

        public int? Oncelik { get; set; } = 1;

        public bool? AktifMi { get; set; } = true;

        // Ek alanlar
        public int? KategoriID { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? MinSepetTutari { get; set; }

        // Navigation properties
        [ForeignKey("KampanyaID")]
        public virtual Kampanyalar Kampanya { get; set; }

        [ForeignKey("UrunID")]
        public virtual Urunler Urun { get; set; }

        [ForeignKey("KoleksiyonID")]
        public virtual Koleksiyon Koleksiyon { get; set; }

        [ForeignKey("KategoriID")]
        public virtual Kategori Kategori { get; set; }
    }
}
