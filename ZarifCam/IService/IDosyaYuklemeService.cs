namespace ZarifCam.IService
{
    public interface IDosyaYuklemeService
    {
        Task<string> ResimYukleAsync(IFormFile file, string klasor = "urunler");
        Task<List<string>> CokluResimYukleAsync(List<IFormFile> files, string klasor = "urunler");
        Task<string> VideoYukleAsync(IFormFile file, string klasor = "videolar");
        Task<bool> DosyaSilAsync(string dosyaYolu);
        Task<string> OptimizeResimAsync(string kaynakYolu, int kalite = 85);
    }
}
