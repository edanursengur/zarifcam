const hamburger = document.getElementById("hamburger");
const mobileNav = document.getElementById("mobileNav");

hamburger.addEventListener("click", () => {
    mobileNav.classList.toggle("open");
    hamburger.classList.toggle("active");
    document.body.classList.toggle("no-scroll");
});
document.addEventListener("click", (e) => {
    if (
        mobileNav.classList.contains("open") &&
        !mobileNav.contains(e.target) &&
        !hamburger.contains(e.target)
    ) {
        mobileNav.classList.remove("open");
        hamburger.classList.remove("active");
        document.body.classList.remove("no-scroll");
    }
});