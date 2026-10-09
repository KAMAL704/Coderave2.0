import * as THREE from 'three';

export class CodeRave3DScene {
  constructor(canvasContainer) {
    this.container = canvasContainer;
    this.scene = null;
    this.camera = null;
    this.renderer = null;

    this.mainGroup = new THREE.Group();
    this.floatingShapes = [];
    this.particles = null;
    this.clock = new THREE.Clock();

    this.mouseX = 0;
    this.mouseY = 0;
    this.targetMouseX = 0;
    this.targetMouseY = 0;
    this.scrollProgress = 0;

    this.init();
  }

  init() {
    this.scene = new THREE.Scene();

    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 100);
    this.camera.position.set(0, 0, 7.5);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);

    this.setupLighting();
    this.buildFloatingMeshes();
    this.buildParticleField();

    window.addEventListener('resize', this.onWindowResize.bind(this));
    window.addEventListener('mousemove', this.onMouseMove.bind(this));
    window.addEventListener('scroll', this.onScroll.bind(this), { passive: true });

    this.animate();
  }

  setupLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.6);
    this.scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLight1.position.set(6, 8, 6);
    this.scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight2.position.set(-6, -4, 4);
    this.scene.add(dirLight2);
  }

  buildFloatingMeshes() {
    const geometries = [
      new THREE.TorusGeometry(0.55, 0.18, 16, 40),
      new THREE.IcosahedronGeometry(0.5, 0),
      new THREE.OctahedronGeometry(0.55, 0),
      new THREE.TetrahedronGeometry(0.48, 0),
      new THREE.CylinderGeometry(0.2, 0.2, 0.8, 16),
      new THREE.BoxGeometry(0.5, 0.5, 0.5)
    ];

    const colors = [
      0xffffff,
      0xffd13b,
      0x4bb9f9,
      0xff6b8b,
      0x6c5ce7,
      0x10ac84
    ];

    for (let i = 0; i < 16; i++) {
      const geo = geometries[i % geometries.length];
      const mat = new THREE.MeshStandardMaterial({
        color: colors[i % colors.length],
        roughness: 0.2,
        metalness: 0.15,
        transparent: true,
        opacity: 0.75,
      });

      const mesh = new THREE.Mesh(geo, mat);

      const radius = 3.2 + Math.random() * 5.0;
      const angle = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 8;

      mesh.position.set(
        Math.cos(angle) * radius,
        y,
        Math.sin(angle) * radius
      );

      mesh.userData = {
        speedX: (Math.random() - 0.5) * 0.015,
        speedY: (Math.random() - 0.5) * 0.015,
        speedZ: (Math.random() - 0.5) * 0.012,
        floatFreq: 0.6 + Math.random() * 0.8,
        floatAmp: 0.3 + Math.random() * 0.25,
        initialY: y,
      };

      this.scene.add(mesh);
      this.floatingShapes.push(mesh);
    }
  }

  buildParticleField() {
    const count = 700;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 22;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 18;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 14;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    grad.addColorStop(0.4, 'rgba(255, 255, 255, 0.5)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);

    const texture = new THREE.CanvasTexture(canvas);

    const mat = new THREE.PointsMaterial({
      size: 0.16,
      map: texture,
      color: 0xffffff,
      transparent: true,
      opacity: 0.65,
      depthWrite: false,
    });

    this.particles = new THREE.Points(geo, mat);
    this.scene.add(this.particles);
  }

  onMouseMove(e) {
    this.targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
    this.targetMouseY = -(e.clientY / window.innerHeight) * 2 + 1;
  }

  onScroll() {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    this.scrollProgress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
  }

  onWindowResize() {
    if (!this.camera || !this.renderer) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));

    const elapsedTime = this.clock.getElapsedTime();

    this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;

    // Rotate floating shapes
    this.floatingShapes.forEach(mesh => {
      mesh.rotation.x += mesh.userData.speedX;
      mesh.rotation.y += mesh.userData.speedY;
      mesh.rotation.z += mesh.userData.speedZ;
      mesh.position.y = mesh.userData.initialY + Math.sin(elapsedTime * mesh.userData.floatFreq) * mesh.userData.floatAmp;
    });

    // Particle flow
    if (this.particles) {
      this.particles.rotation.y = elapsedTime * 0.012 + this.scrollProgress * 0.8;
    }

    // Camera parallax
    const targetCamX = this.mouseX * 0.5;
    const targetCamY = this.mouseY * 0.4 - (this.scrollProgress * 1.5);
    const targetCamZ = 7.5 - (this.scrollProgress * 2.0);

    this.camera.position.x += (targetCamX - this.camera.position.x) * 0.04;
    this.camera.position.y += (targetCamY - this.camera.position.y) * 0.04;
    this.camera.position.z += (targetCamZ - this.camera.position.z) * 0.04;
    this.camera.lookAt(0, -this.scrollProgress * 1.2, 0);

    this.renderer.render(this.scene, this.camera);
  }
}
