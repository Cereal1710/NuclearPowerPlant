/**
 * Canvas3DEngine.js - High-Fidelity 100% 3D Simulation Engine (Zero WebGL)
 * Faithfully recreates the authentic Roblox Nuclear Power Plant Simulator / Scram
 * aesthetic matching user screenshots Image 1, 2, 3, 4.
 *
 * All graphics are 100% diegetic in-world 3D rendered directly via HTML5 Canvas 2D
 * software rasterizer with true isometric perspective, ambient shading, drop shadows,
 * chunky Roblox-style blocky characters, modular beige consoles, and retro CRT monitors.
 */

export class Canvas3DEngine {
  constructor(game, canvas) {
    this.game = game;
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    this.width = window.innerWidth;
    this.height = window.innerHeight;

    // Camera state
    this.mode = 'overview'; // 'overview' | 'desk'
    this.activeDesk = null;

    this.cam = {
      x: 0,
      y: 0,
      zoom: 1.0,
      targetX: 0,
      targetY: 0,
      targetZoom: 1.0
    };

    // Desk definitions with 3D room coordinates (X: left-right, Z: near-far)
    this.desks = [
      {
        id: 'reactor',
        title: 'REACTOR PRIMARY',
        subtitle: 'Core Thermal & Scram',
        rx: -160,
        rz: -20,
        matColor: '#b7a282',
        matW: 240,
        matH: 150,
        hasScram: true,
        crtTitle: 'FEEDWATER OVERVIEW'
      },
      {
        id: 'electrical',
        title: 'GRID CONTROL',
        subtitle: 'Metro Power Dispatch',
        rx: -90,
        rz: 150,
        matColor: '#baa785',
        matW: 230,
        matH: 120,
        crtTitle: 'METRO GRID DISPATCH'
      },
      {
        id: 'shift',
        title: 'SHIFT MANAGER',
        subtitle: 'Personnel Logistics',
        rx: 230,
        rz: 110,
        matColor: '#6d9aa6', // Distinct slate teal mat from Image 1
        matW: 190,
        matH: 120,
        crtTitle: 'STAFF LOGISTICS'
      },
      {
        id: 'maintenance',
        title: 'TURBINES & GENERATOR',
        subtitle: 'Steam Turbines 01/02',
        rx: 170,
        rz: -30,
        matColor: '#bf7d70', // Salmon/coral mat from Image 1
        matW: 200,
        matH: 130,
        crtTitle: 'TURBINE GOVERNOR'
      },
      {
        id: 'safety',
        title: 'SAFETY MONITORING',
        subtitle: 'Radiation Surveillance',
        rx: 40,
        rz: -70,
        matColor: '#7b9684', // Sage green mat
        matW: 190,
        matH: 120,
        crtTitle: 'RADIATION AUDIT'
      },
      {
        id: 'waste',
        title: 'WASTE MANAGEMENT',
        subtitle: 'Spent Fuel Storage',
        rx: 310,
        rz: -40,
        matColor: '#beaf84',
        matW: 180,
        matH: 120,
        crtTitle: 'SPENT FUEL POOL'
      }
    ];

    this.hoveredDesk = null;
    this.mouse = { x: -999, y: -999 };
    this.time = 0;

    // Pre-calculate screen coordinates for desks
    this.updateDeskScreenCoords();

    this.setupListeners();
    this.onResize();
  }

  // 3D Isometric projection helper: transforms room (rx, ry, rz) to 2D screen (sx, sy)
  project3D(rx, ry, rz, cx, cy) {
    // Elevated perspective matching Image 1
    const isoX = (rx - rz * 0.45) * 1.55;
    const isoY = (rx * 0.15 + rz * 0.95) * 1.05 - ry * 1.4;
    return {
      x: cx + isoX,
      y: cy + 40 + isoY,
      depth: rz * 10 + rx
    };
  }

  updateDeskScreenCoords() {
    const cx = this.width / 2;
    const cy = this.height / 2;
    for (const d of this.desks) {
      const p = this.project3D(d.rx, 0, d.rz, cx, cy);
      d.sx = p.x;
      d.sy = p.y;
    }
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
    this.updateDeskScreenCoords();
  }

  transitionToDesk(desk) {
    this.mode = 'desk';
    this.activeDesk = desk;
    this.cam.targetX = desk.sx - this.width / 2;
    this.cam.targetY = desk.sy - this.height / 2;
    this.cam.targetZoom = 1.6;
  }

  returnToOverview() {
    this.mode = 'overview';
    this.activeDesk = null;
    this.cam.targetX = 0;
    this.cam.targetY = 0;
    this.cam.targetZoom = 1.0;
  }

  checkHover() {
    let cursor = 'default';
    if (this.mode === 'overview') {
      let found = null;
      for (const d of this.desks) {
        if (Math.abs(this.mouse.x - d.sx) < 95 && Math.abs(this.mouse.y - d.sy) < 65) {
          found = d;
          cursor = 'pointer';
          break;
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
        if (Math.abs(mx - d.sx) < 95 && Math.abs(my - d.sy) < 65) {
          this.game.sound.playClick(1150);
          this.transitionToDesk(d);
          return;
        }
      }
    } else if (this.mode === 'desk') {
      // 1. In-World Physical 3D Return Button (Top-Left)
      if (mx >= 35 && mx <= 200 && my >= 25 && my <= 75) {
        this.game.sound.playClick(850);
        this.returnToOverview();
        return;
      }

      // 2. Desk-Specific Controls
      this.handleDeskControlsClick(mx, my);
    }
  }

  handleDeskControlsClick(mx, my) {
    const d = this.activeDesk;
    if (!d) return;

    if (d.id === 'reactor') {
      // SCRAM Mushroom Button (Bottom Right)
      const scramX = this.width - 130;
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

      // Reset Trip Button
      if (this.game.reactorSim.isScrammed) {
        const rstX = this.width / 2 - 120;
        const rstY = this.height - 65;
        if (mx >= rstX && mx <= rstX + 240 && my >= rstY && my <= rstY + 44) {
          if (this.game.reactorSim.resetTrip()) {
            this.game.sound.playSuccess();
            this.game.eventSim.addLog('Reactor interlocks reset. Resuming normal operations.');
          } else {
            this.game.sound.playError();
          }
          return;
        }
      }

      // Pump 1 Switch
      const p1X = this.width * 0.22;
      const p1Y = this.height * 0.72;
      if (Math.hypot(mx - p1X, my - p1Y) < 38) {
        this.game.reactorSim.togglePump(0);
        this.game.sound.playHeavySwitch();
        return;
      }

      // Pump 2 Switch
      const p2X = this.width * 0.40;
      const p2Y = this.height * 0.72;
      if (Math.hypot(mx - p2X, my - p2Y) < 38) {
        this.game.reactorSim.togglePump(1);
        this.game.sound.playHeavySwitch();
        return;
      }

      // Feedwater Control Master Switch
      const p3X = this.width * 0.65;
      const p3Y = this.height * 0.72;
      if (Math.hypot(mx - p3X, my - p3Y) < 38) {
        this.game.reactorSim.togglePump(2);
        this.game.sound.playHeavySwitch();
        return;
      }

      // Rod Adjusters
      const rodUpX = this.width * 0.80;
      const rodUpY = this.height * 0.64;
      if (Math.hypot(mx - rodUpX, my - rodUpY) < 28) {
        this.game.reactorSim.adjustAllRods(-10); // Extract rods -> Increase reactivity
        this.game.sound.playMechanicalStep();
        return;
      }
      const rodDnX = this.width * 0.80;
      const rodDnY = this.height * 0.76;
      if (Math.hypot(mx - rodDnX, my - rodDnY) < 28) {
        this.game.reactorSim.adjustAllRods(10); // Insert rods -> Cool down
        this.game.sound.playMechanicalStep();
        return;
      }
    } else if (d.id === 'electrical') {
      // Toggle Grid Sectors
      const sectors = this.game.powerGridSim.sectors;
      const startX = this.width * 0.20;
      const spacing = this.width * 0.16;
      const swY = this.height * 0.72;

      for (let i = 0; i < sectors.length; i++) {
        const sx = startX + i * spacing;
        if (Math.hypot(mx - sx, my - swY) < 36) {
          this.game.powerGridSim.toggleSector(sectors[i].id);
          this.game.sound.playHeavySwitch();
          return;
        }
      }
    } else if (d.id === 'shift') {
      // Hire Technician
      const btn1X = this.width * 0.35;
      const btnY = this.height * 0.72;
      if (Math.hypot(mx - btn1X, my - btnY) < 40) {
        this.game.staffSim.hireStaff('tech');
        this.game.sound.playSuccess();
        return;
      }
      // Trigger Shift Rotation
      const btn2X = this.width * 0.65;
      if (Math.hypot(mx - btn2X, my - btnY) < 40) {
        this.game.shiftNumber++;
        this.game.sound.playMechanicalStep();
        this.game.eventSim.addLog(`Shift rotation complete. Welcome to Shift #${this.game.shiftNumber}!`);
        return;
      }
    } else if (d.id === 'maintenance') {
      // Order Spare Parts
      const btn1X = this.width * 0.35;
      const btnY = this.height * 0.72;
      if (Math.hypot(mx - btn1X, my - btnY) < 40) {
        this.game.maintenanceSim.orderPart('pumps', 1);
        this.game.sound.playSuccess();
        return;
      }
      // Service Turbines
      const btn2X = this.width * 0.65;
      if (Math.hypot(mx - btn2X, my - btnY) < 40) {
        this.game.maintenanceSim.subsystems.forEach(s => s.condition = Math.min(100, s.condition + 20));
        this.game.sound.playMechanicalStep();
        this.game.eventSim.addLog('Mechanical engineers completed turbine maintenance inspection.');
        return;
      }
    } else if (d.id === 'safety') {
      // Run Safety Audit
      const btnX = this.width * 0.5;
      const btnY = this.height * 0.72;
      if (Math.hypot(mx - btnX, my - btnY) < 44) {
        this.game.safetySim.performInternalAudit();
        this.game.sound.playSuccess();
        return;
      }
    } else if (d.id === 'waste') {
      // Transfer Spent Fuel
      const btn1X = this.width * 0.35;
      const btnY = this.height * 0.72;
      if (Math.hypot(mx - btn1X, my - btnY) < 40) {
        this.game.wasteSim.transferToDryCask();
        this.game.sound.playMechanicalStep();
        return;
      }
      // Schedule Convoy
      const btn2X = this.width * 0.65;
      if (Math.hypot(mx - btn2X, my - btnY) < 40) {
        this.game.wasteSim.scheduleOffsiteTransfer();
        this.game.sound.playSuccess();
        return;
      }
    }
  }

  update(dt) {
    this.time += dt;
    const speed = dt * 6.5;
    this.cam.x += (this.cam.targetX - this.cam.x) * speed;
    this.cam.y += (this.cam.targetY - this.cam.y) * speed;
    this.cam.zoom += (this.cam.targetZoom - this.cam.zoom) * speed;
  }

  render() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    ctx.clearRect(0, 0, w, h);

    if (this.mode === 'overview') {
      this.renderOverviewView();
    } else {
      this.renderDeskCloseUpView();
    }
  }

  // =========================================================================
  // VIEW A: 3D ISOMETRIC CONTROL ROOM OVERVIEW (Matching User Screenshot 1 & 3)
  // =========================================================================
  renderOverviewView() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const cx = w / 2;
    const cy = h / 2;

    this.updateDeskScreenCoords();

    // 1. Back Wall and Architectural Enclosure
    ctx.fillStyle = '#262930';
    ctx.fillRect(0, 0, w, h);

    // Wall gradient (industrial dim lighting)
    const wallGrad = ctx.createLinearGradient(0, 0, 0, cy);
    wallGrad.addColorStop(0, '#1c1e24');
    wallGrad.addColorStop(1, '#2c3038');
    ctx.fillStyle = wallGrad;
    ctx.fillRect(0, 0, w, cy - 60);

    // 2. Realistic 3D Perspective Industrial Tiled Floor
    this.drawIsometricFloor(cx, cy);

    // 3. Mezzanine Office Gallery with Windows & Gold Signage (Image 1 Upper Right)
    this.drawMezzanineOffice(cx, cy);

    // 4. Master Overhead Facility Display Board (Image 1 & 3 Upper Left)
    this.drawMasterOverheadBoard(cx, cy);

    // 5. Environmental Props (Planters, Storage Rack, Notice Board)
    this.drawRoomProps(cx, cy);

    // 6. Draw Station Mats and Consoles sorted by depth
    // Depth sorting ensures correct occlusion
    const renderList = [];

    for (const d of this.desks) {
      renderList.push({
        type: 'mat',
        depth: d.rz * 10 + d.rx - 5,
        desk: d
      });
      renderList.push({
        type: 'console',
        depth: d.rz * 10 + d.rx + 5,
        desk: d
      });
    }

    // Add 3D Blocky Staff Minifigures (Roblox Style Image 1)
    renderList.push({
      type: 'staff',
      depth: -20 * 10 - 160 + 8,
      rx: -160,
      rz: -8,
      vestColor: '#ea580c', // Orange safety vest
      pose: 'operator'
    });
    renderList.push({
      type: 'staff',
      depth: -20 * 10 - 210 + 8,
      rx: -210,
      rz: -12,
      vestColor: '#eab308', // Yellow safety vest
      pose: 'operator'
    });
    renderList.push({
      type: 'staff',
      depth: 150 * 10 - 90 + 8,
      rx: -90,
      rz: 165,
      vestColor: '#eab308',
      pose: 'operator'
    });
    renderList.push({
      type: 'staff',
      depth: 110 * 10 + 230 + 8,
      rx: 230,
      rz: 125,
      vestColor: '#0284c7', // Shift Manager Blue
      pose: 'operator'
    });
    renderList.push({
      type: 'staff',
      depth: -30 * 10 + 170 + 8,
      rx: 170,
      rz: -18,
      vestColor: '#ea580c',
      pose: 'operator'
    });
    // Walking operator holding clipboard
    renderList.push({
      type: 'staff',
      depth: 60 * 10 - 280 + 8,
      rx: -270,
      rz: 60,
      vestColor: '#eab308',
      pose: 'clipboard'
    });

    renderList.sort((a, b) => a.depth - b.depth);

    for (const item of renderList) {
      if (item.type === 'mat') {
        const isHovered = this.hoveredDesk === item.desk;
        this.draw3DStationMat(item.desk, cx, cy, isHovered);
      } else if (item.type === 'console') {
        const isHovered = this.hoveredDesk === item.desk;
        this.draw3DConsoleDesk(item.desk, cx, cy, isHovered);
      } else if (item.type === 'staff') {
        const p = this.project3D(item.rx, 0, item.rz, cx, cy);
        this.drawRobloxBlockyCharacter(p.x, p.y, item.vestColor, item.pose);
      }
    }

    // 7. Emergency Flashing Siren Overlay (if incident triggered)
    if (this.game.eventSim.emergencyActive) {
      this.drawEmergencyOverlay();
    }
  }

  // Draw authentic isometric industrial floor with 3D tile seams
  drawIsometricFloor(cx, cy) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    ctx.save();
    // Base floor tone: warm slate grey concrete
    ctx.fillStyle = '#41444c';
    ctx.beginPath();
    ctx.moveTo(0, cy - 70);
    ctx.lineTo(w, cy - 70);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.fill();

    // Perspective depth lines
    ctx.strokeStyle = '#34373e';
    ctx.lineWidth = 1;

    for (let rx = -600; rx <= 600; rx += 70) {
      const p1 = this.project3D(rx, 0, -180, cx, cy);
      const p2 = this.project3D(rx, 0, 320, cx, cy);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }

    for (let rz = -180; rz <= 320; rz += 50) {
      const p1 = this.project3D(-600, 0, rz, cx, cy);
      const p2 = this.project3D(600, 0, rz, cx, cy);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Draw Mezzanine Office Gallery (Upper Right of Image 1)
  drawMezzanineOffice(cx, cy) {
    const ctx = this.ctx;
    const mx = cx + 160;
    const my = 20;
    const mw = 440;
    const mh = 130;

    // Outer concrete beam structure
    ctx.fillStyle = '#22252c';
    ctx.fillRect(mx - 10, my - 10, mw + 20, mh + 20);

    // Stencil Gold Signage on Exterior Wall: "UNIT 01 PRIMARY CONTROL ROOM" (Image 1)
    ctx.fillStyle = '#c5a753'; // Industrial gold stencil
    ctx.font = 'bold 22px "Courier New", monospace';
    ctx.fillText('UNIT 01 PRIMARY', mx + 20, my + 14);
    ctx.font = 'bold 16px "Courier New", monospace';
    ctx.fillText('CONTROL ROOM', mx + 245, my + 14);

    // Dark glass window frame
    ctx.fillStyle = '#111317';
    ctx.fillRect(mx, my + 26, mw, mh - 26);
    ctx.strokeStyle = '#3a3f4b';
    ctx.lineWidth = 3;
    ctx.strokeRect(mx, my + 26, mw, mh - 26);

    // Warm interior office glow
    const officeGrad = ctx.createLinearGradient(mx, my + 26, mx, my + mh);
    officeGrad.addColorStop(0, 'rgba(235, 230, 210, 0.25)');
    officeGrad.addColorStop(1, 'rgba(120, 140, 160, 0.10)');
    ctx.fillStyle = officeGrad;
    ctx.fillRect(mx + 3, my + 29, mw - 6, mh - 32);

    // Vertical window mullions
    for (let i = 1; i <= 3; i++) {
      const wx = mx + (mw / 4) * i;
      ctx.strokeStyle = '#2b303b';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(wx, my + 26);
      ctx.lineTo(wx, my + mh);
      ctx.stroke();
    }

    // Office silhouettes inside (desks, monitors, bookshelves)
    ctx.fillStyle = 'rgba(20, 25, 32, 0.75)';
    ctx.fillRect(mx + 40, my + 75, 70, 25);
    ctx.fillRect(mx + 150, my + 70, 80, 30);
    ctx.fillRect(mx + 280, my + 75, 90, 25);
    // Tiny computer monitor glow inside office
    ctx.fillStyle = 'rgba(147, 197, 253, 0.85)';
    ctx.fillRect(mx + 60, my + 62, 14, 11);
    ctx.fillRect(mx + 175, my + 58, 16, 12);
  }

  // Draw Master Overhead Facility Board (Matching User Image 1 & 3)
  drawMasterOverheadBoard(cx, cy) {
    const ctx = this.ctx;
    const reactor = this.game.reactorSim;
    const grid = this.game.powerGridSim;

    const bx = Math.max(16, cx - 620);
    const by = 14;
    const bw = 700;
    const bh = 180;

    // Hanging steel support rods from ceiling
    ctx.strokeStyle = '#5a6272';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(bx + 40, 0);
    ctx.lineTo(bx + 40, by);
    ctx.moveTo(bx + bw - 40, 0);
    ctx.lineTo(bx + bw - 40, by);
    ctx.stroke();

    // Dark industrial chassis with beveled metal frame
    ctx.fillStyle = '#121419';
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = '#383e4c';
    ctx.lineWidth = 4;
    ctx.strokeRect(bx, by, bw, bh);

    // Left Column: Status Badges (Image 3)
    const lx = bx + 12;
    let ly = by + 12;

    // COOLANT BADGE
    ctx.fillStyle = '#1e3a5f';
    ctx.fillRect(lx, ly, 80, 20);
    ctx.fillStyle = '#60a5fa';
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText('COOLANT ➔ OPEN', lx + 4, ly + 14);

    ly += 25;
    // ROD INSERTION BADGE
    const avgRod = Math.round(reactor.controlRods.reduce((a, b) => a + b, 0) / 4);
    ctx.fillStyle = '#7f1d1d';
    ctx.fillRect(lx, ly, 95, 24);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px monospace';
    ctx.fillText(`RODS: ${avgRod}%`, lx + 6, ly + 16);

    ly += 28;
    // FEEDWATER BADGE
    const activePumps = reactor.pumpStates.filter(Boolean).length;
    ctx.fillStyle = '#4c1d95';
    ctx.fillRect(lx, ly, 95, 22);
    ctx.fillStyle = '#ddd6fe';
    ctx.font = 'bold 10px monospace';
    ctx.fillText(`FEEDWATER ${activePumps}/3`, lx + 6, ly + 15);

    ly += 26;
    // FUEL BADGE
    ctx.fillStyle = '#581c1c';
    ctx.fillRect(lx, ly, 95, 22);
    ctx.fillStyle = '#fca5a5';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('FUEL: 85.2%', lx + 6, ly + 15);

    ly += 26;
    // TELEMETRY BOX: PRES & TEMP
    ctx.fillStyle = '#0a0d14';
    ctx.fillRect(lx, ly, 110, 36);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px monospace';
    ctx.fillText(`PRES: ${(reactor.steamPressure * 10).toFixed(1)} kPa`, lx + 4, ly + 14);
    ctx.fillText(`TEMP: ${(reactor.coreTemp + 273.15).toFixed(1)} K`, lx + 4, ly + 28);

    // CENTER: CIRCULAR REACTOR CORE CHANNEL LATTICE (Image 3)
    const ccx = bx + 185;
    const ccy = by + 90;
    const cr = 58;

    ctx.fillStyle = '#06080e';
    ctx.beginPath();
    ctx.arc(ccx, ccy, cr + 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#27303f';
    ctx.lineWidth = 2;
    ctx.stroke();

    for (let rx = -5; rx <= 5; rx++) {
      for (let ry = -5; ry <= 5; ry++) {
        if (Math.hypot(rx, ry) <= 4.8) {
          const px = ccx + rx * 11;
          const py = ccy + ry * 11;
          let col = '#22c55e'; // Green stable
          if ((rx + ry) % 4 === 0) col = '#38bdf8'; // Blue coolant channel
          if (reactor.coreTemp > 350 && Math.hypot(rx, ry) < 2.5) col = '#f59e0b';
          if (reactor.isScrammed) col = '#ef4444'; // Red SCRAM

          ctx.fillStyle = col;
          ctx.fillRect(px - 3, py - 3, 7, 7);
        }
      }
    }

    // RIGHT: Power Orders & Facility Grid (Image 3)
    const rx = bx + 270;
    let ry = by + 16;

    ctx.fillStyle = '#e2b342';
    ctx.font = 'bold 11px monospace';
    ctx.fillText('⚡ FACILITY POWER ORDERS // IN PROGRESS', rx, ry + 10);

    ry += 20;
    // Supply Bar
    ctx.fillStyle = '#090c12';
    ctx.fillRect(rx, ry, 410, 24);
    const supplyRatio = Math.min(1.0, grid.totalSupplied / Math.max(grid.totalDemand, 1));
    ctx.fillStyle = supplyRatio > 0.9 ? '#10b981' : '#f59e0b';
    ctx.fillRect(rx, ry, 410 * supplyRatio, 24);
    ctx.strokeStyle = '#475569';
    ctx.strokeRect(rx, ry, 410, 24);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px monospace';
    ctx.fillText(`SUPPLY: ${grid.totalSupplied} MW / TARGET: ${grid.totalDemand} MW`, rx + 14, ry + 16);

    ry += 35;
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px monospace';
    ctx.fillText(`INFLOW: +$${grid.currentRevenueRate}/min  |  GRID: ${grid.gridStability.toFixed(1)}%  |  PENALTIES: -$${grid.currentPenaltyRate}/min`, rx, ry + 12);
    ctx.fillText(`SHIFT #${this.game.shiftNumber} // ${this.game.getFormattedTime()}  |  PLANT SAFETY: ${Math.round(this.game.safetySim.safetyIndex)}%`, rx, ry + 30);

    const logText = this.game.eventSim.logs[0] ? this.game.eventSim.logs[0].text : 'ALL PRIMARY CIRCUITS OPERATIONAL';
    ctx.fillStyle = logText.includes('EMERGENCY') ? '#ef4444' : '#38bdf8';
    ctx.font = 'bold 10px monospace';
    ctx.fillText(`[LOG] ${logText.toUpperCase().substring(0, 58)}`, rx, ry + 52);
  }

  // Draw 3D Station Floor Mat (Rectangular area with stencil typography from Image 1)
  draw3DStationMat(desk, cx, cy, isHovered) {
    const ctx = this.ctx;
    const p1 = this.project3D(desk.rx - desk.matW / 2, 0, desk.rz - desk.matH / 2, cx, cy);
    const p2 = this.project3D(desk.rx + desk.matW / 2, 0, desk.rz - desk.matH / 2, cx, cy);
    const p3 = this.project3D(desk.rx + desk.matW / 2, 0, desk.rz + desk.matH / 2, cx, cy);
    const p4 = this.project3D(desk.rx - desk.matW / 2, 0, desk.rz + desk.matH / 2, cx, cy);

    ctx.save();
    ctx.fillStyle = isHovered ? '#38bdf8' : desk.matColor;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.lineTo(p3.x, p3.y);
    ctx.lineTo(p4.x, p4.y);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = isHovered ? '#ffffff' : '#333742';
    ctx.lineWidth = isHovered ? 2.5 : 1;
    ctx.stroke();

    // Stenciled Station Title on the Mat
    const textP = this.project3D(desk.rx, 0, desk.rz + desk.matH / 2 - 12, cx, cy);
    ctx.fillStyle = isHovered ? '#ffffff' : '#1f242c';
    ctx.font = 'bold 11px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(desk.title, textP.x, textP.y);
    ctx.restore();
  }

  // Draw 3D Modular Console Desk (Matching User Image 1: Beige Sloped Desks)
  draw3DConsoleDesk(desk, cx, cy, isHovered) {
    const ctx = this.ctx;
    const cw = desk.id === 'reactor' ? 180 : 160;
    const cd = 48; // depth
    const ch = 38; // height

    // Corner points in 3D: Base on floor (y=0) and Top control deck (y=ch)
    const b1 = this.project3D(desk.rx - cw / 2, 0, desk.rz - cd / 2, cx, cy);
    const b2 = this.project3D(desk.rx + cw / 2, 0, desk.rz - cd / 2, cx, cy);
    const b3 = this.project3D(desk.rx + cw / 2, 0, desk.rz + cd / 2, cx, cy);
    const b4 = this.project3D(desk.rx - cw / 2, 0, desk.rz + cd / 2, cx, cy);

    const t1 = this.project3D(desk.rx - cw / 2, ch + 8, desk.rz - cd / 2, cx, cy);
    const t2 = this.project3D(desk.rx + cw / 2, ch + 8, desk.rz - cd / 2, cx, cy);
    const t3 = this.project3D(desk.rx + cw / 2, ch, desk.rz + cd / 2, cx, cy);
    const t4 = this.project3D(desk.rx - cw / 2, ch, desk.rz + cd / 2, cx, cy);

    ctx.save();

    // 1. Drop shadow on floor
    ctx.fillStyle = 'rgba(15, 18, 24, 0.45)';
    ctx.beginPath();
    ctx.moveTo(b1.x + 8, b1.y + 4);
    ctx.lineTo(b2.x + 8, b2.y + 4);
    ctx.lineTo(b3.x + 12, b3.y + 8);
    ctx.lineTo(b4.x + 12, b4.y + 8);
    ctx.closePath();
    ctx.fill();

    // 2. Front Face of Console (Beige industrial)
    ctx.fillStyle = '#b8b4a7';
    ctx.beginPath();
    ctx.moveTo(b4.x, b4.y);
    ctx.lineTo(b3.x, b3.y);
    ctx.lineTo(t3.x, t3.y);
    ctx.lineTo(t4.x, t4.y);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#2d323b';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 3. Right Side Face of Console
    ctx.fillStyle = '#a19d91';
    ctx.beginPath();
    ctx.moveTo(b3.x, b3.y);
    ctx.lineTo(b2.x, b2.y);
    ctx.lineTo(t2.x, t2.y);
    ctx.lineTo(t3.x, t3.y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 4. Sloped Top Control Deck (Cream/beige with steel-blue panel inserts)
    ctx.fillStyle = isHovered ? '#e8ebf0' : '#dcd8cd';
    ctx.beginPath();
    ctx.moveTo(t1.x, t1.y);
    ctx.lineTo(t2.x, t2.y);
    ctx.lineTo(t3.x, t3.y);
    ctx.lineTo(t4.x, t4.y);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = isHovered ? '#38bdf8' : '#2b303b';
    ctx.lineWidth = isHovered ? 2.5 : 1;
    ctx.stroke();

    // 5. Inset Steel-Blue Instrument Panel on Console Top (Image 2)
    const ip1 = this.project3D(desk.rx - cw / 2 + 12, ch + 6, desk.rz - cd / 2 + 6, cx, cy);
    const ip2 = this.project3D(desk.rx + cw / 2 - 12, ch + 6, desk.rz - cd / 2 + 6, cx, cy);
    const ip3 = this.project3D(desk.rx + cw / 2 - 12, ch + 2, desk.rz + cd / 2 - 8, cx, cy);
    const ip4 = this.project3D(desk.rx - cw / 2 + 12, ch + 2, desk.rz + cd / 2 - 8, cx, cy);

    ctx.fillStyle = '#536d85'; // Steel-blue from Image 2
    ctx.beginPath();
    ctx.moveTo(ip1.x, ip1.y);
    ctx.lineTo(ip2.x, ip2.y);
    ctx.lineTo(ip3.x, ip3.y);
    ctx.lineTo(ip4.x, ip4.y);
    ctx.closePath();
    ctx.fill();

    // Dials and Indicator Lamps on console
    const centerP = this.project3D(desk.rx - 25, ch + 4, desk.rz, cx, cy);
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(centerP.x, centerP.y, 5, 0, Math.PI * 2);
    ctx.fill();

    const lampP = this.project3D(desk.rx + 15, ch + 4, desk.rz, cx, cy);
    ctx.fillStyle = '#22c55e'; // Green glowing LED
    ctx.beginPath();
    ctx.arc(lampP.x, lampP.y, 3, 0, Math.PI * 2);
    ctx.fill();

    // Red SCRAM button if Reactor desk
    if (desk.hasScram) {
      const scramP = this.project3D(desk.rx - cw / 2 + 25, ch + 4, desk.rz, cx, cy);
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(scramP.x, scramP.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // 6. Mini 3D CRT Monitor Mounted on Console (Beige housing with green text)
    const crtP = this.project3D(desk.rx + cw / 2 - 35, ch + 14, desk.rz - 10, cx, cy);
    ctx.fillStyle = '#dedad0';
    ctx.fillRect(crtP.x - 14, crtP.y - 12, 28, 20);
    ctx.strokeStyle = '#1e242d';
    ctx.lineWidth = 1;
    ctx.strokeRect(crtP.x - 14, crtP.y - 12, 28, 20);

    ctx.fillStyle = '#05080e';
    ctx.fillRect(crtP.x - 11, crtP.y - 9, 22, 14);
    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 6px monospace';
    ctx.fillText('100%', crtP.x - 8, crtP.y + 1);

    // 7. Stanchion Signpost Rising behind Reactor Console (Image 1: "Reactor Operations")
    if (desk.id === 'reactor') {
      const sp = this.project3D(desk.rx - 50, ch + 28, desk.rz - cd / 2, cx, cy);
      ctx.fillStyle = '#e2dfd5';
      ctx.fillRect(sp.x - 22, sp.y - 16, 44, 16);
      ctx.strokeStyle = '#272b34';
      ctx.strokeRect(sp.x - 22, sp.y - 16, 44, 16);
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 6px sans-serif';
      ctx.fillText('FEEDWATER', sp.x - 18, sp.y - 6);
    }

    // 8. Swivel Mesh Chair behind Grid Control Desk (Image 1)
    if (desk.id === 'electrical') {
      const cp = this.project3D(desk.rx, 0, desk.rz + cd / 2 + 25, cx, cy);
      ctx.fillStyle = '#2b2f38';
      ctx.beginPath();
      ctx.ellipse(cp.x, cp.y - 18, 11, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(cp.x - 9, cp.y - 36, 18, 18);
    }

    ctx.restore();
  }

  // Draw Roblox-Style 3D Blocky Minifigures (Image 1 & 2)
  drawRobloxBlockyCharacter(px, py, vestColor, pose) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(px, py);

    // 1. Soft Drop Shadow
    ctx.fillStyle = 'rgba(15, 20, 28, 0.40)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 16, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Blocky Legs (Dark Navy work pants)
    ctx.fillStyle = '#1c2431';
    ctx.fillRect(-11, -28, 10, 28);
    ctx.fillRect(1, -28, 10, 28);
    // Shoes
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-12, -4, 11, 5);
    ctx.fillRect(1, -4, 11, 5);

    // 3. Blocky Torso with High-Vis Safety Vest (Image 1 & 2)
    ctx.fillStyle = vestColor; // Neon orange or yellow
    ctx.fillRect(-13, -56, 26, 28);

    // Reflective Silver Horizontal Safety Band
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(-13, -44, 26, 5);

    // 4. Blocky Arms
    ctx.fillStyle = vestColor;
    if (pose === 'clipboard') {
      // One arm holding white clipboard
      ctx.fillRect(-19, -54, 7, 22);
      ctx.fillRect(12, -54, 7, 16);
      // White clipboard
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(10, -44, 14, 18);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.strokeRect(10, -44, 14, 18);
      // Yellow block hand
      ctx.fillStyle = '#facc15';
      ctx.fillRect(13, -40, 6, 6);
    } else {
      ctx.fillRect(-19, -54, 7, 22);
      ctx.fillRect(12, -54, 7, 22);
      // Yellow block hands
      ctx.fillStyle = '#facc15';
      ctx.fillRect(-19, -32, 7, 6);
      ctx.fillRect(12, -32, 7, 6);
    }

    // 5. Cylindrical Yellow Head (Roblox aesthetic)
    ctx.fillStyle = '#facc15';
    ctx.fillRect(-7, -70, 14, 14);

    // Simple facial features
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-4, -64, 2, 3);
    ctx.fillRect(2, -64, 2, 3);

    // 6. 3D Yellow Safety Hardhat Helmet with Brim (Image 1 & 2)
    ctx.fillStyle = '#facc15';
    // Helmet dome
    ctx.beginPath();
    ctx.arc(0, -70, 10, Math.PI, 0);
    ctx.fill();
    // Helmet rim / visor
    ctx.fillRect(-12, -71, 24, 3.5);
    // Helmet crown highlight
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(-4, -78, 8, 3);

    ctx.restore();
  }

  // Draw Environmental Props (Planters with foliage, storage wire rack)
  drawRoomProps(cx, cy) {
    const ctx = this.ctx;

    // Planters with green tropical plants (Left perimeter)
    this.drawPlanter(cx - 520, cy + 30);
    this.drawPlanter(cx - 520, cy + 220);
    // Planters on bottom/right
    this.drawPlanter(cx + 480, cy + 260);

    // Metal Industrial Storage Rack on Right Wall (Image 1)
    const rx = cx + 490;
    const ry = cy - 20;
    ctx.fillStyle = '#64748b';
    ctx.fillRect(rx, ry, 6, 90);
    ctx.fillRect(rx + 60, ry, 6, 90);
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(rx, ry + i * 26, 66, 4);
      // Storage boxes & white binders on shelves
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(rx + 10, ry + i * 26 - 16, 18, 16);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(rx + 32, ry + i * 26 - 14, 22, 14);
      ctx.fillStyle = '#64748b';
    }

    // Cylindrical Steel Trash Can in Bottom-Left Corner (Image 1)
    const tx = cx - 480;
    const ty = cy + 330;
    ctx.fillStyle = '#788294';
    ctx.fillRect(tx - 12, ty - 26, 24, 26);
    ctx.strokeStyle = '#383e4c';
    ctx.strokeRect(tx - 12, ty - 26, 24, 26);
    // Wire mesh stripes
    ctx.fillStyle = '#475569';
    for (let sy = ty - 22; sy < ty; sy += 5) {
      ctx.fillRect(tx - 10, sy, 20, 1.5);
    }
  }

  drawPlanter(px, py) {
    const ctx = this.ctx;
    // Grey stone trough
    ctx.fillStyle = '#333742';
    ctx.fillRect(px - 22, py - 12, 44, 24);
    ctx.strokeStyle = '#1e222a';
    ctx.lineWidth = 2;
    ctx.strokeRect(px - 22, py - 12, 44, 24);

    // Lush green leafy foliage
    ctx.fillStyle = '#226338';
    ctx.beginPath();
    ctx.arc(px - 10, py - 14, 14, 0, Math.PI * 2);
    ctx.arc(px + 10, py - 16, 15, 0, Math.PI * 2);
    ctx.arc(px, py - 18, 16, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#348b4d';
    ctx.beginPath();
    ctx.arc(px - 4, py - 18, 10, 0, Math.PI * 2);
    ctx.arc(px + 6, py - 20, 11, 0, Math.PI * 2);
    ctx.fill();
  }

  drawEmergencyOverlay() {
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

  // =========================================================================
  // VIEW B: OPERATOR CONSOLE CLOSE-UP (Exact 1:1 recreation of User Image 2)
  // =========================================================================
  renderDeskCloseUpView() {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;
    const d = this.activeDesk;
    if (!d) return;

    // 1. Background environment (visible above console: poster board with mascot & plant)
    this.drawConsoleBackgroundEnvironment(w, h);

    // 2. Sloped Console Deck Surface (Cream/beige textured industrial metal)
    const deckY = h * 0.32;
    ctx.fillStyle = '#cbcfc4'; // Cream/beige from Image 2
    ctx.fillRect(0, deckY, w, h - deckY);

    // Beveled console upper rim
    ctx.fillStyle = '#dedfd5';
    ctx.fillRect(0, deckY - 8, w, 8);
    ctx.strokeStyle = '#474c55';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, deckY - 8);
    ctx.lineTo(w, deckY - 8);
    ctx.stroke();

    // 3. Render Station-Specific Sub-Panels & CRT Monitor
    if (d.id === 'reactor') {
      this.renderReactorCloseUp(w, h, deckY);
    } else if (d.id === 'electrical') {
      this.renderElectricalCloseUp(w, h, deckY);
    } else if (d.id === 'shift') {
      this.renderShiftCloseUp(w, h, deckY);
    } else if (d.id === 'maintenance') {
      this.renderMaintenanceCloseUp(w, h, deckY);
    } else if (d.id === 'safety') {
      this.renderSafetyCloseUp(w, h, deckY);
    } else if (d.id === 'waste') {
      this.renderWasteCloseUp(w, h, deckY);
    }

    // 4. In-World Physical 3D Return Button (Top-Left)
    this.drawPhysicalBackButton();
  }

  // Background environment behind the console (Image 2)
  drawConsoleBackgroundEnvironment(w, h) {
    const ctx = this.ctx;
    // Control room backdrop
    ctx.fillStyle = '#373c45';
    ctx.fillRect(0, 0, w, h * 0.34);

    // White safety poster board on the left (Image 2)
    const pw = 280;
    const ph = 200;
    const px = w * 0.15;
    const py = 10;
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(px, py, pw, ph);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 3;
    ctx.strokeRect(px, py, pw, ph);

    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('Reactor Operations Facility', px + 20, py + 28);
    ctx.fillStyle = '#64748b';
    ctx.font = '10px sans-serif';
    ctx.fillText('Neutron Energy Corp. Safety Guidelines', px + 20, py + 45);

    // Mascot with hardhat on poster (Image 2)
    const mx = px + 200;
    const my = py + 85;
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(mx, my, 22, 0, Math.PI * 2);
    ctx.fill();
    // Hardhat
    ctx.fillRect(mx - 24, my - 26, 48, 8);
    ctx.beginPath();
    ctx.arc(mx, my - 22, 18, Math.PI, 0);
    ctx.fill();
    // Safety vest
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(mx - 18, my + 14, 36, 26);
  }

  // REACTOR DESK CLOSE-UP (Exact recreation of Image 2)
  renderReactorCloseUp(w, h, deckY) {
    const ctx = this.ctx;
    const sim = this.game.reactorSim;

    // Modular Steel-Blue Inset Panels (Image 2)
    const panelY = deckY + 30;
    const panelH = h - panelY - 40;

    // Panel 1: Feedwater Pumps 1 & 2
    const p1X = w * 0.05;
    const p1W = w * 0.44;
    this.drawSteelBluePanel(p1X, panelY, p1W, panelH);

    // Panel 2: Feedwater Control & Master Loop
    const p2X = p1X + p1W + 24;
    const p2W = w * 0.45;
    this.drawSteelBluePanel(p2X, panelY, p2W, panelH);

    // Gauges on Panel 1 (Feedwater Pump 1 & 2)
    const sw1X = p1X + p1W * 0.30;
    const sw2X = p1X + p1W * 0.70;

    // Pump 1: Vertical Gauge, Dials, Rotary Switch, Indicator Lamp, Nameplate
    this.drawLargeVerticalGauge(p1X + 45, panelY + 30, 32, 180, sim.coolantPumps[0], 0, 100);
    this.drawCircularDial(sw1X, panelY + 65, 42, 'Flow (m³/s)', (sim.coolantPumps[0] * 0.02).toFixed(1), sim.coolantPumps[0], 0, 100);
    this.drawCircularDial(sw1X, panelY + 165, 42, 'Pump 1 RPM', Math.round(sim.coolantPumps[0] * 32), sim.coolantPumps[0], 0, 100);

    this.drawIndicatorLamp(sw1X - 25, panelY + 235, sim.pumpStates[0]);
    this.drawRotarySwitch(sw1X, panelY + 270, sim.pumpStates[0]);
    this.drawNameplate(sw1X, panelY + 325, 'Feedwater Pump 1');

    // Pump 2: Vertical Gauge, Dials, Rotary Switch, Indicator Lamp, Nameplate
    this.drawLargeVerticalGauge(p1X + p1W * 0.50, panelY + 30, 32, 180, sim.coolantPumps[1], 0, 100);
    this.drawCircularDial(sw2X, panelY + 65, 42, 'Flow (m³/s)', (sim.coolantPumps[1] * 0.02).toFixed(1), sim.coolantPumps[1], 0, 100);
    this.drawCircularDial(sw2X, panelY + 165, 42, 'Pump 2 RPM', Math.round(sim.coolantPumps[1] * 32), sim.coolantPumps[1], 0, 100);

    this.drawIndicatorLamp(sw2X - 25, panelY + 235, sim.pumpStates[1]);
    this.drawRotarySwitch(sw2X, panelY + 270, sim.pumpStates[1]);
    this.drawNameplate(sw2X, panelY + 325, 'Feedwater Pump 2');

    // Panel 2: Master Feedwater Control Switch & Safety Dials
    const sw3X = p2X + 110;
    this.drawCircularDial(sw3X, panelY + 65, 44, 'Core Pressure', `${(sim.steamPressure * 10).toFixed(0)} kPa`, sim.steamPressure, 0, 150);
    this.drawCircularDial(sw3X, panelY + 165, 44, 'Core Temp', `${Math.round(sim.coreTemp + 273)} K`, sim.coreTemp, 250, 400);

    this.drawIndicatorLamp(sw3X - 25, panelY + 235, sim.pumpStates[2]);
    this.drawYellowPistolSwitch(sw3X, panelY + 270, sim.pumpStates[2]); // Yellow safety switch (Image 2)
    this.drawNameplate(sw3X, panelY + 325, 'Feedwater Control');

    // Control Rod Drive Controls
    const rodX = p2X + p2W - 120;
    this.drawControlRodBlock(rodX, panelY + 50, sim);

    // 3D Chunky Retro Beige CRT Monitor (Center of Image 2)
    this.drawChunkyCRTMonitor(w / 2 - 220, 24, 440, 210, [
      { text: 'FEEDWATER OVERVIEW', color: '#cbd5e1', size: 15 },
      { text: 'REACTOR WATER LEVEL', color: '#4ade80', size: 20 },
      { text: '100.0%', color: '#ffffff', size: 34 },
      { text: 'FEEDWATER FLOW (m³/s)', color: '#4ade80', size: 16 },
      { text: ((sim.coolantPumps[0] + sim.coolantPumps[1]) * 0.02).toFixed(2), color: '#38bdf8', size: 28 }
    ]);

    // Big Red Mushroom SCRAM Button (Bottom Right)
    this.drawScramMushroomButton(w - 130, h - 110);

    // Reset Interlock Button (if SCRAM triggered)
    if (sim.isScrammed) {
      this.drawResetScramButton(w / 2 - 120, h - 65, 240, 44);
    }
  }

  // ELECTRICAL GRID DESK CLOSE-UP
  renderElectricalCloseUp(w, h, deckY) {
    const ctx = this.ctx;
    const grid = this.game.powerGridSim;
    const panelY = deckY + 30;
    const panelH = h - panelY - 40;

    this.drawSteelBluePanel(w * 0.08, panelY, w * 0.84, panelH);

    // 4 Sector Switch Stations
    const sectors = grid.sectors;
    const startX = w * 0.18;
    const spacing = w * 0.19;

    for (let i = 0; i < sectors.length; i++) {
      const sec = sectors[i];
      const sx = startX + i * spacing;

      this.drawCircularDial(sx, panelY + 70, 42, 'Load (MW)', `${sec.demand} MW`, sec.demand, 0, 400);
      this.drawLargeVerticalGauge(sx - 35, panelY + 130, 24, 120, sec.online ? sec.demand : 0, 0, 400);

      this.drawIndicatorLamp(sx + 20, panelY + 160, sec.online);
      this.drawRotarySwitch(sx + 20, panelY + 220, sec.online);
      this.drawNameplate(sx, panelY + 285, sec.name);
    }

    // CRT Monitor
    this.drawChunkyCRTMonitor(w / 2 - 220, 24, 440, 210, [
      { text: 'METRO GRID DISPATCH', color: '#cbd5e1', size: 15 },
      { text: 'TOTAL GRID DEMAND', color: '#f59e0b', size: 18 },
      { text: `${grid.totalDemand} MW`, color: '#ffffff', size: 32 },
      { text: `POWER SUPPLIED: ${grid.totalSupplied} MW`, color: '#10b981', size: 18 },
      { text: `STABILITY: ${grid.gridStability.toFixed(1)}%`, color: '#38bdf8', size: 24 }
    ]);
  }

  // SHIFT MANAGER CLOSE-UP
  renderShiftCloseUp(w, h, deckY) {
    const ctx = this.ctx;
    const staff = this.game.staffSim;
    const panelY = deckY + 30;
    const panelH = h - panelY - 40;

    this.drawSteelBluePanel(w * 0.08, panelY, w * 0.84, panelH);

    // Action 1: Hire Technician
    const a1X = w * 0.35;
    this.drawRotarySwitch(a1X, panelY + 180, true);
    this.drawIndicatorLamp(a1X, panelY + 120, true);
    this.drawNameplate(a1X, panelY + 245, 'Hire Technician ($800)');

    // Action 2: Rotate Shift
    const a2X = w * 0.65;
    this.drawYellowPistolSwitch(a2X, panelY + 180, false);
    this.drawIndicatorLamp(a2X, panelY + 120, false);
    this.drawNameplate(a2X, panelY + 245, 'Rotate Plant Shift');

    // CRT Monitor
    this.drawChunkyCRTMonitor(w / 2 - 220, 24, 440, 210, [
      { text: 'STAFF LOGISTICS & ROSTER', color: '#cbd5e1', size: 15 },
      { text: `ON-DUTY STAFF: ${staff.roster.length} OPERATORS`, color: '#38bdf8', size: 18 },
      { text: `SHIFT #${this.game.shiftNumber}`, color: '#ffffff', size: 32 },
      { text: `AVG FATIGUE: ${Math.round(staff.getAverageFatigue())}%`, color: '#f59e0b', size: 18 },
      { text: 'ALL STATIONS MANNED', color: '#22c55e', size: 24 }
    ]);
  }

  // TURBINES & MAINTENANCE CLOSE-UP
  renderMaintenanceCloseUp(w, h, deckY) {
    const ctx = this.ctx;
    const sim = this.game.maintenanceSim;
    const panelY = deckY + 30;
    const panelH = h - panelY - 40;

    this.drawSteelBluePanel(w * 0.08, panelY, w * 0.84, panelH);

    const a1X = w * 0.35;
    this.drawRotarySwitch(a1X, panelY + 180, true);
    this.drawIndicatorLamp(a1X, panelY + 120, true);
    this.drawNameplate(a1X, panelY + 245, 'Order Pump Spares ($500)');

    const a2X = w * 0.65;
    this.drawRotarySwitch(a2X, panelY + 180, false);
    this.drawIndicatorLamp(a2X, panelY + 120, false);
    this.drawNameplate(a2X, panelY + 245, 'Service Turbines 01/02');

    // CRT Monitor
    this.drawChunkyCRTMonitor(w / 2 - 220, 24, 440, 210, [
      { text: 'TURBINE GENERATOR 01/02', color: '#cbd5e1', size: 15 },
      { text: 'HARDWARE INTEGRITY', color: '#4ade80', size: 18 },
      { text: `${Math.round(sim.getAverageHealth())}%`, color: '#ffffff', size: 34 },
      { text: `WAREHOUSE SPARES: ${sim.warehouseParts.pumps} UNITS`, color: '#38bdf8', size: 18 },
      { text: 'VIBRATION: NORMAL', color: '#10b981', size: 24 }
    ]);
  }

  // SAFETY CLOSE-UP
  renderSafetyCloseUp(w, h, deckY) {
    const panelY = deckY + 30;
    const panelH = h - panelY - 40;
    this.drawSteelBluePanel(this.width * 0.08, panelY, this.width * 0.84, panelH);

    const btnX = this.width * 0.5;
    this.drawRotarySwitch(btnX, panelY + 180, true);
    this.drawIndicatorLamp(btnX, panelY + 120, true);
    this.drawNameplate(btnX, panelY + 245, 'Run Radiation Audit');

    this.drawChunkyCRTMonitor(this.width / 2 - 220, 24, 440, 210, [
      { text: 'RADIATION SURVEILLANCE', color: '#cbd5e1', size: 15 },
      { text: 'PLANT SAFETY RATING', color: '#22c55e', size: 18 },
      { text: `${Math.round(this.game.safetySim.safetyIndex)}%`, color: '#ffffff', size: 34 },
      { text: 'CONTAINMENT: INTACT (101.3 kPa)', color: '#38bdf8', size: 18 },
      { text: 'DOSE: 0.12 μSv/h (SAFE)', color: '#10b981', size: 24 }
    ]);
  }

  // WASTE CLOSE-UP
  renderWasteCloseUp(w, h, deckY) {
    const panelY = deckY + 30;
    const panelH = h - panelY - 40;
    this.drawSteelBluePanel(this.width * 0.08, panelY, this.width * 0.84, panelH);

    const a1X = this.width * 0.35;
    this.drawRotarySwitch(a1X, panelY + 180, true);
    this.drawNameplate(a1X, panelY + 245, 'Transfer Cask ($400)');

    const a2X = this.width * 0.65;
    this.drawYellowPistolSwitch(a2X, panelY + 180, false);
    this.drawNameplate(a2X, panelY + 245, 'Schedule Offsite Convoy');

    this.drawChunkyCRTMonitor(this.width / 2 - 220, 24, 440, 210, [
      { text: 'SPENT FUEL STORAGE POOL', color: '#cbd5e1', size: 15 },
      { text: 'POOL CAPACITY UTILIZATION', color: '#38bdf8', size: 18 },
      { text: `${Math.round((this.game.wasteSim.poolAssemblies / this.game.wasteSim.poolCapacity) * 100)}%`, color: '#ffffff', size: 34 },
      { text: `DRY CASKS: ${this.game.wasteSim.casksFilled} SEALED`, color: '#f59e0b', size: 18 },
      { text: 'COOLING LOOP: ACTIVE', color: '#10b981', size: 24 }
    ]);
  }

  // Draw Powder-Coated Steel-Blue Modular Instrument Panel (Image 2)
  drawSteelBluePanel(x, y, w, h) {
    const ctx = this.ctx;
    ctx.fillStyle = '#557088'; // Steel-blue from Image 2
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = '#324555';
    ctx.lineWidth = 4;
    ctx.strokeRect(x, y, w, h);

    // Beveled corner bolts / rivets
    ctx.fillStyle = '#1c2936';
    const r = 4;
    ctx.beginPath();
    ctx.arc(x + 12, y + 12, r, 0, Math.PI * 2);
    ctx.arc(x + w - 12, y + 12, r, 0, Math.PI * 2);
    ctx.arc(x + 12, y + h - 12, r, 0, Math.PI * 2);
    ctx.arc(x + w - 12, y + h - 12, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw Circular Analogue Needle Dial (Image 2)
  drawCircularDial(x, y, r, label, valStr, val, min, max) {
    const ctx = this.ctx;
    // White dial face
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Measurement scale tick marks
    for (let i = 0; i <= 8; i++) {
      const angle = Math.PI * 0.8 + (i / 8) * (Math.PI * 1.4);
      const x1 = x + Math.cos(angle) * (r - 3);
      const y1 = y + Math.sin(angle) * (r - 3);
      const x2 = x + Math.cos(angle) * (r - 10);
      const y2 = y + Math.sin(angle) * (r - 10);
      ctx.strokeStyle = i >= 6 ? '#ef4444' : '#1e293b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // Red Needle
    const norm = Math.max(0, Math.min(1, (val - min) / (max - min)));
    const needleAngle = Math.PI * 0.8 + norm * (Math.PI * 1.4);
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(needleAngle) * (r - 8), y + Math.sin(needleAngle) * (r - 8));
    ctx.stroke();

    // Center pivot knob
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();

    // Label and value below
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, x, y + r + 16);
  }

  // Draw Vertical Needle Bar Gauge (Image 2)
  drawLargeVerticalGauge(x, y, w, h, val, min, max) {
    const ctx = this.ctx;
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(x - w / 2, y, w, h);
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 3;
    ctx.strokeRect(x - w / 2, y, w, h);

    // Dark slider slot
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x - 4, y + 8, 8, h - 16);

    // Red slider pointer block
    const norm = Math.max(0, Math.min(1, (val - min) / (max - min)));
    const ky = y + (h - 16) * (1 - norm) + 8;
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(x - 12, ky - 5, 24, 10);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.strokeRect(x - 12, ky - 5, 24, 10);
  }

  // Draw Authentic Black Rotary Switch (Image 2)
  drawRotarySwitch(x, y, isOn) {
    const ctx = this.ctx;
    // Dark metal bevel plate
    ctx.fillStyle = '#262933';
    ctx.beginPath();
    ctx.roundRect(x - 24, y - 24, 48, 48, 8);
    ctx.fill();
    ctx.strokeStyle = '#0f1218';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Black cylindrical fluted knob
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(isOn ? Math.PI * 0.25 : -Math.PI * 0.25);

    ctx.fillStyle = '#0a0d14';
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fill();

    // White pointer notch line
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-2, -16, 4, 12);
    ctx.restore();
  }

  // Draw Yellow Pistol-Grip Lever Switch (Image 2: Feedwater Control)
  drawYellowPistolSwitch(x, y, isOn) {
    const ctx = this.ctx;
    // Dark backplate
    ctx.fillStyle = '#262933';
    ctx.beginPath();
    ctx.roundRect(x - 26, y - 26, 52, 52, 8);
    ctx.fill();
    ctx.strokeStyle = '#0f1218';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Yellow heavy lever handle (Image 2)
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(isOn ? Math.PI * 0.2 : -Math.PI * 0.2);

    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.roundRect(-7, -22, 14, 44, 4);
    ctx.fill();
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#fef08a';
    ctx.fillRect(-4, -18, 8, 12);
    ctx.restore();
  }

  // Draw Glowing Industrial Indicator Lamp (Image 2)
  drawIndicatorLamp(x, y, isOn) {
    const ctx = this.ctx;
    // Chrome lamp bezel
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(x, y, 9, 0, Math.PI * 2);
    ctx.fill();

    // Diffuse Outer Glow if active
    if (isOn) {
      const grad = ctx.createRadialGradient(x, y, 4, x, y, 18);
      grad.addColorStop(0, 'rgba(74, 222, 128, 0.8)');
      grad.addColorStop(1, 'rgba(74, 222, 128, 0.0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, 18, 0, Math.PI * 2);
      ctx.fill();
    }

    // Lamp Lens
    ctx.fillStyle = isOn ? '#22c55e' : '#14532d';
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = isOn ? '#86efac' : '#166534';
    ctx.fillRect(x - 2, y - 3, 4, 3);
  }

  // Draw White Plastic Engraved Nameplate (Image 2)
  drawNameplate(x, y, text) {
    const ctx = this.ctx;
    const nw = Math.max(120, text.length * 8.5);
    const nh = 22;

    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.roundRect(x - nw / 2, y - nh / 2, nw, nh, 2);
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(text, x, y + 4);
  }

  // Draw Control Rod Adjustment Block
  drawControlRodBlock(x, y, sim) {
    const ctx = this.ctx;
    ctx.fillStyle = '#262933';
    ctx.beginPath();
    ctx.roundRect(x - 45, y, 90, 160, 6);
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ROD DRIVE', x, y + 18);

    const avg = Math.round(sim.controlRods.reduce((a, b) => a + b, 0) / 4);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 16px monospace';
    ctx.fillText(`${avg}%`, x, y + 42);

    // UP Button
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(x - 30, y + 55, 60, 36);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('EXTRACT ▲', x, y + 78);

    // DOWN Button
    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(x - 30, y + 105, 60, 36);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('INSERT ▼', x, y + 128);
  }

  // Draw Chunky Retro Beige CRT Monitor (Exact recreation of Image 2)
  drawChunkyCRTMonitor(x, y, w, h, lines) {
    const ctx = this.ctx;
    // Beige plastic housing
    ctx.fillStyle = '#dedad0';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 14);
    ctx.fill();
    ctx.strokeStyle = '#2b303c';
    ctx.lineWidth = 6;
    ctx.stroke();

    // Curved black CRT glass tube
    ctx.fillStyle = '#05070d';
    ctx.beginPath();
    ctx.roundRect(x + 22, y + 16, w - 44, h - 32, 10);
    ctx.fill();

    // Scanlines
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    for (let sy = y + 16; sy < y + h - 16; sy += 4) {
      ctx.fillRect(x + 22, sy, w - 44, 2);
    }

    // Phosphor text rendering
    const cx = x + w / 2;
    let startY = y + 44;
    for (const item of lines) {
      ctx.fillStyle = item.color;
      ctx.font = `bold ${item.size}px "Courier New", monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(item.text, cx, startY);
      startY += item.size + 10;
    }
  }

  // Draw Big Red Mushroom SCRAM Button (Image 2)
  drawScramMushroomButton(x, y) {
    const ctx = this.ctx;
    // Hazard-striped base collar
    ctx.fillStyle = '#7f1d1d';
    ctx.beginPath();
    ctx.roundRect(x - 52, y - 52, 104, 104, 12);
    ctx.fill();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 5;
    ctx.stroke();

    // Big red dome
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(x, y, 38, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fca5a5';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SCRAM', x, y + 6);
  }

  // Draw Reset SCRAM Interlock Button
  drawResetScramButton(x, y, w, h) {
    const ctx = this.ctx;
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 6);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('RESET SCRAM INTERLOCK', x + w / 2, y + 26);
  }

  // In-World Physical 3D Return Button (Top-Left)
  drawPhysicalBackButton() {
    const ctx = this.ctx;
    ctx.fillStyle = '#1e2430';
    ctx.beginPath();
    ctx.roundRect(35, 25, 175, 48, 6);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('◀ STEP BACK', 122, 47);
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('[RETURN TO ROOM]', 122, 63);
  }
}