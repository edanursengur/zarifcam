// Tüm Ürünler Sayfası JavaScript - Anasayfadaki slider ile aynı yapıyı kullanır
document.addEventListener('DOMContentLoaded', function () {
    // DOM Elementleri
    const productsGrid = document.getElementById('productsGrid');
    const productCountSpan = document.getElementById('productCount');
    const sortSelect = document.getElementById('sortSelect');
    const filterSidebar = document.getElementById('filtersSidebar');
    const filterToggleBtn = document.getElementById('filterToggleBtn');
    const closeFiltersBtn = document.getElementById('closeFiltersBtn');
    const applyFiltersBtn = document.getElementById('applyFiltersBtn');
    const resetFiltersBtn = document.getElementById('resetFiltersBtn');
    const paginationDiv = document.getElementById('pagination');

    // Görünüm modu butonları
    const viewBtns = document.querySelectorAll('.view-btn');

    // API Base URL
    const API_BASE_URL = window.location.origin;

    // State değişkenleri
    let allProducts = [];           // Tüm ürünler (filtrelenmemiş)
    let filteredProducts = [];      // Filtrelenmiş ürünler
    let currentPage = 1;
    let pageSize = 12;
    let currentView = 'grid';
    let currentSort = 'default';

    // Filtre state'leri
    let currentFilters = {
        categories: [],
        brands: [],
        minPrice: 0,
        maxPrice: 10000,
        minRating: 0
    };

    // Sayfa yüklendiğinde
    init();

    async function init() {
        await loadAllProducts();     // Tüm ürünleri çek
        setupEventListeners();       // Event listener'ları kur
    }

    // TÜM ÜRÜNLERİ ÇEK (adet parametresi YOK)
    async function loadAllProducts() {
        try {
            if (productsGrid) {
                productsGrid.innerHTML = '<div class="loading-spinner">Ürünler yükleniyor...</div>';
            }

            // DİKKAT: adet parametresi GÖNDERMİYORUZ -> tüm ürünler gelir
            const response = await fetch(`${API_BASE_URL}/api/anasayfa/onecikan-urunler`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const apiResponse = await response.json();

            if (apiResponse.Success && apiResponse.Data) {
                allProducts = apiResponse.Data;
                filteredProducts = [...allProducts];
                applyFiltersAndRender();
            } else {
                throw new Error(apiResponse.Message || 'Ürünler yüklenemedi');
            }

        } catch (error) {
            console.error('Ürünler yüklenirken hata:', error);
            if (productsGrid) {
                productsGrid.innerHTML = `
                    <div class="error-message">
                        Ürünler yüklenirken bir hata oluştu.
                        <button onclick="location.reload()">Tekrar Dene</button>
                    </div>
                `;
            }
        }
    }

    // Filtreleri uygula ve render et
    function applyFiltersAndRender() {
        let result = [...allProducts];

        // Kategori filtresi
        if (currentFilters.categories.length > 0) {
            result = result.filter(product =>
                currentFilters.categories.includes(product.KategoriId?.toString()) ||
                currentFilters.categories.includes(product.KategoriAdi)
            );
        }

        // Marka filtresi
        if (currentFilters.brands.length > 0) {
            result = result.filter(product =>
                currentFilters.brands.includes(product.MarkaId?.toString()) ||
                currentFilters.brands.includes(product.MarkaAdi)
            );
        }

        // Fiyat filtresi
        result = result.filter(product => {
            const price = product.IndirimliFiyat || product.Fiyat;
            return price >= currentFilters.minPrice && price <= currentFilters.maxPrice;
        });

        // Rating filtresi
        if (currentFilters.minRating > 0) {
            result = result.filter(product =>
                (product.Rating || 0) >= currentFilters.minRating
            );
        }

        // Sıralama
        result = sortProducts(result, currentSort);

        filteredProducts = result;
        updateProductCount();
        renderProductsWithPagination();
    }

    // Ürünleri sırala
    function sortProducts(products, sortType) {
        const sorted = [...products];

        switch (sortType) {
            case 'price-asc':
                return sorted.sort((a, b) => (a.IndirimliFiyat || a.Fiyat) - (b.IndirimliFiyat || b.Fiyat));
            case 'price-desc':
                return sorted.sort((a, b) => (b.IndirimliFiyat || b.Fiyat) - (a.IndirimliFiyat || a.Fiyat));
            case 'newest':
                return sorted.sort((a, b) => new Date(b.EklenmeTarihi || 0) - new Date(a.EklenmeTarihi || 0));
            case 'rating':
                return sorted.sort((a, b) => (b.Rating || 0) - (a.Rating || 0));
            case 'bestseller':
                return sorted.sort((a, b) => (b.SatisAdedi || 0) - (a.SatisAdedi || 0));
            default:
                return sorted;
        }
    }

    // Sayfalama ile ürünleri render et
    function renderProductsWithPagination() {
        const totalProducts = filteredProducts.length;
        const totalPages = Math.ceil(totalProducts / pageSize);
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

        renderProducts(paginatedProducts);
        renderPagination(totalPages);
    }

    // Ürünleri render et (anasayfadaki kartlarla AYNI YAPI)
    function renderProducts(products) {
        if (!productsGrid) return;

        if (!products || products.length === 0) {
            productsGrid.innerHTML = '<div class="no-products">Henüz ürün bulunmuyor.</div>';
            productsGrid.className = `products-grid ${currentView === 'list' ? 'list-view' : ''}`;
            return;
        }

        productsGrid.className = `products-grid ${currentView === 'list' ? 'list-view' : ''}`;

        productsGrid.innerHTML = products.map(product => {
            // İndirim yüzdesi
            const discountPercent = product.EskiFiyat && product.EskiFiyat > product.Fiyat
                ? Math.round(((product.EskiFiyat - product.Fiyat) / product.EskiFiyat) * 100)
                : null;

            // Rozetler
            const badges = [];
            if (product.YeniMi) badges.push('<span class="badge new">Yeni</span>');
            if (product.CokSatanMi) badges.push('<span class="badge bestseller">Çok Satan</span>');
            if (product.UcretsizKargoVarMi) badges.push('<span class="badge free-shipping">Ücretsiz Kargo</span>');
            if (discountPercent) badges.push(`<span class="badge discount">%${discountPercent}</span>`);

            // Taksit
            const taksitMiktari = product.TaksitSecenekleri || 6;
            const taksitFiyati = (product.IndirimliFiyat || product.Fiyat) / taksitMiktari;

            // Fiyat formatlama
            const currentPrice = (product.IndirimliFiyat || product.Fiyat).toLocaleString('tr-TR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });

            const oldPrice = product.EskiFiyat ? product.EskiFiyat.toLocaleString('tr-TR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }) : null;

            const installmentPrice = taksitFiyati.toLocaleString('tr-TR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });

            return `
            <div class="product-card" data-product-id="${product.Id}">
                <div class="card-image-section">
                    <a href="/detay/${product.Id}" class="product-image-link">
                        <img src="${product.AnaGorsel || 'https://via.placeholder.com/300x400?text=Ürün+Görseli'}" 
                             alt="${product.Ad}"
                             class="product-image"
                             loading="lazy"
                             onerror="this.src='https://via.placeholder.com/300x400?text=Görsel+Yok'">
                        
                        ${product.HoverGorsel ? `
                            <img src="${product.HoverGorsel}" 
                                 alt="${product.Ad}"
                                 class="product-image hover-image"
                                 loading="lazy"
                                 onerror="this.style.display='none'">
                        ` : ''}
                    </a>
                    
                    <div class="product-badges">
                        ${badges.join('')}
                    </div>
                    
                    <button class="fav-btn" aria-label="Favorilere ekle" data-product-id="${product.Id}">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                                  stroke="currentColor"
                                  stroke-width="1.5"
                                  fill="none" />
                        </svg>
                    </button>
                </div>
                
                <div class="card-content">
                    <div class="product-category">
                        <span>${product.KategoriAdi || 'Kategori'}</span>
                        <span>★ ${(product.Rating || 4.5).toFixed(1)}</span>
                    </div>
                    
                    <h3 class="product-title">
                        <a href="/detay/${product.ID}">${product.Ad}</a>
                    </h3>
                    
                    ${product.Renkler && product.Renkler.length > 0 ? `
                        <div class="product-variants">
                            <div class="variant-selector">
                                <span class="variant-label">Renk:</span>
                                <div class="variant-options">
                                    ${product.Renkler.map((renk, index) => `
                                        <button class="variant-option ${index === 0 ? 'active' : ''}"
                                                data-variant-id="${renk.Id}"
                                                aria-label="${renk.Ad} renk"
                                                style="background: ${renk.HexKodu || '#f0f0f0'};"
                                                title="${renk.Ad}">
                                        </button>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="product-price-section">
                        <div class="price-main">
                            <span class="current-price">₺${currentPrice}</span>
                            ${oldPrice ? `<span class="old-price">₺${oldPrice}</span>` : ''}
                        </div>
                        ${product.TaksitSecenekleri > 0 ? `
                            <div class="installment">
                                <span>${taksitMiktari}x</span>
                                <span class="installment-price">₺${installmentPrice}</span>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div class="product-actions">
                        <button class="add-to-cart-btn" data-product-id="${product.Id}">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <path d="M9 22a1 1 0 100-2 1 1 0 000 2zM20 22a1 1 0 100-2 1 1 0 000 2zM1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"
                                      stroke="currentColor"
                                      stroke-width="2"
                                      stroke-linecap="round"
                                      stroke-linejoin="round" />
                            </svg>
                            Sepete Ekle
                        </button>
                        <button class="quick-view-btn" aria-label="Hızlı görüntüle" data-product-id="${product.Id}">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2" />
                                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
        }).join('');

        // Buton event'lerini bağla (anasayfadaki gibi)
        attachButtonEvents();
        initColorButtons();
    }

    // Buton event'lerini bağla (anasayfadaki initializeButtons ile aynı)
    function attachButtonEvents() {
        // Favori butonları
        document.querySelectorAll('.fav-btn').forEach(btn => {
            btn.removeEventListener('click', handleFavorite);
            btn.addEventListener('click', handleFavorite);
        });

        // Sepete ekle butonları
        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.removeEventListener('click', handleAddToCart);
            btn.addEventListener('click', handleAddToCart);
        });

        // Hızlı görüntüle butonları
        document.querySelectorAll('.quick-view-btn').forEach(btn => {
            btn.removeEventListener('click', handleQuickView);
            btn.addEventListener('click', handleQuickView);
        });
    }

    // Favori işlemi
    function handleFavorite(e) {
        e.preventDefault();
        e.stopPropagation();

        const btn = e.currentTarget;
        const isActive = btn.classList.contains('active');
        const svg = btn.querySelector('svg');
        const path = svg.querySelector('path');

        if (isActive) {
            btn.classList.remove('active');
            if (path) {
                path.setAttribute('fill', 'none');
                path.setAttribute('stroke', 'currentColor');
            }
        } else {
            btn.classList.add('active');
            if (path) {
                path.setAttribute('fill', '#E8B4B8');
                path.setAttribute('stroke', '#E8B4B8');
            }
        }
    }

    // Sepete ekle işlemi
    function handleAddToCart(e) {
        const btn = e.currentTarget;
        const productCard = btn.closest('.product-card');
        const productId = productCard?.dataset.productId;
        const title = productCard?.querySelector('.product-title a')?.textContent;
        const price = productCard?.querySelector('.current-price')?.textContent;

        const originalText = btn.innerHTML;
        btn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Eklendi
        `;
        btn.style.background = '#4CAF50';

        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = '';
        }, 2000);

        console.log(`Sepete eklendi: ${title} - ${price} (ID: ${productId})`);
    }

    // Hızlı görüntüle işlemi
    function handleQuickView(e) {
        const btn = e.currentTarget;
        const productCard = btn.closest('.product-card');
        const productId = productCard?.dataset.productId;
        const title = productCard?.querySelector('.product-title a')?.textContent;

        console.log(`Hızlı görüntüleme: ${title} (ID: ${productId})`);

        // Modal açma event'i
        const event = new CustomEvent('openQuickView', {
            detail: { productId: productId }
        });
        document.dispatchEvent(event);
    }

    // Renk butonları için (anasayfadaki initColorButtons ile aynı)
    function initColorButtons() {
        document.querySelectorAll('.variant-option').forEach(btn => {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);

            newBtn.addEventListener('click', async function (e) {
                e.preventDefault();
                e.stopPropagation();

                const renkId = this.dataset.variantId;
                const productCard = this.closest('.product-card');

                if (!renkId || !productCard) return;

                productCard.style.opacity = '0.6';
                productCard.style.pointerEvents = 'none';

                try {
                    const response = await fetch(`/api/anasayfa/urun-detay/${renkId}`);
                    const result = await response.json();

                    if (result.Success && result.Data) {
                        const urun = result.Data;

                        const img = productCard.querySelector('.product-image');
                        if (img) img.src = urun.anaGorsel || urun.AnaGorsel;

                        const title = productCard.querySelector('.product-title a');
                        if (title) {
                            title.textContent = urun.ad || urun.Ad;
                            title.href = `/detay/${urun.Id || urun.id}`;
                        }

                        const price = productCard.querySelector('.current-price');
                        if (price) {
                            const fiyat = (urun.indirimliFiyat || urun.fiyat || urun.Fiyat).toLocaleString('tr-TR');
                            price.textContent = `₺${fiyat}`;
                        }

                        const rating = productCard.querySelector('.product-category span:last-child');
                        if (rating) rating.textContent = `★ ${urun.rating || urun.Rating || '4.5'}`;

                        const cartBtn = productCard.querySelector('.add-to-cart-btn');
                        if (cartBtn) cartBtn.dataset.productId = urun.id || urun.Id;

                        const selector = this.closest('.variant-selector');
                        if (selector) {
                            selector.querySelectorAll('.variant-option').forEach(b => b.classList.remove('active'));
                            this.classList.add('active');
                        }
                    }
                } catch (error) {
                    console.error('Renk değiştirme hatası:', error);
                } finally {
                    productCard.style.opacity = '1';
                    productCard.style.pointerEvents = 'auto';
                }
            });
        });
    }

    // Filtre seçeneklerini yükle
    async function loadFilters() {
        try {
            // Kategorileri ürünlerden çıkar
            const categories = [...new Set(allProducts.map(p => p.KategoriAdi).filter(Boolean))];
            const categoryFilter = document.getElementById('categoryFilter');
            if (categoryFilter) {
                categoryFilter.innerHTML = categories.map(cat => `
                    <label>
                        <input type="checkbox" value="${cat}" data-type="category">
                        ${cat}
                    </label>
                `).join('');
            }

            // Markaları ürünlerden çıkar
            const brands = [...new Set(allProducts.map(p => p.MarkaAdi).filter(Boolean))];
            const brandFilter = document.getElementById('brandFilter');
            if (brandFilter) {
                brandFilter.innerHTML = brands.map(brand => `
                    <label>
                        <input type="checkbox" value="${brand}" data-type="brand">
                        ${brand}
                    </label>
                `).join('');
            }

            // Fiyat aralığını ayarla
            const prices = allProducts.map(p => p.IndirimliFiyat || p.Fiyat).filter(Boolean);
            const minPriceTotal = Math.min(...prices, 0);
            const maxPriceTotal = Math.max(...prices, 1000);

            const priceMin = document.getElementById('priceMin');
            const priceMax = document.getElementById('priceMax');
            const minPriceInput = document.getElementById('minPrice');
            const maxPriceInput = document.getElementById('maxPrice');

            if (priceMin) {
                priceMin.min = minPriceTotal;
                priceMin.max = maxPriceTotal;
                priceMin.value = minPriceTotal;
                priceMax.min = minPriceTotal;
                priceMax.max = maxPriceTotal;
                priceMax.value = maxPriceTotal;
                minPriceInput.value = minPriceTotal;
                maxPriceInput.value = maxPriceTotal;
            }

        } catch (error) {
            console.error('Filtreler yüklenirken hata:', error);
        }
    }

    // Event listener'ları kur
    function setupEventListeners() {
        // Sıralama
        if (sortSelect) {
            sortSelect.addEventListener('change', () => {
                currentSort = sortSelect.value;
                currentPage = 1;
                applyFiltersAndRender();
            });
        }

        // Filtre toggle (mobil)
        if (filterToggleBtn) {
            filterToggleBtn.addEventListener('click', () => {
                filterSidebar.classList.toggle('active');
            });
        }

        if (closeFiltersBtn) {
            closeFiltersBtn.addEventListener('click', () => {
                filterSidebar.classList.remove('active');
            });
        }

        // Filtre uygula
        if (applyFiltersBtn) {
            applyFiltersBtn.addEventListener('click', () => {
                collectFilters();
                currentPage = 1;
                applyFiltersAndRender();
                if (window.innerWidth <= 768) {
                    filterSidebar.classList.remove('active');
                }
            });
        }

        // Filtreleri sıfırla
        if (resetFiltersBtn) {
            resetFiltersBtn.addEventListener('click', () => {
                resetAllFilters();
                currentPage = 1;
                applyFiltersAndRender();
            });
        }

        // Görünüm modu
        viewBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const view = btn.dataset.view;
                currentView = view;
                viewBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                renderProductsWithPagination();
            });
        });

        // Fiyat range slider
        const priceMin = document.getElementById('priceMin');
        const priceMax = document.getElementById('priceMax');
        const minPriceInput = document.getElementById('minPrice');
        const maxPriceInput = document.getElementById('maxPrice');

        if (priceMin) {
            priceMin.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                if (value < parseInt(priceMax.value)) {
                    minPriceInput.value = value;
                }
            });

            priceMax.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                if (value > parseInt(priceMin.value)) {
                    maxPriceInput.value = value;
                }
            });
        }
    }

    // Filtreleri topla
    function collectFilters() {
        // Kategoriler
        const categoryCheckboxes = document.querySelectorAll('#categoryFilter input:checked');
        currentFilters.categories = Array.from(categoryCheckboxes).map(cb => cb.value);

        // Markalar
        const brandCheckboxes = document.querySelectorAll('#brandFilter input:checked');
        currentFilters.brands = Array.from(brandCheckboxes).map(cb => cb.value);

        // Fiyat aralığı
        const minPriceInput = document.getElementById('minPrice');
        const maxPriceInput = document.getElementById('maxPrice');
        currentFilters.minPrice = parseInt(minPriceInput?.value) || 0;
        currentFilters.maxPrice = parseInt(maxPriceInput?.value) || 10000;

        // Rating
        const ratingCheckboxes = document.querySelectorAll('#ratingFilter input:checked');
        const ratings = Array.from(ratingCheckboxes).map(cb => parseInt(cb.value));
        currentFilters.minRating = ratings.length > 0 ? Math.min(...ratings) : 0;
    }

    // Tüm filtreleri sıfırla
    function resetAllFilters() {
        document.querySelectorAll('#categoryFilter input').forEach(cb => cb.checked = false);
        document.querySelectorAll('#brandFilter input').forEach(cb => cb.checked = false);
        document.querySelectorAll('#ratingFilter input').forEach(cb => cb.checked = false);

        const minPriceInput = document.getElementById('minPrice');
        const maxPriceInput = document.getElementById('maxPrice');
        const priceMin = document.getElementById('priceMin');
        const priceMax = document.getElementById('priceMax');

        if (minPriceInput && maxPriceInput && priceMin && priceMax) {
            const prices = allProducts.map(p => p.IndirimliFiyat || p.Fiyat).filter(Boolean);
            const minPriceTotal = Math.min(...prices, 0);
            const maxPriceTotal = Math.max(...prices, 1000);

            minPriceInput.value = minPriceTotal;
            maxPriceInput.value = maxPriceTotal;
            priceMin.value = minPriceTotal;
            priceMax.value = maxPriceTotal;
        }

        currentFilters = {
            categories: [],
            brands: [],
            minPrice: 0,
            maxPrice: 10000,
            minRating: 0
        };
    }

    // Ürün sayısını güncelle
    function updateProductCount() {
        if (productCountSpan) {
            productCountSpan.textContent = filteredProducts.length;
        }
    }

    // Sayfalama render et
    function renderPagination(totalPages) {
        if (!paginationDiv) return;

        if (totalPages <= 1) {
            paginationDiv.innerHTML = '';
            return;
        }

        let paginationHtml = '';

        // Önceki buton
        paginationHtml += `
            <button class="page-prev" ${currentPage === 1 ? 'disabled' : ''}>
                &laquo;
            </button>
        `;

        // Sayfa numaraları
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, currentPage + 2);

        if (startPage > 1) {
            paginationHtml += `<button data-page="1">1</button>`;
            if (startPage > 2) paginationHtml += `<span>...</span>`;
        }

        for (let i = startPage; i <= endPage; i++) {
            paginationHtml += `
                <button data-page="${i}" class="${i === currentPage ? 'active' : ''}">
                    ${i}
                </button>
            `;
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) paginationHtml += `<span>...</span>`;
            paginationHtml += `<button data-page="${totalPages}">${totalPages}</button>`;
        }

        // Sonraki buton
        paginationHtml += `
            <button class="page-next" ${currentPage === totalPages ? 'disabled' : ''}>
                &raquo;
            </button>
        `;

        paginationDiv.innerHTML = paginationHtml;

        // Sayfalama event'leri
        paginationDiv.querySelectorAll('button[data-page]').forEach(btn => {
            btn.addEventListener('click', () => {
                const page = parseInt(btn.dataset.page);
                if (page !== currentPage) {
                    currentPage = page;
                    renderProductsWithPagination();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            });
        });

        const prevBtn = paginationDiv.querySelector('.page-prev');
        const nextBtn = paginationDiv.querySelector('.page-next');

        if (prevBtn && !prevBtn.disabled) {
            prevBtn.addEventListener('click', () => {
                if (currentPage > 1) {
                    currentPage--;
                    renderProductsWithPagination();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            });
        }

        if (nextBtn && !nextBtn.disabled) {
            nextBtn.addEventListener('click', () => {
                if (currentPage < totalPages) {
                    currentPage++;
                    renderProductsWithPagination();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            });
        }
    }
});