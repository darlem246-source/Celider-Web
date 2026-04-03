window.addEventListener('load', () => {
  if (!window.location.hash) {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }
  document.body.classList.add('page-ready');
});

// Ripple effect for buttons
document.querySelectorAll('.link-card, .cta-btn, .nav-link').forEach(el => {
  el.addEventListener('click', function(e) {
    if (!this.href || this.href === '#' || this.href.endsWith('#')) return;
    const r = document.createElement('span');
    const rect = this.getBoundingClientRect();
    const s = Math.max(rect.width, rect.height) * 2;
    r.style.cssText = `position:absolute;border-radius:50%;width:${s}px;height:${s}px;
      left:${e.clientX-rect.left-s/2}px;top:${e.clientY-rect.top-s/2}px;
      background:rgba(0,0,0,0.04);transform:scale(0);pointer-events:none;
      animation:rpl 0.6s ease-out forwards;`;
    this.appendChild(r);
    setTimeout(() => r.remove(), 650);
  });
});

const s = document.createElement('style');
s.textContent = '@keyframes rpl{to{transform:scale(1);opacity:0}}';
document.head.appendChild(s);

// Intersection Observer for scroll animations
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.animationPlayState = 'running';
      obs.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.hero,.stats,.section-title,.links-grid,.about-card,.req-card,.commissions-card,.cta-card,.footer, .directiva-section').forEach(el => {
  el.style.animationPlayState = 'paused';
  obs.observe(el);
});

// ===== BACK TO TOP =====
const backToTopBtn = document.getElementById('backToTop');
let ticking = false;

function updateBackToTop() {
  if (window.scrollY > 100) {
    backToTopBtn.classList.add('show');
  } else {
    backToTopBtn.classList.remove('show');
  }
  // Logo header visibility
  const logo = document.querySelector('.logo');
  if (logo && window.innerWidth > 768) {
    if (window.scrollY > 150) {
      logo.classList.remove('nav-hidden');
    } else {
      logo.classList.add('nav-hidden');
    }
  }
  ticking = false;
}

window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(updateBackToTop);
    ticking = true;
  }
});

backToTopBtn.addEventListener('click', (e) => {
  e.preventDefault();
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});

// Smooth scroll for nav links (fixed for #)
document.querySelectorAll('.nav-link, .nav-item').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const targetId = link.getAttribute('href');
    const targetSection = document.querySelector(targetId);
    if (targetSection) {
      const offsetTop = targetSection.getBoundingClientRect().top + window.pageYOffset - 80;
      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    } else {
      // Fallback to top if no target
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  });
});

// Mobile menu toggle
document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.getElementById('menu-toggle');
  const navLinks = document.querySelector('.nav-links');
  const body = document.body;
  const header = document.querySelector('.header');
  
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      navLinks.classList.toggle('active');
      body.classList.toggle('nav-open');
    });
  }
  
  // Close menu on nav-item click
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      navLinks.classList.remove('active');
      body.classList.remove('nav-open');
    });
  });
  
// Close menu on outside click
document.addEventListener('click', (e) => {
  if (navLinks.classList.contains('active') && !header.contains(e.target)) {
    navLinks.classList.remove('active');
    body.classList.remove('nav-open');
  }
});
});

// ===== MODAL DIRECTIVA =====
if (!window.directivaData) {
  console.warn('No se encontró directivaData.');
  window.directivaData = [];
}

let currentMemberIndex = null;

document.addEventListener('DOMContentLoaded', () => {
  const cards = document.querySelectorAll('.directiva-card');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      const memberId = parseInt(card.getAttribute('data-member'), 10);
      openModal(memberId);
    });
  });
});

// Modal navigation
document.addEventListener('DOMContentLoaded', () => {
  const prevBtn = document.getElementById('modalPrev');
  const nextBtn = document.getElementById('modalNext');
  if (prevBtn) prevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (currentMemberIndex !== null) openModal((currentMemberIndex - 1 + directivaData.length) % directivaData.length);
  });
  if (nextBtn) nextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (currentMemberIndex !== null) openModal((currentMemberIndex + 1) % directivaData.length);
  });
});

function openModal(index) {
  currentMemberIndex = index;
  const member = directivaData[index];

  const modalImg = document.getElementById('modalImg');
  const modalName = document.getElementById('modalName');
  const modalRole = document.getElementById('modalRole');
  const detailsList = document.getElementById('modalDetails');

  if (modalImg) modalImg.src = member.img;
  if (modalImg) modalImg.alt = `${member.name} - ${member.role}`;
  if (modalName) modalName.textContent = member.name;
  if (modalRole) modalRole.textContent = member.role;
  if (detailsList) detailsList.innerHTML = member.details.map(detail => `<li>• ${detail}</li>`).join('');

  const modal = document.getElementById('directivaModal');
  if (modal) modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  const closeBtn = document.getElementById('modalCloseBtn');
  if (closeBtn) closeBtn.focus();
  
  enableSwipeListeners();
}

function closeModal() {
  const modal = document.getElementById('directivaModal');
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  currentMemberIndex = null;
  disableSwipeListeners();
}

if (document.getElementById('directivaModal')) {
  document.getElementById('directivaModal').addEventListener('click', (e) => {
    if (e.target.id === 'directivaModal') closeModal();
  });
}

// Keyboard navigation (Escape to close, Tab trap)
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal();
    return;
  }

  const modal = document.getElementById('directivaModal');
  if (!modal || !modal.classList.contains('active')) return;

  if (e.key === 'Tab') {
    const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (!focusable.length) return;
    const firstEl = focusable[0];
    const lastEl = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === firstEl) {
        e.preventDefault();
        lastEl.focus();
      }
    } else {
      if (document.activeElement === lastEl) {
        e.preventDefault();
        firstEl.focus();
      }
    }
  }
});

// Image error fallback
document.addEventListener('DOMContentLoaded', () => {
  const modalImg = document.getElementById('modalImg');
  if (modalImg) {
    modalImg.addEventListener('error', function() {
      this.src = './IMG/image.webp';
    });
  }
});

// ===== MODAL SWIPE NAVIGATION =====
let touchStartX = 0;
let isSwiping = false;

function enableSwipeListeners() {
  const modal = document.getElementById('directivaModal');
  if (!modal) return;
  const modalImg = document.getElementById('modalImg');
  if (!modalImg) return;

  modal.addEventListener('touchstart', handleTouchStart, { passive: true });
  modal.addEventListener('touchmove', handleTouchMove, { passive: false });
  modal.addEventListener('touchend', handleTouchEnd, { passive: true });
}

function disableSwipeListeners() {
  const modal = document.getElementById('directivaModal');
  if (!modal) return;
  modal.removeEventListener('touchstart', handleTouchStart);
  modal.removeEventListener('touchmove', handleTouchMove);
  modal.removeEventListener('touchend', handleTouchEnd);
}

function handleTouchStart(e) {
  touchStartX = e.changedTouches[0].clientX;
  isSwiping = false;
}

function handleTouchMove(e) {
  const currentX = e.changedTouches[0].clientX;
  const swipeDistance = currentX - touchStartX;
  
  if (Math.abs(swipeDistance) > 10) {
    isSwiping = true;
    e.preventDefault();
    const translatePercent = (swipeDistance / window.innerWidth) * 20;
    e.currentTarget.querySelector('.modal-img').style.transform = `translateX(${translatePercent}px) scale(0.95)`;
    e.currentTarget.querySelector('.modal-img').style.opacity = '0.8';
  }
}

function handleTouchEnd(e) {
  if (!isSwiping) return;
  
  const touchEndX = e.changedTouches[0].clientX;
  const swipeDistance = touchStartX - touchEndX;
  const minSwipeDistance = 50;
  
  const modalImg = e.currentTarget.querySelector('.modal-img');
  modalImg.style.transform = '';
  modalImg.style.opacity = '';
  modalImg.style.transition = 'all 0.3s ease';
  
  if (Math.abs(swipeDistance) > minSwipeDistance && currentMemberIndex !== null) {
    if (swipeDistance > 0) {
      openModal((currentMemberIndex + 1) % directivaData.length);
    } else {
      openModal((currentMemberIndex - 1 + directivaData.length) % directivaData.length);
    }
  }
  
  isSwiping = false;
  setTimeout(() => {
    modalImg.style.transition = '';
  }, 300);
}

// ===== COMISIONES ACCORDION =====
document.addEventListener('DOMContentLoaded', () => {
  const commissionsToggle = document.getElementById('commissionsToggle');
  const commissionsCard = document.querySelector('.commissions-card');
  if (commissionsToggle && commissionsCard) {
    commissionsToggle.addEventListener('click', () => {
      commissionsCard.classList.toggle('expanded');
    });
  }
});
