import * as THREE from 'three';

/**
 * CameraController - Manages smooth 3D camera transitions between Wide Overview
 * (matching Image 1) and Close-up Desk Operator view (matching Image 2).
 */
export class CameraController {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;

    // Overview Camera Angle (Exact match to user screenshot Image 1!)
    this.overviewPos = new THREE.Vector3(-0.5, 7.8, 8.8);
    this.overviewLookAt = new THREE.Vector3(0, 1.2, -1.2);

    this.currentLookAt = this.overviewLookAt.clone();
    this.targetPos = this.overviewPos.clone();
    this.targetLookAt = this.overviewLookAt.clone();

    this.startPos = this.overviewPos.clone();
    this.startLookAt = this.overviewLookAt.clone();

    this.mode = 'overview'; // 'overview' | 'desk'
    this.activeDesk = null;

    this.isTransitioning = false;
    this.transitionTime = 0;
    this.transitionDuration = 1.0;

    this.mouseOffset = new THREE.Vector2(0, 0);

    this.camera.position.copy(this.overviewPos);
    this.camera.lookAt(this.currentLookAt);

    this.setupListeners();
  }

  setupListeners() {
    window.addEventListener('mousemove', (e) => {
      if (this.mode === 'overview') {
        const nx = (e.clientX / window.innerWidth) * 2 - 1;
        const ny = -(e.clientY / window.innerHeight) * 2 + 1;
        this.mouseOffset.set(nx * 0.6, ny * 0.3);
      }
    });

    window.addEventListener('keydown', (e) => {
      if ((e.code === 'Escape' || e.code === 'Space') && this.mode === 'desk') {
        this.returnToOverview();
      }
    });
  }

  transitionToDesk(desk) {
    if (this.activeDesk === desk && this.mode === 'desk') return;

    this.mode = 'desk';
    this.activeDesk = desk;

    const targetPos = desk.cfg.camPos.clone();
    const targetLookAt = desk.cfg.camLookAt.clone();

    this.startTransition(targetPos, targetLookAt, 1.0);
  }

  returnToOverview() {
    if (this.mode === 'overview') return;

    this.mode = 'overview';
    this.activeDesk = null;

    this.startTransition(this.overviewPos, this.overviewLookAt, 1.0);
  }

  startTransition(newPos, newLookAt, duration = 1.0) {
    this.startPos.copy(this.camera.position);
    this.startLookAt.copy(this.currentLookAt);

    this.targetPos.copy(newPos);
    this.targetLookAt.copy(newLookAt);

    this.transitionDuration = duration;
    this.transitionTime = 0;
    this.isTransitioning = true;
  }

  update(dt) {
    if (this.isTransitioning) {
      this.transitionTime += dt;
      const t = Math.min(1.0, this.transitionTime / this.transitionDuration);

      // Smooth cubic ease-in-out
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      this.camera.position.lerpVectors(this.startPos, this.targetPos, ease);
      this.currentLookAt.lerpVectors(this.startLookAt, this.targetLookAt, ease);
      this.camera.lookAt(this.currentLookAt);

      if (t >= 1.0) {
        this.isTransitioning = false;
      }
    } else if (this.mode === 'overview') {
      const desiredPos = this.overviewPos.clone().add(new THREE.Vector3(this.mouseOffset.x, this.mouseOffset.y, 0));
      this.camera.position.lerp(desiredPos, dt * 2.0);

      const desiredLook = this.overviewLookAt.clone().add(new THREE.Vector3(this.mouseOffset.x * 0.4, this.mouseOffset.y * 0.2, 0));
      this.currentLookAt.lerp(desiredLook, dt * 2.0);
      this.camera.lookAt(this.currentLookAt);
    }
  }
}

