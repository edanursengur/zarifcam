using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ZarifCam.Models
{
    [Table("KampanyaKartlari")]
    public class KampanyaKartlari
    {
        [Key]
        public int KartID { get; set; }

        [Required]
        public int BolumID { get; set; }

        public int? KampanyaID { get; set; }

        [Required]
        [StringLength(50)]
        public string KartTipi { get; set; } // 'gerisayim', 'kategori', 'urun', 'genel'

        [Required]
        [StringLength(200)]
        public string Baslik { get; set; }

        [StringLength(500)]
        public string Aciklama { get; set; }

        [StringLength(50)]
        public string ButonYazi { get; set; }

        [StringLength(500)]
        public string ButonLink { get; set; }

        [StringLength(500)]
        public string ArkaplanResim { get; set; }

        [StringLength(500)]
        public string OnplanResim { get; set; }

        [StringLength(20)]
        public string ArkaplanRengi { get; set; }

        public DateTime? GeriSayimBaslangic { get; set; }

        public DateTime? GeriSayimBitis { get; set; }

        public int? KategoriID { get; set; }

        public long? UrunID { get; set; }

        public decimal? IndirimOrani { get; set; }

        public int SiraNo { get; set; } = 0;

        public bool AktifMi { get; set; } = true;

        // Navigation properties
        [ForeignKey("BolumID")]
        public virtual AnaSayfaBolumleri AnaSayfaBolum { get; set; }

        [ForeignKey("KampanyaID")]
        public virtual Kampanyalar Kampanya { get; set; }

        [ForeignKey("KategoriID")]
        public virtual Kategori Kategori { get; set; }

        [ForeignKey("UrunID")]
        public virtual Urunler Urun { get; set; }
    }
}
