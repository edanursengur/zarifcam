namespace ZarifCam.Dtos.Kampanya
{
    // DTOs/KampanyaOlusturDTO.cs
    using System;
    using System.Collections.Generic;
    using System.ComponentModel.DataAnnotations;

    public class KampanyaOlusturDTO
    {
        [Required(ErrorMessage = "Kampanya adı zorunludur")]
        [StringLength(200, ErrorMessage = "Kampanya adı en fazla 200 karakter olabilir")]
        public string? Ad { get; set; }

        [Required(ErrorMessage = "Kampanya tipi zorunludur")]
        public int? TipID { get; set; }
        public string? Tip { get; set; }

        [Required(ErrorMessage = "Başlangıç tarihi zorunludur")]
        public DateTime? BaslangicTarihi { get; set; }

        [Required(ErrorMessage = "Bitiş tarihi zorunludur")]
        public DateTime? BitisTarihi { get; set; }

        public string? GorselUrl { get; set; }
        public string? Link { get; set; }
        public bool? AktifMi { get; set; } = true;

        // Kampanya Kartları
        public List<KampanyaKartDTO>? Kartlar { get; set; }

        // Kampanya Kuralları
        public List<KampanyaKuralDTO>? Kurallar { get; set; }

        // Ürünler
        public List<int>? UrunIDs { get; set; }
    }

    public class KampanyaKartDTO
    {
        public string? Baslik { get; set; }
        public string? Aciklama { get; set; }
        public string? ButonYazi { get; set; }
        public string? ButonLink { get; set; }
        public string? ArkaplanResim { get; set; }
        public string? OnplanResim { get; set; }
        public string? ArkaplanRengi { get; set; }
        public DateTime? GeriSayimBaslangic { get; set; }
        public DateTime? GeriSayimBitis { get; set; }
        public int? KategoriID { get; set; }
        public int? UrunID { get; set; }
        public decimal? IndirimOrani { get; set; }
    }

    public class KampanyaKuralDTO
    {
        public int? UrunID { get; set; }
        public int? KoleksiyonID { get; set; }
        public int? MinAdet { get; set; }
        public decimal? IndirimTutar { get; set; }
        public decimal? IndirimOrani { get; set; }
        public int? Oncelik { get; set; }
    }

    public class UrunKampanyaDTO
    {
        public int? UrunID { get; set; }
        public string? UrunAdi { get; set; }
        public decimal? Fiyat { get; set; }
        public string? Kategori { get; set; }
    }
}
