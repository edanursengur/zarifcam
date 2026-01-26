using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ZarifCam.Models
{
    [Table("VurguluKategoriIcerikleri")]
    public class VurguluKategoriIcerikleri
    {
        [Key]
        public int IcerikID { get; set; }

        [Required]
        public int BolumID { get; set; }

        public int? KategoriID { get; set; }

        public long? KoleksiyonID { get; set; }

        [StringLength(100)]
        public string KoleksiyonAdi { get; set; }

        [StringLength(500)]
        public string Aciklama { get; set; }

        public string Ozellikler { get; set; } // JSON formatında

        [StringLength(500)]
        public string ResimUrl { get; set; }

        [StringLength(500)]
        public string VideoUrl { get; set; }

        [StringLength(20)]
        public string ArkaplanRengi { get; set; }

        [StringLength(50)]
        public string GosterimStili { get; set; } = "sol_resim";

        [StringLength(50)]
        public string AnimasyonTipi { get; set; }

        public int SiraNo { get; set; } = 0;

        public bool AktifMi { get; set; } = true;

        public DateTime OlusturulmaTarihi { get; set; } = DateTime.Now;

        // Navigation properties
        [ForeignKey("BolumID")]
        public virtual AnaSayfaBolumleri AnaSayfaBolum { get; set; }

        [ForeignKey("KategoriID")]
        public virtual Kategori Kategori { get; set; }

        [ForeignKey("KoleksiyonID")]
        public virtual Koleksiyon Koleksiyon { get; set; }
    }
}
