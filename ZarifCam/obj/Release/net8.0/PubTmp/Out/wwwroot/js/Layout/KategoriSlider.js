const categoryList = document.querySelector(".category-list");
const arrows = document.querySelectorAll(".cat-arrow");

// Scroll okları
if (arrows.length === 2 && categoryList) {
    arrows[0].addEventListener("click", () => {
        categoryList.scrollBy({ left: -200, behavior: "smooth" });
    });

    arrows[1].addEventListener("click", () => {
        categoryList.scrollBy({ left: 200, behavior: "smooth" });
    });
}

// Kategori item üretici
function createCategoryItem(category) {
    const id = category.TabloID;
    const name = category.Ad;

    return `
        <a href="/kategori/${id}" class="category-item" data-category-id="${id}">
            ${name}
        </a>
    `;
}
const API_BASE_URL = window.location.origin;

// API'den kategorileri çek (BASE URL ile)
fetch(`${API_BASE_URL}/api/anasayfa/kategoriler`)
    .then(res => res.json())
    .then(result => {
        if (!result.Success || !Array.isArray(result.Data)) {
            console.error("Kategori API bozuk:", result);
            return;
        }

        categoryList.innerHTML = "";

        result.Data.forEach(cat => {
            categoryList.insertAdjacentHTML("beforeend", createCategoryItem(cat));
        });
    })
    .catch(err => {
        console.error("Kategori çekme hatası:", err);
    });