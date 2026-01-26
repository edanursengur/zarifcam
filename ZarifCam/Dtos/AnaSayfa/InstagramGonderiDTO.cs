namespace ZarifCam.Dtos.AnaSayfa
{
    // 7. Instagram Gönderi DTO
    public class InstagramGonderiDTO
    {
        public int GonderiID { get; set; }
        public string InstagramGonderiID { get; set; }
        public string GonderiTipi { get; set; } // "image", "video", "reels"
        public string KapakResim { get; set; }
        public string VideoUrl { get; set; }
        public string Link { get; set; }
        public int BegeniSayisi { get; set; }
        public int YorumSayisi { get; set; }
        public string KisaAciklama { get; set; }
        public List<string> Etiketler { get; set; }
    }

}
