// ========== TÜM JAVASCRIPT KODU ==========
(function () {
    // ========== MOBİL MENÜ ==========
    function initMobileMenu() {
        console.log('Mobil menü başlatılıyor...');

        const hamburgerBtn = document.getElementById('hamburgerBtn');
        const overlay = document.getElementById('mobileOverlay');
        const panel = document.getElementById('mobilePanel');
        const closeBtn = document.getElementById('closeMenuBtn');

        if (!hamburgerBtn) {
            console.error('❌ Hamburger butonu bulunamadı!');
            return;
        }
        if (!overlay) {
            console.error('❌ Overlay bulunamadı!');
            return;
        }
        if (!panel) {
            console.error('❌ Panel bulunamadı!');
            return;
        }

        console.log('✅ Tüm elementler bulundu');

        function openMenu() {
            console.log('📱 Menü açılıyor...');
            overlay.classList.add('active');
            panel.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeMenu() {
            console.log('📱 Menü kapatılıyor...');
            overlay.classList.remove('active');
            panel.classList.remove('active');
            document.body.style.overflow = '';
        }

        // Hamburger butonuna tıklama
        hamburgerBtn.onclick = function (e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🍔 Hamburger butona tıklandı');
            openMenu();
        };

        // Kapatma butonuna tıklama
        if (closeBtn) {
            closeBtn.onclick = function (e) {
                e.preventDefault();
                console.log('❌ Kapatma butonuna tıklandı');
                closeMenu();
            };
        }

        // Overlay'e tıklama
        overlay.onclick = function () {
            console.log('🌑 Overlay\'e tıklandı');
            closeMenu();
        };

        // ESC tuşu
        document.onkeydown = function (e) {
            if (e.key === 'Escape' && panel.classList.contains('active')) {
                console.log('⌨️ ESC tuşuna basıldı');
                closeMenu();
            }
        };

        console.log('✅ Mobil menü hazır, butona tıklayabilirsiniz');
    }

    // ========== KATEGORİLER ==========
    function loadCategories() {
        console.log('Kategori yükleme başlıyor...');

        fetch('/api/anasayfa/kategoriler')
            .then(res => res.json())
            .then(result => {
                console.log('API yanıtı:', result);

                if (!result.Success || !Array.isArray(result.Data)) {
                    console.error('❌ Kategori verisi alınamadı:', result);
                    return;
                }

                const categories = result.Data;
                console.log(`${categories.length} kategori yüklenecek`);

                // 1. MASAÜSTÜ DROPDOWN
                let desktopDropdown = document.querySelector('.nav-dropdown .dropdown-content');
                if (!desktopDropdown) {
                    desktopDropdown = document.querySelector('.dropdown-content');
                }

                if (desktopDropdown) {
                    desktopDropdown.innerHTML = '';
                    categories.forEach(category => {
                        const link = document.createElement('a');
                        link.href = `/Kategori/${category.TabloID}`;
                        link.textContent = category.Ad;
                        desktopDropdown.appendChild(link);
                    });
                    console.log('✅ Masaüstü dropdown güncellendi');
                } else {
                    console.error('❌ Masaüstü dropdown bulunamadı');
                }

                // 2. MOBİL MENÜ KATEGORİLERİ
                const mobileMenuLinks = document.querySelector('.mobile-menu-links');
                if (mobileMenuLinks) {
                    // Kategoriler linkini bul
                    let categoriesLink = null;
                    const allLinks = mobileMenuLinks.querySelectorAll('a');

                    for (let link of allLinks) {
                        const text = link.textContent.trim();
                        if (text === 'Kategoriler' || text.includes('Kategoriler')) {
                            categoriesLink = link;
                            break;
                        }
                    }

                    if (categoriesLink) {
                        // Alt menü oluştur
                        const wrapper = document.createElement('div');
                        wrapper.className = 'mobile-categories-wrapper';
                        wrapper.style.marginBottom = '10px';

                        const mainLink = document.createElement('a');
                        mainLink.href = '/Kategori';
                        mainLink.innerHTML = '<i class="fas fa-th-large"></i> Tüm Kategoriler';
                        mainLink.style.display = 'block';
                        mainLink.style.padding = '12px 16px';
                        mainLink.style.backgroundColor = '#f5f5f5';
                        mainLink.style.borderRadius = '8px';
                        mainLink.style.fontWeight = 'bold';
                        mainLink.style.textDecoration = 'none';
                        mainLink.style.color = '#333';

                        const subList = document.createElement('div');
                        subList.style.paddingLeft = '20px';

                        categories.forEach(category => {
                            const subLink = document.createElement('a');
                            subLink.href = `/Kategori/${category.TabloID}`;
                            subLink.textContent = category.Ad;
                            subLink.style.display = 'block';
                            subLink.style.padding = '8px 16px';
                            subLink.style.color = '#666';
                            subLink.style.textDecoration = 'none';
                            subLink.style.fontSize = '14px';
                            subLink.style.borderBottom = '1px solid #f0f0f0';
                            subList.appendChild(subLink);
                        });

                        wrapper.appendChild(mainLink);
                        wrapper.appendChild(subList);
                        categoriesLink.parentNode.replaceChild(wrapper, categoriesLink);
                        console.log('✅ Mobil kategori menüsü güncellendi');
                    } else {
                        console.log('Kategoriler linki bulunamadı, yeni bölüm ekleniyor...');

                        // Yeni kategori bölümü ekle
                        const categoriesSection = document.createElement('div');
                        categoriesSection.style.marginBottom = '15px';

                        const categoriesHeader = document.createElement('a');
                        categoriesHeader.href = '/Kategori';
                        categoriesHeader.innerHTML = '<i class="fas fa-th-large"></i> Tüm Kategoriler';
                        categoriesHeader.style.display = 'block';
                        categoriesHeader.style.padding = '12px 16px';
                        categoriesHeader.style.backgroundColor = '#f5f5f5';
                        categoriesHeader.style.borderRadius = '8px';
                        categoriesHeader.style.fontWeight = 'bold';
                        categoriesHeader.style.textDecoration = 'none';
                        categoriesHeader.style.color = '#333';
                        categoriesHeader.style.marginBottom = '8px';
                        categoriesSection.appendChild(categoriesHeader);

                        const categoriesList = document.createElement('div');
                        categoriesList.style.paddingLeft = '20px';

                        categories.forEach(category => {
                            const categoryLink = document.createElement('a');
                            categoryLink.href = `/Kategori/${category.TabloID}`;
                            categoryLink.textContent = category.Ad;
                            categoryLink.style.display = 'block';
                            categoryLink.style.padding = '8px 16px';
                            categoryLink.style.color = '#666';
                            categoryLink.style.textDecoration = 'none';
                            categoryLink.style.fontSize = '14px';
                            categoryLink.style.borderBottom = '1px solid #f0f0f0';
                            categoriesList.appendChild(categoryLink);
                        });

                        categoriesSection.appendChild(categoriesList);
                        mobileMenuLinks.insertBefore(categoriesSection, mobileMenuLinks.firstChild);
                        console.log('✅ Yeni kategori bölümü eklendi');
                    }
                }
            })
            .catch(err => {
                console.error('❌ Kategori yükleme hatası:', err);
            });
    }

    // ========== ARAMA FORM ==========
    function initSearchForms() {
        // Mobil arama
        const mobileSearchForm = document.querySelector('.mobile-search-form');
        if (mobileSearchForm) {
            mobileSearchForm.addEventListener('submit', function (e) {
                e.preventDefault();
                const input = this.querySelector('.mobile-search-input');
                const query = input.value.trim();
                if (query) {
                    window.location.href = '/Ara?q=' + encodeURIComponent(query);
                }
            });
        }

        // Masaüstü arama
        const searchForm = document.querySelector('.search-wrapper .search-form');
        if (searchForm) {
            searchForm.addEventListener('submit', function (e) {
                const input = this.querySelector('.search-input');
                if (!input.value.trim()) {
                    e.preventDefault();
                }
            });
        }
    }

    // ========== KATEGORİ SCROLL ==========
    function initCategoryScroll() {
        const categoryList = document.querySelector(".category-list");
        const arrows = document.querySelectorAll(".cat-arrow");

        if (arrows.length === 2 && categoryList) {
            arrows[0].addEventListener("click", () => {
                categoryList.scrollBy({ left: -200, behavior: "smooth" });
            });

            arrows[1].addEventListener("click", () => {
                categoryList.scrollBy({ left: 200, behavior: "smooth" });
            });
        }
    }

    // ========== TÜM FONKSİYONLARI BAŞLAT ==========
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            initMobileMenu();
            initSearchForms();
            initCategoryScroll();
            setTimeout(loadCategories, 500);
        });
    } else {
        initMobileMenu();
        initSearchForms();
        initCategoryScroll();
        setTimeout(loadCategories, 500);
    }
})();