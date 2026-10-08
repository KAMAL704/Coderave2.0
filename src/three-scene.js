import * as THREE from 'three';

export class CodeRave3DScene {
  constructor(canvasContainer) {
    this.container = canvasContainer;
    this.scene = null;
    this.camera = null;
    this.renderer = null;

    // Meshes & groups
    this.mainGroup = new THREE.Group();
    this.floatingShapes = [];
    this.particles = null;
    this.clock = new THREE.Clock();

    // Mouse & scroll
    this.mouseX = 0;
    this.mouseY = 0;
    this.targetMouseX = 0;
    this.targetMouseY = 0;
    this.scrollProgress = 0;

    this.init();
  }

  init() {
    // 1. Scene with soft fog
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0xf1f5f9, 0.035);

    // 2. Camera
    const aspect = window.innerWidth / window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 100);
    this.camera.position.set(0, 0, 8);

    // 3. Renderer with transparent background for dashboard blending
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);

    // 4. Clean Soft Lighting
    this.setupLighting();

    // 5. Build Simple Elegant 3D Geometric Objects
    this.buildCenterPiece();
    this.buildFloatingShapes();
    this.buildParticleDust();

    // 6. Listeners
    window.addEventListener('resize', this.onWindowResize.bind(this));
    window.addEventListener('mousemove', this.onMouseMove.bind(this));
    window.addEventListener('scroll', this.onScroll.bind(this), { passive: true });

    // 7. Loop
    this.animate();
  }

  setupLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    this.scene.add(ambientLight);

    // Directional light with soft blue tint
    const dirLight1 = new THREE.DirectionalLight(0x6366f1, 2.0);
    dirLight1.position.set(5, 8, 5);
    this.scene.add(dirLight1);

    // Soft cyan fill light
    const dirLight2 = new THREE.DirectionalLight(0x06b6d4, 1.8);
    dirLight2.position.set(-6, -4, 4);
    this.scene.add(dirLight2);

    // Violet accent point light
    this.pointLight = new THREE.PointLight(0xa855f7, 2.5, 20);
    this.pointLight.position.set(0, 3, 3);
    this.scene.add(this.pointLight);
  }

  buildCenterPiece() {
    // Elegant soft modern Torus Knot
    const knotGeo = new THREE.TorusKnotGeometry(1.4, 0.35, 120, 24, 2, 3);
    const knotMat = new THREE.MeshPhysicalMaterial({
      color: 0x4f46e5,
      emissive: 0x312e81,
      roughness: 0.25,
      metalness: 0.1,
      clearcoat: 0.8,
      clearcoatRoughness: 0.2,
      wireframe: false,
      transparent: true,
      opacity: 0.75,
    });
    this.knotMesh = new THREE.Mesh(knotGeo, knotMat);
    this.mainGroup.add(this.knotMesh);

    // Thin elegant orbital ring
    const ringGeo = new THREE.TorusGeometry(2.3, 0.02, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.6,
    });
    this.ringMesh = new THREE.Mesh(ringGeo, ringMat);
    this.ringMesh.rotation.x = Math.PI * 0.35;
    this.ringMesh.rotation.y = Math.PI * 0.15;
    this.mainGroup.add(this.ringMesh);

    // Second inclined ring
    const ringGeo2 = new THREE.TorusGeometry(2.6, 0.015, 16, 100);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0x8b5cf6,
      transparent: true,
      opacity: 0.5,
    });
    this.ringMesh2 = new THREE.Mesh(ringGeo2, ringMat2);
    this.ringMesh2.rotation.x = -Math.PI * 0.3;
    this.ringMesh2.rotation.y = Math.PI * 0.4;
    this.mainGroup.add(this.ringMesh2);

    // Position center piece on the right side for desktop dashboard balance
    this.mainGroup.position.set(2.0, 0.2, 0);
    this.scene.add(this.mainGroup);
  }

  buildFloatingShapes() {
    const geometries = [
      new THREE.IcosahedronGeometry(0.35, 0),
      new THREE.OctahedronGeometry(0.38, 0),
      new THREE.TetrahedronGeometry(0.32, 0),
      new THREE.TorusGeometry(0.28, 0.08, 16, 32),
    ];

    const materials = [
      new THREE.MeshStandardMaterial({
        color: 0x6366f1, // Indigo
        roughness: 0.3,
        metalness: 0.2,
        transparent: true,
        opacity: 0.65,
      }),
      new THREE.MeshStandardMaterial({
        color: 0x06b6d4, // Cyan
        roughness: 0.3,
        metalness: 0.2,
        transparent: true,
        opacity: 0.65,
      }),
      new THREE.MeshStandardMaterial({
        color: 0xa855f7, // Violet
        roughness: 0.3,
        metalness: 0.2,
        transparent: true,
        opacity: 0.65,
      }),
      new THREE.MeshStandardMaterial({
        color: 0xf59e0b, // Amber
        roughness: 0.3,
        metalness: 0.2,
        transparent: true,
        opacity: 0.65,
      }),
    ];

    for (let i = 0; i < 14; i++) {
      const geo = geometries[i % geometries.length];
      const mat = materials[i % materials.length];
      const mesh = new THREE.Mesh(geo, mat);

      const radius = 3.5 + Math.random() * 5.5;
      const angle = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 6;

      mesh.position.set(
        Math.cos(angle) * radius,
        y,
        Math.sin(angle) * radius
      );

      mesh.userData = {
        speedX: (Math.random() - 0.5) * 0.015,
        speedY: (Math.random() - 0.5) * 0.015,
        floatFreq: 0.6 + Math.random() * 0.8,
        floatAmp: 0.25 + Math.random() * 0.2,
        initialY: y,
      };

      this.scene.add(mesh);
      this.floatingShapes.push(mesh);
    }
  }

  buildParticleDust() {
    const particleCount = 1200;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const palette = [
      new THREE.Color(0x6366f1),
      new THREE.Color(0x06b6d4),
      new THREE.Color(0xa855f7),
      new THREE.Color(0x3b82f6),
      new THREE.Color(0xc7d2fe),
    ];

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 24;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 18;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 16;

      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Circular soft point texture
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.4, 'rgba(255, 255, 255, 0.6)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);

    const texture = new THREE.CanvasTexture(canvas);

    const mat = new THREE.PointsMaterial({
      size: 0.1,
      map: texture,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
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

    if (window.innerWidth < 768) {
      this.mainGroup.position.set(0, 0.2, -1);
      this.mainGroup.scale.set(0.65, 0.65, 0.65);
    } else {
      this.mainGroup.position.set(2.0, 0.2, 0);
      this.mainGroup.scale.set(1, 1, 1);
    }
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));

    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    this.mouseX += (this.targetMouseX - this.mouseX) * 0.05;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.05;

    // Torus knot gentle rotation
    if (this.knotMesh) {
      this.knotMesh.rotation.x = elapsedTime * 0.3;
      this.knotMesh.rotation.y = elapsedTime * 0.4;
    }

    if (this.ringMesh) {
      this.ringMesh.rotation.z += delta * 0.3;
    }
    if (this.ringMesh2) {
      this.ringMesh2.rotation.z -= delta * 0.25;
    }

    // Floating shapes
    this.floatingShapes.forEach(mesh => {
      mesh.rotation.x += mesh.userData.speedX;
      mesh.rotation.y += mesh.userData.speedY;
      mesh.position.y = mesh.userData.initialY + Math.sin(elapsedTime * mesh.userData.floatFreq) * mesh.userData.floatAmp;
    });

    // Particles gentle sway
    if (this.particles) {
      this.particles.rotation.y = elapsedTime * 0.015 + this.scrollProgress * 1.2;
    }

    // Camera responsive parallax
    const targetCamX = this.mouseX * 0.5;
    const targetCamY = this.mouseY * 0.4 - (this.scrollProgress * 1.8);
    const targetCamZ = 8 - (this.scrollProgress * 2.5);

    this.camera.position.x += (targetCamX - this.camera.position.x) * 0.04;
    this.camera.position.y += (targetCamY - this.camera.position.y) * 0.04;
    this.camera.position.z += (targetCamZ - this.camera.position.z) * 0.04;
    this.camera.lookAt(0, -this.scrollProgress * 1.5, 0);

    this.renderer.render(this.scene, this.camera);
  }
}
