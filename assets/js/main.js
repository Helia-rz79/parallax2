const header = document.querySelector(".site-header");
const nav = document.querySelector("#nav");
const menuToggle = document.querySelector(".menu-toggle");
const products = document.querySelector("#products");
const productsViewport = document.querySelector("#products-viewport");
const benefitLines = [...document.querySelectorAll(".benefits-title > *")];
const feature = document.querySelector(".feature");
const featureImg = feature.querySelector("img");
const featureCaption = feature.querySelector("figcaption");
const heroMedia = document.querySelector(".hero-media");

const wideScreen = window.matchMedia("(min-width: 1024px)");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

function setMenu(open) {
    nav.classList.toggle("hidden", !open);
    nav.classList.toggle("flex", open);
    header.classList.toggle("is-open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.classList.toggle("overflow-hidden", open);
}

menuToggle.addEventListener("click", () => {
    setMenu(!nav.classList.contains("flex"));
});

nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenu(false));
});

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenu(false);
});

document.querySelectorAll("[data-placeholder]").forEach((link) => {
    link.addEventListener("click", (event) => event.preventDefault());
});

document.querySelector(".subscribe").addEventListener("submit", (event) => {
    event.preventDefault();
});

function enterProgress(element, distance) {
    const top = element.getBoundingClientRect().top;
    return clamp((window.innerHeight - top) / distance, 0, 1);
}

function clearParallax() {
    heroMedia.style.transform = "";
    products.style.transform = "";
    benefitLines.forEach((line) => {
        line.style.transform = "";
    });
    featureImg.style.transform = "";
    featureCaption.style.opacity = "";
    featureCaption.style.pointerEvents = "";
}

function updateParallax() {
    if (reducedMotion.matches) {
        clearParallax();
        return;
    }

    const viewHeight = window.innerHeight;

    const productsProgress = enterProgress(productsViewport, viewHeight * 0.85);
    const cardShift = (1 - productsProgress) * Math.min(window.innerWidth * 0.72, 760);
    products.style.transform = `translate3d(${-cardShift}px, 0, 0)`;

    const titleProgress = enterProgress(benefitLines[0].parentElement, viewHeight * 0.55);
    benefitLines[0].style.transform = `translate3d(${(1 - titleProgress) * -78}vw, 0, 0)`;
    benefitLines[1].style.transform = `translate3d(${(1 - titleProgress) * 78}vw, 0, 0)`;

    const featurePin = feature.parentElement;
    const travel = Math.max(featurePin.offsetHeight - viewHeight, 1);
    const featureProgress = clamp(-featurePin.getBoundingClientRect().top / travel, 0, 1);
    const grow = clamp(featureProgress / 0.72, 0, 1);
    featureImg.style.transform = `scale(${0.16 + grow * 0.84})`;
    const reveal = clamp((featureProgress - 0.72) / 0.28, 0, 1);
    featureCaption.style.opacity = String(reveal);
    featureCaption.style.pointerEvents = reveal > 0.85 ? "auto" : "none";

    if (!wideScreen.matches) {
        heroMedia.style.transform = "";
        return;
    }

    const heroProgress = clamp(window.scrollY / viewHeight, 0, 1);
    heroMedia.style.transform = `scale(${1 + heroProgress * 0.06})`;
}

let ticking = false;

function requestUpdate() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
        updateParallax();
        ticking = false;
    });
}

window.addEventListener("scroll", requestUpdate, { passive: true });
window.addEventListener("resize", () => {
    if (wideScreen.matches) setMenu(false);
    requestUpdate();
});
wideScreen.addEventListener("change", requestUpdate);
reducedMotion.addEventListener("change", requestUpdate);
updateParallax();
