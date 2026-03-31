// === ZARIFCAM HERO SLIDER - TAM ENTEGRASYON ===
(function () {
    'use strict';

    // ÇİFT YÜKLEME KORUMASI
    if (window._zarifcamSliderLoaded) {
        console.warn('Slider zaten yüklü!');
        return;
    }
    window._zarifcamSliderLoaded = true;

    console.log('ZarifCam Hero Slider yükleniyor...');

    // ========== KONFİGÜRASYON ==========
    const CONFIG = {
        API_URL: '/api/anasayfa/heroslider',
        AUTO_SLIDE_INTERVAL: 5000, // 5 saniye
        SLIDE_TRANSITION: 600, // ms
        DEFAULT_SLIDES: [
            {
                MedyaUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&h=500&fit=crop',
                Baslik: 'ZarifCam Premium Koleksiyon',
                Aciklama: 'Özel tasarım cam ürünlerinde %30 indirim fırsatı',
                ButonText: 'Keşfet',
                ButonLink: '/urunler'
            }
        ]
    };

    // ========== RENDERER ==========
    const Renderer = {
        // API'den slide verilerini al ve render et
        async loadAndRenderSlides() {
            console.log('[Renderer] Slide\'lar API\'den yükleniyor...');

            try {
                // API'den veri al
                const slides = await this.fetchSlides();

                // Render et
                this.renderHeroSliders(slides);

                return slides;
            } catch (error) {
                console.error('[Renderer] Slide yükleme hatası:', error);
                // Fallback göster
                this.renderHeroSliders(CONFIG.DEFAULT_SLIDES);
                return CONFIG.DEFAULT_SLIDES;
            }
        },

        // API'den slide verilerini çek
        async fetchSlides() {
            try {
                console.log(`[Renderer] API isteği: ${CONFIG.API_URL}`);

                const response = await fetch(CONFIG.API_URL);

                if (!response.ok) {
                    throw new Error(`API hatası: ${response.status}`);
                }

                const result = await response.json();

                if (!result.Success || !result.Data) {
                    throw new Error('API başarısız yanıt');
                }

                console.log(`[Renderer] ${result.Data.length} slide alındı`);
                return result.Data;
            } catch (error) {
                console.error('[Renderer] API hatası:', error);
                throw error;
            }
        },

        // Slide'ları render et
        renderHeroSliders(slides) {
            console.log('[Renderer] Slide render ediliyor:', slides.length);

            const container = document.getElementById('slidesTrack');
            const dotsContainer = document.getElementById('sliderDots');

            if (!container) {
                console.error('[Renderer] Container bulunamadı!');
                return;
            }

            // Container'ı temizle
            container.innerHTML = '';
            if (dotsContainer) dotsContainer.innerHTML = '';

            // Slide'ları ekle
            slides.forEach((slide, index) => {
                // Slide element oluştur
                const slideEl = document.createElement('div');
                slideEl.className = `slide ${index === 0 ? 'active' : ''}`;
                slideEl.dataset.index = index;

                // Medya URL kontrolü
                let mediaUrl = slide.MedyaUrl || '/images/default-slide.jpg';
                if (!mediaUrl.startsWith('http') && !mediaUrl.startsWith('/')) {
                    mediaUrl = '/' + mediaUrl;
                }

                slideEl.innerHTML = `
                    <a href="${slide.ButonLink || '#'}" class="slide-link">
                        <img src="${mediaUrl}" 
                             alt="${slide.Baslik || 'Slider'}" 
                             class="slide-image"
                             loading="${index < 2 ? 'eager' : 'lazy'}">
                        <div class="slide-content">
                            ${slide.Baslik ? `<h2>${slide.Baslik}</h2>` : ''}
                            ${slide.Aciklama ? `<p>${slide.Aciklama}</p>` : ''}
                            ${slide.ButonText ? `<span class="slide-btn">${slide.ButonText}</span>` : ''}
                        </div>
                    </a>
                `;

                container.appendChild(slideEl);

                // Dot ekle
                if (dotsContainer) {
                    const dot = document.createElement('button');
                    dot.className = `slider-dot ${index === 0 ? 'active' : ''}`;
                    dot.dataset.index = index;
                    dot.setAttribute('aria-label', `Slide ${index + 1}`);
                    dotsContainer.appendChild(dot);
                }
            });

            console.log(`[Renderer] ${slides.length} slide eklendi`);

            // Slider'ı başlat
            this.initSlider();
        },

        // Slider'ı başlat
        initSlider() {
            console.log('[Renderer] Slider başlatılıyor');

            // Eski slider'ı temizle
            if (window.activeSlider && window.activeSlider.destroy) {
                window.activeSlider.destroy();
            }

            // Yeni slider oluştur
            window.activeSlider = new SimpleSlider();
        }
    };

    // ========== SIMPLE SLIDER () ==========
    class SimpleSlider {
        constructor() {
            console.log('[SimpleSlider] Oluşturuluyor');

            this.currentIndex = 0;
            this.slides = document.querySelectorAll('.slide');
            this.dots = document.querySelectorAll('.slider-dot');
            this.track = document.querySelector('.slides-track');
            this.autoInterval = null;

            if (this.slides.length === 0) {
                console.error('[SimpleSlider] Slide bulunamadı!');
                return;
            }

            this.init();
        }

        init() {
            console.log(`[SimpleSlider] ${this.slides.length} slide ile başlatılıyor`);

            // Event listeners ekle
            this.addEventListeners();

            // Pozisyonu ayarla
            this.updatePosition();

            // Otomatik slider'ı başlat
            this.startAutoSlide();

            console.log('[SimpleSlider] Başlatıldı ✓');
        }

        addEventListeners() {
            // Önceki buton
            const prevBtn = document.querySelector('.prev-btn');
            if (prevBtn) {
                prevBtn.addEventListener('click', () => this.prev());
            }

            // Sonraki buton
            const nextBtn = document.querySelector('.next-btn');
            if (nextBtn) {
                nextBtn.addEventListener('click', () => this.next());
            }

            // Dot'lar
            this.dots.forEach(dot => {
                dot.addEventListener('click', (e) => {
                    const index = parseInt(e.currentTarget.dataset.index);
                    this.goTo(index);
                });
            });

            // Touch events (mobil için)
            this.addTouchEvents();

            // Klavye kontrolleri
            document.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowLeft') this.prev();
                if (e.key === 'ArrowRight') this.next();
            });

            // Hover pause (desktop)
            const slider = document.querySelector('.karaca-hero-slider');
            if (slider && window.innerWidth > 991) {
                slider.addEventListener('mouseenter', () => this.stopAutoSlide());
                slider.addEventListener('mouseleave', () => this.startAutoSlide());
            }
        }

        addTouchEvents() {
            if (!this.track) return;

            let startX = 0;
            let isDragging = false;

            this.track.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX;
                isDragging = true;
                this.stopAutoSlide();
            });

            this.track.addEventListener('touchmove', (e) => {
                if (!isDragging) return;
                e.preventDefault();
            });

            this.track.addEventListener('touchend', (e) => {
                if (!isDragging) return;

                const endX = e.changedTouches[0].clientX;
                const diff = startX - endX;

                if (Math.abs(diff) > 50) { // 50px threshold
                    if (diff > 0) {
                        this.next();
                    } else {
                        this.prev();
                    }
                }

                isDragging = false;
                this.startAutoSlide();
            });
        }

        goTo(index) {
            if (index < 0) index = this.slides.length - 1;
            if (index >= this.slides.length) index = 0;

            this.currentIndex = index;
            this.updatePosition();
            this.updateActiveStates();
        }

        next() {
            this.goTo(this.currentIndex + 1);
        }

        prev() {
            this.goTo(this.currentIndex - 1);
        }

        updatePosition() {
            if (this.track) {
                this.track.style.transform = `translateX(-${this.currentIndex * 100}%)`;
                this.track.style.transition = `transform ${CONFIG.SLIDE_TRANSITION}ms cubic-bezier(0.4, 0, 0.2, 1)`;
            }
        }

        updateActiveStates() {
            // Slide'lar
            this.slides.forEach((slide, i) => {
                slide.classList.toggle('active', i === this.currentIndex);
            });

            // Dot'lar
            this.dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === this.currentIndex);
                dot.setAttribute('aria-current', i === this.currentIndex ? 'true' : 'false');
            });
        }

        startAutoSlide() {
            this.stopAutoSlide();

            if (this.slides.length > 1) {
                this.autoInterval = setInterval(() => {
                    this.next();
                }, CONFIG.AUTO_SLIDE_INTERVAL);
            }
        }

        stopAutoSlide() {
            if (this.autoInterval) {
                clearInterval(this.autoInterval);
                this.autoInterval = null;
            }
        }

        destroy() {
            this.stopAutoSlide();

            // Event listener'ları temizle
            const prevBtn = document.querySelector('.prev-btn');
            const nextBtn = document.querySelector('.next-btn');

            if (prevBtn) prevBtn.replaceWith(prevBtn.cloneNode(true));
            if (nextBtn) nextBtn.replaceWith(nextBtn.cloneNode(true));

            // Klavye event'ini kaldır
            document.removeEventListener('keydown', () => { });

            console.log('[SimpleSlider] Temizlendi');
        }
    };

    // ========== OTOMATİK BAŞLATMA ==========
    async function initializeSlider() {
        console.log('[Initializer] Slider başlatılıyor...');

        // 1. Slider HTML'i kontrol et
        const sliderExists = document.querySelector('.karaca-hero-slider');
        if (!sliderExists) {
            console.warn('[Initializer] Slider HTML bulunamadı');
            return;
        }

        // 2. Slide'ları yükle ve render et
        try {
            await Renderer.loadAndRenderSlides();
            console.log('[Initializer] Slider başarıyla başlatıldı ✓');
        } catch (error) {
            console.error('[Initializer] Slider başlatma hatası:', error);
        }
    }

    // ========== GLOBAL EXPORT ==========
    window.Renderer = Renderer;
    window.SimpleSlider = SimpleSlider;
    window.initializeSlider = initializeSlider;

    // ========== DOM READY EVENT ==========
    document.addEventListener('DOMContentLoaded', function () {
        console.log(' DOM hazır, slider başlatılıyor...');

        // 2 saniye sonra başlat (diğer script'lerin yüklenmesi için)
        setTimeout(() => {
            initializeSlider();
        }, 2000);
    });

    console.log('[Slider] Yüklendi ✓');
})();