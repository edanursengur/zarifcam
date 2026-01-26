using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ZarifCam.Models
{
    public class UrunMedyalari
    {
        [Key]
        public int TabloID { get; set; }

        // Ürün ID
        [Required]
        public long UrunId { get; set; }

        // Ürün ilişkisi

        // Görsel URL
        [Required, MaxLength(500)]
        public string GorselUrl { get; set; } = null!;

        // Ana görsel mi?
        public bool AnaGorselMi { get; set; } = false;

        // Hover görseli mi?
        public bool HoverGorselMi { get; set; } = false;

        // Görsel sırası
        public int GosterimSirasi { get; set; }
    }
}
