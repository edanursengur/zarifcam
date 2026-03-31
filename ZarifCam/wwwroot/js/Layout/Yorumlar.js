// AKAN YORUMLAR SLIDER - SU GİBİ
document.addEventListener('DOMContentLoaded', function () {
    const track = document.getElementById('flowingReviewsTrack');
    const allReviewsBtn = document.querySelector('.flowing-all-reviews-btn');

    if (!track) return;

    // Değişkenler
    let animationSpeed = 40; // saniye
    let isPaused = false;
    let mouseX = 0;
    let lastMouseX = 0;
    let mouseVelocity = 0;
    let isDragging = false;
    let dragStartX = 0;
    let dragOffset = 0;

    // Set'ler
    const sets = track.querySelectorAll('.flowing-reviews-set');
    if (sets.length < 2) return;

    const firstSet = sets[0];
    const secondSet = sets[1];

    // Set genişliğini hesapla
    function getSetWidth() {
        return firstSet.offsetWidth + 20; // gap dahil
    }

    // Animasyonu başlat
    function startAnimation() {
        // CSS animasyonunu durdur
        track.style.animation = 'none';

        // Transform'u sıfırla
        track.style.transform = 'translateX(0)';

        // JavaScript ile animasyon
        let position = 0;
        const speed = getSetWidth() / (animationSpeed * 60); // px per frame (60fps)

        function animate() {
            if (!isPaused && !isDragging) {
                position -= speed;

                // Eğer ilk set tamamen görünmez olduysa
                if (position <= -getSetWidth()) {
                    position = 0; // Sıfırla
                }

                track.style.transform = `translateX(${position}px)`;
            }

            // Mouse velocity ile sürüklenme efekti
            if (Math.abs(mouseVelocity) > 0.1 && !isPaused) {
                position -= mouseVelocity * 0.5;
                mouseVelocity *= 0.95; // Yavaşça dur

                // Sınır kontrolü
                if (position <= -getSetWidth()) {
                    position = 0;
                } else if (position > 0) {
                    position = -getSetWidth();
                }

                track.style.transform = `translateX(${position}px)`;
            }

            requestAnimationFrame(animate);
        }

        animate();
    }

    // Mouse hareketini takip et
    function trackMouseMovement(e) {
        lastMouseX = mouseX;
        mouseX = e.clientX;

        // Hızı hesapla
        if (!isDragging) {
            mouseVelocity = (mouseX - lastMouseX) * 0.1;
        }
    }

    // Mouse hover'da durdur
    track.addEventListener('mouseenter', () => {
        isPaused = true;
    });

    track.addEventListener('mousemove', trackMouseMovement);

    track.addEventListener('mouseleave', () => {
        isPaused = false;
    });

    // Touch/mouse drag
    track.addEventListener('mousedown', startDrag);
    track.addEventListener('touchstart', startDrag, { passive: true });

    function startDrag(e) {
        isDragging = true;
        isPaused = true;
        dragStartX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
        dragOffset = getCurrentTransform();

        // Event listener'ları ekle
        if (e.type === 'mousedown') {
            document.addEventListener('mousemove', onDrag);
            document.addEventListener('mouseup', endDrag);
        } else {
            document.addEventListener('touchmove', onDrag, { passive: true });
            document.addEventListener('touchend', endDrag);
        }

        track.style.cursor = 'grabbing';
        e.preventDefault();
    }

    function onDrag(e) {
        if (!isDragging) return;

        const currentX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
        const deltaX = currentX - dragStartX;
        let newPosition = dragOffset + deltaX;

        // Sınırları kontrol et
        if (newPosition > 0) newPosition = -getSetWidth();
        if (newPosition < -getSetWidth()) newPosition = 0;

        track.style.transform = `translateX(${newPosition}px)`;
    }

    function endDrag(e) {
        if (!isDragging) return;

        isDragging = false;
        isPaused = false;

        // Event listener'ları kaldır
        document.removeEventListener('mousemove', onDrag);
        document.removeEventListener('mouseup', endDrag);
        document.removeEventListener('touchmove', onDrag);
        document.removeEventListener('touchend', endDrag);

        track.style.cursor = '';

        // Momentum efekti
        const currentX = e.type === 'mouseup' ? e.clientX : e.changedTouches[0].clientX;
        const deltaX = currentX - dragStartX;
        const velocity = deltaX / 10; // Hız hesapla

        if (Math.abs(velocity) > 5) {
            mouseVelocity = -velocity * 0.5;
        }
    }

    // Mevcut transform değerini al
    function getCurrentTransform() {
        const transform = track.style.transform;
        if (!transform || transform === 'none') return 0;

        const match = transform.match(/translateX\(([-\d.]+)px\)/);
        return match ? parseFloat(match[1]) : 0;
    }

    // Responsive için pencere boyutu değiştiğinde
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            // Mobilde hızı artır
            animationSpeed = window.innerWidth <= 768 ? 30 : 40;
        }, 250);
    });

    // Tüm yorumlar butonu
    if (allReviewsBtn) {
        allReviewsBtn.addEventListener('click', () => {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'view_all_reviews', {
                    'event_category': 'navigation',
                    'event_label': 'homepage_flowing_reviews'
                });
            }
        });
    }

    // İlk yükleme
    startAnimation();

    // Reduced motion preference kontrolü
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        animationSpeed = 60; // Yavaşlat
    }

    // Debug
    console.log('Akan Yorum Slider yüklendi:', {
        setWidth: getSetWidth(),
        animationSpeed,
        setsCount: sets.length
    });
});