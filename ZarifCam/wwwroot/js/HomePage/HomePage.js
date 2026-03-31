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
    initCategorySlider() {
        const track = document.querySelector('.category-track');

        if (!track) return;

        // infinite için kopyala
        track.innerHTML += track.innerHTML;

        let autoScroll = setInterval(() => {
            track.scrollLeft += 2;

            if (track.scrollLeft >= track.scrollWidth / 2) {
                track.scrollLeft = 0;
            }
        }, 10);

        // kullanıcı dokununca durdur
        const stop = () => clearInterval(autoScroll);
        const start = () => {
            autoScroll = setInterval(() => {
                track.scrollLeft += 1;
                if (track.scrollLeft >= track.scrollWidth / 2) {
                    track.scrollLeft = 0;
                }
            }, 20);
        };

        track.addEventListener('mouseenter', stop);
        track.addEventListener('mouseleave', start);
        track.addEventListener('touchstart', stop);
        track.addEventListener('touchend', start);
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

        container.innerHTML = categories.map(cat => this.createCategoryCard(cat)).join('');

        console.log(`✅ ${categories.length} kategori render edildi`);

        // sliderı renderdan sonra başlat
        this.initCategorySlider();
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
                this.loadFeaturedProducts()
            ]);

            // İkinci aşama veriler
            setTimeout(() => {
                Promise.allSettled([
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
    loadCSS();
    loadFonts();
    initBackToTop();
    initScrollAnimations();
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
    console.log('HomePage Enhanced yüklendi');
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


const track = document.getElementById("categoriesTrack");

async function loadCategories() {
    try {
        const res = await fetch(API_URL);

        if (!res.ok) throw new Error("API patladı");

        const categories = await res.json();

        if (!categories || categories.length === 0) {
            console.warn("Kategori yok");
            return;
        }

        renderSlider(categories);

    } catch (err) {
        console.error("Kategori çekilemedi:", err);
    }
}

function renderSlider(categories) {

    track.innerHTML = "";

    // İlk set
    categories.forEach(cat => {
        track.appendChild(createItem(cat));
    });

    // Aynılarını tekrar ekle (sonsuz kayma için)
    categories.forEach(cat => {
        track.appendChild(createItem(cat));
    });

    // Animasyonu başlat
    requestAnimationFrame(() => {
        track.classList.add("auto-scroll");
    });
}

function createItem(category) {

    const div = document.createElement("div");
    div.className = "category-item";
    div.textContent = category.name || category.CategoryName || category;

    return div;
}
function enableDragScroll(container) {
    let isDown = false;
    let startX;
    let scrollLeft;

    container.addEventListener('mousedown', e => {
        isDown = true;
        container.classList.add('dragging');
        startX = e.pageX - container.offsetLeft;
        scrollLeft = container.scrollLeft;
    });

    container.addEventListener('mouseleave', () => {
        isDown = false;
    });

    container.addEventListener('mouseup', () => {
        isDown = false;
    });

    container.addEventListener('mousemove', e => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - container.offsetLeft;
        const walk = (x - startX) * 1.5;
        container.scrollLeft = scrollLeft - walk;
    });
}

    

    
