// Görsel önizleme
const gorselInput = document.getElementById("gorsel");
const gorselPreview = document.getElementById("gorselPreview");

gorselInput.addEventListener("change", function () {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            gorselPreview.setAttribute("src", e.target.result);
        }
        reader.readAsDataURL(file);
    } else {
        gorselPreview.setAttribute("src", "");
    }
});

// Form submit (JS validation + console log örnek)
const urunForm = document.getElementById("urunForm");
urunForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const data = {
        urunAdi: document.getElementById("urunAdi").value,
        kategori: document.getElementById("kategori").value,
        fiyat: parseFloat(document.getElementById("fiyat").value),
        aciklama: document.getElementById("aciklama").value,
        gorsel: gorselInput.files[0] || null
    };

    console.log("Ürün Eklendi:", data);

    alert("Ürün formu konsola loglandı. Backend ile bağla!");
});
