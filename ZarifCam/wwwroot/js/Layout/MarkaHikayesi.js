// ÇEYİZ PAKETLERİ SLIDER
document.addEventListener('DOMContentLoaded', function () {
  const track = document.getElementById('dowrySliderTrack');
  const dotsContainer = document.getElementById('dowryDots');
  const progressBar = document.getElementById('dowryProgress');
  const prevBtn = document.querySelector('.dowry-prev-btn');
  const nextBtn = document.querySelector('.dowry-next-btn');

  if (!track) return;

  // Değişkenler
  const slides = Array.from(track.querySelectorAll('.dowry-slide'));
  let currentSlide = 0;
  let autoSlideInterval;
  let isPaused = false;
  let isDragging = false;
  let startX = 0;
  let currentTranslate = 0;
  let prevTranslate = 0;

  // Görünen slide sayısı
  function getSlidesPerView() {
    if (window.innerWidth <= 768) return 1;
    if (window.innerWidth <= 1200) return 2;
    return 3;
  }

  // Toplam kaydırılabilir slide sayısı
  function getTotalSlides() {
    const slidesPerView = getSlidesPerView();
    return Math.max(0, slides.length - slidesPerView);
  }

  // Slide genişliği (gap dahil)
  function getSlideWidth() {
    if (slides.length === 0) return 0;
    const slide = slides[0];
    const style = window.getComputedStyle(track);
    const gap = parseFloat(style.gap) || 30;

    // Mobilde slide'ın tamamını göstermek için ayar
    if (window.innerWidth <= 768) {
      return slide.offsetWidth + gap;
    }

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
      dotsContainer.appendChild(dot);
    }

    updateDots();
  }

  // Slider'ı güncelle
  function updateSlider() {
    const slidesPerView = getSlidesPerView();
    const slideWidth = getSlideWidth();
    const totalSlides = getTotalSlides();

    // Sınır kontrolü
    currentSlide = Math.max(0, Math.min(currentSlide, totalSlides));

    // Transform uygula
    const translateX = currentSlide * slideWidth;
    track.style.transform = `translateX(-${translateX}px)`;
    currentTranslate = -translateX;

    // Dots'ları güncelle
    updateDots();

    // Progress bar'ı güncelle
    updateProgressBar();

    // Butonları güncelle (mobilde butonlar zaten gizli)
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

  // Butonları güncelle (mobilde butonlar zaten CSS'te gizli)
  function updateButtons() {
    const totalSlides = getTotalSlides();

    if (prevBtn && prevBtn.offsetParent !== null) { // Görünürse
      prevBtn.disabled = currentSlide === 0;
      prevBtn.style.opacity = currentSlide === 0 ? '0.3' : '1';
      prevBtn.setAttribute('aria-disabled', currentSlide === 0);
    }

    if (nextBtn && nextBtn.offsetParent !== null) { // Görünürse
      nextBtn.disabled = currentSlide >= totalSlides;
      nextBtn.style.opacity = currentSlide >= totalSlides ? '0.3' : '1';
      nextBtn.setAttribute('aria-disabled', currentSlide >= totalSlides);
    }
  }

  // Belirli slide'a git
  function goToSlide(index) {
    const totalSlides = getTotalSlides();
    const newIndex = Math.max(0, Math.min(index, totalSlides));

    if (newIndex !== currentSlide) {
      currentSlide = newIndex;
      updateSlider();
      pauseAndResume();
    }
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

    // Sadece birden fazla slide varsa otomatik geçiş
    if (getTotalSlides() > 0) {
      autoSlideInterval = setInterval(() => {
        if (!isPaused && !isDragging) {
          nextSlide();
        }
      }, 5000);
    }
  }

  function stopAutoSlide() {
    if (autoSlideInterval) {
      clearInterval(autoSlideInterval);
      autoSlideInterval = null;
    }
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

  // Detay butonları - MOBİL'de direkt yönlendir
  const detailBtns = document.querySelectorAll('.detail-btn');
  detailBtns.forEach(btn => {
    btn.addEventListener('click', function () {
      const packageType = this.getAttribute('data-package');

      // MOBİL'de direkt detay sayfasına yönlendir
      if (window.innerWidth <= 768) {
        // Feedback efekti
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
          this.style.transform = '';
          window.location.href = `/ceyiz-paketleri/${packageType}`;
        }, 200);
        return;
      }

      // Desktop'ta analytics ve modal
      if (typeof gtag !== 'undefined') {
        gtag('event', 'dowry_package_view', {
          'event_category': 'engagement',
          'event_label': packageType
        });
      }

      // Feedback efekti
      this.style.transform = 'scale(0.95)';
      setTimeout(() => {
        this.style.transform = '';
      }, 200);

      console.log(`Paket detayı: ${packageType}`);
      // Burada modal açılabilir
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

      // Feedback efekti
      const originalHTML = this.innerHTML;
      this.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#567C8D">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
            `;
      this.style.background = '#e8f5e9';
      this.style.borderColor = '#4caf50';

      setTimeout(() => {
        this.innerHTML = originalHTML;
        this.style.background = '';
        this.style.borderColor = '';
      }, 1500);

      console.log(`Sepete eklendi: ${packageType} paketi`);
    });
  });

  // WhatsApp butonu
  const whatsappBtn = document.querySelector('.whatsapp-btn');
  if (whatsappBtn) {
    whatsappBtn.addEventListener('click', function () {
      const phoneNumber = "905XXXXXXXXX";
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

  // Hover'da otomatik geçişi durdur
  track.addEventListener('mouseenter', () => {
    if (window.innerWidth > 768) { // Sadece desktop'ta
      isPaused = true;
      stopAutoSlide();
    }
  });

  track.addEventListener('mouseleave', () => {
    if (window.innerWidth > 768) { // Sadece desktop'ta
      isPaused = false;
      startAutoSlide();
    }
  });

  // Touch/swipe için event'ler - MOBİL'de aktif
  function handleTouchStart(e) {
    if (window.innerWidth > 768) return; // Sadece mobilde

    isDragging = true;
    startX = e.touches[0].clientX;
    prevTranslate = currentTranslate;
    track.style.transition = 'none';
    isPaused = true;
    stopAutoSlide();
  }

  function handleTouchMove(e) {
    if (!isDragging || window.innerWidth > 768) return;

    const currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    currentTranslate = prevTranslate + diff;

    // Sınır kontrolü
    const maxTranslate = 0;
    const minTranslate = -getTotalSlides() * getSlideWidth();
    currentTranslate = Math.max(minTranslate, Math.min(maxTranslate, currentTranslate));

    track.style.transform = `translateX(${currentTranslate}px)`;
  }

  function handleTouchEnd() {
    if (!isDragging || window.innerWidth > 768) return;

    isDragging = false;
    track.style.transition = 'transform 0.3s ease';

    const diff = startX - (startX - (prevTranslate - currentTranslate));
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      if (diff > 0 && currentSlide > 0) {
        prevSlide();
      } else if (diff < 0 && currentSlide < getTotalSlides()) {
        nextSlide();
      } else {
        updateSlider(); // Orjinal pozisyona dön
      }
    } else {
      updateSlider(); // Orjinal pozisyona dön
    }

    // Otomatik geçişi yeniden başlat
    setTimeout(() => {
      isPaused = false;
      startAutoSlide();
    }, 2000);
  }

  // Touch event'lerini ekle
  track.addEventListener('touchstart', handleTouchStart, { passive: true });
  track.addEventListener('touchmove', handleTouchMove, { passive: true });
  track.addEventListener('touchend', handleTouchEnd);

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
      stopAutoSlide();
      startAutoSlide();
    }, 250);
  });

  // İlk yükleme
  createDots();
  updateSlider();
  startAutoSlide();

  // Klavye navigasyonu
  document.addEventListener('keydown', (e) => {
    if (window.innerWidth <= 768) return; // Sadece desktop'ta

    if (e.key === 'ArrowLeft') {
      prevSlide();
      pauseAndResume();
    } else if (e.key === 'ArrowRight') {
      nextSlide();
      pauseAndResume();
    }
  });
});