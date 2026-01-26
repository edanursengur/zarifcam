// Örnek: ürün listesi tıklandığında formu doldurma
function populateUpdateForm(product) {
    document.getElementById('urunId').value = product.id;
    document.getElementById('urunAdi').value = product.name;
    document.getElementById('slug').value = product.slug;
    document.getElementById('kategori').value = product.categoryId;
    document.getElementById('fiyat').value = product.price;
    document.getElementById('aciklama').value = product.description || '';
    document.getElementById('isFeatured').checked = product.isFeatured;
    document.getElementById('isActive').checked = product.isActive;

    if (product.imageUrl) {
        document.getElementById('gorselPreview').src = product.imageUrl;
    } else {
        document.getElementById('gorselPreview').src = '';
    }
}

// Slug otomatik üretim
const urunAdiInput = document.getElementById('urunAdi');
const slugInput = document.getElementById('slug');
urunAdiInput.addEventListener('input', () => {
    const slug = urunAdiInput.value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    slugInput.value = slug;
});

// Görsel önizleme
const gorselInput = document.getElementById('gorsel');
const previewImg = document.getElementById('gorselPreview');
gorselInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        previewImg.src = URL.createObjectURL(file);
    }
});

// Form submit
const form = document.getElementById('urunGuncelleForm');
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(form);

    fetch(`/api/products/${formData.get('urunId')}`, {
        method: 'PUT',
        body: formData
    }).then(res => {
        if (res.ok) alert('Ürün başarıyla güncellendi!');
        else alert('Güncelleme hatası!');
    });
});