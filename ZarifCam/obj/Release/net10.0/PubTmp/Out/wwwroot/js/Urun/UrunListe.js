// Örnek ürün verisi
const urunler = [
    { id: 1, ad: "Kristal Sürahi", kategori: "Sürahiler", fiyat: 1250, gorsel: "~/medya/dfgdgf.png" },
    { id: 2, ad: "El Yapımı Kase", kategori: "Kaseler", fiyat: 850, gorsel: "~/medya/sdffg.png" },
    { id: 3, ad: "Zarif Bardak Seti", kategori: "Bardaklar", fiyat: 1450, gorsel: "~/medya/dfgdgf.png" }
];

const urunGrid = document.getElementById("urunGrid");

// Ürünleri grid içine ekle
urunler.forEach(urun => {
    const card = document.createElement("div");
    card.classList.add("product-card");
    card.innerHTML = `
        <div class="product-image">
            <img src="${urun.gorsel}" alt="${urun.ad}">
        </div>
        <div class="product-info">
            <div class="kategori">${urun.kategori}</div>
            <h3>${urun.ad}</h3>
            <div class="price">₺${urun.fiyat.toLocaleString()}</div>
        </div>
        <div class="card-actions">
            <button class="btn-update" onclick="guncelleUrun(${urun.id})">Güncelle</button>
            <button class="btn-delete" onclick="silUrun(${urun.id})">Sil</button>
        </div>
    `;
    urunGrid.appendChild(card);
});

// Buton işlevleri (console log örneği)
function guncelleUrun(id) {
    console.log("Güncellenecek Ürün ID:", id);
    alert(`Ürün ${id} güncelleme sayfasına yönlendirilecek (backend ile bağlanacak)`);
}

function silUrun(id) {
    console.log("Silinecek Ürün ID:", id);
    const confirmDelete = confirm("Bu ürünü silmek istediğinizden emin misiniz?");
    if (confirmDelete) {
        alert(`Ürün ${id} silinecek (backend ile bağlanacak)`);
    }
}
