import './style.css';
import { createIcons, icons } from 'lucide';
import confetti from 'canvas-confetti';
import { CodeRave3DScene } from './three-scene.js';

// 1. Initialize Lucide Icons
function initIcons() {
  createIcons({ icons });
}

// 2. Initialize Three.js 3D Background
let scene3d = null;
function init3D() {
  const container = document.getElementById('canvas-container');
  if (container) {
    scene3d = new CodeRave3DScene(container);
  }
}

// 3. Countdown Timer targeting 28 November 2026, 09:00 AM
function initCountdown() {
  const daysEl = document.getElementById('timer-days');
  const hoursEl = document.getElementById('timer-hours');
  const minutesEl = document.getElementById('timer-minutes');
  const secondsEl = document.getElementById('timer-seconds');

  if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

  // Target: 28 Nov 2026, 09:00 AM IST
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

// 4. Schedule Day Tabs Switching
function initScheduleTabs() {
  const tabs = document.querySelectorAll('.sched-tab');
  const panes = document.querySelectorAll('.timeline-pane');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panes.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const targetId = `pane-${tab.getAttribute('data-target')}`;
      const targetPane = document.getElementById(targetId);
      if (targetPane) {
        targetPane.classList.add('active');
      }
    });
  });
}

// 5. FAQ Accordion
function initFAQ() {
  const items = document.querySelectorAll('.faq-item');

  items.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    if (!trigger) return;

    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      items.forEach(i => {
        i.classList.remove('open');
        const t = i.querySelector('.faq-trigger');
        if (t) t.setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        item.classList.add('open');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

// 6. Registration & PPT Submission Modal
function initRegisterModal() {
  const modal = document.getElementById('register-modal');
  const closeBtn = document.getElementById('modal-close-btn');
  const form = document.getElementById('pre-register-form');

  const openTriggers = [
    document.getElementById('nav-submit-ppt-btn'),
    document.getElementById('hero-submit-ppt-btn'),
    document.getElementById('footer-submit-ppt-btn'),
    document.getElementById('mobile-register-btn')
  ];

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
    if (btn) btn.addEventListener('click', openModal);
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

      // Celebrate with confetti
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#4f46e5', '#06b6d4', '#7c3aed', '#f59e0b']
      });

      const modalHeader = modal.querySelector('.modal-header');
      if (modalHeader) {
        modalHeader.innerHTML = `
          <div class="status-pill">SUBMISSION CONFIRMED 🎉</div>
          <h3 class="gradient-text-primary">Team ${teamName} Registered!</h3>
          <p>Your team registration for Day 1 PPT (${mode.toUpperCase()}) has been recorded. Check your email for screening updates and shortlist announcements.</p>
        `;
      }
      form.style.display = 'none';

      setTimeout(() => {
        closeModal();
      }, 3000);
    });
  }
}

// 7. Mobile Navigation Drawer
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobile-toggle');
  const drawer = document.getElementById('mobile-drawer');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  if (!toggleBtn || !drawer) return;

  toggleBtn.addEventListener('click', () => {
    drawer.classList.toggle('open');
  });

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      drawer.classList.remove('open');
    });
  });
}

// 8. Scroll Effects & Back to Top
function initScrollEffects() {
  const topBtn = document.getElementById('scroll-to-top');

  // Active link highlighting
  window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.pageYOffset;

    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 140;
      const sectionId = current.getAttribute('id');
      const navLink = document.querySelector(`.nav-menu a[href*=${sectionId}]`);

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLink?.classList.add('active');
      } else {
        navLink?.classList.remove('active');
      }
    });
  });

  if (topBtn) {
    topBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

// Initialize on DOM Content Loaded
document.addEventListener('DOMContentLoaded', () => {
  initIcons();
  init3D();
  initCountdown();
  initScheduleTabs();
  initFAQ();
  initRegisterModal();
  initMobileMenu();
  initScrollEffects();
});
