using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ZarifCam.Models
{
    [Table("why_zarif_cam_items")]
    public class WhyZarifCamItem
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required, MaxLength(150)]
        [Column("title")]
        public string Title { get; set; } = null!;

        [Required, MaxLength(500)]
        [Column("description")]
        public string Description { get; set; } = null!;

        [Column("display_order")]
        public int Order { get; set; }

        [Column("is_active")]
        public bool IsActive { get; set; } = true;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
