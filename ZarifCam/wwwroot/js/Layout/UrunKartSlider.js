// Trendyol Tarzı Ürün Slider - API Entegrasyonlu
document.addEventListener('DOMContentLoaded', function () {
    const track = document.getElementById('productSliderTrack');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');

    // API Base URL - Kendi domaininize göre ayarlayın
    const API_BASE_URL = window.location.origin; // Veya doğrudan https://localhost:7000 gibi

    // Öne çıkan ürünleri getir
    fetchFeaturedProducts();

    async function fetchFeaturedProducts() {
        try {
            // Loading göster
            track.innerHTML = '<div class="loading-spinner">Ürünler yükleniyor...</div>';

            // API'den ürünleri çek (12 adet)
            const response = await fetch(`${API_BASE_URL}/api/anasayfa/onecikan-urunler?adet=12`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    // Gerekirse Authorization header ekleyin
                    // 'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const apiResponse = await response.json();

            if (apiResponse.Success && apiResponse.Data) {
                // Ürünleri render et
                renderProducts(apiResponse.Data);
            } else {
                throw new Error(apiResponse.Message || 'Ürünler yüklenemedi');
            }

        } catch (error) {
            console.error('Ürünler yüklenirken hata:', error);
            track.innerHTML = `
                <div class="error-message">
                    Ürünler yüklenirken bir hata oluştu. 
                    <button onclick="location.reload()">Tekrar Dene</button>
                </div>
            `;
        }
    }

    function renderProducts(products) {
        if (!products || products.length === 0) {
            track.innerHTML = '<div class="no-products">Henüz ürün bulunmuyor.</div>';
            return;
        }

        // Ürün kartlarını oluştur
        track.innerHTML = products.map(product => {
            // İndirim yüzdesini hesapla
            const discountPercent = product.EskiFiyat && product.EskiFiyat > product.Fiyat
                ? Math.round(((product.EskiFiyat - product.Fiyat) / product.EskiFiyat) * 100)
                : null;

            // Rozetleri belirle - property isimleri büyük harf
            const badges = [];
            if (product.YeniMi) badges.push('<span class="badge new">Yeni</span>');
            if (product.CokSatanMi) badges.push('<span class="badge bestseller">Çok Satan</span>');
            //if (product.SinirliStokMu) badges.push('<span class="badge limited">Sınırlı Stok</span>');
            if (product.UcretsizKargoVarMi) badges.push('<span class="badge free-shipping">Ücretsiz Kargo</span>');
            if (discountPercent) badges.push(`<span class="badge discount">%${discountPercent}</span>`);

            // Taksit hesaplama
            const taksitMiktari = product.TaksitSecenekleri || 6;
            const taksitFiyati = (product.IndirimliFiyat || product.Fiyat) / taksitMiktari;

            // Fiyatları formatla
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
                        <span>★ ${product.Rating?.toFixed(1) || '0.0'}</span>
                    </div>

                    <h3 class="product-title">
                        <a href="/detay/${product.Id}">${product.Ad}</a>
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
                            ${oldPrice ? `
                                <span class="old-price">₺${oldPrice}</span>
                            ` : ''}
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

        // Slider'ı başlat
        initializeSlider();

        // Buton event'lerini başlat
        initializeButtons();

        initColorButtons();
    }

    function initializeSlider() {
        const cards = document.querySelectorAll('.product-card');
        if (!cards.length) return;

        // Slider değişkenleri
        let currentPosition = 0;
        let cardWidth = cards[0].offsetWidth + 20; // gap dahil
        let visibleCards = Math.floor(document.querySelector('.slider-container').offsetWidth / cardWidth);
        let maxPosition = Math.max(0, cards.length - visibleCards);

        // Butonları güncelle
        function updateButtons() {
            if (prevBtn) prevBtn.disabled = currentPosition === 0;
            if (nextBtn) nextBtn.disabled = currentPosition >= maxPosition;
        }

        // Slider pozisyonunu güncelle
        function updateSliderPosition() {
            track.style.transform = `translateX(-${currentPosition * cardWidth}px)`;
            updateButtons();
        }

        // Sonraki kartlara git
        function nextSlide() {
            if (currentPosition < maxPosition) {
                currentPosition++;
                updateSliderPosition();
            }
        }

        // Önceki kartlara git
        function prevSlide() {
            if (currentPosition > 0) {
                currentPosition--;
                updateSliderPosition();
            }
        }

        // Mevcut event listener'ları temizle
        if (prevBtn) {
            prevBtn.replaceWith(prevBtn.cloneNode(true));
            document.querySelector('.prev-btn')?.addEventListener('click', prevSlide);
        }
        if (nextBtn) {
            nextBtn.replaceWith(nextBtn.cloneNode(true));
            document.querySelector('.next-btn')?.addEventListener('click', nextSlide);
        }

        // Touch/swipe desteği
        let startX = 0;
        let isDragging = false;

        track.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
        });

        track.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
        });

        track.addEventListener('touchend', (e) => {
            if (!isDragging) return;

            const endX = e.changedTouches[0].clientX;
            const diff = startX - endX;

            if (Math.abs(diff) > 50) {
                if (diff > 0 && currentPosition < maxPosition) {
                    nextSlide();
                } else if (diff < 0 && currentPosition > 0) {
                    prevSlide();
                }
            }

            isDragging = false;
        });

        // Fare ile sürükleme
        track.addEventListener('mousedown', (e) => {
            startX = e.clientX;
            isDragging = true;
            track.style.cursor = 'grabbing';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
        });

        document.addEventListener('mouseup', (e) => {
            if (!isDragging) return;

            const endX = e.clientX;
            const diff = startX - endX;

            if (Math.abs(diff) > 50) {
                if (diff > 0 && currentPosition < maxPosition) {
                    nextSlide();
                } else if (diff < 0 && currentPosition > 0) {
                    prevSlide();
                }
            }

            isDragging = false;
            track.style.cursor = '';
        });

        // Pencere boyutu değiştiğinde slider'ı güncelle
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                cardWidth = cards[0].offsetWidth + 20;
                visibleCards = Math.floor(document.querySelector('.slider-container').offsetWidth / cardWidth);
                maxPosition = Math.max(0, cards.length - visibleCards);

                if (currentPosition > maxPosition) {
                    currentPosition = Math.max(0, maxPosition);
                }

                updateSliderPosition();
            }, 250);
        });

        // İlk pozisyonu ayarla
        updateSliderPosition();
    }
    // Renk butonları için event listener
    // Renk butonları için event listener
    // RENK BUTONLARI İÇİN EVENT LİSTENER (ÇALIŞAN VERSİYON)
    function initColorButtons() {
        console.log('initColorButtons çalıştı');

        document.querySelectorAll('.variant-option').forEach(btn => {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);

            newBtn.addEventListener('click', async function (e) {
                e.preventDefault();
                e.stopPropagation();

                const renkId = this.dataset.variantId;
                const productCard = this.closest('.product-card');

                if (!renkId || !productCard) {
                    console.log('Eksik bilgi:', { renkId, productCard });
                    return;
                }

                productCard.style.opacity = '0.6';
                productCard.style.pointerEvents = 'none';

                try {
                    console.log('İstek atılıyor:', `/api/anasayfa/urun-detay/${renkId}`);
                    const response = await fetch(`/api/anasayfa/urun-detay/${renkId}`);
                    const result = await response.json();

                    if (result.Success && result.Data) {
                        const urun = result.Data;

                        // Resim
                        const img = productCard.querySelector('.product-image');
                        if (img) img.src = urun.anaGorsel || urun.AnaGorsel;

                        // Başlık
                        const title = productCard.querySelector('.product-title a');
                        if (title) {
                            title.textContent = urun.ad || urun.Ad;
                            title.href = `/detay/${urun.Id || urun.Id}`;
                        }

                        // Fiyat
                        const price = productCard.querySelector('.current-price');
                        if (price) {
                            const fiyat = (urun.indirimliFiyat || urun.fiyat || urun.Fiyat).toLocaleString('tr-TR');
                            price.textContent = `₺${fiyat}`;
                        }

                        // Rating
                        const rating = productCard.querySelector('.product-category span:last-child');
                        if (rating) rating.textContent = `★ ${urun.rating || urun.Rating || '4.5'}`;

                        // Sepet butonu
                        const cartBtn = productCard.querySelector('.add-to-cart-btn');
                        if (cartBtn) cartBtn.dataset.productId = urun.id || urun.Id;

                        // Aktif buton
                        const selector = this.closest('.variant-selector');
                        if (selector) {
                            selector.querySelectorAll('.variant-option').forEach(b => b.classList.remove('active'));
                            this.classList.add('active');
                        }

                        console.log('Ürün güncellendi:', urun);
                    }
                } catch (error) {
                    console.error('Hata:', error);
                } finally {
                    productCard.style.opacity = '1';
                    productCard.style.pointerEvents = 'auto';
                }
            });
        });
    }
    // Sayfa yüklendiğinde ve dinamik içerik eklendiğinde çalıştır
    document.addEventListener('DOMContentLoaded', function () {
        // İlk yükleme
        initColorButtons();

        // Dinamik içerik eklendiğinde tekrar bağla (MutationObserver)
        const observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.addedNodes.length) {
                    initColorButtons();
                }
            });
        });

        const track = document.getElementById('dowrySliderTrack');
        if (track) {
            observer.observe(track, { childList: true, subtree: true });
        }
    });

    // Eğer ürünler AJAX ile yükleniyorsa, yükleme sonrası çağır
    function onProductsLoaded() {
        initColorButtons();
    }
    function initializeButtons() {
        // Favori butonları
        const favButtons = document.querySelectorAll('.fav-btn');
        favButtons.forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                e.stopPropagation();

                const isActive = this.classList.contains('active');
                const svg = this.querySelector('svg');
                const path = svg.querySelector('path');

                if (isActive) {
                    this.classList.remove('active');
                    path.setAttribute('fill', 'none');
                    path.setAttribute('stroke', 'currentColor');
                } else {
                    this.classList.add('active');
                    path.setAttribute('fill', '#E8B4B8');
                    path.setAttribute('stroke', '#E8B4B8');
                }

                // Analytics
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'product_favorite', {
                        'event_category': 'engagement',
                        'event_label': isActive ? 'remove' : 'add'
                    });
                }
            });
        });

        // Varyant seçimi
        const variantOptions = document.querySelectorAll('.variant-option');
        variantOptions.forEach(option => {
            option.addEventListener('click', function () {
                const selector = this.closest('.variant-selector');
                const activeOption = selector.querySelector('.variant-option.active');

                if (activeOption) {
                    activeOption.classList.remove('active');
                }

                this.classList.add('active');
            });
        });

        // Sepete ekle butonları
        const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
        addToCartButtons.forEach(btn => {
            btn.addEventListener('click', async function () {
                const card = this.closest('.product-card');
                const productId = card.dataset.productId;
                const title = card.querySelector('.product-title a').textContent;
                const price = card.querySelector('.current-price').textContent;

                // Sepete ekle API isteği (opsiyonel)
                try {
                    // Buton feedback
                    const originalText = this.innerHTML;
                    this.innerHTML = `
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                        Eklendi
                    `;
                    this.style.background = '#7D9D9C';

                    // 2 saniye sonra eski haline dön
                    setTimeout(() => {
                        this.innerHTML = originalText;
                        this.style.background = '';
                    }, 2000);

                    // Analytics
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'add_to_cart', {
                            'event_category': 'ecommerce',
                            'event_label': title,
                            'value': parseFloat(price.replace('₺', '').replace('.', '').replace(',', '.'))
                        });
                    }

                    console.log(`Sepete eklendi: ${title} - ${price} (ID: ${productId})`);

                } catch (error) {
                    console.error('Sepete eklenirken hata:', error);
                }
            });
        });

        // Hızlı görüntüle butonları
        const quickViewButtons = document.querySelectorAll('.quick-view-btn');
        quickViewButtons.forEach(btn => {
            btn.addEventListener('click', function () {
                const card = this.closest('.product-card');
                const productId = card.dataset.productId;
                const title = card.querySelector('.product-title a').textContent;

                // Quick view modal açma işlemi
                console.log(`Quick view: ${title} (ID: ${productId})`);

                // İleride modal açmak için event fırlat
                const event = new CustomEvent('openQuickView', {
                    detail: { productId: productId }
                });
                document.dispatchEvent(event);

                // Analytics
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'quick_view', {
                        'event_category': 'engagement',
                        'event_label': title
                    });
                }
            });
        });
    }

    // Sayfa değişikliklerinde slider'ı güncelle (Turbo/HTMX için)
    document.addEventListener('turbo:load', function () {
        fetchFeaturedProducts();
    });
});