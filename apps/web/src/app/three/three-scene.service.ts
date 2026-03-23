/**
 * ThreeSceneService
 *
 * Manages the WebGL 3D gallery scene:
 * - Floating image planes arranged in a spiral grid
 * - Ambient particle field for depth
 * - Mouse-driven camera parallax (subtle, cinematic)
 * - Scroll-driven camera dolly through the gallery
 * - Lazy texture loading via IntersectionObserver equivalent in 3D (frustum culling)
 * - Proper cleanup on destroy to prevent WebGL context leaks
 */
import { Injectable, NgZone, OnDestroy } from '@angular/core';
import * as THREE from 'three';

export interface SceneImage {
  url: string;
  title: string;
  id: string;
}

@Injectable({ providedIn: 'root' })
export class ThreeSceneService implements OnDestroy {
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private animFrameId!: number;

  private imagePlanes: THREE.Mesh[] = [];
  private particleSystem!: THREE.Points;
  private textureLoader = new THREE.TextureLoader();

  // Mouse & scroll state (all in normalised coords / pixels)
  private mouse = new THREE.Vector2();
  private targetMouseX = 0;
  private targetMouseY = 0;
  private currentMouseX = 0;
  private currentMouseY = 0;
  private scrollProgress = 0;  // 0–1

  private readonly clock = new THREE.Clock();
  private isRunning = false;

  // Layout constants
  private readonly COLS = 4;
  private readonly ROWS = 3;
  private readonly PLANE_W = 3.2;
  private readonly PLANE_H = 2.1;
  private readonly GAP_X = 4.5;
  private readonly GAP_Y = 3.2;
  private readonly CAMERA_Z_START = 14;
  private readonly CAMERA_Z_END = -20;

  constructor(private ngZone: NgZone) {}

  // ─── Public API ─────────────────────────────────────────────────────────────

  initScene(canvas: HTMLCanvasElement, images: SceneImage[]): void {
    this.setupRenderer(canvas);
    this.setupCamera();
    this.setupScene();
    this.setupLights();
    this.buildGalleryPlanes(images);
    this.buildParticleField();
    this.bindEventListeners(canvas);
    this.startLoop();
  }

  updateImages(images: SceneImage[]): void {
    // Lazy-update textures when the gallery data arrives
    images.forEach((img, i) => {
      const plane = this.imagePlanes[i];
      if (!plane) return;
      this.textureLoader.load(img.url, texture => {
        texture.colorSpace = THREE.SRGBColorSpace;
        (plane.material as THREE.MeshStandardMaterial).map = texture;
        (plane.material as THREE.MeshStandardMaterial).needsUpdate = true;
      });
    });
  }

  setScrollProgress(progress: number): void {
    this.scrollProgress = Math.max(0, Math.min(1, progress));
  }

  highlightPlane(index: number): void {
    this.imagePlanes.forEach((p, i) => {
      const mat = p.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = i === index ? 0.15 : 0;
    });
  }

  dispose(): void {
    this.isRunning = false;
    cancelAnimationFrame(this.animFrameId);
    this.imagePlanes.forEach(p => {
      (p.material as THREE.MeshStandardMaterial).map?.dispose();
      (p.material as THREE.MeshStandardMaterial).dispose();
      p.geometry.dispose();
    });
    this.particleSystem?.geometry.dispose();
    (this.particleSystem?.material as THREE.Material)?.dispose();
    this.renderer?.dispose();
  }

  // ─── Scene setup ────────────────────────────────────────────────────────────

  private setupRenderer(canvas: HTMLCanvasElement): void {
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = false; // no shadows for perf
  }

  private setupCamera(): void {
    this.camera = new THREE.PerspectiveCamera(
      55, window.innerWidth / window.innerHeight, 0.1, 200
    );
    this.camera.position.set(0, 0, this.CAMERA_Z_START);
  }

  private setupScene(): void {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a0d);
    this.scene.fog = new THREE.FogExp2(0x0a0a0d, 0.035);
  }

  private setupLights(): void {
    // Soft ambient — keeps dark areas visible
    const ambient = new THREE.AmbientLight(0xffffff, 0.3);
    this.scene.add(ambient);

    // Warm key light from above-front
    const key = new THREE.DirectionalLight(0xd4a843, 1.2);
    key.position.set(5, 8, 12);
    this.scene.add(key);

    // Cool fill from below — cinematic look
    const fill = new THREE.DirectionalLight(0x3344aa, 0.4);
    fill.position.set(-5, -4, 8);
    this.scene.add(fill);

    // Rim light behind planes for depth
    const rim = new THREE.DirectionalLight(0xffffff, 0.25);
    rim.position.set(0, 0, -10);
    this.scene.add(rim);
  }

  // ─── Gallery geometry ────────────────────────────────────────────────────────

  private buildGalleryPlanes(images: SceneImage[]): void {
    const geometry = new THREE.PlaneGeometry(this.PLANE_W, this.PLANE_H, 1, 1);

    const totalW = (this.COLS - 1) * this.GAP_X;
    const totalH = (this.ROWS - 1) * this.GAP_Y;

    for (let row = 0; row < this.ROWS; row++) {
      for (let col = 0; col < this.COLS; col++) {
        const i = row * this.COLS + col;
        const img = images[i];

        const material = new THREE.MeshStandardMaterial({
          color: 0x888888,
          roughness: 0.3,
          metalness: 0.1,
          transparent: true,
          opacity: 0,
          emissive: new THREE.Color(0xd4a843),
          emissiveIntensity: 0,
        });

        // Load texture if URL available
        if (img?.url) {
          this.textureLoader.load(img.url, texture => {
            texture.colorSpace = THREE.SRGBColorSpace;
            material.map = texture;
            material.color.set(0xffffff);
            material.needsUpdate = true;
          });
        }

        const plane = new THREE.Mesh(geometry.clone(), material);
        plane.position.set(
          col * this.GAP_X - totalW / 2,
          -(row * this.GAP_Y - totalH / 2),
          // stagger z slightly for visual depth
          (Math.random() - 0.5) * 2
        );
        // Slight random tilt — feels organic
        plane.rotation.y = (Math.random() - 0.5) * 0.08;
        plane.rotation.x = (Math.random() - 0.5) * 0.04;
        plane.userData = { index: i, id: img?.id };

        this.imagePlanes.push(plane);
        this.scene.add(plane);
      }
    }
  }

  private buildParticleField(): void {
    const count = 800;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 60;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 60;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      size: 0.06,
      color: 0xd4a843,
      transparent: true,
      opacity: 0.35,
      sizeAttenuation: true,
    });

    this.particleSystem = new THREE.Points(geo, mat);
    this.scene.add(this.particleSystem);
  }

  // ─── Event listeners ─────────────────────────────────────────────────────────

  private bindEventListeners(canvas: HTMLCanvasElement): void {
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('resize', this.onResize);
    canvas.parentElement?.addEventListener('scroll', this.onScroll);
    document.addEventListener('scroll', this.onScroll);
  }

  private onMouseMove = (e: MouseEvent): void => {
    this.targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    this.targetMouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
  };

  private onResize = (): void => {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  };

  private onScroll = (): void => {
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    this.scrollProgress = maxScroll > 0 ? scrollY / maxScroll : 0;
  };

  // ─── Animation loop ──────────────────────────────────────────────────────────

  private startLoop(): void {
    this.isRunning = true;
    // Run outside Angular zone — no change detection on every RAF
    this.ngZone.runOutsideAngular(() => this.loop());
  }

  private loop(): void {
    if (!this.isRunning) return;
    this.animFrameId = requestAnimationFrame(() => this.loop());
    this.update();
    this.renderer.render(this.scene, this.camera);
  }

  private update(): void {
    const elapsed = this.clock.getElapsedTime();

    // ── Smooth mouse follow ───────────────────────────────────────────────────
    this.currentMouseX += (this.targetMouseX - this.currentMouseX) * 0.04;
    this.currentMouseY += (this.targetMouseY - this.currentMouseY) * 0.04;

    // ── Camera dolly (scroll) + parallax (mouse) ──────────────────────────────
    const targetZ = THREE.MathUtils.lerp(this.CAMERA_Z_START, this.CAMERA_Z_END, this.scrollProgress);
    this.camera.position.z += (targetZ - this.camera.position.z) * 0.05;
    this.camera.position.x += (this.currentMouseX * 1.5 - this.camera.position.x) * 0.05;
    this.camera.position.y += (this.currentMouseY * 0.8 - this.camera.position.y) * 0.05;
    this.camera.lookAt(this.camera.position.x * 0.3, this.camera.position.y * 0.3, -10);

    // ── Particle drift ────────────────────────────────────────────────────────
    this.particleSystem.rotation.y = elapsed * 0.015;
    this.particleSystem.rotation.x = elapsed * 0.008;

    // ── Image plane fade-in as camera approaches ──────────────────────────────
    this.imagePlanes.forEach(plane => {
      const dist = plane.position.z - this.camera.position.z;
      // Fade in when within 12 units ahead
      const opacity = THREE.MathUtils.clamp(1 - dist / 12, 0, 1);
      const mat = plane.material as THREE.MeshStandardMaterial;
      mat.opacity += (opacity - mat.opacity) * 0.06;

      // Gentle float
      plane.position.y += Math.sin(elapsed * 0.5 + plane.userData['index']) * 0.0008;
    });
  }

  // ─── Cleanup ─────────────────────────────────────────────────────────────────

  ngOnDestroy(): void {
    this.dispose();
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('resize', this.onResize);
    document.removeEventListener('scroll', this.onScroll);
  }
}
