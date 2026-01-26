using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ZarifCam.Models
{
    [Table("slider_items")]
    public class SliderItem
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required, MaxLength(200)]
        [Column("title")]
        public string Title { get; set; } = null!;

        [MaxLength(500)]
        [Column("description")]
        public string? Description { get; set; }

        [Required, MaxLength(500)]
        [Column("image_url")]
        public string ImageUrl { get; set; } = null!;

        [MaxLength(100)]
        [Column("button_text")]
        public string? ButtonText { get; set; }

        [MaxLength(500)]
        [Column("button_url")]
        public string? ButtonUrl { get; set; }

        [Column("display_order")]
        public int Order { get; set; }

        [Column("is_active")]
        public bool IsActive { get; set; } = true;

        [Column("start_date")]
        public DateTime? StartDate { get; set; }

        [Column("end_date")]
        public DateTime? EndDate { get; set; }

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
