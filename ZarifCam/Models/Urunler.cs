using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using ZarifCam.Dtos.AnaSayfa;

namespace ZarifCam.Models
{
    public class Urunler
    {
        [Key]
        public long TabloID { get; set; }

        [Required]
        [StringLength(200)]
        public string Ad { get; set; }

        [Required]
        [StringLength(200)]
        public string Slug { get; set; }

        [StringLength(500)]
        public string KisaAciklama { get; set; }

        public string Aciklama { get; set; }

        public bool AnaSayfadaOneCikanMi { get; set; } = false;

        public bool AktifMi { get; set; } = true;

        [Required]
        public int KategoriId { get; set; }

        public DateTime OlusturulmaTarihi { get; set; } = DateTime.UtcNow;

        public DateTime? GuncellemeTarihi { get; set; }

        // Navigation properties
        [ForeignKey("KategoriId")]
        public virtual Kategori Kategori { get; set; }

        public virtual ICollection<UrunMedyalari> Medyalar { get; set; }
        public virtual ICollection<UrunFiyatlari> Fiyatlar { get; set; }
        public virtual ICollection<UrunRenk> Renkler { get; set; }
        public virtual ICollection<UrunStok> Stoklar { get; set; }
        public virtual ICollection<UrunKoleksiyon> Koleksiyonlar { get; set; }
    }

}
