// HEADER JAVASCRIPT - SIFIRDAN

// DOM yüklendiğinde çalıştır
document.addEventListener('DOMContentLoaded', function () {
    // Mobil menü elementleri
    const hamburger = document.getElementById('hamburger');
    const mobileNav = document.getElementById('mobileNav');
    const closeMenu = document.getElementById('closeMenu');

    // Header scroll efekti
    const header = document.querySelector('.site-header');

    // 1. MOBİL MENÜ AÇ/KAPA
    if (hamburger && mobileNav) {
        hamburger.addEventListener('click', () => {
            mobileNav.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    if (closeMenu) {
        closeMenu.addEventListener('click', () => {
            mobileNav.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    // 2. MENÜ DIŞINA TIKLAYINCA KAPAT
    document.addEventListener('click', (e) => {
        if (mobileNav && mobileNav.classList.contains('active') &&
            !mobileNav.contains(e.target) &&
            e.target !== hamburger) {
            mobileNav.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // 3. HEADER SCROLL EFEKTİ
    window.addEventListener('scroll', () => {
        if (header) {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    });

    // 4. ARAMA FORMU
    const searchForm = document.querySelector('.search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const query = this.querySelector('input[name="q"]').value.trim();
            if (query) {
                window.location.href = `/Ara?q=${encodeURIComponent(query)}`;
            }
        });
    }

    // 5. MOBİL ARAMA
    const mobileSearchBtn = document.querySelector('.mobile-search-btn');
    const mobileSearchInput = document.querySelector('.mobile-search-input');

    if (mobileSearchBtn && mobileSearchInput) {
        mobileSearchBtn.addEventListener('click', () => {
            const query = mobileSearchInput.value.trim();
            if (query) {
                window.location.href = `/Ara?q=${encodeURIComponent(query)}`;
            }
        });

        mobileSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = mobileSearchInput.value.trim();
                if (query) {
                    window.location.href = `/Ara?q=${encodeURIComponent(query)}`;
                }
            }
        });
    }

    // 6. DROPDOWN MENÜLER İÇİN TOUCH DESTEĞİ
    if ('ontouchstart' in window) {
        const dropdowns = document.querySelectorAll('.dropdown');
        dropdowns.forEach(dropdown => {
            let timer;
            dropdown.addEventListener('touchstart', function (e) {
                timer = setTimeout(() => {
                    this.classList.add('touch-active');
                }, 300);
            });

            dropdown.addEventListener('touchend', function (e) {
                clearTimeout(timer);
                if (!this.classList.contains('touch-active')) {
                    window.location.href = this.querySelector('.nav-link').href;
                }
                this.classList.remove('touch-active');
            });
        });
    }

    // 7. SEPET VE FAVORİ SAYILARINI GÜNCELLE (ÖRNEK)
    function updateCartCount(count) {
        const cartBadge = document.querySelector('.icon-item[aria-label="Sepet"] .icon-badge');
        if (cartBadge) cartBadge.textContent = count || '0';
    }

    function updateWishlistCount(count) {
        const wishBadge = document.querySelector('.icon-item[aria-label="Favoriler"] .icon-badge');
        if (wishBadge) wishBadge.textContent = count || '0';
    }

    // Örnek değerler (gerçek uygulamada API'den gelecek)
    // updateCartCount(2);
    // updateWishlistCount(3);
});