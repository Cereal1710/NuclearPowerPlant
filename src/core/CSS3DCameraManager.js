/**
 * CSS3DCameraManager - Manages 3D Camera Rig Transitions & Parallax (Zero WebGL)
 */
export class CSS3DCameraManager {
  constructor(cameraRigEl) {
    this.rig = cameraRigEl;
    this.mode = 'overview'; // 'overview' | 'desk'
    this.activeDesk = null;

    this.overviewTransform = {
      x: 0,
      y: -30,
      z: -180,
      rotX: 14,
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
        this.parallax.x = nx * 16;
        this.parallax.y = ny * 8;
        this.applyTransform();
      }
    });

    window.addEventListener('keydown', (e) => {
      if ((e.code === 'Escape' || e.code === 'Space') && this.mode === 'desk') {
        this.returnToOverview();
      }
    });
  }

  transitionToDesk(deskCfg) {
    this.mode = 'desk';
    this.activeDesk = deskCfg;

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
      const rotX = this.overviewTransform.rotX - (this.parallax.y * 0.1);
      const rotY = this.overviewTransform.rotY + (this.parallax.x * 0.1);

      this.rig.style.transform = `
        translate3d(${x}px, ${y}px, ${z}px)
        rotateX(${rotX}deg)
        rotateY(${rotY}deg)
      `;
    }
  }
}
