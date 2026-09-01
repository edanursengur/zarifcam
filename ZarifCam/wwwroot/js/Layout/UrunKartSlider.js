// ========== ÜRÜN SLIDER - MOBİL OPTİMİZE VERSİYON ==========
(function () {
    'use strict';

    let track = null;
    let prevBtn = null;
    let nextBtn = null;
    let sliderContainer = null;

    let currentPosition = 0;
    let cardWidth = 0;
    let visibleCards = 0;
    let maxPosition = 0;
    let cards = [];
    let totalCards = 0;

    // Drag değişkenleri
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let dragStartTranslate = 0;
    let currentTranslate = 0;
    let dragThreshold = 10; // Daha tutarlı bir eşik

    // Mobil için ayrı eşik değeri
    let isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    let mobileDragThreshold = 8; // Mobil için daha düşük eşik

    // Scroll engelleme için
    let preventScroll = false;

    // Sayfa yüklendiğinde başlat
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSlider);
    } else {
        initSlider();
    }

    async function initSlider() {
        track = document.getElementById('productSliderTrack');
        prevBtn = document.querySelector('.prev-btn');
        nextBtn = document.querySelector('.next-btn');
        sliderContainer = document.querySelector('.slider-container');

        if (!track) {
            console.warn('Slider track bulunamadı');
            return;
        }

        await fetchProducts();
    }

    async function fetchProducts() {
        try {
            track.innerHTML = '<div class="loading-spinner">Ürünler yükleniyor...</div>';

            const response = await fetch(`${window.location.origin}/api/anasayfa/onecikan-urunler?adet=12`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const apiResponse = await response.json();

            if (apiResponse.Success && apiResponse.Data) {
                renderProducts(apiResponse.Data);
            } else {
                throw new Error(apiResponse.Message || 'Ürünler yüklenemedi');
            }
        } catch (error) {
            console.error('Ürünler yüklenirken hata:', error);
            track.innerHTML = `<div class="error-message">Ürünler yüklenirken bir hata oluştu. <button onclick="location.reload()">Tekrar Dene</button></div>`;
        }
    }

    function renderProducts(products) {
        if (!products || products.length === 0) {
            track.innerHTML = '<div class="no-products">Henüz ürün bulunmuyor.</div>';
            return;
        }

        track.innerHTML = products.map(product => {
            const discountPercent = product.EskiFiyat && product.EskiFiyat > product.Fiyat
                ? Math.round(((product.EskiFiyat - product.Fiyat) / product.EskiFiyat) * 100)
                : null;

            const badges = [];
            if (product.YeniMi) badges.push('<span class="badge new">Yeni</span>');
            if (product.CokSatanMi) badges.push('<span class="badge bestseller">Çok Satan</span>');
            if (product.UcretsizKargoVarMi) badges.push('<span class="badge free-shipping">Ücretsiz Kargo</span>');
            if (discountPercent) badges.push(`<span class="badge discount">%${discountPercent}</span>`);

            const taksitMiktari = product.TaksitSecenekleri || 6;
            const taksitFiyati = (product.IndirimliFiyat || product.Fiyat) / taksitMiktari;
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
                    </a>
                    <div class="product-badges">${badges.join('')}</div>
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

        // Slider'ı başlat
        initSliderEvents();
        initProductButtons();

        // Boyutları hesapla
        setTimeout(() => {
            calculateDimensions();
            updateSliderPosition();
        }, 100);

        // Resize olayı
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                calculateDimensions();
                updateSliderPosition();
            }, 150);
        });
    }

    function initSliderEvents() {
        cards = document.querySelectorAll('#productSliderTrack .product-card');
        if (!cards.length) return;

        totalCards = cards.length;

        // Buton olayları
        if (prevBtn) {
            const newPrevBtn = prevBtn.cloneNode(true);
            prevBtn.parentNode.replaceChild(newPrevBtn, prevBtn);
            prevBtn = newPrevBtn;
            prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                movePrev();
            });
        }

        if (nextBtn) {
            const newNextBtn = nextBtn.cloneNode(true);
            nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);
            nextBtn = newNextBtn;
            nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                moveNext();
            });
        }

        // Touch olayları - İYİLEŞTİRİLMİŞ
        track.addEventListener('touchstart', handleTouchStart, { passive: false });
        track.addEventListener('touchmove', handleTouchMove, { passive: false });
        track.addEventListener('touchend', handleTouchEnd);
        track.addEventListener('touchcancel', handleTouchEnd);

        // Mouse olayları
        track.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        // CSS ile grab cursor
        track.style.cursor = 'grab';
    }

    function calculateDimensions() {
        if (!cards.length) return;

        const containerWidth = sliderContainer ? sliderContainer.offsetWidth : window.innerWidth;
        const gap = 20;

        if (window.innerWidth <= 768) {
            cardWidth = (containerWidth - gap) / 2;
        } else if (window.innerWidth <= 1024) {
            cardWidth = (containerWidth - gap * 2) / 3;
        } else {
            // Masaüstü için daha hassas hesaplama
            const firstCard = cards[0];
            if (firstCard) {
                const cardStyle = window.getComputedStyle(firstCard);
                const cardWidthWithMargin = firstCard.offsetWidth + gap;
                cardWidth = cardWidthWithMargin;
            } else {
                cardWidth = 300; // Fallback
            }
        }

        visibleCards = Math.floor(containerWidth / cardWidth);
        if (visibleCards < 1) visibleCards = 1;

        maxPosition = Math.max(0, totalCards - visibleCards);

        if (currentPosition > maxPosition) {
            currentPosition = maxPosition;
        }

        updateButtonsState();
    }

    function updateSliderPosition() {
        if (!track) return;
        const translateX = -currentPosition * cardWidth;
        track.style.transform = `translateX(${translateX}px)`;
        currentTranslate = translateX;
        updateButtonsState();
    }

    function updateButtonsState() {
        if (prevBtn) prevBtn.disabled = currentPosition <= 0;
        if (nextBtn) nextBtn.disabled = currentPosition >= maxPosition;

        if (prevBtn) {
            prevBtn.style.opacity = currentPosition <= 0 ? '0.5' : '1';
            prevBtn.style.cursor = currentPosition <= 0 ? 'not-allowed' : 'pointer';
        }
        if (nextBtn) {
            nextBtn.style.opacity = currentPosition >= maxPosition ? '0.5' : '1';
            nextBtn.style.cursor = currentPosition >= maxPosition ? 'not-allowed' : 'pointer';
        }
    }

    function movePrev() {
        if (currentPosition > 0) {
            currentPosition--;
            updateSliderPosition();
        }
    }

    function moveNext() {
        if (currentPosition < maxPosition) {
            currentPosition++;
            updateSliderPosition();
        }
    }

    // ============ İYİLEŞTİRİLMİŞ TOUCH EVENTLERİ ============
    function handleTouchStart(e) {
        // Sadece slider içindeki kartlara tıklandığında çalışsın
        if (!track.contains(e.target)) return;

        // Butonlara tıklandıysa kaydırmayı başlatma
        if (e.target.closest('.fav-btn') || e.target.closest('.add-to-cart-btn') || e.target.closest('.quick-view-btn')) {
            return;
        }

        const touch = e.touches[0];
        dragStartX = touch.clientX;
        dragStartY = touch.clientY;
        dragStartTranslate = currentTranslate;
        isDragging = false;
        preventScroll = false;

        track.style.transition = 'none';
    }

    function handleTouchMove(e) {
        if (!track.contains(e.target)) return;

        // Butonlara tıklandıysa kaydırmayı başlatma
        if (e.target.closest('.fav-btn') || e.target.closest('.add-to-cart-btn') || e.target.closest('.quick-view-btn')) {
            return;
        }

        const touch = e.touches[0];
        const currentX = touch.clientX;
        const currentY = touch.clientY;
        const diffX = currentX - dragStartX;
        const diffY = Math.abs(currentY - dragStartY);
        const absDiffX = Math.abs(diffX);

        // Yatay hareket eşik değerini geçtiyse ve yatay hareket dikeyden büyükse
        const currentThreshold = isMobile ? mobileDragThreshold : dragThreshold;

        if (!isDragging && absDiffX > currentThreshold && absDiffX > diffY) {
            isDragging = true;
            preventScroll = true;
            e.preventDefault();
            e.stopPropagation();
            track.style.cursor = 'grabbing';
        }

        if (isDragging) {
            e.preventDefault();
            e.stopPropagation();

            let newTranslate = dragStartTranslate + diffX;

            // Sınırlama ve direnç efekti
            const maxTranslate = 0;
            const minTranslate = -(totalCards - visibleCards) * cardWidth;

            // Sınırlara yaklaşırken direnç uygula
            if (newTranslate > maxTranslate) {
                const overshoot = newTranslate - maxTranslate;
                newTranslate = maxTranslate - overshoot * 0.3;
            } else if (newTranslate < minTranslate) {
                const overshoot = minTranslate - newTranslate;
                newTranslate = minTranslate + overshoot * 0.3;
            }

            track.style.transform = `translateX(${newTranslate}px)`;
            currentTranslate = newTranslate;
        }
    }

    function handleTouchEnd(e) {
        if (!track.contains(e.target)) return;

        if (isDragging) {
            e.preventDefault();
            e.stopPropagation();

            track.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            track.style.cursor = 'grab';

            const endX = e.changedTouches[0].clientX;
            const diff = endX - dragStartX;

            let newPosition = currentPosition;

            // Kaydırma mesafesine göre sayfa değiştir
            const swipeThreshold = 30; // Daha tutarlı eşik

            if (Math.abs(diff) > swipeThreshold) {
                if (diff < 0 && currentPosition < maxPosition) {
                    newPosition = currentPosition + 1;
                } else if (diff > 0 && currentPosition > 0) {
                    newPosition = currentPosition - 1;
                }
            } else {
                // Yeterli kaydırma yoksa en yakın konuma yapıştır
                const targetTranslate = -currentTranslate;
                let nearestPosition = Math.round(targetTranslate / cardWidth);
                nearestPosition = Math.max(0, Math.min(nearestPosition, maxPosition));
                newPosition = nearestPosition;
            }

            currentPosition = newPosition;
            updateSliderPosition();
        }

        isDragging = false;
        preventScroll = false;
        track.style.transition = '';
    }

    // ============ İYİLEŞTİRİLMİŞ MOUSE EVENTLERİ ============
    let isMouseDragging = false;
    let mouseStartX = 0;
    let mouseStartY = 0;
    let mouseStartTranslate = 0;

    function handleMouseDown(e) {
        if (!track.contains(e.target)) return;

        // Butonlara tıklandıysa kaydırmayı başlatma
        if (e.target.closest('.fav-btn') || e.target.closest('.add-to-cart-btn') || e.target.closest('.quick-view-btn')) {
            return;
        }

        e.preventDefault();
        isMouseDragging = true;
        mouseStartX = e.clientX;
        mouseStartY = e.clientY;
        mouseStartTranslate = currentTranslate;

        track.style.transition = 'none';
        track.style.cursor = 'grabbing';
    }

    function handleMouseMove(e) {
        if (!isMouseDragging) return;

        const diffX = e.clientX - mouseStartX;
        const diffY = Math.abs(e.clientY - mouseStartY);

        // Yeterli yatay hareket yoksa kaydırma
        if (Math.abs(diffX) < dragThreshold && Math.abs(diffX) < diffY) {
            return;
        }

        e.preventDefault();

        let newTranslate = mouseStartTranslate + diffX;

        const maxTranslate = 0;
        const minTranslate = -(totalCards - visibleCards) * cardWidth;

        if (newTranslate > maxTranslate) {
            const overshoot = newTranslate - maxTranslate;
            newTranslate = maxTranslate - overshoot * 0.3;
        } else if (newTranslate < minTranslate) {
            const overshoot = minTranslate - newTranslate;
            newTranslate = minTranslate + overshoot * 0.3;
        }

        track.style.transform = `translateX(${newTranslate}px)`;
        currentTranslate = newTranslate;
    }

    function handleMouseUp(e) {
        if (!isMouseDragging) return;

        isMouseDragging = false;
        track.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        track.style.cursor = 'grab';

        const diff = e.clientX - mouseStartX;

        let newPosition = currentPosition;

        if (Math.abs(diff) > 30) {
            if (diff < 0 && currentPosition < maxPosition) {
                newPosition = currentPosition + 1;
            } else if (diff > 0 && currentPosition > 0) {
                newPosition = currentPosition - 1;
            }
        } else {
            const targetTranslate = -currentTranslate;
            let nearestPosition = Math.round(targetTranslate / cardWidth);
            nearestPosition = Math.max(0, Math.min(nearestPosition, maxPosition));
            newPosition = nearestPosition;
        }

        currentPosition = newPosition;
        updateSliderPosition();
    }

    // ============ ÜRÜN BUTONLARI ============
    function initProductButtons() {
        // Favori butonları
        document.querySelectorAll('.fav-btn').forEach(btn => {
            btn.removeEventListener('click', handleFavClick);
            btn.addEventListener('click', handleFavClick);
        });

        // Sepete ekle butonları
        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.removeEventListener('click', handleAddToCart);
            btn.addEventListener('click', handleAddToCart);
        });
    }

    function handleFavClick(e) {
        e.preventDefault();
        e.stopPropagation();
        const btn = e.currentTarget;
        btn.classList.toggle('active');
        const svgPath = btn.querySelector('svg path');
        if (svgPath) {
            if (btn.classList.contains('active')) {
                svgPath.setAttribute('fill', '#E8B4B8');
                svgPath.setAttribute('stroke', '#E8B4B8');
            } else {
                svgPath.setAttribute('fill', 'none');
                svgPath.setAttribute('stroke', 'currentColor');
            }
        }
    }

    function handleAddToCart(e) {
        e.preventDefault();
        e.stopPropagation();
        const btn = e.currentTarget;
        const originalText = btn.innerHTML;
        btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> Eklendi`;
        btn.style.background = '#7D9D9C';
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = '';
        }, 2000);
    }
})();