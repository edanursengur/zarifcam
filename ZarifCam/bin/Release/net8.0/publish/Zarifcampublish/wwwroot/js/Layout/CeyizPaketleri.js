// ÇEYİZ PAKETLERİ SLIDER
document.addEventListener('DOMContentLoaded', function () {
    const track = document.getElementById('dowrySliderTrack');
    const dotsContainer = document.getElementById('dowryDots');
    const progressBar = document.getElementById('dowryProgress');
    const prevBtn = document.querySelector('.dowry-prev-btn');
    const nextBtn = document.querySelector('.dowry-next-btn');

    if (!track) return;


    // API Base URL


        const API_BASE_URL = window.location.origin;

        async function fetchDowryPackages() {
            try {
                track.innerHTML = '<div class="loading-spinner">Paketler yükleniyor...</div>';

                const response = await fetch(`${API_BASE_URL}/api/anasayfa/ceyiz-paketleri?adet=10`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const apiResponse = await response.json();

                if (apiResponse.Success && apiResponse.Data) {
                    renderPackages(apiResponse.Data);
                } else {
                    throw new Error(apiResponse.Message || 'Paketler yüklenemedi');
                }

            } catch (error) {
                console.error('Paketler yüklenirken hata:', error);
                track.innerHTML = `
                    <div class="error-message">
                        <p>Paketler yüklenirken hata oluştu</p>
                        <button onclick="location.reload()">Tekrar Dene</button>
                    </div>
                `;
            }
        }

    function renderPackages(packages) {
        const slidesHtml = packages.map(pkg => {
            return `
            <div class="dowry-slide">
                <article class="slide-card">
                    <!-- RESİM ALANI - card-image class'ı ile -->
                    <div class="card-image">
                        <img src="${pkg.AnaGorsel}" alt="${pkg.Ad}" loading="lazy">
                        <div class="image-overlay">
                            <span>${pkg.PaketAdeti || 12} Parça</span>
                        </div>
                    </div>

                    <!-- İÇERİK ALANI - card-content class'ı ile -->
                    <div class="card-content">
                        <header class="card-header">
                            <h3 class="card-title">${pkg.Ad}</h3>
                            <div class="card-rating">
                                <span class="stars">★★★★★</span>
                                <span class="rating-text">${pkg.Rating || 4.8}</span>
                            </div>
                        </header>

                        <p class="card-desc">${pkg.KisaAciklama || 'Özel çeyiz paketi'}</p>

                        <div class="card-price">
                            <div class="price-main">
                                <span class="current-price">₺${(pkg.IndirimliFiyat || pkg.Fiyat).toLocaleString('tr-TR')}</span>
                                ${pkg.EskiFiyat ? `<span class="old-price">₺${pkg.EskiFiyat.toLocaleString('tr-TR')}</span>` : ''}
                            </div>
                            ${pkg.EskiFiyat ? `<div class="price-saving">₺${(pkg.EskiFiyat - pkg.Fiyat).toLocaleString('tr-TR')} tasarruf</div>` : ''}
                        </div>

                        <div class="card-actions">
                            <button class="action-btn detail-btn" data-package-id="${pkg.Id}">
                                Detayları Gör
                            </button>
                            <button class="action-btn cart-btn" data-package-id="${pkg.Id}">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <path d="M9 22a1 1 0 100-2 1 1 0 000 2zM20 22a1 1 0 100-2 1 1 0 000 2zM1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6" stroke="currentColor" stroke-width="2"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </article>
            </div>
        `;
        }).join('');

        track.innerHTML = slidesHtml;
    }
        fetchDowryPackages();
    // Değişkenler
    const slides = Array.from(track.querySelectorAll('.dowry-slide'));
    let currentSlide = 0;
    let autoSlideInterval;
    let isPaused = false;

    // Görünen slide sayısı
    function getSlidesPerView() {
        if (window.innerWidth <= 992) return 1;
        if (window.innerWidth <= 1200) return 2;
        return 3;
    }

    // Toplam slide sayısı
    function getTotalSlides() {
        const slidesPerView = getSlidesPerView();
        return Math.max(0, slides.length - slidesPerView);
    }

    // Slide genişliği
    function getSlideWidth() {
        if (slides.length === 0) return 0;
        const slide = slides[0];
        const style = window.getComputedStyle(track);
        const gap = parseFloat(style.gap) || 30;
        return slide.offsetWidth + gap;
    }

    // Dots oluştur
    function createDots() {
        if (!dotsContainer) return;

        const totalSlides = getTotalSlides() + 1;

        dotsContainer.innerHTML = '';

        for (let i = 0; i < totalSlides; i++) {
            const dot = document.createElement('button');
            dot.className = 'slider-dot';
            dot.setAttribute('aria-label', `${i + 1}. sayfa`);
            dot.addEventListener('click', () => goToSlide(i));

            if (i === 0) dot.classList.add('active');
            dotsContainer.appendChild(dot);
        }
    }

    // Slider'ı güncelle
    function updateSlider() {
        const slidesPerView = getSlidesPerView();
        const slideWidth = getSlideWidth();
        const totalSlides = getTotalSlides();

        // Sınır kontrolü
        currentSlide = Math.min(currentSlide, totalSlides);

        // Transform
        const translateX = currentSlide * slideWidth;
        track.style.transform = `translateX(-${translateX}px)`;

        // Dots'ları güncelle
        updateDots();

        // Progress bar'ı güncelle
        updateProgressBar();

        // Butonları güncelle
        updateButtons();
    }

    // Dots'ları güncelle
    function updateDots() {
        const dots = dotsContainer.querySelectorAll('.slider-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });
    }

    // Progress bar'ı güncelle
    function updateProgressBar() {
        if (!progressBar) return;

        const totalSlides = getTotalSlides();
        if (totalSlides === 0) {
            progressBar.style.width = '100%';
            return;
        }

        const progressPercent = (currentSlide / totalSlides) * 100;
        progressBar.style.width = `${progressPercent}%`;
    }

    // Butonları güncelle
    function updateButtons() {
        const totalSlides = getTotalSlides();

        if (prevBtn) {
            prevBtn.disabled = currentSlide === 0;
            prevBtn.style.opacity = currentSlide === 0 ? '0.3' : '1';
        }

        if (nextBtn) {
            nextBtn.disabled = currentSlide >= totalSlides;
            nextBtn.style.opacity = currentSlide >= totalSlides ? '0.3' : '1';
        }
    }

    // Belirli slide'a git
    function goToSlide(index) {
        const totalSlides = getTotalSlides();
        currentSlide = Math.max(0, Math.min(index, totalSlides));
        updateSlider();
    }

    // Sonraki slide
    function nextSlide() {
        const totalSlides = getTotalSlides();

        if (currentSlide < totalSlides) {
            currentSlide++;
        } else {
            currentSlide = 0; // Başa dön
        }

        updateSlider();
    }

    // Önceki slide
    function prevSlide() {
        const totalSlides = getTotalSlides();

        if (currentSlide > 0) {
            currentSlide--;
        } else {
            currentSlide = totalSlides; // Sona git
        }

        updateSlider();
    }

    // Otomatik slider
    function startAutoSlide() {
        stopAutoSlide();

        autoSlideInterval = setInterval(() => {
            if (!isPaused) {
                nextSlide();
            }
        }, 5000);
    }

    function stopAutoSlide() {
        if (autoSlideInterval) {
            clearInterval(autoSlideInterval);
            autoSlideInterval = null;
        }
    }

    // Buton event'leri
    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            prevSlide();
            pauseAndResume();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            nextSlide();
            pauseAndResume();
        });
    }

    // Detay butonları
    const detailBtns = document.querySelectorAll('.detail-btn');
    detailBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const packageType = this.getAttribute('data-package');

            // Analytics
            if (typeof gtag !== 'undefined') {
                gtag('event', 'dowry_package_view', {
                    'event_category': 'engagement',
                    'event_label': packageType
                });
            }

            // Burada modal açılabilir veya sayfaya yönlendirilebilir
            console.log(`Paket detayı: ${packageType}`);

            // Feedback
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 200);
        });
    });

    // Sepete ekle butonları
    const cartBtns = document.querySelectorAll('.cart-btn');
    cartBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const packageType = this.getAttribute('data-package');

            // Analytics
            if (typeof gtag !== 'undefined') {
                gtag('event', 'add_to_cart', {
                    'event_category': 'ecommerce',
                    'event_label': `dowry_${packageType}`
                });
            }

            // Feedback
            const originalHTML = this.innerHTML;
            this.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#567C8D">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
            `;

            setTimeout(() => {
                this.innerHTML = originalHTML;
            }, 1500);

            console.log(`Sepete eklendi: ${packageType} paketi`);
        });
    });

    // WhatsApp butonu
    const whatsappBtn = document.querySelector('.whatsapp-btn');
    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', function () {
            const phoneNumber = "905XXXXXXXXX"; // WhatsApp numarası
            const message = "Merhaba, çeyiz paketi hakkında bilgi almak istiyorum.";
            const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

            window.open(url, '_blank');

            if (typeof gtag !== 'undefined') {
                gtag('event', 'whatsapp_click', {
                    'event_category': 'engagement',
                    'event_label': 'dowry_package'
                });
            }
        });
    }

    // Pause and resume
    function pauseAndResume() {
        isPaused = true;
        stopAutoSlide();

        setTimeout(() => {
            isPaused = false;
            startAutoSlide();
        }, 3000);
    }

    // Hover'da durdur
    track.addEventListener('mouseenter', () => {
        isPaused = true;
        stopAutoSlide();
    });

    track.addEventListener('mouseleave', () => {
        isPaused = false;
        startAutoSlide();
    });

    // Touch/swipe
    let startX = 0;
    let isDragging = false;

    track.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        isDragging = true;
        isPaused = true;
        stopAutoSlide();
    }, { passive: true });

    track.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
    });

    track.addEventListener('touchend', (e) => {
        if (!isDragging) return;

        const endX = e.changedTouches[0].clientX;
        const diff = startX - endX;
        const threshold = 50;

        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        }

        isDragging = false;
        setTimeout(() => {
            isPaused = false;
            startAutoSlide();
        }, 2000);
    });

    // Pencere boyutu değiştiğinde
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const totalSlides = getTotalSlides();
            if (currentSlide > totalSlides) {
                currentSlide = Math.max(0, totalSlides);
            }

            createDots();
            updateSlider();
        }, 250);
    });

    // İlk yükleme
    createDots();
    updateSlider();

    // Otomatik slider'ı başlat
    if (getTotalSlides() > 0) {
        startAutoSlide();
    }

    // Debug
    console.log('Çeyiz Slider yüklendi:', {
        totalSlides: slides.length,
        slidesPerView: getSlidesPerView(),
        currentSlide
    });
});