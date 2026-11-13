/**
 * Roblox3DCamera.js - 3D Camera Manager for CSS 3D Viewport (Zero WebGL)
 */
export class Roblox3DCamera {
  constructor(game, cameraRigEl) {
    this.game = game;
    this.rig = cameraRigEl;
    this.mode = 'overview'; // 'overview' | 'desk'
    this.activeDesk = null;

    // Overview Camera (Elevated isometric view matching Image 1)
    this.overviewTransform = {
      x: 0,
      y: -220,
      z: -820,
      rotX: -24,
      rotY: 0
    };

    this.parallax = { x: 0, y: 0 };
    this.setupListeners();
    this.applyTransform();
  }

  setupListeners() {
    window.addEventListener('mousemove', (e) => {
      if (this.mode === 'overview') {
        const nx = (e.clientX / window.innerWidth) * 2 - 1;
        const ny = (e.clientY / window.innerHeight) * 2 - 1;
        this.parallax.x = nx * 14;
        this.parallax.y = ny * 8;
        this.applyTransform();
      }
    });

    window.addEventListener('keydown', (e) => {
      if ((e.code === 'Escape' || e.code === 'Space' || e.code === 'Backspace') && this.mode === 'desk') {
        this.returnToOverview();
      }
    });
  }

  transitionToDesk(deskCfg) {
    this.mode = 'desk';
    this.activeDesk = deskCfg;

    // Move camera smoothly right in front of desk console (Image 2 operator close-up)
    this.rig.style.transform = `
      translate3d(${deskCfg.camX}px, ${deskCfg.camY}px, ${deskCfg.camZ}px)
      rotateX(${deskCfg.camRotX}deg)
      rotateY(${deskCfg.camRotY}deg)
    `;
  }

  returnToOverview() {
    this.mode = 'overview';
    this.activeDesk = null;
    this.applyTransform();
  }

  applyTransform() {
    if (this.mode === 'overview') {
      const x = this.overviewTransform.x + this.parallax.x;
      const y = this.overviewTransform.y + this.parallax.y;
      const z = this.overviewTransform.z;
      const rotX = this.overviewTransform.rotX - (this.parallax.y * 0.06);
      const rotY = this.overviewTransform.rotY + (this.parallax.x * 0.06);

      this.rig.style.transform = `
        translate3d(${x}px, ${y}px, ${z}px)
        rotateX(${rotX}deg)
        rotateY(${rotY}deg)
      `;
    }
  }
}