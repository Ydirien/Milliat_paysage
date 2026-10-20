const menuButton = document.querySelector("[data-menu-toggle]");
const menu = document.querySelector("[data-menu]");
const header = document.querySelector("[data-header]");
const pageContent = document.querySelector("main");
const footer = document.querySelector("footer");
const desktopQuery = window.matchMedia("(min-width: 861px)");
let lockedScrollY = 0;

function setPageInert(inert) {
  [pageContent, footer].forEach((element) => {
    if (element) element.inert = inert;
  });
}

function lockPage() {
  lockedScrollY = window.scrollY;
  document.body.style.top = `-${lockedScrollY}px`;
  document.body.classList.add("menu-open");
  setPageInert(true);
}

function unlockPage() {
  document.body.classList.remove("menu-open");
  document.body.style.removeProperty("top");
  setPageInert(false);
  window.scrollTo(0, lockedScrollY);
}

function closeMenu({ restoreFocus = false } = {}) {
  if (!menuButton || !menu) return;
  const wasOpen = menu.hasAttribute("data-open");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Ouvrir le menu");
  const label = menuButton.querySelector(".menu-toggle__label");
  if (label) label.textContent = "Menu";
  menu.removeAttribute("data-open");
  if (header) header.removeAttribute("data-menu-open");
  if (wasOpen) unlockPage();
  if (restoreFocus) menuButton.focus();
}

function openMenu() {
  if (!menuButton || !menu || desktopQuery.matches) return;
  menuButton.setAttribute("aria-expanded", "true");
  menuButton.setAttribute("aria-label", "Fermer le menu");
  const label = menuButton.querySelector(".menu-toggle__label");
  if (label) label.textContent = "Fermer";
  menu.setAttribute("data-open", "");
  if (header) header.setAttribute("data-menu-open", "");
  lockPage();
  const firstLink = menu.querySelector("a");
  if (firstLink) firstLink.focus();
}

if (menuButton && menu) {
  menuButton.addEventListener("click", () => {
    const open = menuButton.getAttribute("aria-expanded") === "true";
    if (open) closeMenu({ restoreFocus: true });
    else openMenu();
  });

  menu.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menu.hasAttribute("data-open")) closeMenu({ restoreFocus: true });

    if (event.key === "Tab" && menu.hasAttribute("data-open")) {
      const focusable = [menuButton, ...menu.querySelectorAll("a[href]")];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  desktopQuery.addEventListener("change", (event) => {
    if (event.matches) closeMenu();
  });

  window.addEventListener("pagehide", () => closeMenu());
}

if (header) {
  const updateHeader = () => header.toggleAttribute("data-scrolled", window.scrollY > 16);
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });
}

const revealItems = document.querySelectorAll("[data-reveal]");
if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  // Les éléments visibles dès le chargement ne sont pas masqués, pour ne pas retarder l'affichage principal (LCP)
  revealItems.forEach((item) => {
    if (item.getBoundingClientRect().top < window.innerHeight) item.setAttribute("data-visible", "");
  });
  document.documentElement.classList.add("has-motion");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.setAttribute("data-visible", "");
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: "0px 0px -8%", threshold: 0.08 });
  revealItems.forEach((item) => observer.observe(item));
}
