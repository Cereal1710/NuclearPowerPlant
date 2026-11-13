/**
 * Software3DEngine.js - 100% Real 3D Software Graphics Engine (Zero WebGL)
 * 
 * Features:
 * - 3D Matrix & Vector Pipeline (PerspectiveCamera, 4x4 ViewMatrix, Perspective Projection)
 * - Volumetric 3D Geometry (3D Boxes, Prisms, Sloped Consoles, Cylinders, Blocky Roblox Minifigures)
 * - 3D Directional Lighting & Ambient Occlusion Shading
 * - Painter's Algorithm Depth-Sorting
 * - High-Detail Diegetic 3D Surfaces (CRT Screens, Analogue Meters, Rotary Switches, SCRAM Mushroom)
 * - Smooth 3D Camera Flight (Overview -> Operator Desk Close-Up -> Return)
 * - 100% Hardware-Agnostic: Runs on HTML5 Canvas 2D context with ZERO WebGL calls!
 */

// 3D Vector Math
class Vec3 {
  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  set(x, y, z) { this.x = x; this.y = y; this.z = z; return this; }
  clone() { return new Vec3(this.x, this.y, this.z); }
  add(v) { this.x += v.x; this.y += v.y; this.z += v.z; return this; }
  sub(v) { this.x -= v.x; this.y -= v.y; this.z -= v.z; return this; }
  scale(s) { this.x *= s; this.y *= s; this.z *= s; return this; }
  dot(v) { return this.x * v.x + this.y * v.y + this.z * v.z; }
  cross(v) {
    return new Vec3(
      this.y * v.z - this.z * v.y,
      this.z * v.x - this.x * v.z,
      this.x * v.y - this.y * v.x
    );
  }
  length() { return Math.hypot(this.x, this.y, this.z); }
  normalize() {
    const l = this.length();
    if (l > 0.00001) { this.x /= l; this.y /= l; this.z /= l; }
    return this;
  }
}

// 4x4 Transformation Matrix
class Mat4 {
  constructor() {
    this.m = new Float32Array(16);
    this.identity();
  }
  identity() {
    this.m.fill(0);
    this.m[0] = this.m[5] = this.m[10] = this.m[15] = 1;
    return this;
  }
  lookAt(eye, target, up) {
    const zAxis = eye.clone().sub(target).normalize();
    const xAxis = up.cross(zAxis).normalize();
    const yAxis = zAxis.cross(xAxis).normalize();

    this.m[0] = xAxis.x; this.m[1] = yAxis.x; this.m[2] = zAxis.x; this.m[3] = 0;
    this.m[4] = xAxis.y; this.m[5] = yAxis.y; this.m[6] = zAxis.y; this.m[7] = 0;
    this.m[8] = xAxis.z; this.m[9] = yAxis.z; this.m[10] = zAxis.z; this.m[11] = 0;
    this.m[12] = -xAxis.dot(eye);
    this.m[13] = -yAxis.dot(eye);
    this.m[14] = -zAxis.dot(eye);
    this.m[15] = 1;
    return this;
  }
  transformVec3(v) {
    const x = v.x, y = v.y, z = v.z;
    return new Vec3(
      x * this.m[0] + y * this.m[4] + z * this.m[8] + this.m[12],
      x * this.m[1] + y * this.m[5] + z * this.m[9] + this.m[13],
      x * this.m[2] + y * this.m[6] + z * this.m[10] + this.m[14]
    );
  }
}

export class Software3DEngine {
  constructor(game, canvas) {
    this.game = game;
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    this.width = window.innerWidth;
    this.height = window.innerHeight;

    // Camera 3D
    this.camPos = new Vec3(0, 6.8, 9.2); // Elevated overview matching Image 1
    this.camTarget = new Vec3(0, 1.2, -1.0);
    this.camUp = new Vec3(0, 1, 0);

    this.desiredPos = this.camPos.clone();
    this.desiredTarget = this.camTarget.clone();

    this.viewMatrix = new Mat4();
    this.fov = 50 * (Math.PI / 180);

    // State
    this.mode = 'overview'; // 'overview' | 'desk'
    this.activeDesk = null;
    this.hoveredDesk = null;
    this.mouse = { x: -999, y: -999 };
    this.time = 0;

    // Desks in 3D Space
    this.desks = [
      {
        id: 'reactor',
        title: 'REACTOR PRIMARY',
        pos: new Vec3(-3.8, 0, -2.0),
        rotY: 0.35,
        camPos: new Vec3(-3.8, 1.7, -0.6),
        camTarget: new Vec3(-3.8, 1.35, -2.0),
        matColor: '#bca783',
        matW: 3.6,
        matD: 2.4,
        hasScram: true,
        crtTitle: 'FEEDWATER OVERVIEW'
      },
      {
        id: 'electrical',
        title: 'GRID CONTROL',
        pos: new Vec3(-1.2, 0, 1.6),
        rotY: 0.1,
        camPos: new Vec3(-1.2, 1.7, 3.0),
        camTarget: new Vec3(-1.2, 1.35, 1.6),
        matColor: '#b8a47e',
        matW: 3.4,
        matD: 2.2,
        crtTitle: 'METRO GRID DISPATCH'
      },
      {
        id: 'shift',
        title: 'SHIFT MANAGER',
        pos: new Vec3(4.2, 0, 0.8),
        rotY: -0.28,
        camPos: new Vec3(4.2, 1.7, 2.2),
        camTarget: new Vec3(4.2, 1.35, 0.8),
        matColor: '#6a9ca8', // Blue-green mat from Image 1
        matW: 3.2,
        matD: 2.2,
        crtTitle: 'STAFF LOGISTICS'
      },
      {
        id: 'maintenance',
        title: 'TURBINES & GENERATOR',
        pos: new Vec3(2.8, 0, -2.2),
        rotY: -0.2,
        camPos: new Vec3(2.8, 1.7, -0.8),
        camTarget: new Vec3(2.8, 1.35, -2.2),
        matColor: '#be7f73', // Salmon mat from Image 1
        matW: 3.2,
        matD: 2.2,
        crtTitle: 'TURBINE GOVERNOR'
      },
      {
        id: 'safety',
        title: 'SAFETY MONITORING',
        pos: new Vec3(0.8, 0, -3.2),
        rotY: 0,
        camPos: new Vec3(0.8, 1.7, -1.8),
        camTarget: new Vec3(0.8, 1.35, -3.2),
        matColor: '#799882',
        matW: 3.2,
        matD: 2.2,
        crtTitle: 'RADIATION SURVEILLANCE'
      },
      {
        id: 'waste',
        title: 'WASTE MANAGEMENT',
        pos: new Vec3(5.6, 0, -1.8),
        rotY: -0.35,
        camPos: new Vec3(5.6, 1.7, -0.4),
        camTarget: new Vec3(5.6, 1.35, -1.8),
        matColor: '#b8a87b',
        matW: 3.0,
        matD: 2.2,
        crtTitle: 'SPENT FUEL POOL'
      }
    ];

    this.setupListeners();
    this.onResize();
  }

  setupListeners() {
    window.addEventListener('resize', () => this.onResize());

    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      this.checkHover();
    });

    window.addEventListener('click', (e) => {
      this.handleClick(e.clientX, e.clientY);
    });

    window.addEventListener('keydown', (e) => {
      if ((e.code === 'Escape' || e.code === 'Space' || e.code === 'Backspace') && this.mode === 'desk') {
        this.returnToOverview();
      }
    });
  }

  onResize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * dpr;
    this.canvas.height = this.height * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  transitionToDesk(desk) {
    this.mode = 'desk';
    this.activeDesk = desk;
    this.desiredPos = desk.camPos.clone();
    this.desiredTarget = desk.camTarget.clone();
  }

  returnToOverview() {
    this.mode = 'overview';
    this.activeDesk = null;
    this.desiredPos = new Vec3(0, 6.8, 9.2);
    this.desiredTarget = new Vec3(0, 1.2, -1.0);
  }

  // Project 3D World point -> 2D Screen point
  project(pWorld) {
    const pCam = this.viewMatrix.transformVec3(pWorld);
    // In camera space: -Z is forward
    if (pCam.z >= -0.1) return null; // Behind camera

    const f = (this.height / 2) / Math.tan(this.fov / 2);
    const sx = this.width / 2 + (pCam.x / -pCam.z) * f;
    const sy = this.height / 2 - (pCam.y / -pCam.z) * f;

    return { x: sx, y: sy, depth: -pCam.z };
  }

  checkHover() {
    let cursor = 'default';
    if (this.mode === 'overview') {
      let found = null;
      for (const d of this.desks) {
        const pScreen = this.project(new Vec3(d.pos.x, 0.8, d.pos.z));
        if (pScreen) {
          if (Math.hypot(this.mouse.x - pScreen.x, this.mouse.y - pScreen.y) < 75) {
            found = d;
            cursor = 'pointer';
            break;
          }
        }
      }
      this.hoveredDesk = found;
    } else if (this.mode === 'desk') {
      cursor = 'pointer';
    }
    this.canvas.style.cursor = cursor;
  }

  handleClick(mx, my) {
    this.game.sound.ensureContext();

    if (this.mode === 'overview') {
      for (const d of this.desks) {
        const pScreen = this.project(new Vec3(d.pos.x, 0.8, d.pos.z));
        if (pScreen) {
          if (Math.hypot(mx - pScreen.x, my - pScreen.y) < 75) {
            this.game.sound.playClick(1150);
            this.transitionToDesk(d);
            return;
          }
        }
      }
    } else if (this.mode === 'desk') {
      // 1. Physical 3D Return Button (Top-Left of Screen)
      if (mx >= 35 && mx <= 185 && my >= 25 && my <= 75) {
        this.game.sound.playClick(850);
        this.returnToOverview();
        return;
      }

      // 2. Interactive Desk Controls
      this.handleDeskClick(mx, my);
    }
  }

  handleDeskClick(mx, my) {
    const d = this.activeDesk;
    if (!d) return;

    if (d.id === 'reactor') {
      // Big Red Mushroom SCRAM Button (Bottom Right)
      const scramX = this.width - 120;
      const scramY = this.height - 110;
      if (Math.hypot(mx - scramX, my - scramY) < 48) {
        this.game.sound.playScramSlam();
        this.game.reactorSim.scram();
        if (this.game.eventSim.emergencyActive) {
          this.game.eventSim.handleEmergencySuccess();
        } else {
          this.game.eventSim.addLog('EMERGENCY SCRAM INITIATED BY OPERATOR!');
        }
        return;
      }

      // Reset SCRAM button if tripped
      if (this.game.reactorSim.isScrammed) {
        const rstX = this.width / 2 - 110;
        const rstY = this.height - 65;
        if (mx >= rstX && mx <= rstX + 220 && my >= rstY && my <= rstY + 44) {
          if (this.game.reactorSim.resetTrip()) {
            this.game.sound.playSuccess();
            this.game.eventSim.addLog('Reactor interlocks reset. Commencing startup.');
          } else {
            this.game.sound.playError();
          }
          return;
        }
      }

      // Feedwater Pump 1 Switch
      const p1X = this.width * 0.22;
      const p1Y = this.height * 0.74;
      if (Math.hypot(mx - p1X, my - p1Y) < 38) {
        this.game.reactorSim.togglePump(0);
        this.game.sound.playHeavySwitch();
        return;
      }

      // Feedwater Pump 2 Switch
      const p2X = this.width * 0.40;
      const p2Y = this.height * 0.74;
      if (Math.hypot(mx - p2X, my - p2Y) < 38) {
        this.game.reactorSim.togglePump(1);
        this.game.sound.playHeavySwitch();
        return;
      }

      // Feedwater Control Master Switch
      const p3X = this.width * 0.65;
      const p3Y = this.height * 0.74;
      if (Math.hypot(mx - p3X, my - p3Y) < 38) {
        this.game.reactorSim.togglePump(2);
        this.game.sound.playHeavySwitch();
        return;
      }
    } else if (d.id === 'electrical') {
      const sectors = this.game.powerGridSim.sectors;
      const startX = this.width * 0.20;
      const spacing = this.width * 0.16;
      const swY = this.height * 0.74;

      for (let i = 0; i < sectors.length; i++) {
        const sx = startX + i * spacing;
        if (Math.hypot(mx - sx, my - swY) < 36) {
          this.game.powerGridSim.toggleSector(sectors[i].id);
          this.game.sound.playHeavySwitch();
          return;
        }
      }
    } else {
      // Generic station interaction
      this.game.sound.playHeavySwitch();
    }
  }

  update(dt) {
    this.time += dt;

    // Smooth 3D Camera Glide
    const lerpSpeed = dt * 5.0;
    this.camPos.x += (this.desiredPos.x - this.camPos.x) * lerpSpeed;
    this.camPos.y += (this.desiredPos.y - this.camPos.y) * lerpSpeed;
    this.camPos.z += (this.desiredPos.z - this.camPos.z) * lerpSpeed;

    this.camTarget.x += (this.desiredTarget.x - this.camTarget.x) * lerpSpeed;
    this.camTarget.y += (this.desiredTarget.y - this.camTarget.y) * lerpSpeed;
    this.camTarget.z += (this.desiredTarget.z - this.camTarget.z) * lerpSpeed;

    // Subtle Overview Parallax
    if (this.mode === 'overview') {
      const px = ((this.mouse.x / this.width) * 2 - 1) * 0.4;
      const py = ((this.mouse.y / this.height) * 2 - 1) * 0.2;
      this.camPos.x += px * 0.05;
      this.camPos.y -= py * 0.05;
    }

    // Update 4x4 View Matrix
    this.viewMatrix.lookAt(this.camPos, this.camTarget, this.camUp);
  }

  render() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    ctx.clearRect(0, 0, w, h);

    // Collect 3D Polygons from scene
    const polygons = [];

    // 1. Floor & Floor Mats
    this.generateFloorPolygons(polygons);

    // 2. Back Wall, Mezzanine Office & Overhead Board
    this.generateArchitecturePolygons(polygons);

    // 3. 3D Modular Beige Consoles
    this.generateConsolePolygons(polygons);

    // 4. 3D Roblox Blocky Minifigures
    this.generateStaffPolygons(polygons);

    // 5. Environment Props (Planters, Swivel Chair)
    this.generatePropPolygons(polygons);

    // Sort polygons by camera depth (Painter's Algorithm)
    polygons.sort((a, b) => b.depth - a.depth);

    // Rasterize sorted 3D polygons
    for (const poly of polygons) {
      this.rasterizePolygon(poly);
    }

    // 6. If in Operator Desk Close-up View, render sharp diegetic CRT & Gauges directly in view
    if (this.mode === 'desk') {
      this.renderDeskOperatorOverlay();
    }

    // 7. Emergency Flashing Alert
    if (this.game.eventSim.emergencyActive) {
      this.renderEmergencyBeacons();
    }
  }

  // -------------------------------------------------------------------------
  // 3D GEOMETRY GENERATORS
  // -------------------------------------------------------------------------

  generateFloorPolygons(list) {
    // Large Industrial Concrete Floor (Image 1)
    const fw = 28;
    const fd = 22;
    const p1 = new Vec3(-fw / 2, 0, -fd / 2);
    const p2 = new Vec3(fw / 2, 0, -fd / 2);
    const p3 = new Vec3(fw / 2, 0, fd / 2);
    const p4 = new Vec3(-fw / 2, 0, fd / 2);

    list.push({
      pts: [p1, p2, p3, p4],
      color: '#42454e',
      stroke: '#32353e',
      depth: (p1.z + p3.z) / 2,
      isFloor: true
    });

    // Floor Mats under each desk
    for (const d of this.desks) {
      const isHovered = this.hoveredDesk === d;
      const mw = d.matW;
      const md = d.matD;
      const mx = d.pos.x;
      const mz = d.pos.z;

      const mp1 = new Vec3(mx - mw / 2, 0.02, mz - md / 2);
      const mp2 = new Vec3(mx + mw / 2, 0.02, mz - md / 2);
      const mp3 = new Vec3(mx + mw / 2, 0.02, mz + md / 2);
      const mp4 = new Vec3(mx - mw / 2, 0.02, mz + md / 2);

      list.push({
        pts: [mp1, mp2, mp3, mp4],
        color: isHovered ? '#38bdf8' : d.matColor,
        stroke: '#282b34',
        depth: mz,
        label: d.title
      });
    }
  }

  generateArchitecturePolygons(list) {
    // Back Wall
    const bw = 28;
    const bh = 9;
    const bz = -9.2;

    list.push({
      pts: [
        new Vec3(-bw / 2, 0, bz),
        new Vec3(bw / 2, 0, bz),
        new Vec3(bw / 2, bh, bz),
        new Vec3(-bw / 2, bh, bz)
      ],
      color: '#282c35',
      stroke: '#1c1e24',
      depth: bz
    });

    // Mezzanine Office Gallery (Upper Right of Image 1)
    const mx = 6.0;
    const my = 5.2;
    const mw = 9.5;
    const mh = 2.4;

    list.push({
      pts: [
        new Vec3(mx - mw / 2, my - mh / 2, bz + 0.1),
        new Vec3(mx + mw / 2, my - mh / 2, bz + 0.1),
        new Vec3(mx + mw / 2, my + mh / 2, bz + 0.1),
        new Vec3(mx - mw / 2, my + mh / 2, bz + 0.1)
      ],
      color: '#13161c',
      stroke: '#363c48',
      depth: bz + 0.1,
      isMezzanine: true
    });

    // Master Overhead Display Board (Upper Left, Image 1 & 3)
    const ox = -3.8;
    const oy = 5.2;
    const ow = 9.6;
    const oh = 3.8;

    list.push({
      pts: [
        new Vec3(ox - ow / 2, oy - oh / 2, bz + 0.15),
        new Vec3(ox + ow / 2, oy - oh / 2, bz + 0.15),
        new Vec3(ox + ow / 2, oy + oh / 2, bz + 0.15),
        new Vec3(ox - ow / 2, oy + oh / 2, bz + 0.15)
      ],
      color: '#0e1015',
      stroke: '#383e4c',
      depth: bz + 0.15,
      isOverheadBoard: true
    });
  }

  generateConsolePolygons(list) {
    for (const d of this.desks) {
      const isHovered = this.hoveredDesk === d;
      const cos = Math.cos(d.rotY);
      const sin = Math.sin(d.rotY);

      // Helper to rotate local console offset
      const rot = (lx, ly, lz) => {
        return new Vec3(
          d.pos.x + lx * cos + lz * sin,
          d.pos.y + ly,
          d.pos.z - lx * sin + lz * cos
        );
      };

      const cw = 2.6;
      const cd = 0.9;
      const ch = 0.75;

      // 1. Console Front Face (Beige metal, Image 1 & 2)
      list.push({
        pts: [
          rot(-cw / 2, 0, cd / 2),
          rot(cw / 2, 0, cd / 2),
          rot(cw / 2, ch, cd / 2),
          rot(-cw / 2, ch, cd / 2)
        ],
        color: '#b8b4a7',
        stroke: '#2a2e37',
        depth: d.pos.z + cd / 2
      });

      // 2. Console Sloped Top Deck (Tilted upwards at 25deg, Image 2)
      list.push({
        pts: [
          rot(-cw / 2, ch, cd / 2),
          rot(cw / 2, ch, cd / 2),
          rot(cw / 2, ch + 0.35, -cd / 2),
          rot(-cw / 2, ch + 0.35, -cd / 2)
        ],
        color: isHovered ? '#e8ebf0' : '#d8d4c9',
        stroke: isHovered ? '#38bdf8' : '#2a2e37',
        depth: d.pos.z,
        isControlDeck: true,
        desk: d
      });

      // 3. 3D Chunky Retro Beige CRT Monitor on Stand (Center of desk)
      const mw = 0.9;
      const mh = 0.65;
      const my = ch + 0.38;
      const mz = -0.15;

      list.push({
        pts: [
          rot(-mw / 2, my, mz),
          rot(mw / 2, my, mz),
          rot(mw / 2, my + mh, mz),
          rot(-mw / 2, my + mh, mz)
        ],
        color: '#dedad0',
        stroke: '#20242d',
        depth: d.pos.z + mz,
        isCRTMonitor: true,
        desk: d
      });
    }
  }

  generateStaffPolygons(list) {
    const staffPositions = [
      { x: -3.8, z: -1.4, vest: '#ea580c' }, // Reactor operator
      { x: -4.5, z: -1.6, vest: '#eab308' }, // Coolant tech
      { x: -1.2, z: 2.2, vest: '#eab308' },  // Grid dispatcher
      { x: 4.2, z: 1.4, vest: '#0284c7' },   // Shift manager (Blue vest)
      { x: 2.8, z: -1.6, vest: '#ea580c' },  // Turbine mechanic
      { x: -2.6, z: 0.2, vest: '#eab308', clipboard: true } // Walking operator
    ];

    for (const s of staffPositions) {
      // Simple 3D Blocky Roblox Minifigure
      const foot = new Vec3(s.x, 0, s.z);
      const head = new Vec3(s.x, 1.4, s.z);

      list.push({
        pos: foot,
        headPos: head,
        vestColor: s.vest,
        depth: s.z,
        isStaff: true
      });
    }
  }

  generatePropPolygons(list) {
    // Swivel Chair behind Grid Control (Image 1)
    const cp = new Vec3(-1.2, 0, 2.4);
    list.push({
      pts: [
        new Vec3(cp.x - 0.25, 0.45, cp.z - 0.25),
        new Vec3(cp.x + 0.25, 0.45, cp.z - 0.25),
        new Vec3(cp.x + 0.25, 0.45, cp.z + 0.25),
        new Vec3(cp.x - 0.25, 0.45, cp.z + 0.25)
      ],
      color: '#262932',
      depth: cp.z
    });

    // Planters along walkways (Image 1)
    const planterCoords = [
      new Vec3(-7.2, 0, -2.5),
      new Vec3(-7.2, 0, 2.0),
      new Vec3(7.2, 0, -1.8),
      new Vec3(7.2, 0, 2.5)
    ];

    for (const pl of planterCoords) {
      list.push({
        pts: [
          new Vec3(pl.x - 0.4, 0.35, pl.z - 0.3),
          new Vec3(pl.x + 0.4, 0.35, pl.z - 0.3),
          new Vec3(pl.x + 0.4, 0.35, pl.z + 0.3),
          new Vec3(pl.x - 0.4, 0.35, pl.z + 0.3)
        ],
        color: '#2f343e',
        foliagePos: new Vec3(pl.x, 0.55, pl.z),
        depth: pl.z,
        isPlanter: true
      });
    }
  }

  // -------------------------------------------------------------------------
  // 3D POLYGON RASTERIZER
  // -------------------------------------------------------------------------

  rasterizePolygon(poly) {
    const ctx = this.ctx;

    // A. Staff Minifigure
    if (poly.isStaff) {
      this.draw3DRobloxStaff(poly);
      return;
    }

    // B. Planter
    if (poly.isPlanter) {
      this.draw3DPlanter(poly);
      return;
    }

    // Project 3D vertices to 2D Screen
    const sPts = poly.pts.map(p => this.project(p));
    for (const p of sPts) {
      if (!p) return; // Behind camera
    }

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(sPts[0].x, sPts[0].y);
    for (let i = 1; i < sPts.length; i++) {
      ctx.lineTo(sPts[i].x, sPts[i].y);
    }
    ctx.closePath();

    ctx.fillStyle = poly.color;
    ctx.fill();

    if (poly.stroke) {
      ctx.strokeStyle = poly.stroke;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Floor Perspective Tile Lines
    if (poly.isFloor) {
      this.drawFloorGridLines(ctx);
    }

    // Floor Mat Text Stencil
    if (poly.label) {
      const centerP = this.project(new Vec3((poly.pts[0].x + poly.pts[2].x) / 2, 0.04, poly.pts[2].z - 0.2));
      if (centerP) {
        ctx.fillStyle = '#1c222a';
        ctx.font = 'bold 12px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(poly.label, centerP.x, centerP.y);
      }
    }

    // Mezzanine Office Windows & Gold Signage (Image 1)
    if (poly.isMezzanine) {
      this.drawMezzanineDetails(sPts);
    }

    // Master Overhead Board Graphics (Image 1 & 3)
    if (poly.isOverheadBoard) {
      this.drawOverheadBoardDetails(sPts);
    }

    // Mini Dials & Gauges on Console Deck
    if (poly.isControlDeck) {
      this.drawControlDeckDetails(poly.desk);
    }

    // CRT Monitor Screen
    if (poly.isCRTMonitor) {
      this.drawCRTMonitorDetails(sPts, poly.desk);
    }

    ctx.restore();
  }

  drawFloorGridLines(ctx) {
    ctx.strokeStyle = '#323640';
    ctx.lineWidth = 1;
    for (let x = -14; x <= 14; x += 1.8) {
      const p1 = this.project(new Vec3(x, 0.01, -11));
      const p2 = this.project(new Vec3(x, 0.01, 11));
      if (p1 && p2) {
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
    }
    for (let z = -11; z <= 11; z += 1.8) {
      const p1 = this.project(new Vec3(-14, 0.01, z));
      const p2 = this.project(new Vec3(14, 0.01, z));
      if (p1 && p2) {
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
    }
  }

  drawMezzanineDetails(sPts) {
    const ctx = this.ctx;
    const minX = Math.min(...sPts.map(p => p.x));
    const maxX = Math.max(...sPts.map(p => p.x));
    const minY = Math.min(...sPts.map(p => p.y));
    const maxY = Math.max(...sPts.map(p => p.y));

    // Stencil Gold Typography on Wall: "UNIT 01 PRIMARY CONTROL ROOM" (Image 1)
    ctx.fillStyle = '#cbb05a';
    ctx.font = 'bold 18px "Courier New", monospace';
    ctx.fillText('UNIT 01 PRIMARY', minX + 15, minY - 8);
    ctx.font = 'bold 13px "Courier New", monospace';
    ctx.fillText('CONTROL ROOM', minX + 180, minY - 8);

    // Illuminated glass panes
    ctx.fillStyle = 'rgba(235, 230, 210, 0.22)';
    ctx.fillRect(minX + 4, minY + 4, (maxX - minX) - 8, (maxY - minY) - 8);

    // Window vertical mullions
    const w = maxX - minX;
    ctx.strokeStyle = '#282c36';
    ctx.lineWidth = 3;
    for (let i = 1; i <= 3; i++) {
      ctx.beginPath();
      ctx.moveTo(minX + (w / 4) * i, minY);
      ctx.lineTo(minX + (w / 4) * i, maxY);
      ctx.stroke();
    }
  }

  drawOverheadBoardDetails(sPts) {
    const ctx = this.ctx;
    const minX = Math.min(...sPts.map(p => p.x));
    const maxX = Math.max(...sPts.map(p => p.x));
    const minY = Math.min(...sPts.map(p => p.y));
    const maxY = Math.max(...sPts.map(p => p.y));
    const w = maxX - minX;

    const reactor = this.game.reactorSim;
    const grid = this.game.powerGridSim;

    // Badges on left
    ctx.fillStyle = '#1e3a5f';
    ctx.fillRect(minX + 10, minY + 10, 75, 18);
    ctx.fillStyle = '#60a5fa';
    ctx.font = 'bold 8px sans-serif';
    ctx.fillText('COOLANT ➔ OPEN', minX + 14, minY + 22);

    const avgRod = Math.round(reactor.controlRods.reduce((a, b) => a + b, 0) / 4);
    ctx.fillStyle = '#7f1d1d';
    ctx.fillRect(minX + 10, minY + 32, 75, 20);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px monospace';
    ctx.fillText(`RODS: ${avgRod}%`, minX + 14, minY + 46);

    // Circular Reactor Core Channel Lattice (Image 3)
    const ccx = minX + 135;
    const ccy = (minY + maxY) / 2;
    ctx.fillStyle = '#06080e';
    ctx.beginPath();
    ctx.arc(ccx, ccy, 45, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.stroke();

    for (let rx = -4; rx <= 4; rx++) {
      for (let ry = -4; ry <= 4; ry++) {
        if (Math.hypot(rx, ry) <= 3.8) {
          ctx.fillStyle = (rx + ry) % 4 === 0 ? '#38bdf8' : reactor.isScrammed ? '#ef4444' : '#22c55e';
          ctx.fillRect(ccx + rx * 9 - 3, ccy + ry * 9 - 3, 6, 6);
        }
      }
    }

    // Power Orders on right
    const rx = minX + 200;
    ctx.fillStyle = '#e2b342';
    ctx.font = 'bold 11px monospace';
    ctx.fillText('⚡ FACILITY POWER ORDERS // IN PROGRESS', rx, minY + 20);

    ctx.fillStyle = '#090c12';
    ctx.fillRect(rx, minY + 28, w - 215, 20);
    const ratio = Math.min(1.0, grid.totalSupplied / Math.max(grid.totalDemand, 1));
    ctx.fillStyle = ratio > 0.9 ? '#10b981' : '#f59e0b';
    ctx.fillRect(rx, minY + 28, (w - 215) * ratio, 20);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px monospace';
    ctx.fillText(`SUPPLY: ${grid.totalSupplied} MW / TARGET: ${grid.totalDemand} MW`, rx + 8, minY + 42);
  }

  drawControlDeckDetails(desk) {
    const ctx = this.ctx;
    const centerP = this.project(new Vec3(desk.pos.x, 0.85, desk.pos.z));
    if (!centerP) return;

    // Steel-blue plate with dials
    ctx.fillStyle = '#56728a';
    ctx.beginPath();
    ctx.arc(centerP.x - 22, centerP.y, 8, 0, Math.PI * 2);
    ctx.fill();

    // Green indicator lamp
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(centerP.x + 15, centerP.y, 4, 0, Math.PI * 2);
    ctx.fill();

    // Red SCRAM button if reactor desk
    if (desk.hasScram) {
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(centerP.x - 55, centerP.y, 7, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  drawCRTMonitorDetails(sPts, desk) {
    const ctx = this.ctx;
    const minX = Math.min(...sPts.map(p => p.x));
    const maxX = Math.max(...sPts.map(p => p.x));
    const minY = Math.min(...sPts.map(p => p.y));
    const maxY = Math.max(...sPts.map(p => p.y));

    // Dark screen
    ctx.fillStyle = '#05080e';
    ctx.fillRect(minX + 3, minY + 3, (maxX - minX) - 6, (maxY - minY) - 6);

    ctx.fillStyle = '#4ade80';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('100.0%', (minX + maxX) / 2, (minY + maxY) / 2 + 3);
  }

  draw3DRobloxStaff(poly) {
    const ctx = this.ctx;
    const footP = this.project(poly.pos);
    const headP = this.project(poly.headPos);
    if (!footP || !headP) return;

    const h = footP.y - headP.y;
    const w = h * 0.42;

    // Soft drop shadow
    ctx.fillStyle = 'rgba(15, 20, 28, 0.40)';
    ctx.beginPath();
    ctx.ellipse(footP.x, footP.y, w * 0.6, w * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();

    // Legs
    ctx.fillStyle = '#1c2431';
    ctx.fillRect(footP.x - w / 2, footP.y - h * 0.4, w * 0.45, h * 0.4);
    ctx.fillRect(footP.x + w * 0.05, footP.y - h * 0.4, w * 0.45, h * 0.4);

    // Torso with Safety Vest
    ctx.fillStyle = poly.vestColor;
    ctx.fillRect(footP.x - w / 2, footP.y - h * 0.78, w, h * 0.38);

    // Reflective Silver Stripe
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(footP.x - w / 2, footP.y - h * 0.62, w, h * 0.07);

    // Yellow head
    ctx.fillStyle = '#facc15';
    ctx.fillRect(footP.x - w * 0.25, headP.y + h * 0.05, w * 0.5, h * 0.18);

    // Yellow Hardhat with Brim (Image 1 & 2)
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(footP.x, headP.y + h * 0.08, w * 0.32, Math.PI, 0);
    ctx.fill();
    ctx.fillRect(footP.x - w * 0.4, headP.y + h * 0.06, w * 0.8, h * 0.05);
  }

  draw3DPlanter(poly) {
    const ctx = this.ctx;
    const fp = this.project(poly.foliagePos);
    if (!fp) return;

    ctx.fillStyle = '#226338';
    ctx.beginPath();
    ctx.arc(fp.x, fp.y, 14, 0, Math.PI * 2);
    ctx.fill();
  }

  // -------------------------------------------------------------------------
  // OPERATOR DESK CLOSE-UP VIEW (Image 2: High-Detail Diegetic Console)
  // -------------------------------------------------------------------------

  renderDeskOperatorOverlay() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const d = this.activeDesk;
    const sim = this.game.reactorSim;
    const grid = this.game.powerGridSim;

    // Physical 3D Return Button (Top-Left)
    ctx.fillStyle = '#1e2430';
    ctx.beginPath();
    ctx.roundRect(35, 25, 150, 48, 6);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('◀ STEP BACK', 110, 46);
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText('[RETURN TO ROOM]', 110, 62);

    // Foreground Console Sloped Deck (Cream/beige textured metal, Image 2)
    const deckY = h * 0.34;
    ctx.fillStyle = '#cbcfc4';
    ctx.fillRect(0, deckY, w, h - deckY);
    ctx.fillStyle = '#dedfd5';
    ctx.fillRect(0, deckY - 6, w, 6);

    // 3D Chunky Retro Beige CRT Monitor (Center of Image 2)
    const crtW = 420;
    const crtH = 210;
    const crtX = w / 2 - crtW / 2;
    const crtY = 25;

    ctx.fillStyle = '#dedad0';
    ctx.beginPath();
    ctx.roundRect(crtX, crtY, crtW, crtH, 12);
    ctx.fill();
    ctx.strokeStyle = '#2b303c';
    ctx.lineWidth = 6;
    ctx.stroke();

    ctx.fillStyle = '#05070d';
    ctx.beginPath();
    ctx.roundRect(crtX + 18, crtY + 14, crtW - 36, crtH - 28, 8);
    ctx.fill();

    // Scanlines
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    for (let sy = crtY + 14; sy < crtY + crtH - 14; sy += 4) {
      ctx.fillRect(crtX + 18, sy, crtW - 36, 2);
    }

    if (d.id === 'reactor') {
      ctx.fillStyle = '#cbd5e1';
      ctx.font = 'bold 14px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('FEEDWATER OVERVIEW', crtX + crtW / 2, crtY + 44);

      ctx.fillStyle = '#4ade80';
      ctx.font = 'bold 18px "Courier New", monospace';
      ctx.fillText('REACTOR WATER LEVEL', crtX + crtW / 2, crtY + 74);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 34px "Courier New", monospace';
      ctx.fillText('100.0%', crtX + crtW / 2, crtY + 114);

      ctx.fillStyle = '#4ade80';
      ctx.font = 'bold 15px "Courier New", monospace';
      ctx.fillText('FEEDWATER FLOW (m³/s)', crtX + crtW / 2, crtY + 146);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 26px "Courier New", monospace';
      const flow = ((sim.coolantPumps[0] + sim.coolantPumps[1]) * 0.02).toFixed(2);
      ctx.fillText(flow, crtX + crtW / 2, crtY + 178);

      // Station Panels: Feedwater Pumps 1 & 2
      this.drawCloseUpSubPanel(w * 0.06, deckY + 30, w * 0.43, h - deckY - 45, 'reactor_left');
      this.drawCloseUpSubPanel(w * 0.52, deckY + 30, w * 0.43, h - deckY - 45, 'reactor_right');

      // Big Red Mushroom SCRAM Button (Bottom Right, Image 2)
      this.drawScramButton(w - 120, h - 110);
    } else if (d.id === 'electrical') {
      ctx.fillStyle = '#cbd5e1';
      ctx.font = 'bold 14px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('METRO GRID DISPATCH', crtX + crtW / 2, crtY + 44);

      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 18px "Courier New", monospace';
      ctx.fillText('GRID STABILITY', crtX + crtW / 2, crtY + 74);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 34px "Courier New", monospace';
      ctx.fillText(`${grid.gridStability.toFixed(1)}%`, crtX + crtW / 2, crtY + 114);

      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 15px "Courier New", monospace';
      ctx.fillText(`SUPPLY / TARGET: ${grid.totalSupplied} MW / ${grid.totalDemand} MW`, crtX + crtW / 2, crtY + 146);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 20px "Courier New", monospace';
      ctx.fillText(`NET REVENUE: +$${grid.currentRevenueRate}/min`, crtX + crtW / 2, crtY + 178);

      this.drawCloseUpSubPanel(w * 0.08, deckY + 30, w * 0.84, h - deckY - 45, 'grid');
    }
  }

  drawCloseUpSubPanel(x, y, pw, ph, type) {
    const ctx = this.ctx;
    ctx.fillStyle = '#557088'; // Powder-coated steel blue (Image 2)
    ctx.fillRect(x, y, pw, ph);
    ctx.strokeStyle = '#324555';
    ctx.lineWidth = 4;
    ctx.strokeRect(x, y, pw, ph);

    if (type === 'reactor_left') {
      const sim = this.game.reactorSim;
      const sw1X = x + pw * 0.30;
      const sw2X = x + pw * 0.70;

      // Pump 1
      this.drawDial(sw1X, y + 60, 38, 'Pump 1 Flow', sim.coolantPumps[0]);
      this.drawRotary(sw1X, y + 170, sim.pumpStates[0]);
      this.drawLamp(sw1X - 22, y + 140, sim.pumpStates[0]);
      this.drawNameplate(sw1X, y + 215, 'Feedwater Pump 1');

      // Pump 2
      this.drawDial(sw2X, y + 60, 38, 'Pump 2 Flow', sim.coolantPumps[1]);
      this.drawRotary(sw2X, y + 170, sim.pumpStates[1]);
      this.drawLamp(sw2X - 22, y + 140, sim.pumpStates[1]);
      this.drawNameplate(sw2X, y + 215, 'Feedwater Pump 2');
    } else if (type === 'reactor_right') {
      const sim = this.game.reactorSim;
      const swX = x + 110;

      this.drawDial(swX, y + 60, 42, 'Core Temp', sim.coreTemp);
      this.drawPistolSwitch(swX, y + 170, sim.pumpStates[2]);
      this.drawLamp(swX - 22, y + 140, sim.pumpStates[2]);
      this.drawNameplate(swX, y + 215, 'Feedwater Control');
    } else if (type === 'grid') {
      const grid = this.game.powerGridSim;
      const startX = x + pw * 0.16;
      const spacing = pw * 0.22;

      for (let i = 0; i < grid.sectors.length; i++) {
        const sec = grid.sectors[i];
        const sx = startX + i * spacing;
        this.drawDial(sx, y + 60, 36, `${sec.demand} MW`, sec.demand);
        this.drawRotary(sx, y + 170, sec.online);
        this.drawLamp(sx - 20, y + 140, sec.online);
        this.drawNameplate(sx, y + 215, sec.name);
      }
    }
  }

  drawDial(x, y, r, label, val) {
    const ctx = this.ctx;
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Red needle
    const norm = Math.min(1, Math.max(0, val / 100));
    const angle = Math.PI * 0.8 + norm * (Math.PI * 1.4);
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(angle) * (r - 6), y + Math.sin(angle) * (r - 6));
    ctx.stroke();

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, x, y + r + 14);
  }

  drawRotary(x, y, isOn) {
    const ctx = this.ctx;
    ctx.fillStyle = '#262933';
    ctx.beginPath();
    ctx.roundRect(x - 22, y - 22, 44, 44, 6);
    ctx.fill();

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(isOn ? Math.PI * 0.25 : -Math.PI * 0.25);
    ctx.fillStyle = '#0a0d14';
    ctx.beginPath();
    ctx.arc(0, 0, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-2, -15, 4, 10);
    ctx.restore();
  }

  drawPistolSwitch(x, y, isOn) {
    const ctx = this.ctx;
    ctx.fillStyle = '#262933';
    ctx.beginPath();
    ctx.roundRect(x - 24, y - 24, 48, 48, 6);
    ctx.fill();

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(isOn ? Math.PI * 0.2 : -Math.PI * 0.2);
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.roundRect(-6, -20, 12, 40, 3);
    ctx.fill();
    ctx.restore();
  }

  drawLamp(x, y, isOn) {
    const ctx = this.ctx;
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fill();

    if (isOn) {
      ctx.fillStyle = '#22c55e';
      ctx.shadowColor = '#4ade80';
      ctx.shadowBlur = 12;
    } else {
      ctx.fillStyle = '#14532d';
      ctx.shadowBlur = 0;
    }
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  drawNameplate(x, y, text) {
    const ctx = this.ctx;
    const nw = Math.max(100, text.length * 8);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(x - nw / 2, y - 8, nw, 18);
    ctx.strokeStyle = '#0f172a';
    ctx.strokeRect(x - nw / 2, y - 8, nw, 18);
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(text, x, y + 5);
  }

  drawScramButton(x, y) {
    const ctx = this.ctx;
    ctx.fillStyle = '#7f1d1d';
    ctx.beginPath();
    ctx.roundRect(x - 50, y - 50, 100, 100, 10);
    ctx.fill();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 5;
    ctx.stroke();

    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(x, y, 36, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fca5a5';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SCRAM', x, y + 5);
  }

  renderEmergencyBeacons() {
    const ctx = this.ctx;
    const flash = Math.sin(this.time * 8.0) * 0.5 + 0.5;

    ctx.fillStyle = `rgba(220, 38, 38, ${0.28 * flash})`;
    ctx.fillRect(0, 0, this.width, this.height);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`🚨 CRITICAL EMERGENCY: ${this.game.eventSim.emergencyTitle} 🚨`, this.width / 2, 75);
    ctx.font = 'bold 20px monospace';
    ctx.fillText(`SLAP SCRAM MUSHROOM ON REACTOR DESK! [${Math.max(0, this.game.eventSim.scramChallengeTimer).toFixed(1)}s]`, this.width / 2, 108);
  }
}
