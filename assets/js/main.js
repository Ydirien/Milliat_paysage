/* ========================================
   MILLIAT PAYSAGISTE - Scripts principaux
   ========================================
   Menu burger, animations scroll, smooth scroll
   ======================================== */

// ============ DOMCONTENTLOADED ============
document.addEventListener('DOMContentLoaded', function() {
  initBurgerMenu();
  initScrollAnimations();
  initSmoothScroll();
  initHeaderScroll();
  setActiveNavLink();
});

// ============ MENU BURGER ============
function initBurgerMenu() {
  const burger = document.querySelector('.burger');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');
  const body = document.body;
  
  if (!burger || !navMenu) return;
  
  // Toggle menu au clic sur le burger
  burger.addEventListener('click', function() {
    burger.classList.toggle('active');
    navMenu.classList.toggle('active');
    body.classList.toggle('menu-open');
  });
  
  // Fermer le menu au clic sur un lien
  navLinks.forEach(link => {
    link.addEventListener('click', function() {
      burger.classList.remove('active');
      navMenu.classList.remove('active');
      body.classList.remove('menu-open');
    });
  });
  
  // Fermer le menu au clic en dehors
  document.addEventListener('click', function(e) {
    if (!burger.contains(e.target) && !navMenu.contains(e.target)) {
      burger.classList.remove('active');
      navMenu.classList.remove('active');
      body.classList.remove('menu-open');
    }
  });
  
  // Fermer le menu avec la touche Escape
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && navMenu.classList.contains('active')) {
      burger.classList.remove('active');
      navMenu.classList.remove('active');
      body.classList.remove('menu-open');
    }
  });
}

// ============ ANIMATIONS AU SCROLL ============
function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Optionnel : arrêter d'observer une fois l'animation déclenchée
        // observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  // Observer tous les éléments avec la classe .fade-in
  const fadeElements = document.querySelectorAll('.fade-in');
  fadeElements.forEach(element => {
    observer.observe(element);
  });
}

// ============ SMOOTH SCROLL ============
function initSmoothScroll() {
  const links = document.querySelectorAll('a[href^="#"]');
  
  links.forEach(link => {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      
      // Ignorer les liens # vides
      if (href === '#' || href === '#!') return;
      
      const target = document.querySelector(href);
      
      if (target) {
        e.preventDefault();
        
        const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

// ============ HEADER SCROLL EFFECT ============
function initHeaderScroll() {
  const header = document.querySelector('.header');
  if (!header) return;
  
  let lastScroll = 0;
  
  window.addEventListener('scroll', function() {
    const currentScroll = window.pageYOffset;
    
    // Ajouter la classe "scrolled" après 100px
    if (currentScroll > 100) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
  });
}

// ============ ACTIVE NAV LINK ============
function setActiveNavLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    
    // Vérifier si le lien correspond à la page actuelle
    if (href === currentPage || 
        (currentPage === '' && href === 'index.html') ||
        (currentPage === 'index.html' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

// ============ COMPTEUR ANIMÉ (pour les stats) ============
function animateCounter(element, target, duration = 2000) {
  let start = 0;
  const increment = target / (duration / 16); // 60 FPS
  
  const counter = setInterval(() => {
    start += increment;
    if (start >= target) {
      element.textContent = target;
      clearInterval(counter);
    } else {
      element.textContent = Math.floor(start);
    }
  }, 16);
}

// Observer pour déclencher les compteurs quand ils sont visibles
function initCounters() {
  const counters = document.querySelectorAll('.stat-number');
  
  const counterObserver = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
        entry.target.classList.add('counted');
        const target = parseInt(entry.target.textContent);
        entry.target.textContent = '0';
        animateCounter(entry.target, target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  
  counters.forEach(counter => {
    counterObserver.observe(counter);
  });
}

// Initialiser les compteurs si présents sur la page
if (document.querySelector('.stat-number')) {
  initCounters();
}

// ============ LAZY LOADING IMAGES ============
function initLazyLoading() {
  const images = document.querySelectorAll('img[data-src]');
  
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        img.classList.add('loaded');
        observer.unobserve(img);
      }
    });
  });
  
  images.forEach(img => imageObserver.observe(img));
}

// Initialiser le lazy loading si des images [data-src] existent
if (document.querySelector('img[data-src]')) {
  initLazyLoading();
}

// ============ UTILITIES ============

// Fonction pour détecter si on est sur mobile
function isMobile() {
  return window.innerWidth <= 768;
}

// Fonction pour throttle (limiter la fréquence d'exécution)
function throttle(func, delay) {
  let lastCall = 0;
  return function(...args) {
    const now = new Date().getTime();
    if (now - lastCall < delay) {
      return;
    }
    lastCall = now;
    return func(...args);
  };
}

// Fonction pour debounce (attendre la fin d'une série d'événements)
function debounce(func, delay) {
  let timeoutId;
  return function(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

// ============ EXPORTS (si modules ES6) ============
// export { initBurgerMenu, initScrollAnimations, isMobile, throttle, debounce };
