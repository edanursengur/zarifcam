// ==================== GLOBAL KONFİGÜRASYON ====================
const CONFIG = {
    API_BASE: '/api/anasayfa',
    SLIDE_INTERVAL: 5000,
    LAZY_LOAD_THRESHOLD: 0.1,
    CACHE_TTL: 5 * 60 * 1000, // 5 dakika
};

// ==================== UTILITY FONKSİYONLARI ====================
const Utils = {
    async cachedFetch(url, options = {}) {
        const cacheKey = `${url}_${JSON.stringify(options)}`;
        const cache = window.HomePageCache || new Map();
        const cached = cache.get(cacheKey);

        if (cached && Date.now() - cached.timestamp < CONFIG.CACHE_TTL) {
            console.log(`Cache hit: ${url}`);
            return cached.data;
        }

        try {
            const response = await fetch(url, options);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const contentType = response.headers.get('content-type');
            if (!contentType?.includes('application/json')) {
                throw new Error('Invalid content type');
            }

            const data = await response.json();

            cache.set(cacheKey, {
                data,
                timestamp: Date.now()
            });
            window.HomePageCache = cache;

            return data;
        } catch (error) {
            console.error(`Fetch failed for ${url}:`, error);
            throw error;
        }
    },

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

// ==================== RENDER FONKSİYONLARI ====================
const Renderer = {
    renderHeroSliders(slides) {
        const container = document.getElementById('heroSlides');
        const dotsContainer = document.getElementById('heroSliderDots');

        if (!container) return;

        if (!slides || !Array.isArray(slides) || slides.length === 0) {
            container.innerHTML = this.createFallbackSlide();
            if (dotsContainer) {
                dotsContainer.innerHTML = '<button class="slider-dot active"></button>';
            }
            return;
        }

        container.innerHTML = slides.map((slide, index) => `
            <div class="slide ${index === 0 ? 'active' : ''}" 
                 style="background-image: url('${slide.MedyaUrl || slide.medyaUrl || '/images/default-slide.jpg'}')">
                <div class="slide-content">
                    ${slide.Baslik || slide.baslik ? `<h1>${slide.Baslik || slide.baslik}</h1>` : ''}
                    ${slide.Aciklama || slide.aciklama ? `<p>${slide.Aciklama || slide.aciklama}</p>` : ''}
                    ${(slide.ButonText || slide.butonText) && (slide.ButonLink || slide.butonLink) ?
                `<a href="${slide.ButonLink || slide.butonLink}" class="btn-primary">${slide.ButonText || slide.butonText}</a>` : ''}
                </div>
            </div>
        `).join('');

        if (dotsContainer) {
            dotsContainer.innerHTML = slides.map((_, index) => `
                <button class="slider-dot ${index === 0 ? 'active' : ''}" 
                        data-slider-action="goto"
                        data-index="${index}"></button>
            `).join('');
        }
    },

    renderQuickAccess(items) {
        const container = document.querySelector('.quick-icons');
        if (!container) return;

        if (!items || !Array.isArray(items) || items.length === 0) {
            // Fallback quick access items
            const fallbackItems = [
                { Ikon: 'fas fa-truck', Baslik: 'Hızlı Kargo', Link: '/kargo' },
                { Ikon: 'fas fa-shield-alt', Baslik: 'Güvenli Alışveriş', Link: '/guvenlik' },
                { Ikon: 'fas fa-headset', Baslik: '7/24 Destek', Link: '/destek' },
                { Ikon: 'fas fa-undo', Baslik: 'Kolay İade', Link: '/iade' },
                { Ikon: 'fas fa-gift', Baslik: 'Hediyeler', Link: '/hediyeler' }
            ];

            container.innerHTML = fallbackItems.map(item => `
                <a href="${item.Link}" class="quick-icon">
                    <i class="${item.Ikon}"></i>
                    <span>${item.Baslik}</span>
                </a>
            `).join('');
            return;
        }

        container.innerHTML = items.map(item => `
            <a href="${item.Link || item.link || '#'}" class="quick-icon">
                <i class="${item.Ikon || item.ikon || 'fas fa-question'}"></i>
                <span>${item.Baslik || item.baslik || 'Başlık'}</span>
            </a>
        `).join('');
    },

    renderCategories(categories) {
        const container = document.getElementById('categoryTrack');
        if (!container) {
            console.error('❌ categoryTrack container bulunamadı');
            return;
        }

        console.log('🎨 Kategoriler render ediliyor...', categories);

        // Kategorileri render et
        container.innerHTML = categories.map(cat => this.createCategoryCard(cat)).join('');

        // Render sonrası log
        const renderedItems = container.querySelectorAll('.category-card');
        console.log(`✅ ${renderedItems.length} kategori render edildi`);
    },
    createCategoryCard(category) {
        const slug = category.Slug || category.slug || category.KategoriID || 'default';
        const name = category.Ad || category.ad || category.KategoriAdi || 'Kategori';
        const image = category.GorselUrl || category.gorselUrl || category.Resim || '/images/default-category.jpg';
        const description = category.Aciklama || category.aciklama || '';

        return `
            <a href="/kategori/${slug}" class="category-card" data-category-id="${category.KategoriID || category.id}">
                <img src="${image}" 
                     alt="${name}"
                     loading="lazy"
                     onerror="this.onerror=null; this.src='/images/default-category.jpg';">
                <div class="category-overlay">
                    <h3>${name}</h3>
                    ${description ? `<p>${description}</p>` : ''}
                </div>
            </a>
        `;
    },

    renderProducts(products, containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.warn(`Container ${containerId} not found`);
            return;
        }

        if (!products || !Array.isArray(products) || products.length === 0) {
            container.innerHTML = '<p class="no-products">Ürün bulunamadı</p>';
            return;
        }

        container.innerHTML = products.map(product => this.createProductCard(product)).join('');
    },

    createProductCard(product) {
        const price = product.Fiyat || product.fiyat || product.price || 0;
        const discountPrice = product.IndirimliFiyat || product.indirimliFiyat || product.discountPrice;
        const hasDiscount = discountPrice && price && price > 0;
        const discountPercentage = hasDiscount ?
            Math.round((1 - (discountPrice / price)) * 100) : 0;

        return `
            <div class="product-card">
                <a href="/urun/${product.Slug || product.slug || product.TabloID || product.id}" class="product-image">
                    <img src="${product.AnaGorsel || product.anaGorsel || product.image || '/images/default-product.jpg'}" 
                         alt="${product.Ad || product.ad || product.name || 'Ürün'}"
                         loading="lazy">
                    ${discountPercentage > 0 ?
                `<div class="discount-badge">-%${discountPercentage}</div>` : ''}
                    <button class="favorite-btn" data-product-id="${product.TabloID || product.id}">
                        <i class="far fa-heart"></i>
                    </button>
                </a>
                <div class="product-info">
                    <h3>
                        <a href="/urun/${product.Slug || product.slug || product.TabloID || product.id}">
                            ${product.Ad || product.ad || product.name || 'Ürün'}
                        </a>
                    </h3>
                    <div class="ddflex">
                    <div class="product-price">
                        ${hasDiscount ? `
                            <span class="old-price">${price.toFixed(2)} ₺</span>
                            <span class="new-price">${discountPrice.toFixed(2)} ₺</span>
                        ` : `
                            <span class="current-price">
                                ${price ? `${price.toFixed(2)} ₺` : 'Fiyat Belirtilmemiş'}
                            </span>
                        `}
                    </div>
                    <button class="add-to-cart" data-product-id="${product.TabloID || product.id}">
                        Sepete Ekle
                    </button>
                </div>
                </div>
            </div>
        `;
    },

    createFallbackSlide() {
        return `
            <div class="slide active">
                <div class="slide-content">
                    <h1>Hoş Geldiniz</h1>
                    <p>Kaliteli ürünlerimizi keşfedin</p>
                    <a href="/urunler" class="btn-primary">Alışverişe Başla</a>
                </div>
            </div>
        `;
    }
};

// ==================== SLIDER SİSTEMİ ====================
const SliderSystem = {
    currentSlide: 0,
    slideInterval: null,

    init() {
        this.setupEventListeners();
        this.startAutoSlide();
        this.setupIntersectionObserver();
    },

    setupEventListeners() {
        // Hero slider touch events
        const heroSlider = document.querySelector('.hero-slider');
        if (heroSlider) {
            let touchStartX = 0;
            let touchEndX = 0;

            heroSlider.addEventListener('touchstart', (e) => {
                touchStartX = e.touches[0].clientX;
            }, { passive: true });

            heroSlider.addEventListener('touchend', (e) => {
                touchEndX = e.changedTouches[0].clientX;
                const diff = touchStartX - touchEndX;

                if (Math.abs(diff) > 50) {
                    diff > 0 ? this.nextSlide() : this.prevSlide();
                }
            }, { passive: true });

            // Klavye kontrolleri
            document.addEventListener('keydown', (e) => {
                if (['ArrowLeft', 'ArrowRight'].includes(e.key)) {
                    e.preventDefault();
                    e.key === 'ArrowLeft' ? this.prevSlide() : this.nextSlide();
                }
            });
        }

        // Slider butonları için event delegation
        document.addEventListener('click', (e) => {
            const target = e.target.closest('[data-slider-action]');
            if (!target) return;

            const action = target.dataset.sliderAction;
            const targetId = target.dataset.target;
            const slider = document.getElementById(targetId);

            if (!slider) return;

            const scrollAmount = 300;

            switch (action) {
                case 'prev':
                    slider.scrollLeft -= scrollAmount;
                    break;
                case 'next':
                    slider.scrollLeft += scrollAmount;
                    break;
                case 'goto':
                    const index = parseInt(target.dataset.index);
                    this.showSlide(index);
                    break;
            }
        });

        // Dot'lar için event delegation
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('slider-dot')) {
                const index = parseInt(e.target.dataset.index);
                if (!isNaN(index)) {
                    this.showSlide(index);
                }
            }
        });
    },

    showSlide(index) {
        const slides = document.querySelectorAll('.hero-slider .slide');
        const dots = document.querySelectorAll('.slider-dot');

        if (!slides.length) return;

        // Index sınır kontrolü
        index = (index + slides.length) % slides.length;

        // Güncelleme
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));

        slides[index].classList.add('active');
        if (dots[index]) dots[index].classList.add('active');

        this.currentSlide = index;
        this.resetAutoSlide();
    },

    nextSlide() {
        const slides = document.querySelectorAll('.hero-slider .slide');
        if (slides.length) {
            this.showSlide(this.currentSlide + 1);
        }
    },

    prevSlide() {
        const slides = document.querySelectorAll('.hero-slider .slide');
        if (slides.length) {
            this.showSlide(this.currentSlide - 1);
        }
    },

    startAutoSlide() {
        this.stopAutoSlide();
        this.slideInterval = setInterval(() => {
            this.nextSlide();
        }, CONFIG.SLIDE_INTERVAL);
    },

    stopAutoSlide() {
        if (this.slideInterval) {
            clearInterval(this.slideInterval);
            this.slideInterval = null;
        }
    },

    resetAutoSlide() {
        this.stopAutoSlide();
        this.startAutoSlide();
    },

    setupIntersectionObserver() {
        if (!('IntersectionObserver' in window)) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const dataset = entry.target.dataset;

                        if (dataset.lazyLoad === 'instagram') {
                            DataLoader.loadInstagramPosts();
                        } else if (dataset.lazyLoad === 'recommendations') {
                            DataLoader.loadPersonalizedRecommendations();
                        } else if (dataset.lazyLoad === 'testimonials') {
                            DataLoader.loadTestimonials();
                        }

                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: CONFIG.LAZY_LOAD_THRESHOLD }
        );

        // Lazy load elementlerini gözle
        document.querySelectorAll('[data-lazy-load]').forEach(el => observer.observe(el));
    }
};

// ==================== DATA YÜKLEYİCİ ====================
const DataLoader = {
    isLoading: false,

    async loadInitialData() {
        if (this.isLoading) return;

        this.isLoading = true;

        try {
            // Kritik verileri paralel yükle
            await Promise.allSettled([
                this.loadHeroSliders(),
                this.loadQuickAccess(),
                this.loadCategories(),
                this.loadFeaturedProducts()
            ]);

            // İkinci aşama veriler
            setTimeout(() => {
                Promise.allSettled([
                    this.loadFeaturedCategory(),
                    this.loadCampaigns(),
                    this.loadTrustBadges()
                ]);
            }, 500);

        } catch (error) {
            console.error('Initial data loading failed:', error);
            this.showFallbackUI();
        } finally {
            this.isLoading = false;
        }
    },

    async loadHeroSliders() {
        try {
            const data = await Utils.cachedFetch(`${CONFIG.API_BASE}/heroslider`);
            if (data?.Success) {
                Renderer.renderHeroSliders(data.Data || data.data);
                SliderSystem.startAutoSlide();
            } else {
                // API'den data gelmediyse fallback
                Renderer.renderHeroSliders([]);
            }
        } catch (error) {
            console.error('Failed to load hero sliders:', error);
            Renderer.renderHeroSliders([]); // Fallback render
        }
    },

    async loadQuickAccess() {
        try {
            const data = await Utils.cachedFetch(`${CONFIG.API_BASE}/hizlierisim`);
            if (data?.Success) {
                Renderer.renderQuickAccess(data.Data || data.data);
            } else {
                Renderer.renderQuickAccess([]);
            }
        } catch (error) {
            console.error('Failed to load quick access:', error);
            Renderer.renderQuickAccess([]);
        }
    },

    async loadCategories() {
        try {
            const data = await Utils.cachedFetch(`${CONFIG.API_BASE}/kategoriler`);
            if (data?.Success) {
                Renderer.renderCategories(data.Data || data.data);
            } else {
                Renderer.renderCategories([]);
            }
        } catch (error) {
            console.error('Failed to load categories:', error);
            Renderer.renderCategories([]);
        }
    },

    async loadFeaturedProducts() {
        try {
            const data = await Utils.cachedFetch(`${CONFIG.API_BASE}/onecikan-urunler?adet=12`);
            if (data?.Success) {
                Renderer.renderProducts(data.Data || data.data, 'home-product-grid');
            } else {
                Renderer.renderProducts([], 'home-product-grid');
            }
        } catch (error) {
            console.error('Failed to load featured products:', error);
            Renderer.renderProducts([], 'home-product-grid');
        }
    },

    async loadFeaturedCategory() {
        try {
            const data = await Utils.cachedFetch(`${CONFIG.API_BASE}/vurgulu-kategori`);
            if (data?.Success) {
                this.renderFeaturedCategory(data.Data || data.data);
            }
        } catch (error) {
            console.error('Failed to load featured category:', error);
        }
    },

    async loadCampaigns() {
        try {
            const data = await Utils.cachedFetch(`${CONFIG.API_BASE}/kampanya-kartlari`);
            if (data?.Success) {
                this.renderCampaigns(data.Data || data.data);
            }
        } catch (error) {
            console.error('Failed to load campaigns:', error);
        }
    },

    async loadTrustBadges() {
        try {
            const data = await Utils.cachedFetch(`${CONFIG.API_BASE}/guven-badgeleri`);
            if (data?.Success) {
                this.renderTrustBadges(data.Data || data.data);
            }
        } catch (error) {
            console.error('Failed to load trust badges:', error);
        }
    },

    async loadInstagramPosts() {
        try {
            const data = await Utils.cachedFetch(`${CONFIG.API_BASE}/instagram?adet=8`);
            if (data?.Success) {
                this.renderInstagramPosts(data.Data || data.data);
            }
        } catch (error) {
            console.error('Failed to load Instagram posts:', error);
        }
    },

    async loadPersonalizedRecommendations() {
        try {
            const token = localStorage.getItem('token');
            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

            // Önce API'nin var olup olmadığını kontrol et
            try {
                const response = await fetch(`${CONFIG.API_BASE}/kisisel-oneriler?adet=6`, {
                    method: 'HEAD',
                    headers
                });

                if (response.status === 404) {
                    // API yoksa popüler ürünleri göster
                    return this.loadFeaturedProducts();
                }

                const data = await Utils.cachedFetch(`${CONFIG.API_BASE}/kisisel-oneriler?adet=6`, { headers });
                if (data?.Success) {
                    Renderer.renderProducts(data.Data || data.data, 'personalizedSlider');
                }
            } catch (apiError) {
                console.log('Personalized API not available, showing featured products');
                this.loadFeaturedProducts();
            }
        } catch (error) {
            console.error('Failed to load personalized recommendations:', error);
            this.loadFeaturedProducts(); // Fallback
        }
    },

    renderFeaturedCategory(category) {
        const section = document.querySelector('.featured-category');
        if (!section || !category) return;

        const infoDiv = section.querySelector('.highlight-info');
        const imageDiv = section.querySelector('.highlight-image');

        if (infoDiv) {
            const title = infoDiv.querySelector('h2');
            const desc = infoDiv.querySelector('p');
            const button = infoDiv.querySelector('a');

            if (title && (category.Baslik || category.baslik)) title.textContent = category.Baslik || category.baslik;
            if (desc && (category.AltBaslik || category.altBaslik)) desc.textContent = category.AltBaslik || category.altBaslik;
            if (button && (category.ButonYazi || category.butonYazi) && (category.ButonLink || category.butonLink)) {
                button.textContent = category.ButonYazi || category.butonYazi;
                button.href = category.ButonLink || category.butonLink;
            }
        }

        if (imageDiv) {
            const img = imageDiv.querySelector('img');
            if (img && (category.ResimUrl || category.resimUrl)) {
                img.src = category.ResimUrl || category.resimUrl;
                img.alt = category.Baslik || category.baslik || 'Koleksiyon';
            }
        }
    },

    renderCampaigns(campaigns) {
        const container = document.querySelector('.campaign-grid');
        if (!container || !campaigns || !Array.isArray(campaigns)) return;

        container.innerHTML = campaigns.map(campaign => `
            <div class="campaign-card ${campaign.kartTipi || campaign.type || 'genel'}" 
                 style="${campaign.arkaplanResim || campaign.backgroundImage ?
                `background-image: url('${campaign.arkaplanResim || campaign.backgroundImage}')` :
                campaign.arkaplanRengi || campaign.backgroundColor ?
                    `background-color: ${campaign.arkaplanRengi || campaign.backgroundColor}` : ''}">
                ${(campaign.kartTipi === 'gerisayim' || campaign.type === 'countdown') ?
                `<div class="campaign-badge">Süresi Doluyor</div>` : ''}
                <h3>${campaign.baslik || campaign.title || 'Kampanya'}</h3>
                ${campaign.aciklama || campaign.description ?
                `<p>${campaign.aciklama || campaign.description}</p>` : ''}
                ${(campaign.butonYazi || campaign.buttonText) && (campaign.butonLink || campaign.buttonLink) ?
                `<a href="${campaign.butonLink || campaign.buttonLink}" class="btn-small">
                        ${campaign.butonYazi || campaign.buttonText}
                    </a>` : ''}
            </div>
        `).join('');
    },

    renderTrustBadges(badges) {
        const container = document.querySelector('.trust-badges');
        if (!container) return;

        // API'den gelen yapıya göre veriyi işle
        const badgeData = badges?.Data || badges;

        if (!badgeData || !Array.isArray(badgeData) || badgeData.length === 0) {
            this.showFallbackTrustBadges(container);
            return;
        }

        // Verileri sırala (SiraNo'ya göre)
        const sortedBadges = [...badgeData].sort((a, b) => (a.SiraNo || 0) - (b.SiraNo || 0));

        container.innerHTML = sortedBadges.map(badge => this.createTrustBadgeHTML(badge)).join('');
    },

    createTrustBadgeHTML(badge) {
        // Ikon rengi kontrolü
        const iconColor = badge.IkonRenk ? `style="color: ${badge.IkonRenk}"` : '';

        return `
        <div class="trust-item" data-badge-id="${badge.BadgeID || ''}">
            <div class="trust-icon">
                <i class="${badge.Ikon || 'fas fa-shield-alt'}" ${iconColor}></i>
            </div>
            <div class="trust-content">
                <h3>${badge.Baslik || 'Güven'}</h3>
                <p>${badge.Aciklama || 'Açıklama'}</p>
            </div>
            ${badge.Link ? `<a href="${badge.Link}" class="trust-link" aria-label="${badge.Baslik} detayları"></a>` : ''}
        </div>
    `;
    },

    showFallbackTrustBadges(container) {
        const fallbackBadges = [
            {
                Ikon: "fas fa-truck",
                Baslik: "Ücretsiz Kargo",
                Aciklama: "1500 TL üzeri alışverişlerde",
                IkonRenk: "#10b981"
            },
            {
                Ikon: "fas fa-undo-alt",
                Baslik: "Kolay İade",
                Aciklama: "30 gün içinde ücretsiz iade",
                IkonRenk: "#3b82f6"
            },
            {
                Ikon: "fas fa-shield-alt",
                Baslik: "Güvenli Alışveriş",
                Aciklama: "SSL Sertifikalı",
                IkonRenk: "##567C8D"
            },
            {
                Ikon: "fas fa-headset",
                Baslik: "7/24 Destek",
                Aciklama: "Canlı destek hattı",
                IkonRenk: "#f59e0b"
            }
        ];

        container.innerHTML = fallbackBadges.map(badge => this.createTrustBadgeHTML(badge)).join('');
    },

    async loadTrustBadges() {
        try {
            const data = await Utils.cachedFetch(`${CONFIG.API_BASE}/guven-badgeleri`);

            // API Response yapısını kontrol et
            if (data?.Success === true) {
                // Data direkt olarak gelebilir veya Data içinde olabilir
                const badges = data.Data || data;
                this.renderTrustBadges(badges);
            } else if (Array.isArray(data)) {
                // Direkt array geldiyse
                this.renderTrustBadges(data);
            } else {
                // Fallback göster
                this.showFallbackTrustBadges(document.querySelector('.trust-badges'));
            }
        } catch (error) {
            console.error('Failed to load trust badges:', error);
            this.showFallbackTrustBadges(document.querySelector('.trust-badges'));
        }
    },

    renderInstagramPosts(posts) {
        const container = document.getElementById('instaFeed');
        if (!container) return;

        if (!posts || !Array.isArray(posts) || posts.length === 0) {
            container.innerHTML = '<p class="no-posts">Instagram gönderisi bulunamadı</p>';
            return;
        }

        container.innerHTML = posts.map(post => `
            <a href="${post.link || '#'}" class="instagram-post" target="_blank" rel="noopener noreferrer">
                <img src="${post.kapakResim || post.image || '/images/default-instagram.jpg'}" 
                     alt="${post.kisaAciklama || post.caption || 'Instagram gönderisi'}"
                     loading="lazy">
                <div class="post-overlay">
                    <span><i class="fas fa-heart"></i> ${post.begeni || post.likes || 0}</span>
                    <span><i class="fas fa-comment"></i> ${post.yorum || post.comments || 0}</span>
                </div>
            </a>
        `).join('');
    },

    showFallbackUI() {
        // Mevcut bir fallback varsa kaldır
        const existingFallback = document.querySelector('.fallback-notification');
        if (existingFallback) existingFallback.remove();

        const fallback = document.createElement('div');
        fallback.className = 'fallback-notification';
        fallback.innerHTML = `
            <div class="fallback-content">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Bazı içerikler yüklenemedi. Lütfen internet bağlantınızı kontrol edin.</p>
                <button class="fallback-retry" onclick="DataLoader.loadInitialData()">
                    <i class="fas fa-redo"></i> Tekrar Dene
                </button>
                <button class="fallback-close" onclick="this.parentElement.parentElement.remove()">
                    &times;
                </button>
            </div>
        `;

        document.body.appendChild(fallback);

        // Otomatik kaldırma
        setTimeout(() => {
            if (fallback.parentElement) {
                fallback.remove();
            }
        }, 5000);
    }
};

// ==================== BAŞLATMA ====================
document.addEventListener('DOMContentLoaded', () => {
    console.log('HomePage Enhanced yüklendi');
     // Kategori slider'ını başlat
        CategorySlider.init();
    // 1. Slider sistemini başlat
    SliderSystem.init();

    // 2. Verileri yükle
    DataLoader.loadInitialData();

    // 3. Performans optimizasyonları
    optimizePerformance();

    // 4. Global erişim için
    window.HomePage = {
        slider: SliderSystem,
        loader: DataLoader,
        renderer: Renderer,
        utils: Utils,
        reload: () => DataLoader.loadInitialData()
    };
});

// ==================== PERFORMANS OPTİMİZASYONLARI ====================
function optimizePerformance() {
    // Lazy loading for images
    const images = document.querySelectorAll('img[loading="lazy"]');
    if ('loading' in HTMLImageElement.prototype) {
        images.forEach(img => {
            img.loading = 'lazy';
        });
    } else {
        // Fallback için IntersectionObserver
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    imageObserver.unobserve(img);
                }
            });
        });

        document.querySelectorAll('img[data-src]').forEach(img => imageObserver.observe(img));
    }

    // Memory leak prevention
    window.addEventListener('beforeunload', () => {
        SliderSystem.stopAutoSlide();
        window.HomePageCache = null;
    });

    // Preconnect to important origins
    const preconnect = document.createElement('link');
    preconnect.rel = 'preconnect';
    preconnect.href = new URL(CONFIG.API_BASE, window.location.origin).origin;
    document.head.appendChild(preconnect);
}

// ==================== HATA YÖNETİMİ ====================
window.addEventListener('error', (event) => {
    console.error('Global error caught:', event.error);

    // HomePage'e ait hataları göster
    if (event.filename && event.filename.includes('HomePage')) {
        console.log('HomePage hatası, verileri yeniden yüklemeyi deniyor...');
        setTimeout(() => {
            if (DataLoader && typeof DataLoader.loadInitialData === 'function') {
                DataLoader.loadInitialData();
            }
        }, 2000);
    }
});

// Unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});

// Sayfa görünür olduğunda verileri yenile
document.addEventListener('visibilitychange', () => {
    if (!document.hidden &&
        DataLoader &&
        typeof DataLoader.loadInitialData === 'function' &&
        !DataLoader.isLoading) {
        // Sayfa tekrar görünür olduğunda cache'i temizle ve yenile
        window.HomePageCache = null;
        setTimeout(() => DataLoader.loadInitialData(), 100);
    }
});

// CSS dosyalarını dinamik olarak yükle
function loadCSS() {
    const stylesheets = [
        '/css/HomePage/homepage.css',
    ];

    stylesheets.forEach(href => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.onload = () => console.log(`${href} yüklendi`);
        document.head.appendChild(link);
    });
}

// Fontları yükle
function loadFonts() {
    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap';
    fontLink.rel = 'stylesheet';
    document.head.appendChild(fontLink);
}

// Back to top butonu
function initBackToTop() {
    const backToTop = document.createElement('button');
    backToTop.className = 'back-to-top';
    backToTop.innerHTML = '<i class="fas fa-chevron-up"></i>';
    backToTop.setAttribute('aria-label', 'En üste git');
    document.body.appendChild(backToTop);

    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });

    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Intersection Observer for animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Animate elements with data-animate attribute
    document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));
}

// DOMContentLoaded içine ekle:
document.addEventListener('DOMContentLoaded', () => {
    loadCSS();
    loadFonts();
    initBackToTop();
    initScrollAnimations();
    // ... diğer kodlar
});

////Erişim hhılzı
// Quick Access Scroll Control
class QuickAccessScroll {
    constructor() {
        this.container = document.getElementById('quickIcons');
        this.wrapper = document.getElementById('quickIconsWrapper');
        this.indicator = document.getElementById('scrollIndicator');
        this.init();
    }

    init() {
        if (!this.container || !this.wrapper) return;

        // Scroll event listener
        this.container.addEventListener('scroll', this.handleScroll.bind(this));

        // Create scroll indicator dots
        this.createScrollIndicator();

        // Initial check
        setTimeout(() => this.handleScroll(), 100);

        // Auto-hide scrollbar after inactivity
        this.setupAutoHideScrollbar();
    }

    handleScroll() {
        const { scrollLeft, scrollWidth, clientWidth } = this.container;

        // Update wrapper classes based on scroll position
        this.updateScrollClasses(scrollLeft, scrollWidth, clientWidth);

        // Update indicator dots
        this.updateScrollIndicator(scrollLeft, clientWidth);
    }

    updateScrollClasses(scrollLeft, scrollWidth, clientWidth) {
        const isAtStart = scrollLeft <= 10;
        const isAtEnd = scrollLeft >= scrollWidth - clientWidth - 10;

        // Clear classes
        this.wrapper.classList.remove('scroll-start', 'scroll-end', 'scroll-middle');

        // Add appropriate class
        if (isAtStart && isAtEnd) {
            // No scrolling needed
        } else if (isAtStart) {
            this.wrapper.classList.add('scroll-start');
        } else if (isAtEnd) {
            this.wrapper.classList.add('scroll-end');
        } else {
            this.wrapper.classList.add('scroll-middle');
        }
    }

    createScrollIndicator() {
        if (!this.indicator || window.innerWidth > 768) return;

        const itemCount = this.container.children.length;
        const visibleItems = Math.floor(this.container.clientWidth / 180); // Approx item width

        if (itemCount <= visibleItems) return;

        const dotCount = Math.ceil(itemCount / visibleItems);

        for (let i = 0; i < dotCount; i++) {
            const dot = document.createElement('div');
            dot.className = `scroll-dot ${i === 0 ? 'active' : ''}`;
            dot.dataset.index = i;
            dot.addEventListener('click', () => this.scrollToPage(i));
            this.indicator.appendChild(dot);
        }
    }

    updateScrollIndicator(scrollLeft, clientWidth) {
        if (!this.indicator || window.innerWidth > 768) return;

        const dots = this.indicator.querySelectorAll('.scroll-dot');
        const currentPage = Math.round(scrollLeft / clientWidth);

        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentPage);
        });
    }

    scrollToPage(pageIndex) {
        const scrollAmount = pageIndex * this.container.clientWidth;
        this.container.scrollTo({
            left: scrollAmount,
            behavior: 'smooth'
        });
    }

    setupAutoHideScrollbar() {
        let scrollbarTimeout;

        this.container.addEventListener('scroll', () => {
            // Show scrollbar
            this.container.style.scrollbarWidth = 'thin';

            // Clear previous timeout
            clearTimeout(scrollbarTimeout);

            // Hide scrollbar after 1.5 seconds of inactivity
            scrollbarTimeout = setTimeout(() => {
                if (window.innerWidth > 768) {
                    this.container.style.scrollbarWidth = 'none';
                }
            }, 1500);
        });

        // Show scrollbar on hover
        this.container.addEventListener('mouseenter', () => {
            this.container.style.scrollbarWidth = 'thin';
            clearTimeout(scrollbarTimeout);
        });

        this.container.addEventListener('mouseleave', () => {
            scrollbarTimeout = setTimeout(() => {
                if (window.innerWidth > 768) {
                    this.container.style.scrollbarWidth = 'none';
                }
            }, 1000);
        });
    }

    // Auto scroll (optional)
    startAutoScroll() {
        if (this.autoScrollInterval) return;

        this.autoScrollInterval = setInterval(() => {
            const { scrollLeft, scrollWidth, clientWidth } = this.container;

            if (scrollLeft >= scrollWidth - clientWidth - 10) {
                // Return to start
                this.container.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                // Scroll forward
                this.container.scrollBy({ left: 200, behavior: 'smooth' });
            }
        }, 4000);
    }

    stopAutoScroll() {
        if (this.autoScrollInterval) {
            clearInterval(this.autoScrollInterval);
            this.autoScrollInterval = null;
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const quickAccessScroll = new QuickAccessScroll();

    // Optional: Auto-scroll on desktop
    if (window.innerWidth > 768) {
        quickAccessScroll.startAutoScroll();

        // Pause on hover
        const container = document.getElementById('quickIcons');
        if (container) {
            container.addEventListener('mouseenter', () => quickAccessScroll.stopAutoScroll());
            container.addEventListener('mouseleave', () => quickAccessScroll.startAutoScroll());
        }
    }
});
//// ==================== OTOMATİK KATEGORİ SLIDER ====================
//const CategorySlider = {
//    isPlaying: true,
//    animationSpeed: 30, // saniye
//    duplicateItems: false,
//    progressInterval: null,

//    init() {
//        this.setupAutoScroll();
//        this.setupEventListeners();
//        this.setupInfiniteScroll();
//        this.setupProgressBar();
//    },

//    setupAutoScroll() {
//        const track = document.getElementById('categoryTrack');
//        if (!track) return;

//        // Başlangıç animasyonu
//        track.style.animation = `scrollCategories ${this.animationSpeed}s linear infinite`;
//        track.style.animationPlayState = 'running';

//        // Infinite scroll için duplicate items ekle
//        if (!this.duplicateItems) {
//            this.addDuplicateItems(track);
//            this.duplicateItems = true;
//        }
//    },

//    addDuplicateItems(track) {
//        const items = track.innerHTML;
//        // Eğer içerik yoksa veya çok azsa duplicate ekleme
//        if (!items || items.trim().length < 100) return;

//        const duplicateTrack = document.createElement('div');
//        duplicateTrack.className = 'category-track duplicate';
//        duplicateTrack.innerHTML = items;

//        track.parentNode.appendChild(duplicateTrack);
//    },

//    setupEventListeners() {
//        const slider = document.querySelector('.category-slider');
//        if (!slider) return;

//        // Hover'da dur
//        slider.addEventListener('mouseenter', () => {
//            this.pauseAnimation();
//        });

//        // Hover'dan çıkınca devam et
//        slider.addEventListener('mouseleave', () => {
//            if (this.isPlaying) {
//                this.playAnimation();
//            }
//        });

//        // Touch events for mobile
//        slider.addEventListener('touchstart', () => {
//            this.pauseAnimation();
//        });

//        slider.addEventListener('touchend', () => {
//            setTimeout(() => {
//                if (this.isPlaying) {
//                    this.playAnimation();
//                }
//            }, 1000);
//        });

//        // Click'te de dur (kategoriye tıklanabilir)
//        slider.addEventListener('click', (e) => {
//            if (e.target.closest('.category-card')) {
//                this.pauseAnimation();
//                setTimeout(() => {
//                    if (this.isPlaying) {
//                        this.playAnimation();
//                    }
//                }, 3000);
//            }
//        });
//    },

//    setupInfiniteScroll() {
//        const track = document.getElementById('categoryTrack');
//        if (!track) return;

//        // Animation iteration event
//        track.addEventListener('animationiteration', () => {
//            this.updateProgressBar(0);
//        });
//    },

//    setupProgressBar() {
//        // Eğer progress bar zaten varsa ekleme
//        if (document.querySelector('.scroll-progress')) return;

//        const progressBar = document.createElement('div');
//        progressBar.className = 'scroll-progress';
//        progressBar.innerHTML = '<div class="scroll-progress-bar"></div>';

//        const slider = document.querySelector('.category-slider');
//        if (slider) {
//            slider.appendChild(progressBar);

//            // Progress bar'ı güncelle
//            this.startProgressBar();
//        }
//    },
//    playAnimation() {
//        const tracks = document.querySelectorAll('.category-track');
//        tracks.forEach(track => {
//            // Önce transition'ı kaldır, sonra ekle
//            track.style.transition = 'none';
//            track.style.animationPlayState = 'running';

//            // Bir sonraki frame'de transition'ı geri ekle
//            requestAnimationFrame(() => {
//                track.style.transition = '';
//            });
//        });

//        this.isPlaying = true;
//        this.startProgressBar();
//    },
//    startProgressBar() {
//        if (this.progressInterval) clearInterval(this.progressInterval);

//        let progress = 0;
//        const interval = 100; // ms
//        const increment = (interval / (this.animationSpeed * 1000)) * 100;

//        this.progressInterval = setInterval(() => {
//            if (this.isPlaying) {
//                progress += increment;
//                if (progress > 100) progress = 0;
//                this.updateProgressBar(progress);
//            }
//        }, interval);
//    },

//    updateProgressBar(progress) {
//        const progressBar = document.querySelector('.scroll-progress-bar');
//        if (progressBar) {
//            progressBar.style.width = `${progress}%`;
//        }
//    },

//    playAnimation() {
//        const tracks = document.querySelectorAll('.category-track');
//        tracks.forEach(track => {
//            track.style.animationPlayState = 'running';
//        });

//        this.isPlaying = true;
//        this.startProgressBar();
//    },

//    pauseAnimation() {
//        const tracks = document.querySelectorAll('.category-track');
//        tracks.forEach(track => {
//            track.style.animationPlayState = 'paused';
//        });

//        this.isPlaying = false;
//        clearInterval(this.progressInterval);
//    },

//    toggleAnimation() {
//        if (this.isPlaying) {
//            this.pauseAnimation();
//        } else {
//            this.playAnimation();
//        }
//    },

//    setSpeed(speed) {
//        this.animationSpeed = speed;
//        const tracks = document.querySelectorAll('.category-track');

//        tracks.forEach(track => {
//            track.style.animationDuration = `${speed}s`;
//        });

//        this.startProgressBar();
//    },

//    destroy() {
//        this.pauseAnimation();
//        clearInterval(this.progressInterval);

//        const duplicateTrack = document.querySelector('.category-track.duplicate');
//        if (duplicateTrack) {
//            duplicateTrack.remove();
//        }
//    }
//};

//// BAŞLATMA - DOM hazır olduğunda
//document.addEventListener('DOMContentLoaded', () => {
//    // Kategori slider'ını başlat
//    CategorySlider.init();

//    // Global erişim için
//    window.CategorySlider = CategorySlider;
//});

//// Sayfa görünürlüğü değiştiğinde kontrol et
//document.addEventListener('visibilitychange', () => {
//    if (document.hidden) {
//        CategorySlider.pauseAnimation();
//    } else if (CategorySlider.isPlaying) {
//        CategorySlider.playAnimation();
//    }
//});

//// Pencere boyutu değiştiğinde slider'ı yeniden başlat
//let resizeTimeout;
//window.addEventListener('resize', () => {
//    clearTimeout(resizeTimeout);
//    resizeTimeout = setTimeout(() => {
//        CategorySlider.destroy();
//        CategorySlider.init();
//    }, 250);
//});
// ==================== OTOMATİK KATEGORİ SLIDER ====================
const CategorySlider = {
    isPlaying: true,
    animationSpeed: 30,
    duplicateItems: false,
    progressInterval: null,
    originalItemsCount: 0,
    isResetting: false,
    isInitialized: false,

    async init() {
        console.log('🎯 Kategori slider başlatılıyor...');

        try {
            // 1. Önce kategorileri API'den yükle
            await this.loadCategoriesFromAPI();

            // 2. Elementleri cache'le
            this.cacheElements();

            // 3. Infinite scroll hazırla
            this.prepareForInfiniteScroll();

            // 4. Animasyonu başlat
            this.setupAutoScroll();

            // 5. Event listener'ları kur
            this.setupEventListeners();

            // 6. Progress bar'ı kur
            this.setupProgressBar();

            // 7. Animation reset'i ayarla
            this.setupAnimationReset();

            this.isInitialized = true;
            console.log('✅ Kategori slider başarıyla başlatıldı');

        } catch (error) {
            console.error('❌ Kategori slider başlatılamadı:', error);
            this.showFallbackCategories();
        }
    },
    async loadCategoriesFromAPI() {
        console.log('📡 API\'den kategoriler yükleniyor...');

        try {
            // API'den kategorileri al
            const data = await Utils.cachedFetch(`${CONFIG.API_BASE}/kategoriler`);

            if (data?.Success && data.Data?.length > 0) {
                console.log(`✅ ${data.Data.length} kategori yüklendi`);
                this.renderCategories(data.Data);
                return data.Data;
            } else {
                console.warn('⚠️ API boş döndü, fallback kullanılıyor');
                this.showFallbackCategories();
                return [];
            }

        } catch (error) {
            console.error('❌ API yüklenemedi:', error);
            this.showFallbackCategories();
            throw error;
        }
    },
    showFallbackCategories() {
        const container = document.getElementById('categoryTrack');
        if (!container) return;

        console.log('🔄 Fallback kategoriler gösteriliyor...');

        const fallbackCategories = [
            { Ad: 'Cam Ürünler', Slug: 'cam-urunler', GorselUrl: '/images/categories/cam.jpg' },
            { Ad: 'Süs Eşyaları', Slug: 'sus-esyalari', GorselUrl: '/images/categories/decor.jpg' },
            { Ad: 'Hediyelik', Slug: 'hediyelik', GorselUrl: '/images/categories/gift.jpg' },
            { Ad: 'Aksesuarlar', Slug: 'aksesuarlar', GorselUrl: '/images/categories/accessories.jpg' },
            { Ad: 'Yeni Gelenler', Slug: 'yeni-gelenler', GorselUrl: '/images/categories/new.jpg' },
            { Ad: 'İndirimli', Slug: 'indirimli', GorselUrl: '/images/categories/sale.jpg' },
            { Ad: 'Özel Koleksiyon', Slug: 'ozel-koleksiyon', GorselUrl: '/images/categories/special.jpg' },
            { Ad: 'Popüler', Slug: 'populer', GorselUrl: '/images/categories/popular.jpg' }
        ];

        container.innerHTML = fallbackCategories.map(cat => this.createCategoryCard(cat)).join('');
        console.log('✅ 8 fallback kategori eklendi');
    },

    cacheElements() {
        this.track = document.getElementById('categoryTrack');
        this.slider = document.querySelector('.category-slider');
        
        if (!this.track) {
            console.warn('Category track not found');
            return;
        }
        
        // Orijinal item sayısını kaydet
        this.originalItemsCount = this.track.children.length;
        
        // Eğer yeterli item yoksa, duplicate ekle
        if (this.originalItemsCount < 4) {
            this.createMoreItems();
        }
    },

    createMoreItems() {
        if (!this.track || this.originalItemsCount === 0) return;
        
        // Mevcut item'ları kopyala
        const items = Array.from(this.track.children);
        let clonedContent = '';
        
        // Toplam 8-12 item olana kadar kopyala
        const targetCount = 12;
        const neededClones = Math.ceil(targetCount / this.originalItemsCount);
        
        for (let i = 0; i < neededClones; i++) {
            items.forEach(item => {
                clonedContent += item.outerHTML;
            });
        }
        
        // Orijinal item'ları koru, klonları ekle
        this.track.innerHTML += clonedContent;
    },

    prepareForInfiniteScroll() {
        if (!this.track || this.duplicateItems) return;
        
        // Orijinal içeriği al
        const originalContent = this.track.innerHTML;
        
        // 2 kopya daha ekle (toplam 3 set)
        this.track.innerHTML = originalContent + originalContent + originalContent;
        
        // Track genişliğini ayarla
        this.adjustTrackWidth();
        
        this.duplicateItems = true;
    },

    adjustTrackWidth() {
        if (!this.track || this.track.children.length === 0) return;
        
        // İlk item'ın genişliğini al
        const firstItem = this.track.children[0];
        const itemWidth = firstItem.offsetWidth || 280;
        const gap = 24; // gap değeri
        
        // Toplam genişlik
        const totalItems = this.track.children.length;
        const totalWidth = (itemWidth + gap) * totalItems;
        
        this.track.style.width = `${totalWidth}px`;
    },

    setupAutoScroll() {
        if (!this.track) return;
        
        // Animasyonu başlat
        this.track.style.animation = `scrollCategories ${this.animationSpeed}s linear infinite`;
        this.track.style.animationPlayState = 'running';
    },

    setupEventListeners() {
        if (!this.slider) return;

        // Hover'da dur
        this.slider.addEventListener('mouseenter', () => {
            this.pauseAnimation();
        });

        // Hover'dan çıkınca SMOOTH devam et
        this.slider.addEventListener('mouseleave', () => {
            if (this.isPlaying) {
                // Kısa gecikme ile devam et
                setTimeout(() => {
                    this.resumeAnimationSmoothly();
                }, 300);
            }
        });

        // Touch events for mobile
        this.slider.addEventListener('touchstart', () => {
            this.pauseAnimation();
        });

        this.slider.addEventListener('touchend', () => {
            setTimeout(() => {
                if (this.isPlaying) {
                    this.resumeAnimationSmoothly();
                }
            }, 1500);
        });

        // Click'te de dur (kategoriye tıklanabilir)
        this.slider.addEventListener('click', (e) => {
            if (e.target.closest('.category-card')) {
                this.pauseAnimation();
                setTimeout(() => {
                    if (this.isPlaying) {
                        this.resumeAnimationSmoothly();
                    }
                }, 3000);
            }
        });

        // Sayfa görünürlüğü
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAnimation();
            } else if (this.isPlaying) {
                this.resumeAnimationSmoothly();
            }
        });

        // Pencere boyutu değişince
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 250);
        });
    },

    setupAnimationReset() {
        if (!this.track) return;
        
        // CSS Animation event'leri
        this.track.addEventListener('animationiteration', (e) => {
            if (e.animationName === 'scrollCategories') {
                this.handleAnimationEnd();
            }
        });
    },

    handleAnimationEnd() {
        if (this.isResetting) return;
        this.isResetting = true;
        
        // Animasyonu geçici durdur
        this.track.style.animationPlayState = 'paused';
        
        // Hemen sıfır pozisyona al (görünmez)
        this.track.style.transform = 'translateX(0)';
        this.track.style.transition = 'none';
        
        // Bir sonraki frame'de animasyonu tekrar başlat
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                this.track.style.transition = '';
                this.track.style.animationPlayState = 'running';
                this.isResetting = false;
                
                // Progress bar'ı sıfırla
                this.updateProgressBar(0);
            });
        });
    },

    setupProgressBar() {
        // Eğer progress bar yoksa oluştur
        if (document.querySelector('.scroll-progress')) return;
        
        const progressBar = document.createElement('div');
        progressBar.className = 'scroll-progress';
        progressBar.innerHTML = '<div class="scroll-progress-bar"></div>';
        
        if (this.slider) {
            this.slider.appendChild(progressBar);
            this.startProgressBar();
        }
    },

    startProgressBar() {
        if (this.progressInterval) clearInterval(this.progressInterval);

        let progress = 0;
        const interval = 100; // ms
        const increment = (interval / (this.animationSpeed * 1000)) * 100;

        this.progressInterval = setInterval(() => {
            if (this.isPlaying && !this.isResetting) {
                progress += increment;
                if (progress > 100) progress = 0;
                this.updateProgressBar(progress);
            }
        }, interval);
    },

    updateProgressBar(progress) {
        const progressBar = document.querySelector('.scroll-progress-bar');
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
    },

    pauseAnimation() {
        if (!this.track) return;
        
        this.track.style.animationPlayState = 'paused';
        this.isPlaying = false;
        
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
        }
    },

    resumeAnimationSmoothly() {
        if (!this.track || this.isResetting) return;
        
        // Önce transition'ı kaldır
        this.track.style.transition = 'none';
        
        // Animasyonu başlat
        this.track.style.animationPlayState = 'running';
        
        // Bir sonraki frame'de transition'ı geri ekle
        requestAnimationFrame(() => {
            this.track.style.transition = '';
        });
        
        this.isPlaying = true;
        this.startProgressBar();
    },

    playAnimation() {
        if (!this.track) return;
        
        this.track.style.animationPlayState = 'running';
        this.isPlaying = true;
        this.startProgressBar();
    },

    toggleAnimation() {
        if (this.isPlaying) {
            this.pauseAnimation();
        } else {
            this.resumeAnimationSmoothly();
        }
    },

    setSpeed(newSpeed) {
        this.animationSpeed = newSpeed;
        
        if (this.track) {
            // Mevcut animasyon pozisyonunu koru
            const computedStyle = window.getComputedStyle(this.track);
            const currentTransform = computedStyle.transform;
            
            // Yeni animasyon
            this.track.style.animation = `scrollCategories ${newSpeed}s linear infinite`;
            this.track.style.transform = currentTransform;
            
            // Progress bar'ı güncelle
            this.startProgressBar();
        }
    },

    handleResize() {
        // Track genişliğini yeniden ayarla
        this.adjustTrackWidth();
        
        // Animasyonu yeniden başlat
        if (this.track) {
            this.track.style.animation = 'none';
            
            requestAnimationFrame(() => {
                this.track.style.animation = `scrollCategories ${this.animationSpeed}s linear infinite`;
                this.track.style.animationPlayState = this.isPlaying ? 'running' : 'paused';
            });
        }
    },

    destroy() {
        this.pauseAnimation();
        
        // Duplicate item'ları temizle (sadece orijinalleri tut)
        if (this.track && this.duplicateItems && this.originalItemsCount > 0) {
            const allItems = Array.from(this.track.children);
            
            // Sadece ilk seti tut (orijinal sayı kadar)
            const itemsToKeep = allItems.slice(0, this.originalItemsCount);
            this.track.innerHTML = '';
            itemsToKeep.forEach(item => this.track.appendChild(item));
            
            // Track genişliğini sıfırla
            this.track.style.width = '';
            
            this.duplicateItems = false;
        }
    }
};
