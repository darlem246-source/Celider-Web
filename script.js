// Ripple effect for buttons
document.querySelectorAll('.link-card, .cta-btn').forEach(el => {
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

document.querySelectorAll('.hero,.stats,.section-title,.links-grid,.about-card,.req-card,.commissions-card,.cta-card,.footer').forEach(el => {
  el.style.animationPlayState = 'paused';
  obs.observe(el);
});

// ===== MODAL DIRECTIVA =====
// directivaData is loaded from directiva-data.js (separation of content and structure)
if (!window.directivaData) {
  console.warn('No se encontró directivaData.');
  window.directivaData = [];
}

let currentMemberIndex = null;

const cards = document.querySelectorAll('.directiva-card');
cards.forEach(card => {
  card.addEventListener('click', () => {
    const memberId = parseInt(card.getAttribute('data-member'), 10);
    openModal(memberId);
  });
});

// Modal navigation
document.getElementById('modalPrev').addEventListener('click', (e) => {
  e.stopPropagation();
  if (currentMemberIndex !== null) openModal((currentMemberIndex - 1 + directivaData.length) % directivaData.length);
});

document.getElementById('modalNext').addEventListener('click', (e) => {
  e.stopPropagation();
  if (currentMemberIndex !== null) openModal((currentMemberIndex + 1) % directivaData.length);
});

function openModal(index) {
  currentMemberIndex = index;
  const member = directivaData[index];

  document.getElementById('modalImg').src = member.img;
  document.getElementById('modalImg').alt = `${member.name} - ${member.role}`;
  document.getElementById('modalName').textContent = member.name;
  document.getElementById('modalRole').textContent = member.role;

  const detailsList = document.getElementById('modalDetails');
  detailsList.innerHTML = member.details.map(detail => `<li>• ${detail}</li>`).join('');

  const modal = document.getElementById('directivaModal');
  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  document.getElementById('modalCloseBtn').focus();
  
  // Agregar listeners de swipe al abrir modal
  enableSwipeListeners();
}

function closeModal() {
  const modal = document.getElementById('directivaModal');
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  currentMemberIndex = null;
  
  // Remover listeners de swipe al cerrar modal
  disableSwipeListeners();
}

document.getElementById('directivaModal').addEventListener('click', (e) => {
  if (e.target.id === 'directivaModal') closeModal();
});

// Keyboard navigation (Escape to close, Tab trap)
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal();
    return;
  }

  const modal = document.getElementById('directivaModal');
  if (!modal.classList.contains('active')) return;

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
document.getElementById('modalImg').addEventListener('error', function() {
  this.src = './IMG/image.webp';
});

// ===== MODAL SWIPE NAVIGATION (HORIZONTAL) =====
const modal = document.getElementById('directivaModal');
const modalImg = document.getElementById('modalImg');
let touchStartX = 0;
let isSwiping = false;

// Funciones para agregar/remover listeners dinámicamente
function enableSwipeListeners() {
  modal.addEventListener('touchstart', handleTouchStart, { passive: true });
  modal.addEventListener('touchmove', handleTouchMove, { passive: false });
  modal.addEventListener('touchend', handleTouchEnd, { passive: true });
}

function disableSwipeListeners() {
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
  
  // Solo si el movimiento es significativo hacia los lados
  if (Math.abs(swipeDistance) > 10) {
    isSwiping = true;
    e.preventDefault(); // Prevenir scroll cuando se detecta swipe horizontal
    // Animar la imagen durante el swipe
    const translatePercent = (swipeDistance / window.innerWidth) * 20;
    modalImg.style.transform = `translateX(${translatePercent}px) scale(0.95)`;
    modalImg.style.opacity = '0.8';
  }
}

function handleTouchEnd(e) {
  if (!isSwiping) return;
  
  const touchEndX = e.changedTouches[0].clientX;
  const swipeDistance = touchStartX - touchEndX;
  const minSwipeDistance = 50;
  
  // Reset inmediato de la animación
  modalImg.style.transform = '';
  modalImg.style.opacity = '';
  modalImg.style.transition = 'all 0.3s ease';
  
  // Detectar swipe HORIZONTAL
  if (Math.abs(swipeDistance) > minSwipeDistance) {
    if (currentMemberIndex !== null) {
      // Swipe IZQUIERDA (swipeDistance > 0) = Siguiente
      if (swipeDistance > 0) {
        openModal((currentMemberIndex + 1) % directivaData.length);
      }
      // Swipe DERECHA (swipeDistance < 0) = Anterior
      else {
        openModal((currentMemberIndex - 1 + directivaData.length) % directivaData.length);
      }
    }
  }
  
  isSwiping = false;
  setTimeout(() => {
    modalImg.style.transition = '';
  }, 300);
}

// ===== COMISIONES ACCORDION =====
const commissionsToggle = document.getElementById('commissionsToggle');
const commissionsCard = commissionsToggle.closest('.commissions-card');

commissionsToggle.addEventListener('click', () => {
  commissionsCard.classList.toggle('expanded');
});
