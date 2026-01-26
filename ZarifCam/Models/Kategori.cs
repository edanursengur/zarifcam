using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ZarifCam.Models
{
    public class Kategori
    {
        [Key]
        public int TabloID { get; set; }

        [Required]
        [StringLength(150)]
        public string Ad { get; set; }

        [Required]
        [StringLength(150)]
        public string Slug { get; set; }

        [StringLength(500)]
        public string GorselUrl { get; set; }

        public bool AnaSayfadaGoster { get; set; } = true;

        public int Sira { get; set; }

        public bool AktifMi { get; set; } = true;

        public int? UstKategoriId { get; set; }

        public DateTime OlusturulmaTarihi { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("UstKategoriId")]
        public virtual Kategori UstKategori { get; set; }

        public virtual ICollection<Kategori> AltKategoriler { get; set; }
        public virtual ICollection<Urunler> Urunler { get; set; }
    }
}
