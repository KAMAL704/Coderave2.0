import * as THREE from 'three';

export class CodeRave3DScene {
  constructor(canvasContainer) {
    this.container = canvasContainer;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    
    // Meshes & groups
    this.coreGroup = new THREE.Group();
    this.particles = null;
    this.floatingObjects = [];
    this.lights = [];
    
    // Animation & interaction state
    this.mouseX = 0;
    this.mouseY = 0;
    this.targetMouseX = 0;
    this.targetMouseY = 0;
    this.scrollProgress = 0;
    this.isInspecting = false;
    this.clock = new THREE.Clock();
    
    this.init();
  }

  init() {
    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x060814, 0.04);

    // 2. Camera
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(55, aspect, 0.1, 100);
    this.camera.position.set(0, 0, 7.5);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.container.appendChild(this.renderer.domElement);

    // 4. Build elements
    this.setupLighting();
    this.buildCore();
    this.buildParticles();
    this.buildFloatingArtifacts();

    // 5. Event listeners
    window.addEventListener('resize', this.onWindowResize.bind(this));
    window.addEventListener('mousemove', this.onMouseMove.bind(this));
    window.addEventListener('scroll', this.onScroll.bind(this), { passive: true });

    // 6. Start loop
    this.animate();
  }

  setupLighting() {
    const ambientLight = new THREE.AmbientLight(0x0f172a, 1.2);
    this.scene.add(ambientLight);

    // Point Light 1: Neon Cyan
    this.lightCyan = new THREE.PointLight(0x00f5ff, 4, 25);
    this.lightCyan.position.set(4, 3, 5);
    this.scene.add(this.lightCyan);
    this.lights.push(this.lightCyan);

    // Point Light 2: Electric Violet / Magenta
    this.lightViolet = new THREE.PointLight(0xa855f7, 5, 25);
    this.lightViolet.position.set(-4, -2, 4);
    this.scene.add(this.lightViolet);
    this.lights.push(this.lightViolet);

    // Point Light 3: Solar Gold
    this.lightGold = new THREE.PointLight(0xf59e0b, 2.5, 20);
    this.lightGold.position.set(0, 5, -2);
    this.scene.add(this.lightGold);
    this.lights.push(this.lightGold);
  }

  buildCore() {
    // A. Holographic Outer Torus Knot
    const knotGeo = new THREE.TorusKnotGeometry(1.6, 0.38, 140, 24, 2, 3);
    const knotMat = new THREE.MeshPhysicalMaterial({
      color: 0x00e1d9,
      emissive: 0x052e3d,
      roughness: 0.15,
      metalness: 0.9,
      wireframe: true,
      transparent: true,
      opacity: 0.85,
    });
    this.knotMesh = new THREE.Mesh(knotGeo, knotMat);
    this.coreGroup.add(this.knotMesh);

    // B. Inner Quantum Core (Dual Icosahedrons)
    const coreGeo = new THREE.IcosahedronGeometry(0.85, 1);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x8b5cf6,
      emissive: 0x6d28d9,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      metalness: 0.8,
      wireframe: false,
      transparent: true,
      opacity: 0.92,
    });
    this.innerCore = new THREE.Mesh(coreGeo, coreMat);
    this.coreGroup.add(this.innerCore);

    // B2. Outer Wireframe Shell for Inner Core
    const shellGeo = new THREE.IcosahedronGeometry(0.98, 2);
    const shellMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      transparent: true,
      opacity: 0.25,
    });
    this.shellMesh = new THREE.Mesh(shellGeo, shellMat);
    this.coreGroup.add(this.shellMesh);

    // C. Orbital Cyber Rings with Data Nodes
    this.orbitRings = [];
    const ringRadii = [2.4, 2.85, 3.3];
    const ringColors = [0x00f5ff, 0xa855f7, 0x3b82f6];

    ringRadii.forEach((radius, idx) => {
      const ringGroup = new THREE.Group();
      
      const ringGeo = new THREE.TorusGeometry(radius, 0.018, 16, 96);
      const ringMat = new THREE.MeshBasicMaterial({
        color: ringColors[idx],
        transparent: true,
        opacity: 0.45,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ringGroup.add(ring);

      // Add 2-3 satellite tech nodes on each ring
      const satelliteCount = idx === 0 ? 3 : 2;
      for (let s = 0; s < satelliteCount; s++) {
        const satGeo = new THREE.OctahedronGeometry(0.09, 0);
        const satMat = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          emissive: ringColors[idx],
          emissiveIntensity: 1.5,
          roughness: 0.1,
          metalness: 1.0,
        });
        const satellite = new THREE.Mesh(satGeo, satMat);
        const angle = (s / satelliteCount) * Math.PI * 2;
        satellite.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
        ringGroup.add(satellite);
      }

      // Tilt each ring along unique cyber angles
      ringGroup.rotation.x = Math.PI * (0.3 + idx * 0.22);
      ringGroup.rotation.y = Math.PI * (0.15 + idx * 0.35);

      this.orbitRings.push({ group: ringGroup, speed: (idx % 2 === 0 ? 1 : -1) * (0.4 + idx * 0.2) });
      this.coreGroup.add(ringGroup);
    });

    // Position the Core towards the right-center for desktop hero visual balance
    this.coreGroup.position.set(1.4, 0.1, 0);
    this.scene.add(this.coreGroup);
  }

  buildParticles() {
    const particleCount = 2200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);

    const palette = [
      new THREE.Color(0x00f5ff), // Cyan
      new THREE.Color(0xa855f7), // Violet
      new THREE.Color(0x38bdf8), // Sky
      new THREE.Color(0xf59e0b), // Gold
      new THREE.Color(0xffffff), // Pure white
    ];

    for (let i = 0; i < particleCount; i++) {
      // Cylindrical / spherical cloud spread
      const radius = 3 + Math.random() * 18;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI * 1.6;

      positions[i * 3] = radius * Math.cos(theta) * Math.cos(phi);
      positions[i * 3 + 1] = radius * Math.sin(phi) + (Math.random() - 0.5) * 4;
      positions[i * 3 + 2] = radius * Math.sin(theta) * Math.cos(phi);

      const pickedColor = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = pickedColor.r;
      colors[i * 3 + 1] = pickedColor.g;
      colors[i * 3 + 2] = pickedColor.b;

      scales[i] = Math.random() * 2 + 0.5;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Create subtle circular texture using Canvas
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.35, 'rgba(255,255,255,0.7)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);

    const texture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
      size: 0.12,
      map: texture,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  buildFloatingArtifacts() {
    const geometries = [
      new THREE.TetrahedronGeometry(0.35, 0),
      new THREE.OctahedronGeometry(0.4, 0),
      new THREE.DodecahedronGeometry(0.32, 0),
      new THREE.BoxGeometry(0.35, 0.35, 0.35)
    ];

    const materials = [
      new THREE.MeshStandardMaterial({
        color: 0x00f5ff,
        metalness: 0.9,
        roughness: 0.1,
        wireframe: true,
        transparent: true,
        opacity: 0.6,
      }),
      new THREE.MeshStandardMaterial({
        color: 0xa855f7,
        metalness: 0.8,
        roughness: 0.2,
        wireframe: true,
        transparent: true,
        opacity: 0.6,
      }),
      new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        metalness: 0.8,
        roughness: 0.2,
        wireframe: true,
        transparent: true,
        opacity: 0.5,
      })
    ];

    for (let i = 0; i < 16; i++) {
      const geo = geometries[i % geometries.length];
      const mat = materials[i % materials.length];
      const mesh = new THREE.Mesh(geo, mat);

      const distance = 4.5 + Math.random() * 8;
      const angle = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 8;

      mesh.position.set(
        Math.cos(angle) * distance,
        y,
        Math.sin(angle) * distance
      );

      mesh.userData = {
        rotSpeedX: (Math.random() - 0.5) * 0.02,
        rotSpeedY: (Math.random() - 0.5) * 0.02,
        floatSpeed: 0.5 + Math.random() * 1.2,
        initialY: y,
        floatOffset: Math.random() * Math.PI * 2
      };

      this.scene.add(mesh);
      this.floatingObjects.push(mesh);
    }
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

    // Responsive core positioning
    if (window.innerWidth < 768) {
      this.coreGroup.position.set(0, 0.4, -1);
      this.coreGroup.scale.set(0.68, 0.68, 0.68);
    } else {
      this.coreGroup.position.set(1.4, 0.1, 0);
      this.coreGroup.scale.set(1, 1, 1);
    }
  }

  setInspectionMode(enabled) {
    this.isInspecting = enabled;
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));

    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    // Smooth mouse interpolation
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;

    // 1. Core rotation & pulsation
    if (this.knotMesh) {
      this.knotMesh.rotation.x = elapsedTime * 0.28;
      this.knotMesh.rotation.y = elapsedTime * 0.35;
    }

    if (this.innerCore) {
      this.innerCore.rotation.x = -elapsedTime * 0.4;
      this.innerCore.rotation.z = elapsedTime * 0.25;
      const pulse = 1 + Math.sin(elapsedTime * 3) * 0.07;
      this.innerCore.scale.set(pulse, pulse, pulse);
    }

    if (this.shellMesh) {
      this.shellMesh.rotation.y = -elapsedTime * 0.2;
      this.shellMesh.rotation.x = elapsedTime * 0.15;
    }

    // 2. Orbital rings rotation
    this.orbitRings.forEach(ring => {
      ring.group.rotation.z += delta * ring.speed;
    });

    // 3. Dynamic lighting oscillation
    if (this.lightCyan && this.lightViolet) {
      this.lightCyan.position.x = 4 + Math.sin(elapsedTime * 0.8) * 2;
      this.lightCyan.position.y = 3 + Math.cos(elapsedTime * 0.6) * 1.5;

      this.lightViolet.position.x = -4 + Math.cos(elapsedTime * 0.7) * 2;
      this.lightViolet.position.y = -2 + Math.sin(elapsedTime * 0.9) * 1.5;
    }

    // 4. Floating tech artifacts
    this.floatingObjects.forEach(mesh => {
      mesh.rotation.x += mesh.userData.rotSpeedX;
      mesh.rotation.y += mesh.userData.rotSpeedY;
      mesh.position.y = mesh.userData.initialY + Math.sin(elapsedTime * mesh.userData.floatSpeed + mesh.userData.floatOffset) * 0.35;
    });

    // 5. Particle field motion
    if (this.particles) {
      this.particles.rotation.y = elapsedTime * 0.02 + this.scrollProgress * 1.5;
      this.particles.rotation.x = this.mouseY * 0.08;
    }

    // 6. Camera & Core reaction based on scroll and mouse
    if (!this.isInspecting) {
      const targetCamX = this.mouseX * 0.8;
      const targetCamY = this.mouseY * 0.6 - (this.scrollProgress * 2.2);
      const targetCamZ = 7.5 - (this.scrollProgress * 3.2);

      this.camera.position.x += (targetCamX - this.camera.position.x) * 0.04;
      this.camera.position.y += (targetCamY - this.camera.position.y) * 0.04;
      this.camera.position.z += (targetCamZ - this.camera.position.z) * 0.04;

      this.camera.lookAt(0, -this.scrollProgress * 1.8, 0);

      // Core rotation reaction
      this.coreGroup.rotation.y = this.mouseX * 0.4 + this.scrollProgress * Math.PI * 1.8;
      this.coreGroup.rotation.x = -this.mouseY * 0.3 + Math.sin(elapsedTime * 0.5) * 0.1;
    } else {
      // In 3D inspection mode: fast responsive orbit view
      this.coreGroup.rotation.y += delta * 0.8;
      this.coreGroup.rotation.x = Math.sin(elapsedTime * 0.7) * 0.2;
    }

    this.renderer.render(this.scene, this.camera);
  }
}
