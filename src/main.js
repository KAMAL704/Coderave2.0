import './style.css';
import { createIcons, icons } from 'lucide';
import confetti from 'canvas-confetti';
import { CodeRave3DScene } from './three-scene.js';

// 1. Initialize Icons
function initIcons() {
  createIcons({ icons });
}

// 2. Initialize 3D Scene
let scene3d = null;
function init3D() {
  const container = document.getElementById('canvas-container');
  if (container) {
    scene3d = new CodeRave3DScene(container);
  }
}

// 3. Dynamic Scroll Background Color Transition (DubHacks Signature)
function initScrollColorTransition() {
  const dynamicBg = document.getElementById('dynamic-bg');
  const sections = document.querySelectorAll('[data-bg]');
  const navbar = document.getElementById('main-navbar');

  function checkScrollBg() {
    const scrollPos = window.scrollY + window.innerHeight * 0.35;

    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        const bg = sec.getAttribute('data-bg');
        if (dynamicBg && bg) {
          dynamicBg.style.backgroundColor = bg;
          document.body.style.backgroundColor = bg;
        }
      }
    });

    if (window.scrollY > 80) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', checkScrollBg, { passive: true });
  checkScrollBg();
}

// 4. Real-Time Countdown to Nov 28, 2026, 09:00 AM IST
function initCountdown() {
  const daysEl = document.getElementById('timer-days');
  const hoursEl = document.getElementById('timer-hours');
  const minutesEl = document.getElementById('timer-minutes');
  const secondsEl = document.getElementById('timer-seconds');

  if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

  const targetDate = new Date('2026-11-28T09:00:00+05:30').getTime();

  function updateTimer() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance < 0) {
      daysEl.textContent = '00';
      hoursEl.textContent = '00';
      minutesEl.textContent = '00';
      secondsEl.textContent = '00';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    daysEl.textContent = String(days).padStart(2, '0');
    hoursEl.textContent = String(hours).padStart(2, '0');
    minutesEl.textContent = String(minutes).padStart(2, '0');
    secondsEl.textContent = String(seconds).padStart(2, '0');
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}

// 5. Registration & PPT Submission Modal
function initRegisterModal() {
  const modal = document.getElementById('register-modal');
  const closeBtn = document.getElementById('modal-close-btn');
  const form = document.getElementById('pre-register-form');

  const openTriggers = document.querySelectorAll('.open-register-trigger');

  if (!modal) return;

  const openModal = () => {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  };

  openTriggers.forEach(btn => {
    btn.addEventListener('click', openModal);
  });

  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const teamName = document.getElementById('team-name').value;
      const mode = document.getElementById('submission-mode').value;

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#ed478e', '#6046f8', '#ffd13b', '#4bb9f9']
      });

      const modalHeader = modal.querySelector('.modal-header');
      if (modalHeader) {
        modalHeader.innerHTML = `
          <div style="font-family: 'Space Mono', monospace; font-size: 11px; font-weight: 700; color: #10ac84; margin-bottom: 8px;">SUBMISSION CONFIRMED 🎉</div>
          <h3 style="font-size: 22px; margin-bottom: 6px;">Team ${teamName} Registered!</h3>
          <p style="font-size: 13px; color: #475569;">Your registration for Day 1 PPT (${mode.toUpperCase()}) has been recorded. Check your email for screening updates and shortlist announcements.</p>
        `;
      }
      form.style.display = 'none';

      setTimeout(() => {
        closeModal();
      }, 3200);
    });
  }
}

// 6. Init
document.addEventListener('DOMContentLoaded', () => {
  initIcons();
  init3D();
  initScrollColorTransition();
  initCountdown();
  initRegisterModal();
});
