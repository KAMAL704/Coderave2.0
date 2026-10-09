// ==========================================================================
// CodeRave 2.0 — CycleOne.tech Particle System & Interactions
// Compatible with both direct static serving and Vite bundling
// ==========================================================================

const THREE = window.THREE;
const confetti = window.confetti || function () {};

// ==========================================================================
// 1. CycleOne Interactive Three.js Particle Canvas
// ==========================================================================
let scene, camera, renderer, particles;
let raycaster, mouse;
let particlesData = [];
const particlesCount = 1200;
const maxDistance = 45;
const repelStrength = 0.12;

function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas || !window.THREE) return;

  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 50;

  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
    antialias: true
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2(-999, -999);

  const posArray = new Float32Array(particlesCount * 3);
  particlesData = [];

  for (let i = 0; i < particlesCount; i++) {
    const i3 = i * 3;
    posArray[i3] = (Math.random() - 0.5) * 110;
    posArray[i3 + 1] = (Math.random() - 0.5) * 110;
    posArray[i3 + 2] = (Math.random() - 0.5) * 110;

    particlesData.push({
      velocity: new THREE.Vector3(0, 0, 0),
      originalPosition: new THREE.Vector3(
        posArray[i3],
        posArray[i3 + 1],
        posArray[i3 + 2]
      )
    });
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

  // Orange and Red warm cyber glow
  const material = new THREE.PointsMaterial({
    size: 0.28,
    color: '#FF8800',
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending
  });

  particles = new THREE.Points(geometry, material);
  scene.add(particles);

  window.addEventListener('resize', onWindowResize, false);
  document.addEventListener('mousemove', onMouseMove, false);
  document.addEventListener('touchmove', onTouchMove, { passive: true });
}

function onMouseMove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
}

function onTouchMove(event) {
  if (event.touches.length > 0) {
    mouse.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
  }
}

function onWindowResize() {
  if (!camera || !renderer) return;
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function updateParticles() {
  if (!particles) return;
  const positions = particles.geometry.attributes.position.array;

  raycaster.setFromCamera(mouse, camera);
  const mousePoint = new THREE.Vector3();
  mousePoint.copy(raycaster.ray.direction);
  mousePoint.multiplyScalar(25);
  mousePoint.add(raycaster.ray.origin);

  for (let i = 0; i < particlesCount; i++) {
    const i3 = i * 3;
    const pData = particlesData[i];

    const currentPos = new THREE.Vector3(
      positions[i3],
      positions[i3 + 1],
      positions[i3 + 2]
    );

    const dist = currentPos.distanceTo(mousePoint);
    if (dist < maxDistance) {
      const repelDir = currentPos.clone().sub(mousePoint).normalize();
      const force = (1 - dist / maxDistance) * repelStrength;
      pData.velocity.add(repelDir.multiplyScalar(force));
    }

    const toOrig = pData.originalPosition.clone().sub(currentPos);
    pData.velocity.add(toOrig.multiplyScalar(0.012));

    pData.velocity.multiplyScalar(0.94);
    positions[i3] += pData.velocity.x;
    positions[i3 + 1] += pData.velocity.y;
    positions[i3 + 2] += pData.velocity.z;
  }

  particles.geometry.attributes.position.needsUpdate = true;
}

function animateParticles() {
  requestAnimationFrame(animateParticles);
  if (particles && renderer && scene && camera) {
    updateParticles();
    particles.rotation.x += 0.0003;
    particles.rotation.y += 0.0004;
    renderer.render(scene, camera);
  }
}

// ==========================================================================
// 2. Navigation & Mobile Menu (CycleOne Logic)
// ==========================================================================
function initNavigation() {
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  const navbar = document.querySelector('.navbar');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('active');
    });

    document.querySelectorAll('.nav-item').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
      });
    });
  }

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }

    let current = '';
    const sections = document.querySelectorAll('section');
    sections.forEach(sec => {
      const secTop = sec.offsetTop;
      const secHeight = sec.clientHeight;
      if (window.scrollY >= secTop - secHeight / 3) {
        current = sec.getAttribute('id') || '';
      }
    });

    document.querySelectorAll('.nav-links .nav-item').forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href') || '';
      if (href === `#${current}`) {
        link.classList.add('active');
      }
    });
  }, { passive: true });
}

// ==========================================================================
// 3. Real-Time Countdown to November 28, 2026, 09:00 AM IST
// ==========================================================================
function initCountdown() {
  const daysEl = document.getElementById('timer-days');
  const hoursEl = document.getElementById('timer-hours');
  const minutesEl = document.getElementById('timer-minutes');
  const secondsEl = document.getElementById('timer-seconds');

  if (!daysEl || !hoursEl || !minutesEl || !secondsEl) return;

  const targetDate = new Date('2026-11-28T09:00:00+05:30').getTime();

  function update() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance < 0) {
      daysEl.textContent = '00';
      hoursEl.textContent = '00';
      minutesEl.textContent = '00';
      secondsEl.textContent = '00';
      return;
    }

    const d = Math.floor(distance / (1000 * 60 * 60 * 24));
    const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((distance % (1000 * 60)) / 1000);

    daysEl.textContent = String(d).padStart(2, '0');
    hoursEl.textContent = String(h).padStart(2, '0');
    minutesEl.textContent = String(m).padStart(2, '0');
    secondsEl.textContent = String(s).padStart(2, '0');
  }

  update();
  setInterval(update, 1000);
}

// ==========================================================================
// 4. Mobile Flip Card Tap Toggle
// ==========================================================================
function initFlipCards() {
  document.querySelectorAll('.team-member-flip').forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('flipped');
    });
  });
}

// ==========================================================================
// 5. Dedicated Hackathon Registration Portal Modal
// ==========================================================================
function initModal() {
  const modal = document.getElementById('register-modal');
  const closeBtn = document.getElementById('modal-close-btn');
  const openTriggers = document.querySelectorAll('.open-register-trigger');

  if (!modal) return;

  const openModal = () => {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  };

  openTriggers.forEach(btn => btn.addEventListener('click', openModal));
  closeBtn?.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) closeModal();
  });

  const hackathonForm = document.getElementById('hackathon-register-form');
  if (hackathonForm) {
    hackathonForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (typeof confetti === 'function') {
        confetti({
          particleCount: 120,
          spread: 75,
          origin: { y: 0.6 },
          colors: ['#FF8800', '#FA002D', '#FFFFFF']
        });
      }
      alert('🎉 Team Registered for Alert! You will receive an immediate notification the moment the Devfolio Hackathon Portal link opens.');
      closeModal();
      hackathonForm.reset();
    });
  }

  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Thank you! Your query has been received by Internwell SLIET.');
      contactForm.reset();
    });
  }
}

// ==========================================================================
// 6. 5-Second Loading Overlay with Official Logo & Circular Countdown
// ==========================================================================
function initLoader() {
  const overlay = document.getElementById('loading-overlay');
  const timerNum = document.getElementById('loader-timer');
  const timerProg = document.getElementById('loader-timer-prog');
  const skipBtn = document.getElementById('loader-skip-btn');

  if (!overlay) return;

  let secondsLeft = 5;
  const totalSeconds = 5;
  const circumference = 220; // 2 * Math.PI * 35 approx

  let isDismissed = false;
  const dismissLoader = () => {
    if (isDismissed) return;
    isDismissed = true;
    overlay.classList.add('fade-out');
    setTimeout(() => {
      overlay.style.display = 'none';
    }, 700);
  };

  skipBtn?.addEventListener('click', dismissLoader);

  const countdownInterval = setInterval(() => {
    secondsLeft--;
    if (timerNum) {
      timerNum.textContent = secondsLeft > 0 ? String(secondsLeft) : '0';
    }
    if (timerProg) {
      const fraction = Math.max(0, secondsLeft / totalSeconds);
      const offset = circumference * (1 - fraction);
      timerProg.style.strokeDashoffset = String(offset);
    }

    if (secondsLeft <= 0) {
      clearInterval(countdownInterval);
      setTimeout(dismissLoader, 400);
    }
  }, 1000);
}

// ==========================================================================
// Main Initialization
// ==========================================================================
function initApp() {
  initParticles();
  animateParticles();
  initNavigation();
  initCountdown();
  initFlipCards();
  initModal();
  initLoader();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
