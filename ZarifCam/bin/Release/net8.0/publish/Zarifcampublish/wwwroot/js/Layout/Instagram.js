// Mini Instagram Yönlendirme
document.addEventListener('DOMContentLoaded', function () {
  const instaBtn = document.querySelector('.mini-insta-btn');
  const instaIcon = document.querySelector('.mini-insta-icon');

  // Buton tıklama
  if (instaBtn) {
    instaBtn.addEventListener('click', function (e) {
      // Analytics için
      if (typeof gtag !== 'undefined') {
        gtag('event', 'mini_instagram_click', {
          'event_category': 'social',
          'event_label': 'homepage_mini_cta'
        });
      }

      // Küçük feedback animasyonu
      this.style.transform = 'scale(0.95)';
      setTimeout(() => {
        this.style.transform = '';
      }, 200);
    });
  }

  // Icon hover efekti
  if (instaIcon) {
    instaIcon.addEventListener('mouseenter', function () {
      this.style.transform = 'scale(1.1) rotate(5deg)';
    });

    instaIcon.addEventListener('mouseleave', function () {
      this.style.transform = '';
    });

    // Icon'a tıklama
    instaIcon.style.cursor = 'pointer';
    instaIcon.addEventListener('click', function () {
      window.open('https://instagram.com/zarif_cam', '_blank');
    });
  }

  // Mobilde dokunma efekti
  if ('ontouchstart' in window) {
    const elements = [instaBtn, instaIcon];

    elements.forEach(el => {
      if (el) {
        el.addEventListener('touchstart', function () {
          this.style.opacity = '0.8';
        });

        el.addEventListener('touchend', function () {
          this.style.opacity = '';
        });
      }
    });
  }
});