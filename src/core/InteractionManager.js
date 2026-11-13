import * as THREE from 'three';

/**
 * InteractionManager - 3D Raycasting, Diegetic Surface UV Coordinates,
 * Physical 3D Button Depressions & Hover Highlights.
 */
export class InteractionManager {
  constructor(game, camera, domElement) {
    this.game = game;
    this.camera = camera;
    this.domElement = domElement;

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2(-999, -999);

    this.hoveredDesk = null;
    this.hoveredObject = null;

    this.setupListeners();
  }

  setupListeners() {
    this.domElement.addEventListener('mousemove', (e) => this.onMouseMove(e));
    this.domElement.addEventListener('click', (e) => this.onClick(e));
    this.domElement.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
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

  onTouchStart(e) {
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      const rect = this.domElement.getBoundingClientRect();
      this.mouse.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;

      this.handleClick();
    }
  }

  getRaycastHits() {
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const objects = this.game.deskBuilder.interactiveObjects;
    return this.raycaster.intersectObjects(objects, false);
  }

  checkHover() {
    const hits = this.getRaycastHits();
    let cursor = 'default';

    if (this.game.cameraManager.mode === 'overview') {
      let hitDesk = null;
      for (const hit of hits) {
        if (hit.object.userData.isDeskHitBox) {
          hitDesk = this.game.deskBuilder.desks.find(d => d.id === hit.object.userData.deskId);
          break;
        } else if (hit.object.userData.isScramButton) {
          cursor = 'pointer';
        }
      }

      if (hitDesk !== this.hoveredDesk) {
        if (this.hoveredDesk) {
          this.hoveredDesk.highlightMesh.material.opacity = 0;
          this.hoveredDesk.floatingLabel.scale.set(1.8, 0.56, 1);
        }
        this.hoveredDesk = hitDesk;
        if (this.hoveredDesk) {
          this.hoveredDesk.highlightMesh.material.opacity = 0.8;
          this.hoveredDesk.floatingLabel.scale.set(2.1, 0.65, 1);
        }
      }

      if (this.hoveredDesk) {
        cursor = 'pointer';
      }
    } else if (this.game.cameraManager.mode === 'desk') {
      const currentDesk = this.game.cameraManager.activeDesk;

      for (const hit of hits) {
        // Physical Back button
        if (hit.object.userData.isBackButton) {
          cursor = 'pointer';
          break;
        }
        // SCRAM mushroom button
        if (hit.object.userData.isScramButton) {
          cursor = 'pointer';
          break;
        }
        // Monitor screen surface UV
        if (hit.object.userData.isScreen && hit.object.userData.deskId === currentDesk.id) {
          if (hit.uv) {
            const hasHit = hit.object.userData.screenUI.handlePointerMove(hit.uv.x, hit.uv.y);
            if (hasHit) cursor = 'pointer';
          }
          break;
        }
      }
    }

    this.domElement.style.cursor = cursor;
  }

  handleClick() {
    // Audio context resume on first interaction
    this.game.sound.ensureContext();

    const hits = this.getRaycastHits();
    if (hits.length === 0) return;

    const hit = hits[0];

    // Priority 1: Physical SCRAM Button (can be hit from any view during alarm)
    if (hit.object.userData.isScramButton) {
      this.triggerPhysicalScram(hit.object);
      return;
    }

    if (this.game.cameraManager.mode === 'overview') {
      // Clicked desk from overview
      for (const h of hits) {
        if (h.object.userData.isDeskHitBox) {
          const desk = this.game.deskBuilder.desks.find(d => d.id === h.object.userData.deskId);
          if (desk) {
            this.game.sound.playClick(1100);
            this.game.cameraManager.transitionToDesk(desk);
            return;
          }
        }
      }
    } else if (this.game.cameraManager.mode === 'desk') {
      const currentDesk = this.game.cameraManager.activeDesk;

      // Clicked Physical 3D Back button
      if (hit.object.userData.isBackButton) {
        this.pressPhysicalBackButton(hit.object);
        return;
      }

      // Clicked Screen UV
      if (hit.object.userData.isScreen && hit.object.userData.deskId === currentDesk.id && hit.uv) {
        hit.object.userData.screenUI.handleClick(hit.uv.x, hit.uv.y);
        return;
      }
    }
  }

  triggerPhysicalScram(buttonMesh) {
    // Mechanical slam animation
    const originalY = buttonMesh.position.y;
    buttonMesh.position.y -= 0.035; // depress
    this.game.sound.playScramSlam();

    setTimeout(() => {
      buttonMesh.position.y = originalY;
    }, 280);

    // Trigger reactor SCRAM
    this.game.reactorSim.scram();

    // Check emergency event
    if (this.game.eventSim.emergencyActive) {
      this.game.eventSim.handleEmergencySuccess();
    } else {
      this.game.eventSim.addLog('Manual emergency SCRAM triggered by operator.');
    }
  }

  pressPhysicalBackButton(btnMesh) {
    // Button mechanical press animation
    const origY = btnMesh.position.y;
    btnMesh.position.y -= 0.015;
    this.game.sound.playClick(800);

    setTimeout(() => {
      btnMesh.position.y = origY;
      this.game.cameraManager.returnToOverview();
    }, 120);
  }
}

