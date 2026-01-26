namespace ZarifCam.IService
{
    public interface IEmailService
    {
        Task<bool> GonderAsync(string to, string konu, string icerik, bool htmlIcerik = true);
        Task<bool> SiparisOnayGonderAsync(string to, string siparisNo);
        Task<bool> BultenKayitGonderAsync(string to);
    }
}
