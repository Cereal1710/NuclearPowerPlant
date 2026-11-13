import * as THREE from 'three';

/**
 * InteractionHandler - 3D Raycasting for:
 * - Station selection from overview
 * - Physical rotary switch clicks (turning switches on consoles)
 * - Physical SCRAM mushroom button depression
 * - Physical Back button depression
 */
export class InteractionHandler {
  constructor(game, camera, domElement) {
    this.game = game;
    this.camera = camera;
    this.domElement = domElement;

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2(-999, -999);
    this.hoveredObject = null;
    this.hoveredDesk = null;

    this.setupListeners();
  }

  setupListeners() {
    this.domElement.addEventListener('mousemove', (e) => this.onMouseMove(e));
    this.domElement.addEventListener('click', (e) => this.onClick(e));
    this.domElement.addEventListener('touchstart', (e) => this.onTouch(e), { passive: false });
  }

  onMouseMove(e) {
    const rect = this.domElement.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    this.checkHover();
  }

  onClick(e) {
    const rect = this.domElement.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    this.handleClick();
  }

  onTouch(e) {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      const rect = this.domElement.getBoundingClientRect();
      this.mouse.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
      this.handleClick();
    }
  }

  getIntersects() {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const objects = this.game.consolesBuilder.interactiveObjects;
    return this.raycaster.intersectObjects(objects, false);
  }

  checkHover() {
    const hits = this.getIntersects();
    let cursor = 'default';

    if (this.game.cameraController.mode === 'overview') {
      let hitDesk = null;
      for (const hit of hits) {
        if (hit.object.userData.isDesk) {
          hitDesk = hit.object.userData;
          cursor = 'pointer';
          break;
        }
      }

      if (hitDesk !== this.hoveredDesk) {
        if (this.hoveredDesk) {
          this.hoveredDesk.floorMat.material.color.setHex(this.hoveredDesk.config.matColor || 0xd6d1c4);
        }
        this.hoveredDesk = hitDesk;
        if (this.hoveredDesk) {
          this.hoveredDesk.floorMat.material.color.setHex(0x38bdf8); // Cyan hover glow
        }
      }
    } else if (this.game.cameraController.mode === 'desk') {
      for (const hit of hits) {
        if (hit.object.userData.isRotarySwitch || hit.object.userData.isScramButton || hit.object.userData.isBackButton) {
          cursor = 'pointer';
          break;
        }
      }
    }

    this.domElement.style.cursor = cursor;
  }

  handleClick() {
    this.game.sound.ensureContext();
    const hits = this.getIntersects();
    if (hits.length === 0) return;

    const hit = hits[0];

    // Priority 1: SCRAM Button (can be hit from any camera mode)
    if (hit.object.userData.isScramButton) {
      hit.object.userData.onClick();
      return;
    }

    // Overview Mode: Select Desk
    if (this.game.cameraController.mode === 'overview') {
      for (const h of hits) {
        if (h.object.userData.isDesk) {
          const desk = this.game.consolesBuilder.consoles.find(c => c.cfg.id === h.object.userData.config.id);
          if (desk) {
            this.game.sound.playClick(1200);
            this.game.cameraController.transitionToDesk(desk);
            return;
          }
        }
      }
    } else if (this.game.cameraController.mode === 'desk') {
      // Desk Close-up Mode:
      // Click Rotary Switch
      if (hit.object.userData.isRotarySwitch) {
        hit.object.userData.onClick();
        return;
      }

      // Click Physical Back Button
      if (hit.object.userData.isBackButton) {
        hit.object.userData.onClick();
        return;
      }
    }
  }
}

