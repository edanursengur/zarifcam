// EN AVANTAJLI FIRSATLAR - DÝNAMÝK SLIDER
document.addEventListener('DOMContentLoaded', function () {
    const API_AKTIF_KAMPANYALAR = '/api/anasayfa/aktifkampanyalar?limit=10';

    // Aktif kampanyalarý yükle
    loadAktifKampanyalar();

    // Aktif kampanyalarý yükleme fonksiyonu
    async function loadAktifKampanyalar() {
        const track = document.getElementById('exactSliderTrack');
        const loading = document.getElementById('kampanyaLoading');

        if (!track) return;

        // Loading göster
        if (loading) loading.style.display = 'block';
        track.innerHTML = '';

        try {
            const response = await fetch(API_AKTIF_KAMPANYALAR);
            const kampanyalar = await response.json();

            console.log('Yüklenen kampanyalar:', kampanyalar);

            if (kampanyalar && kampanyalar.length > 0) {
                // Kampanyalarý slider'a ekle
                renderKampanyalar(track, kampanyalar);

                // Slider'ý baþlat (mevcut slider kodun çalýþmasý için)
                setTimeout(() => {
                    // Burada mevcut slider kodun zaten çalýþacak
                    // Sadece kartlar yüklendikten sonra tekrar initialize etmek için
                    if (typeof initExistingSlider === 'function') {
                        initExistingSlider();
                    }
                }, 100);
            } else {
                // Kampanya yoksa placeholder göster
                track.innerHTML = `
                    <div class="exact-deal-card">
                        <div class="exact-card-inner">
                            <div class="exact-card-background" style="background-color: #f5f5f5;">
                            </div>
                            <div class="exact-card-content">
                                <div class="exact-card-text">
                                    <div class="exact-card-main-text">YAKINDA</div>
                                    <div class="exact-card-highlight">YENÝ FIRSATLAR</div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Kampanyalar yüklenirken hata:', error);
            track.innerHTML = `
                <div class="exact-deal-card">
                    <div class="exact-card-inner">
                        <div class="exact-card-background" style="background-color: #f5f5f5;">
                        </div>
                        <div class="exact-card-content">
                            <div class="exact-card-text">
                                <div class="exact-card-main-text">YÜKLENEMEDÝ</div>
                                <div class="exact-card-highlight">LÜTFEN SAYFAYI YENÝLEYÝN</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } finally {
            if (loading) loading.style.display = 'none';
        }
    }

    // Kampanyalarý HTML'e çevir
    // Kampanyalarý HTML'e çevir
    function renderKampanyalar(track, kampanyalar) {
        let html = '';

        kampanyalar.forEach(kampanya => {
            // Görsel URL: Önce kampanya kartý arkaplaný, yoksa ürün görseli, yoksa varsayýlan
            let gorselUrl = kampanya.KartArkaplanResim || kampanya.UrunGorselUrl || kampanya.GorselUrl;

            // Hala yoksa varsayýlan görsel
            if (!gorselUrl) {
                // Rastgele bir görsel seç (kategorisine göre deðiþebilir)
                const defaultImages = [
                    'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d',
                    'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0',
                    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
                    'https://images.unsplash.com/photo-1523275335684-37898b6baf30'
                ];
                gorselUrl = defaultImages[Math.floor(Math.random() * defaultImages.length)] + '?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
            }

            // Link oluþtur - önce kart buton linki, yoksa kampanya linki, yoksa detay sayfasý
            const link = kampanya.KartButonLink || kampanya.Link || `/kampanya/detay/${kampanya.KampanyaID}`;

            // Buton yazýsý - karttan gelir, yoksa varsayýlan
            const butonYazi = kampanya.KartButonYazi || 'Keþfet';

            // Badge metni (sað üst köþe)
            const badgeText = kampanya.badgeText || 'FIRSAT';

            // Ana metin (orta büyük yazý)
            const anaMetin = kampanya.AnaMetin || kampanya.KartBaslik || 'ÖZEL FIRSAT';

            // Vurgu metni (ana metnin altýndaki küçük yazý)
            const vurguMetni = kampanya.VurguMetni || 'KAÇIRMAYIN';

            // Arkaplan rengi (eðer görsel yoksa)
            const bgColor = kampanya.KartArkaplanRengi || '#f5f5f5';

            // Arkaplan stili - görsel varsa onu kullan, yoksa rengi kullan
            const bgStyle = gorselUrl
                ? `background-image: url('${gorselUrl}');`
                : `background-color: ${bgColor};`;

            html += `
            <div class="exact-deal-card">
                <div class="exact-card-inner">
                    <div class="exact-card-background" style="${bgStyle}"></div>
                    <div class="exact-card-content">
                        <div class="exact-card-badge">${badgeText}</div>
                        <div class="exact-card-text">
                            <div class="exact-card-main-text">${anaMetin}</div>
                            <div class="exact-card-highlight">${vurguMetni}</div>
                        </div>
                        <a href="${link}" class="exact-card-cta">
                            ${butonYazi} >>
                        </a>
                    </div>
                </div>
            </div>
        `;
        });

        track.innerHTML = html;
    }


    const track = document.getElementById('exactSliderTrack');
    const dotsContainer = document.getElementById('exactSliderDots');
    const prevBtn = document.querySelector('.exact-prev-btn');
    const nextBtn = document.querySelector('.exact-next-btn');

    if (!track) return;

    // Deðiþkenler
    const cards = Array.from(track.querySelectorAll('.exact-deal-card'));
    const totalCards = cards.length;
    let currentSlide = 0;

    // Ekran geniþliðine göre görünen kart sayýsý
    function getSlidesPerView() {
        if (window.innerWidth <= 576) return 1;
        return 2;
    }

    // Toplam slide sayýsýný hesapla
    function getTotalSlides() {
        const slidesPerView = getSlidesPerView();
        return Math.max(0, Math.ceil(totalCards / slidesPerView) - 1);
    }

    // Kart geniþliðini hesapla
    function getCardWidth() {
        if (cards.length === 0) return 0;
        const card = cards[0];
        const style = window.getComputedStyle(card);
        const marginRight = parseFloat(style.marginRight) || 0;
        return card.offsetWidth + marginRight;
    }

    // Kontrolleri güncelle (butonlarý gizle/göster)
    function updateControls() {
        const totalSlides = getTotalSlides();
        const slidesPerView = getSlidesPerView();

        // Eðer 2 veya daha az kart varsa ve ekranda hepsi görünüyorsa
        if (totalCards <= slidesPerView) {
            // Butonlarý gizle
            if (prevBtn) prevBtn.style.display = 'none';
            if (nextBtn) nextBtn.style.display = 'none';
            if (dotsContainer) dotsContainer.style.display = 'none';
            return;
        } else {
            // Butonlarý göster
            if (prevBtn) prevBtn.style.display = 'flex';
            if (nextBtn) nextBtn.style.display = 'flex';
            if (dotsContainer) dotsContainer.style.display = 'flex';
        }

        // Buton durumlarýný güncelle
        if (prevBtn) {
            prevBtn.disabled = currentSlide === 0;
            prevBtn.style.opacity = currentSlide === 0 ? '0.3' : '1';
            prevBtn.style.cursor = currentSlide === 0 ? 'not-allowed' : 'pointer';
        }

        if (nextBtn) {
            nextBtn.disabled = currentSlide >= totalSlides;
            nextBtn.style.opacity = currentSlide >= totalSlides ? '0.3' : '1';
            nextBtn.style.cursor = currentSlide >= totalSlides ? 'not-allowed' : 'pointer';
        }
    }

    // Dot'larý oluþtur
    function createDots() {
        if (!dotsContainer) return;

        const totalSlides = getTotalSlides() + 1;

        // Eðer 1 slide varsa dots gösterme
        if (totalSlides <= 1) {
            dotsContainer.innerHTML = '';
            return;
        }

        dotsContainer.innerHTML = '';

        for (let i = 0; i < totalSlides; i++) {
            const dot = document.createElement('button');
            dot.className = 'exact-slider-dot';
            dot.setAttribute('aria-label', `${i + 1}. sayfa`);
            dot.addEventListener('click', () => goToSlide(i));

            if (i === currentSlide) dot.classList.add('active');
            dotsContainer.appendChild(dot);
        }
    }

    // Slider'ý güncelle
    function updateSlider() {
        const slidesPerView = getSlidesPerView();
        const cardWidth = getCardWidth();
        const translateX = currentSlide * cardWidth * slidesPerView;

        track.style.transform = `translateX(-${translateX}px)`;
        updateDots();
        updateControls();
    }

    // Dot'larý güncelle
    function updateDots() {
        const dots = dotsContainer.querySelectorAll('.exact-slider-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentSlide);
        });
    }

    // Belirli slide'a git
    function goToSlide(index) {
        const totalSlides = getTotalSlides();
        currentSlide = Math.max(0, Math.min(index, totalSlides));
        updateSlider();
    }

    // Sonraki slide (döngüsel)
    function nextSlide() {
        const totalSlides = getTotalSlides();

        if (currentSlide < totalSlides) {
            currentSlide++;
        } else {
            // Son slide'daysa baþa dön
            currentSlide = 0;
        }

        updateSlider();
    }

    // Önceki slide (döngüsel)
    function prevSlide() {
        const totalSlides = getTotalSlides();

        if (currentSlide > 0) {
            currentSlide--;
        } else {
            // Ýlk slide'daysa sona git
            currentSlide = totalSlides;
        }

        updateSlider();
    }

    // Event listener'lar
    if (prevBtn) {
        prevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            prevSlide();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            nextSlide();
        });
    }

    // Touch/swipe desteði
    let startX = 0;
    let isDragging = false;
    let startTranslate = 0;

    track.addEventListener('touchstart', (e) => {
        const totalSlides = getTotalSlides();
        if (totalSlides <= 0) return; // Kaydýrmaya gerek yoksa

        startX = e.touches[0].clientX;
        startTranslate = currentSlide * getCardWidth() * getSlidesPerView();
        isDragging = true;
        track.style.transition = 'none';
    }, { passive: true });

    track.addEventListener('touchmove', (e) => {
        if (!isDragging) return;

        const currentX = e.touches[0].clientX;
        const diff = startX - currentX;
        const translateX = startTranslate + diff;

        // Sýnýrlarý kontrol et
        const slidesPerView = getSlidesPerView();
        const cardWidth = getCardWidth();
        const totalSlides = getTotalSlides();
        const maxTranslate = cardWidth * slidesPerView * totalSlides;
        const boundedTranslate = Math.max(0, Math.min(translateX, maxTranslate));

        track.style.transform = `translateX(-${boundedTranslate}px)`;
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
        if (!isDragging) return;

        const endX = e.changedTouches[0].clientX;
        const diff = startX - endX;
        const threshold = 50;

        track.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)';

        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        } else {
            updateSlider(); // Eski konuma dön
        }

        isDragging = false;
    });

    // Mouse drag
    track.addEventListener('mousedown', (e) => {
        const totalSlides = getTotalSlides();
        if (totalSlides <= 0) return;

        startX = e.clientX;
        startTranslate = currentSlide * getCardWidth() * getSlidesPerView();
        isDragging = true;
        track.style.cursor = 'grabbing';
        track.style.transition = 'none';
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        const currentX = e.clientX;
        const diff = startX - currentX;
        const translateX = startTranslate + diff;

        // Sýnýrlarý kontrol et
        const slidesPerView = getSlidesPerView();
        const cardWidth = getCardWidth();
        const totalSlides = getTotalSlides();
        const maxTranslate = cardWidth * slidesPerView * totalSlides;
        const boundedTranslate = Math.max(0, Math.min(translateX, maxTranslate));

        track.style.transform = `translateX(-${boundedTranslate}px)`;
    });

    document.addEventListener('mouseup', () => {
        if (!isDragging) return;

        track.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        track.style.cursor = '';
        updateSlider(); // Konumu hizala
        isDragging = false;
    });

    // Kart sayýsýna göre CSS class'larýný güncelle
    function updateCardClasses() {
        const slidesPerView = getSlidesPerView();

        cards.forEach((card, index) => {
            // Eðer tek kart görünüyorsa ve toplam kart sayýsý 1'den fazlaysa
            if (slidesPerView === 1 && totalCards > 1) {
                card.style.marginRight = '15px';
            } else if (slidesPerView === 2 && totalCards === 3) {
                // 3 kart durumunda özel stil
                if (index === 2) { // Son kart
                    card.style.marginRight = '0';
                } else {
                    card.style.marginRight = '15px';
                }
            }
        });
    }

    // Pencere boyutu deðiþtiðinde
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const newSlidesPerView = getSlidesPerView();
            const newTotalSlides = getTotalSlides();

            // Eðer mevcut slide yeni toplamdan fazlaysa, baþa dön
            if (currentSlide > newTotalSlides) {
                currentSlide = 0;
            }

            updateCardClasses();
            createDots();
            updateControls();
            updateSlider();
        }, 250);
    });

    // Otomatik slider (sadece kaydýrma gerekiyorsa)
    let autoSlideInterval;

    function startAutoSlide() {
        const totalSlides = getTotalSlides();
        if (totalSlides <= 0) return; // Kaydýrmaya gerek yoksa baþlatma

        stopAutoSlide(); // Önceki interval'i temizle

        autoSlideInterval = setInterval(() => {
            nextSlide();
        }, 5000); // 5 saniye
    }

    function stopAutoSlide() {
        if (autoSlideInterval) {
            clearInterval(autoSlideInterval);
            autoSlideInterval = null;
        }
    }

    // Hover'da durdur
    if (prevBtn && nextBtn) {
        track.addEventListener('mouseenter', stopAutoSlide);
        track.addEventListener('mouseleave', startAutoSlide);

        prevBtn.addEventListener('mouseenter', stopAutoSlide);
        nextBtn.addEventListener('mouseenter', stopAutoSlide);
        prevBtn.addEventListener('mouseleave', startAutoSlide);
        nextBtn.addEventListener('mouseleave', startAutoSlide);
    }

    // Touch device'da
    track.addEventListener('touchstart', stopAutoSlide);
    track.addEventListener('touchend', () => {
        setTimeout(startAutoSlide, 3000);
    });

    // Kart sayýsýna göre log
    console.log(`Toplam kart: ${totalCards}, Görünen: ${getSlidesPerView()}, Slide sayýsý: ${getTotalSlides() + 1}`);

    // Ýlk yükleme
    updateCardClasses();
    createDots();
    updateControls();
    updateSlider();

    // Sadece kaydýrma gerekiyorsa otomatik slider'ý baþlat
    if (getTotalSlides() > 0 && window.innerWidth > 768) {
        startAutoSlide();
    }

    // Debug için
    window.debugSlider = {
        getState: () => ({
            totalCards,
            slidesPerView: getSlidesPerView(),
            totalSlides: getTotalSlides(),
            currentSlide,
            canSlide: getTotalSlides() > 0
        }),
        goToSlide,
        nextSlide,
        prevSlide
    };
});