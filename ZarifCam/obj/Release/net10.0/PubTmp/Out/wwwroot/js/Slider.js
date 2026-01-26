document.addEventListener("DOMContentLoaded", () => {
    fetch("/api/slider")
        .then(res => res.json())
        .then(data => {
            if (!data || data.length === 0) return;

            const slider = document.getElementById("heroSlider");
            const dots = document.getElementById("heroSliderDots");

            slider.innerHTML = "";
            dots.innerHTML = "";

            data.forEach((item, index) => {
                // Slide
                const slide = document.createElement("div");
                slide.className = `slide ${index === 0 ? "active" : ""}`;
                slide.style.backgroundImage = `url('${item.imageUrl}')`;

                slide.innerHTML = `
                    <div class="slide-content">
                        <h1>${item.title}</h1>
                        ${item.description ? `<p>${item.description}</p>` : ""}
                        ${item.buttonText && item.buttonUrl
                        ? `<a href="${item.buttonUrl}" class="btn-primary">${item.buttonText}</a>`
                        : ""}
                    </div>
                `;

                slider.appendChild(slide);

                // Dot
                const dot = document.createElement("span");
                dot.className = `dot ${index === 0 ? "active" : ""}`;
                dot.dataset.index = index;
                dots.appendChild(dot);
            });

            initSlider();
        });
});

function initSlider() {
    const slides = document.querySelectorAll(".slide");
    const dots = document.querySelectorAll(".dot");
    let current = 0;

    setInterval(() => {
        slides[current].classList.remove("active");
        dots[current].classList.remove("active");

        current = (current + 1) % slides.length;

        slides[current].classList.add("active");
        dots[current].classList.add("active");
    }, 5000);
}
