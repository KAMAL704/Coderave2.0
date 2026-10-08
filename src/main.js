import './style.css';
import { createIcons, icons } from 'lucide';
import confetti from 'canvas-confetti';
import { CodeRave3DScene } from './three-scene.js';
import { sound } from './audio.js';

// 1. Initialize Lucide Icons
function initIcons() {
  createIcons({ icons });
}

// 2. Initialize Three.js 3D Scene
let scene3d = null;
function init3D() {
  const container = document.getElementById('canvas-container');
  if (container) {
    scene3d = new CodeRave3DScene(container);
  }
}

// 3. Audio & SFX System
function initAudio() {
  const soundBtn = document.getElementById('sound-toggle-btn');
  if (!soundBtn) return;

  soundBtn.addEventListener('click', () => {
    const isEnabled = sound.toggle();
    if (isEnabled) {
      soundBtn.classList.add('active');
      soundBtn.querySelector('.hud-label').textContent = 'SFX: ON';
      const iconSpan = soundBtn.querySelector('.sound-icon');
      iconSpan.setAttribute('data-lucide', 'volume-2');
      initIcons();
    } else {
      soundBtn.classList.remove('active');
      soundBtn.querySelector('.hud-label').textContent = 'SFX: OFF';
      const iconSpan = soundBtn.querySelector('.sound-icon');
      iconSpan.setAttribute('data-lucide', 'volume-x');
      initIcons();
    }
  });

  // Attach hover sounds to buttons and cards
  const interactiveElements = document.querySelectorAll('.btn, .glass-card, .sched-tab, .hud-btn, .nav-link');
  interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      sound.playHover();
    });
    el.addEventListener('click', () => {
      sound.playClick();
    });
  });
}

// 4. 3D Inspection Mode
function init3DInspector() {
  const inspectBtn = document.getElementById('inspect-3d-btn');
  const canvasContainer = document.getElementById('canvas-container');
  if (!inspectBtn || !canvasContainer) return;

  let inspecting = false;
  inspectBtn.addEventListener('click', () => {
    inspecting = !inspecting;
    if (scene3d) {
      scene3d.setInspectionMode(inspecting);
    }
    if (inspecting) {
      inspectBtn.classList.add('active');
      canvasContainer.classList.add('interactive-mode');
      inspectBtn.querySelector('.hud-label').textContent = '3D MODE: ACTIVE';
    } else {
      inspectBtn.classList.remove('active');
      canvasContainer.classList.remove('interactive-mode');
      inspectBtn.querySelector('.hud-label').textContent = '3D CORE MODE';
    }
  });
}

// 5. Countdown Timer
function initCountdown() {
  const daysEl = document.getElementById('timer-days');
  const hoursEl = document.getElementById('timer-hours');
  const minutesEl = document.getElementById('timer-minutes');
  const secondsEl = document.getElementById('timer-seconds');

  if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

  // CodeRave Devathon Target Date (or dynamic future countdown)
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 3);
  targetDate.setHours(17, 0, 0, 0);

  function updateTimer() {
    const now = new Date().getTime();
    const distance = targetDate.getTime() - now;

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

// 6. Metrics Counter Animation
function initMetricsCounter() {
  const counters = document.querySelectorAll('.counter');
  let hasRun = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !hasRun) {
        hasRun = true;
        counters.forEach(counter => {
          const target = +counter.getAttribute('data-target');
          let count = 0;
          const speed = target / 50;

          const updateCount = () => {
            count += speed;
            if (count < target) {
              counter.innerText = Math.ceil(count);
              setTimeout(updateCount, 25);
            } else {
              counter.innerText = target;
            }
          };
          updateCount();
        });
      }
    });
  }, { threshold: 0.5 });

  const metricsSection = document.querySelector('.metrics-strip');
  if (metricsSection) {
    observer.observe(metricsSection);
  }
}

// 7. Schedule Tabs Switching
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

// 8. FAQ Accordion
function initFAQ() {
  const items = document.querySelectorAll('.faq-item');

  items.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    if (!trigger) return;

    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all other items for a clean accordion effect
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

// 9. Confetti Celebration
function initConfetti() {
  const celebrateBtn = document.getElementById('trigger-confetti-btn');
  if (!celebrateBtn) return;

  celebrateBtn.addEventListener('click', () => {
    sound.playChime(750, 0.4);
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#00f5ff', '#a855f7', '#fbbf24', '#ffffff']
    });
  });
}

// 10. Registration Modal & Form Handling
function initRegisterModal() {
  const openBtn = document.getElementById('open-register-modal-btn');
  const modal = document.getElementById('register-modal');
  const closeBtn = document.getElementById('modal-close-btn');
  const form = document.getElementById('pre-register-form');

  if (!modal) return;

  const openModal = () => {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  };

  if (openBtn) openBtn.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const teamName = document.getElementById('team-name').value;

      // Celebrate
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.5 },
        colors: ['#00f5ff', '#a855f7', '#fbbf24']
      });

      // Show instant confirmation
      const modalHeader = modal.querySelector('.modal-header');
      if (modalHeader) {
        modalHeader.innerHTML = `
          <div class="status-pill text-cyan">PASS CONFIRMED ⚡</div>
          <h3 class="gradient-text-cyan-purple">Welcome Team ${teamName}!</h3>
          <p>Your team reservation has been recorded. Redirecting to official Devfolio portal to finalize submission...</p>
        `;
      }
      form.style.display = 'none';

      setTimeout(() => {
        window.open('https://code-rave.devfolio.co/overview', '_blank');
        closeModal();
      }, 2200);
    });
  }
}

// 11. Mobile Drawer Navigation
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

// 12. Scroll Effects & Back to Top
function initScrollEffects() {
  const topBtn = document.getElementById('scroll-to-top');
  const navbar = document.querySelector('.navbar');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }

    // Active link highlighting
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.pageYOffset;

    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 150;
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

// Initialize everything on DOM Content Loaded
document.addEventListener('DOMContentLoaded', () => {
  initIcons();
  init3D();
  initAudio();
  init3DInspector();
  initCountdown();
  initMetricsCounter();
  initScheduleTabs();
  initFAQ();
  initConfetti();
  initRegisterModal();
  initMobileMenu();
  initScrollEffects();
});
