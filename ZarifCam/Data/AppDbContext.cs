using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using ZarifCam.Models;

namespace ZarifCam.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        // Mevcut tablolar
        public DbSet<HeroSlider> HeroSlider { get; set; }
        public DbSet<Kategori> Kategori { get; set; }
        public DbSet<Urunler> Urunler { get; set; }
        public DbSet<UrunMedyalari> UrunMedyalari { get; set; }
        public DbSet<UrunFiyatlari> UrunFiyatlari { get; set; }
        public DbSet<Koleksiyon> Koleksiyon { get; set; }
        public DbSet<Renkler> Renkler { get; set; }
        public DbSet<UrunRenk> UrunRenk { get; set; }
        public DbSet<UrunStok> UrunStok { get; set; }
        public DbSet<UrunKoleksiyon> UrunKoleksiyon { get; set; }
        public DbSet<DovizTipi> DovizTipi { get; set; }
        public DbSet<Siparisler> Siparisler { get; set; }
        public DbSet<Kampanyalar> Kampanyalar { get; set; }
        public DbSet<KampanyaKurallar> KampanyaKurallar { get; set; }
        public DbSet<KampanyaEtki> KampanyaEtki { get; set; }
        public DbSet<UrunKar> UrunKar { get; set; }

        // Yeni eklenen tablolar
        public DbSet<AnaSayfaBolumleri> AnaSayfaBolumleri { get; set; }
        public DbSet<VurguluKategoriIcerikleri> VurguluKategoriIcerikleri { get; set; }
        public DbSet<InstagramGonderileri> InstagramGonderileri { get; set; }
        public DbSet<KisiselOneriKurallari> KisiselOneriKurallari { get; set; }
        public DbSet<KullaniciEtkilesimleri> KullaniciEtkilesimleri { get; set; }
        public DbSet<GuvenBadgeleri> GuvenBadgeleri { get; set; }
        public DbSet<MarkaHikayesi> MarkaHikayesi { get; set; }
        public DbSet<HizliErisimIkonlari> HizliErisimIkonlari { get; set; }
        public DbSet<KampanyaKartlari> KampanyaKartlari { get; set; }
        public DbSet<MusteriYorumlari> MusteriYorumlari { get; set; }
    }
}