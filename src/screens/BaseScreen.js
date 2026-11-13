import * as THREE from 'three';

/**
 * BaseScreen - Renders interactive high-resolution canvas onto 3D monitor meshes.
 * Handles UV-to-Canvas mapping for clicks, toggles, buttons, and visual styling.
 */
export class BaseScreen {
  constructor(game, width = 1024, height = 640) {
    this.game = game;
    this.width = width;
    this.height = height;

    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d');

    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.minFilter = THREE.LinearFilter;
    this.texture.magFilter = THREE.LinearFilter;

    this.interactiveElements = [];
    this.hoveredElement = null;
    this.dirty = true;
  }

  registerButton(id, x, y, w, h, onClick, label = '', extra = {}) {
    this.interactiveElements.push({
      id,
      type: 'button',
      x, y, w, h,
      onClick,
      label,
      ...extra
    });
  }

  clearElements() {
    this.interactiveElements = [];
  }

  handlePointerMove(uvX, uvY) {
    const x = uvX * this.width;
    const y = (1 - uvY) * this.height;

    let found = null;
    for (const el of this.interactiveElements) {
      if (x >= el.x && x <= el.x + el.w && y >= el.y && y <= el.y + el.h) {
        found = el;
        break;
      }
    }

    if (found !== this.hoveredElement) {
      this.hoveredElement = found;
      this.dirty = true;
    }

    return !!found;
  }

  handleClick(uvX, uvY) {
    const x = uvX * this.width;
    const y = (1 - uvY) * this.height;

    for (const el of this.interactiveElements) {
      if (x >= el.x && x <= el.x + el.w && y >= el.y && y <= el.y + el.h) {
        if (el.onClick) {
          el.onClick(el, x - el.x, y - el.y);
          this.dirty = true;
          return true;
        }
      }
    }
    return false;
  }

  drawHeader(title, subtitle, stationBadge = '') {
    const ctx = this.ctx;
    // Top bar
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, this.width, 68);

    // Subtle neon divider
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(0, 66, this.width, 2);

    // Brand icon & text
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('⚡ NUCLEARIS NPP', 24, 34);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px sans-serif';
    ctx.fillText('NEUTRON ENERGY CORP. // ' + (subtitle || 'CONTROL CONSOLE'), 24, 54);

    // Title center
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(title, this.width / 2, 42);
    ctx.textAlign = 'left';

    // Badge
    if (stationBadge) {
      ctx.fillStyle = '#1e293b';
      ctx.roundRect(this.width - 230, 14, 206, 40, 6);
      ctx.fill();
      ctx.strokeStyle = '#334155';
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(stationBadge, this.width - 36, 39);
      ctx.textAlign = 'left';
    }
  }

  drawButton(btn, isPrimary = false, isDanger = false) {
    const ctx = this.ctx;
    const isHovered = this.hoveredElement === btn;

    let bg = isPrimary ? '#0284c7' : isDanger ? '#dc2626' : '#1e293b';
    let textCol = '#ffffff';

    if (isHovered) {
      bg = isPrimary ? '#38bdf8' : isDanger ? '#ef4444' : '#334155';
    }

    ctx.save();
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.roundRect(btn.x, btn.y, btn.w, btn.h, 6);
    ctx.fill();

    ctx.strokeStyle = isHovered ? '#67e8f9' : '#475569';
    ctx.lineWidth = isHovered ? 2 : 1;
    ctx.stroke();

    ctx.fillStyle = textCol;
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(btn.label, btn.x + btn.w / 2, btn.y + btn.h / 2);
    ctx.restore();
  }

  drawProgressBar(x, y, w, h, value, max, color = '#38bdf8', label = '') {
    const ctx = this.ctx;
    const pct = Math.max(0, Math.min(1, value / max));

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 4);
    ctx.fill();

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x, y, w * pct, h, 4);
    ctx.fill();

    ctx.strokeStyle = '#334155';
    ctx.stroke();

    if (label) {
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, x + w / 2, y + h / 2);
    }
  }

  update() {
    this.render();
    if (this.dirty) {
      this.texture.needsUpdate = true;
      this.dirty = false;
    }
  }

  render() {
    // Override in subclass
  }
}

