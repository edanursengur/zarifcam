using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ZarifCam.Models
{
    [Table("UrunStok")]
    public class UrunStok
    {
        [Key]
        public int TabloID { get; set; }

        public int? UrunID { get; set; }

        public int? RenkID { get; set; }

        public int MevcutAdet { get; set; } = 0;

        public int RezerveAdet { get; set; } = 0;

        public bool AktifMi { get; set; } = true;

        // Computed property
        [NotMapped]
        public int KullanilabilirAdet => MevcutAdet - RezerveAdet;

        // Navigation properties
        [ForeignKey("UrunID")]
        public virtual Urunler Urun { get; set; }

        [ForeignKey("RenkID")]
        public virtual Renkler Renk { get; set; }
    }
}
