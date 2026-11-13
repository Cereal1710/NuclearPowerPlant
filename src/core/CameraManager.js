import * as THREE from 'three';

/**
 * CameraManager - Manages smooth 3D camera transitions between Wide Overview
 * and Close-up Desk stations, with smooth cubic easing interpolation.
 */
export class CameraManager {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;

    // Overview default camera position & look-at target
    this.overviewPos = new THREE.Vector3(0, 6.8, 9.2);
    this.overviewLookAt = new THREE.Vector3(0, 2.0, -1.8);

    this.currentLookAt = this.overviewLookAt.clone();
    this.targetPos = this.overviewPos.clone();
    this.targetLookAt = this.overviewLookAt.clone();

    this.startPos = this.overviewPos.clone();
    this.startLookAt = this.overviewLookAt.clone();

    this.mode = 'overview'; // 'overview' | 'desk'
    this.activeDesk = null;

    this.isTransitioning = false;
    this.transitionTime = 0;
    this.transitionDuration = 1.0; // 1 second smooth flight

    // Pan / tilt subtle offset in overview
    this.mouseOffset = new THREE.Vector2(0, 0);

    this.camera.position.copy(this.overviewPos);
    this.camera.lookAt(this.currentLookAt);

    this.setupInputListeners();
  }

  setupInputListeners() {
    window.addEventListener('mousemove', (e) => {
      if (this.mode === 'overview') {
        const nx = (e.clientX / window.innerWidth) * 2 - 1;
        const ny = -(e.clientY / window.innerHeight) * 2 + 1;
        this.mouseOffset.set(nx * 0.8, ny * 0.4);
      }
    });

    window.addEventListener('keydown', (e) => {
      // Space or Escape returns to wide overview
      if ((e.code === 'Escape' || e.code === 'Space') && this.mode === 'desk') {
        this.returnToOverview();
      }
    });
  }

  transitionToDesk(desk) {
    if (this.activeDesk === desk && this.mode === 'desk') return;

    this.mode = 'desk';
    this.activeDesk = desk;

    // Calculate world positions for camera and lookAt
    const targetCamPos = desk.config.camPos.clone();
    const targetLookAt = desk.config.camLookAt.clone();

    this.startTransition(targetCamPos, targetLookAt, 0.9);
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

      // Smooth cubic ease-in-out curve
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      this.camera.position.lerpVectors(this.startPos, this.targetPos, ease);
      this.currentLookAt.lerpVectors(this.startLookAt, this.targetLookAt, ease);
      this.camera.lookAt(this.currentLookAt);

      if (t >= 1.0) {
        this.isTransitioning = false;
      }
    } else if (this.mode === 'overview') {
      // Subtle parallax response to mouse in overview mode
      const desiredPos = this.overviewPos.clone().add(new THREE.Vector3(this.mouseOffset.x, this.mouseOffset.y, 0));
      this.camera.position.lerp(desiredPos, dt * 2.5);

      const desiredLook = this.overviewLookAt.clone().add(new THREE.Vector3(this.mouseOffset.x * 0.5, this.mouseOffset.y * 0.3, 0));
      this.currentLookAt.lerp(desiredLook, dt * 2.5);
      this.camera.lookAt(this.currentLookAt);
    }
  }
}

