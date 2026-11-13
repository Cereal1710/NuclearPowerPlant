/**
 * Roblox3DScene.js - 100% 3D Diegetic Control Room Scene (Zero WebGL)
 * Recreating the authentic Roblox Nuclear Power Plant Simulator / Scram
 * aesthetic matching user screenshots Image 1, 2, 3, 4.
 */
export class Roblox3DScene {
  constructor(game, worldEl) {
    this.game = game;
    this.worldEl = worldEl;
    this.desks = [];

    this.buildRoom();
    this.buildMezzanine();
    this.buildOverheadBoard();
    this.buildFloorMats();
    this.buildConsoles();
    this.buildRobloxStaff();
    this.buildProps();
  }

  // 1. Floor & Front Architectural Wall
  buildRoom() {
    const floor = document.createElement('div');
    floor.className = 'room-floor obj-3d';
    this.worldEl.appendChild(floor);

    const frontWall = document.createElement('div');
    frontWall.className = 'room-wall-front obj-3d';
    this.worldEl.appendChild(frontWall);
  }

  // 2. Mezzanine Office Gallery (Upper Right of Image 1)
  buildMezzanine() {
    const mezz = document.createElement('div');
    mezz.className = 'mezzanine-office obj-3d';
    mezz.innerHTML = `
      <div class="mezzanine-sign">
        <span class="sign-main">UNIT 01 PRIMARY</span>
        <span class="sign-sub">CONTROL ROOM</span>
      </div>
      <div class="mezzanine-windows">
        <div class="office-pane">
          <div class="office-interior-desk"></div>
          <div class="office-screen-glow"></div>
        </div>
        <div class="office-pane">
          <div class="office-interior-desk"></div>
        </div>
        <div class="office-pane">
          <div class="office-interior-desk"></div>
          <div class="office-screen-glow"></div>
        </div>
        <div class="office-pane">
          <div class="office-interior-desk"></div>
        </div>
      </div>
    `;
    this.worldEl.appendChild(mezz);
  }

  // 3. Master Overhead Display Board (Upper Left of Image 1 & Image 3)
  buildOverheadBoard() {
    const board = document.createElement('div');
    board.className = 'master-overhead-board obj-3d';
    board.id = 'master-overhead-board';

    board.innerHTML = `
      <div class="overhead-strut" style="left: 60px;"></div>
      <div class="overhead-strut" style="right: 60px;"></div>

      <div class="overhead-left-col">
        <div class="badge-coolant">COOLANT ➔ OPEN</div>
        <div class="badge-rods" id="badge-rods">RODS: 55%</div>
        <div class="badge-feedwater" id="badge-feedwater">FEEDWATER 2/3</div>
        <div class="badge-fuel">FUEL: 85.2%</div>
        <div class="overhead-telemetry-box" id="overhead-core-telemetry">
          PRES: 101.3 kPa<br>
          TEMP: 320.0 K
        </div>
      </div>

      <div class="overhead-core-circle" id="overhead-core-grid">
        <!-- 121 fuel cell pins generated dynamically -->
      </div>

      <div class="overhead-right-col">
        <div class="power-orders-hdr">⚡ FACILITY POWER ORDERS // IN PROGRESS</div>
        <div class="supply-progress-bar">
          <div class="supply-progress-fill" id="supply-fill" style="width: 50%;"></div>
          <div class="supply-progress-text" id="supply-text">SUPPLY: 450 MW / TARGET: 900 MW</div>
        </div>
        <div class="overhead-stats-row">
          <span id="overhead-inflow">INFLOW: +$620/min</span>
          <span id="overhead-grid-stab">GRID: 98.4%</span>
          <span id="overhead-penalties">PENALTIES: -$0/min</span>
        </div>
        <div class="overhead-stats-row">
          <span id="overhead-shift-info">SHIFT #1 [08:00]</span>
          <span id="overhead-safety-info">PLANT SAFETY: 97%</span>
        </div>
        <div class="overhead-log-ticker" id="overhead-ticker">
          [LOG] NUCLEARIS NUCLEAR POWER PLANT ONLINE // NEUTRON ENERGY CORP.
        </div>
      </div>
    `;

    const gridEl = board.querySelector('#overhead-core-grid');
    for (let r = 0; r < 11; r++) {
      for (let c = 0; c < 11; c++) {
        const pin = document.createElement('div');
        const dist = Math.hypot(r - 5, c - 5);
        if (dist <= 4.8) {
          pin.className = 'core-pin';
          if ((r + c) % 4 === 0) pin.classList.add('coolant');
        } else {
          pin.style.visibility = 'hidden';
        }
        gridEl.appendChild(pin);
      }
    }

    this.worldEl.appendChild(board);
  }

  // 4. Floor Runner Mats under each station (Image 1)
  buildFloorMats() {
    const mats = [
      { id: 'reactor', title: 'REACTOR PRIMARY', x: -360, z: -200, w: 340, h: 220, bg: '#bca783' },
      { id: 'electrical', title: 'GRID CONTROL', x: -120, z: 80, w: 320, h: 200, bg: '#b8a47e' },
      { id: 'turbines', title: 'TURBINES & GENERATOR', x: 260, z: -180, w: 300, h: 180, bg: '#be7f73' },
      { id: 'shift', title: 'SHIFT MANAGER', x: 400, z: 40, w: 300, h: 180, bg: '#6a9ca8' },
      { id: 'safety', title: 'SAFETY MONITORING', x: 60, z: -280, w: 300, h: 180, bg: '#799882' },
      { id: 'waste', title: 'WASTE MANAGEMENT', x: 540, z: -160, w: 300, h: 180, bg: '#b8a87b' }
    ];

    for (const m of mats) {
      const matEl = document.createElement('div');
      matEl.className = 'floor-mat obj-3d';
      matEl.style.width = `${m.w}px`;
      matEl.style.height = `${m.h}px`;
      matEl.style.left = `${-m.w / 2}px`;
      matEl.style.top = `${-m.h / 2}px`;
      matEl.style.transform = `translate3d(${m.x}px, 108px, ${m.z}px) rotateX(90deg)`;
      matEl.style.backgroundColor = m.bg;
      matEl.innerHTML = `<div class="floor-mat-label">${m.title}</div>`;
      this.worldEl.appendChild(matEl);
    }
  }

  // 5. 3D Modular Consoles (Beige Desks with Sloped Decks, Image 1 & 2)
  buildConsoles() {
    const configs = [
      {
        id: 'reactor',
        title: 'REACTOR PRIMARY',
        subtitle: 'Core Thermal & Scram',
        x: -360,
        z: -200,
        rotY: 18,
        camX: 360,
        camY: 10,
        camZ: 140,
        camRotX: -14,
        camRotY: -18,
        hasScram: true,
        crtTitle: 'FEEDWATER OVERVIEW'
      },
      {
        id: 'electrical',
        title: 'GRID CONTROL',
        subtitle: 'Metro Power Dispatch',
        x: -120,
        z: 80,
        rotY: 8,
        camX: 120,
        camY: 10,
        camZ: -160,
        camRotX: -14,
        camRotY: -8,
        crtTitle: 'METRO GRID DISPATCH'
      },
      {
        id: 'shift',
        title: 'SHIFT MANAGER',
        subtitle: 'Personnel Logistics',
        x: 400,
        z: 40,
        rotY: -16,
        camX: -400,
        camY: 10,
        camZ: -120,
        camRotX: -14,
        camRotY: 16,
        crtTitle: 'STAFF LOGISTICS'
      },
      {
        id: 'maintenance',
        title: 'TURBINES & GENERATOR',
        subtitle: 'Steam Turbines 01/02',
        x: 260,
        z: -180,
        rotY: -12,
        camX: -260,
        camY: 10,
        camZ: 100,
        camRotX: -14,
        camRotY: 12,
        crtTitle: 'TURBINE GOVERNOR'
      },
      {
        id: 'safety',
        title: 'SAFETY MONITORING',
        subtitle: 'Radiation Surveillance',
        x: 60,
        z: -280,
        rotY: 0,
        camX: -60,
        camY: 10,
        camZ: 200,
        camRotX: -14,
        camRotY: 0,
        crtTitle: 'RADIATION SURVEILLANCE'
      },
      {
        id: 'waste',
        title: 'WASTE MANAGEMENT',
        subtitle: 'Spent Fuel Storage',
        x: 540,
        z: -160,
        rotY: -22,
        camX: -540,
        camY: 10,
        camZ: 80,
        camRotX: -14,
        camRotY: 22,
        crtTitle: 'SPENT FUEL POOL'
      }
    ];

    for (const cfg of configs) {
      const consoleEl = document.createElement('div');
      consoleEl.className = 'console-station-3d obj-3d';
      consoleEl.style.transform = `translate3d(${cfg.x}px, 30px, ${cfg.z}px) rotateY(${cfg.rotY}deg)`;

      // Click to zoom camera directly to desk
      consoleEl.addEventListener('click', (e) => {
        if (e.target.closest('.rotary-switch-box') || e.target.closest('.scram-console-box') || e.target.closest('.physical-back-btn')) return;
        this.game.sound.playClick(1100);
        this.game.camera.transitionToDesk(cfg);
      });

      // 3D Console Base
      const baseBox = document.createElement('div');
      baseBox.className = 'console-base-box';
      consoleEl.appendChild(baseBox);

      // Sloped Control Deck (Image 2)
      const deck = document.createElement('div');
      deck.className = 'console-top-deck';

      if (cfg.id === 'reactor') {
        this.populateReactorDeck(deck, cfg);
      } else if (cfg.id === 'electrical') {
        this.populateGridDeck(deck, cfg);
      } else {
        this.populateGenericDeck(deck, cfg);
      }

      consoleEl.appendChild(deck);
      this.worldEl.appendChild(consoleEl);
      this.desks.push({ cfg, el: consoleEl });
    }
  }

  // Populate Reactor Primary Deck (Exact 1:1 match of User Image 2)
  populateReactorDeck(deck, cfg) {
    const backBtn = document.createElement('div');
    backBtn.className = 'physical-back-btn';
    backBtn.innerHTML = `
      <div class="back-btn-title">◀ OVERVIEW</div>
      <div class="back-btn-sub">[RETURN]</div>
    `;
    backBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.game.sound.playClick(850);
      this.game.camera.returnToOverview();
    });
    deck.appendChild(backBtn);

    const p1 = document.createElement('div');
    p1.className = 'panel-steel-blue';
    p1.style.width = '95px';
    p1.innerHTML = `
      <div class="screw-rivet tl"></div><div class="screw-rivet tr"></div>
      <div class="screw-rivet bl"></div><div class="screw-rivet br"></div>
      
      <div style="display: flex; gap: 5px; align-items: center; margin-bottom: 3px;">
        <div class="vertical-slider-gauge">
          <div class="vertical-slider-slot"></div>
          <div class="vertical-slider-knob" id="p1-slider" style="top: 10px;"></div>
        </div>
        <div style="display: flex; flex-direction: column; align-items: center;">
          <div class="dial-meter-circular">
            <div class="dial-meter-needle" id="p1-dial-1" style="transform: rotate(40deg);"></div>
            <div class="dial-meter-pivot"></div>
          </div>
          <div class="dial-meter-circular">
            <div class="dial-meter-needle" id="p1-dial-2" style="transform: rotate(-20deg);"></div>
            <div class="dial-meter-pivot"></div>
          </div>
        </div>
      </div>

      <div class="indicator-lamp-led on" id="p1-lamp"></div>
      <div class="rotary-switch-box" id="p1-switch">
        <div class="rotary-switch-knob on" id="p1-knob"><div class="rotary-notch"></div></div>
      </div>
      <div class="engraved-nameplate">Feedwater Pump 1</div>
    `;

    const p1Sw = p1.querySelector('#p1-switch');
    p1Sw.addEventListener('click', (e) => {
      e.stopPropagation();
      const st = this.game.reactorSim.togglePump(0);
      this.game.sound.playHeavySwitch();
      p1.querySelector('#p1-knob').className = `rotary-switch-knob ${st ? 'on' : 'off'}`;
      p1.querySelector('#p1-lamp').className = `indicator-lamp-led ${st ? 'on' : ''}`;
    });
    deck.appendChild(p1);

    const crt = document.createElement('div');
    crt.className = 'chunky-crt-monitor-3d';
    crt.innerHTML = `
      <div class="crt-glass-screen">
        <div class="crt-text-sub">FEEDWATER OVERVIEW</div>
        <div class="crt-text-main">REACTOR LEVEL</div>
        <div class="crt-text-val" id="crt-reactor-val">100.0%</div>
        <div class="crt-text-sub">FLOW (m³/s)</div>
        <div class="crt-text-val" id="crt-flow-val" style="color: #38bdf8; font-size: 9px;">1.83</div>
      </div>
    `;
    deck.appendChild(crt);

    const p2 = document.createElement('div');
    p2.className = 'panel-steel-blue';
    p2.style.width = '95px';
    p2.innerHTML = `
      <div class="screw-rivet tl"></div><div class="screw-rivet tr"></div>
      <div class="screw-rivet bl"></div><div class="screw-rivet br"></div>

      <div style="display: flex; gap: 5px; margin-bottom: 3px;">
        <div class="dial-meter-circular">
          <div class="dial-meter-needle" id="core-temp-needle" style="transform: rotate(30deg);"></div>
          <div class="dial-meter-pivot"></div>
          <div class="dial-label">Temp</div>
        </div>
        <div class="dial-meter-circular">
          <div class="dial-meter-needle" id="core-pres-needle" style="transform: rotate(10deg);"></div>
          <div class="dial-meter-pivot"></div>
          <div class="dial-label">Pres</div>
        </div>
      </div>

      <div class="indicator-lamp-led on" id="fw-ctrl-lamp"></div>
      <div class="yellow-pistol-switch" id="fw-ctrl-switch">
        <div class="yellow-pistol-handle on" id="fw-ctrl-handle"></div>
      </div>
      <div class="engraved-nameplate">Feedwater Control</div>
    `;

    const fwSw = p2.querySelector('#fw-ctrl-switch');
    fwSw.addEventListener('click', (e) => {
      e.stopPropagation();
      const st = this.game.reactorSim.togglePump(2);
      this.game.sound.playHeavySwitch();
      p2.querySelector('#fw-ctrl-handle').className = `yellow-pistol-handle ${st ? 'on' : 'off'}`;
      p2.querySelector('#fw-ctrl-lamp').className = `indicator-lamp-led ${st ? 'on' : ''}`;
    });
    deck.appendChild(p2);

    const scramBox = document.createElement('div');
    scramBox.className = 'scram-console-box';
    scramBox.innerHTML = `<div class="scram-mushroom-dome" id="scram-dome-btn">SCRAM</div>`;
    scramBox.addEventListener('click', (e) => {
      e.stopPropagation();
      this.game.sound.playScramSlam();
      this.game.reactorSim.scram();
      if (this.game.eventSim.emergencyActive) {
        this.game.eventSim.handleEmergencySuccess();
      } else {
        this.game.eventSim.addLog('EMERGENCY SCRAM TRIGGERED BY OPERATOR!');
      }
    });
    deck.appendChild(scramBox);
  }

  populateGridDeck(deck, cfg) {
    const backBtn = document.createElement('div');
    backBtn.className = 'physical-back-btn';
    backBtn.innerHTML = `
      <div class="back-btn-title">◀ OVERVIEW</div>
      <div class="back-btn-sub">[RETURN]</div>
    `;
    backBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.game.sound.playClick(850);
      this.game.camera.returnToOverview();
    });
    deck.appendChild(backBtn);

    const p = document.createElement('div');
    p.className = 'panel-steel-blue';
    p.style.flex = '1';
    p.innerHTML = `
      <div class="screw-rivet tl"></div><div class="screw-rivet tr"></div>
      <div style="display: flex; gap: 8px; align-items: center; justify-content: center; width: 100%;">
        <div style="display: flex; flex-direction: column; align-items: center;">
          <div class="indicator-lamp-led on" id="sec-0-lamp"></div>
          <div class="rotary-switch-box" id="sec-0-sw"><div class="rotary-switch-knob on"></div></div>
          <div class="engraved-nameplate">Hospital P1</div>
        </div>
        <div style="display: flex; flex-direction: column; align-items: center;">
          <div class="indicator-lamp-led on" id="sec-1-lamp"></div>
          <div class="rotary-switch-box" id="sec-1-sw"><div class="rotary-switch-knob on"></div></div>
          <div class="engraved-nameplate">Industrial</div>
        </div>
        <div style="display: flex; flex-direction: column; align-items: center;">
          <div class="indicator-lamp-led on" id="sec-2-lamp"></div>
          <div class="rotary-switch-box" id="sec-2-sw"><div class="rotary-switch-knob on"></div></div>
          <div class="engraved-nameplate">Residential</div>
        </div>
      </div>
    `;
    deck.appendChild(p);

    const crt = document.createElement('div');
    crt.className = 'chunky-crt-monitor-3d';
    crt.innerHTML = `
      <div class="crt-glass-screen">
        <div class="crt-text-sub">METRO DISPATCH</div>
        <div class="crt-text-main">GRID STABILITY</div>
        <div class="crt-text-val" id="crt-grid-stab">98.5%</div>
        <div class="crt-text-sub">LOAD</div>
        <div class="crt-text-val" id="crt-grid-load" style="color: #38bdf8; font-size: 9px;">450 MW</div>
      </div>
    `;
    deck.appendChild(crt);
  }

  populateGenericDeck(deck, cfg) {
    const backBtn = document.createElement('div');
    backBtn.className = 'physical-back-btn';
    backBtn.innerHTML = `
      <div class="back-btn-title">◀ OVERVIEW</div>
      <div class="back-btn-sub">[RETURN]</div>
    `;
    backBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.game.sound.playClick(850);
      this.game.camera.returnToOverview();
    });
    deck.appendChild(backBtn);

    const p = document.createElement('div');
    p.className = 'panel-steel-blue';
    p.style.flex = '1';
    p.innerHTML = `
      <div class="screw-rivet tl"></div><div class="screw-rivet tr"></div>
      <div style="display: flex; gap: 8px; align-items: center; justify-content: center; width: 100%;">
        <div class="dial-meter-circular">
          <div class="dial-meter-needle" style="transform: rotate(20deg);"></div>
          <div class="dial-meter-pivot"></div>
        </div>
        <div class="indicator-lamp-led on"></div>
        <div class="rotary-switch-box"><div class="rotary-switch-knob on"></div></div>
        <div class="engraved-nameplate">${cfg.title}</div>
      </div>
    `;
    deck.appendChild(p);

    const crt = document.createElement('div');
    crt.className = 'chunky-crt-monitor-3d';
    crt.innerHTML = `
      <div class="crt-glass-screen">
        <div class="crt-text-sub">${cfg.crtTitle}</div>
        <div class="crt-text-main">STATUS</div>
        <div class="crt-text-val" style="color: #4ade80;">ONLINE</div>
        <div class="crt-text-sub">INTEGRITY</div>
        <div class="crt-text-val" style="color: #38bdf8; font-size: 9px;">100%</div>
      </div>
    `;
    deck.appendChild(crt);
  }

  // 6. 3D Roblox Blocky Minifigures (Image 1 & 2)
  buildRobloxStaff() {
    const staffConfigs = [
      { x: -360, z: -160, vest: 'orange' },
      { x: -420, z: -170, vest: 'yellow' },
      { x: -120, z: 120, vest: 'yellow' },
      { x: 400, z: 80, vest: 'blue' },
      { x: 260, z: -140, vest: 'orange' },
      { x: -240, z: -30, vest: 'yellow' }
    ];

    for (const s of staffConfigs) {
      const char = document.createElement('div');
      char.className = 'roblox-staff-3d obj-3d';
      char.style.transform = `translate3d(${s.x}px, 45px, ${s.z}px)`;

      const vestClass = s.vest === 'yellow' ? 'yellow-vest' : s.vest === 'blue' ? 'blue-vest' : '';

      char.innerHTML = `
        <div class="roblox-shadow"></div>
        <div class="roblox-legs">
          <div class="roblox-leg"></div>
          <div class="roblox-leg"></div>
        </div>
        <div class="roblox-torso ${vestClass}">
          <div class="roblox-reflective-strip"></div>
        </div>
        <div class="roblox-head"></div>
        <div class="roblox-hard-hat"></div>
      `;

      this.worldEl.appendChild(char);
    }
  }

  // 7. Environment Props (Planters, Swivel Chair)
  buildProps() {
    const chair = document.createElement('div');
    chair.className = 'office-chair-3d obj-3d';
    chair.style.transform = `translate3d(-120px, 70px, 125px)`;
    chair.innerHTML = `
      <div class="chair-seat"></div>
      <div class="chair-backrest"></div>
    `;
    this.worldEl.appendChild(chair);

    const planterCoords = [
      { x: -580, z: -180 },
      { x: -580, z: 70 },
      { x: 580, z: -120 },
      { x: 580, z: 100 }
    ];

    for (const p of planterCoords) {
      const pl = document.createElement('div');
      pl.className = 'planter-box-3d obj-3d';
      pl.style.transform = `translate3d(${p.x}px, 85px, ${p.z}px)`;
      pl.innerHTML = `<div class="planter-foliage"></div>`;
      this.worldEl.appendChild(pl);
    }
  }

  update() {
    const reactor = this.game.reactorSim;
    const grid = this.game.powerGridSim;
    const safety = this.game.safetySim;
    const events = this.game.eventSim;

    const rodsBadge = document.getElementById('badge-rods');
    if (rodsBadge) {
      const avgRod = Math.round(reactor.controlRods.reduce((a, b) => a + b, 0) / 4);
      rodsBadge.textContent = `RODS: ${avgRod}%`;
    }

    const fwBadge = document.getElementById('badge-feedwater');
    if (fwBadge) {
      const activePumps = reactor.pumpStates.filter(Boolean).length;
      fwBadge.textContent = `FEEDWATER ${activePumps}/3`;
    }

    const telem = document.getElementById('overhead-core-telemetry');
    if (telem) {
      telem.innerHTML = `
        PRES: ${(reactor.steamPressure * 10).toFixed(1)} kPa<br>
        TEMP: ${(reactor.coreTemp + 273.15).toFixed(1)} K
      `;
    }

    const supplyFill = document.getElementById('supply-fill');
    const supplyText = document.getElementById('supply-text');
    if (supplyFill && supplyText) {
      const ratio = Math.min(1.0, grid.totalSupplied / Math.max(grid.totalDemand, 1));
      supplyFill.style.width = `${ratio * 100}%`;
      supplyFill.style.backgroundColor = ratio > 0.9 ? '#10b981' : '#f59e0b';
      supplyText.textContent = `SUPPLY: ${grid.totalSupplied} MW / TARGET: ${grid.totalDemand} MW`;
    }

    const inflow = document.getElementById('overhead-inflow');
    if (inflow) inflow.textContent = `INFLOW: +$${grid.currentRevenueRate}/min`;

    const stab = document.getElementById('overhead-grid-stab');
    if (stab) stab.textContent = `GRID: ${grid.gridStability.toFixed(1)}%`;

    const pens = document.getElementById('overhead-penalties');
    if (pens) pens.textContent = `PENALTIES: -$${grid.currentPenaltyRate}/min`;

    const shiftInfo = document.getElementById('overhead-shift-info');
    if (shiftInfo) shiftInfo.textContent = `SHIFT #${this.game.shiftNumber} [${this.game.getFormattedTime()}]`;

    const safetyInfo = document.getElementById('overhead-safety-info');
    if (safetyInfo) safetyInfo.textContent = `PLANT SAFETY: ${Math.round(safety.safetyIndex)}%`;

    const ticker = document.getElementById('overhead-ticker');
    if (ticker) {
      const logText = events.logs[0] ? events.logs[0].text : 'ALL PRIMARY CIRCUITS NOMINAL';
      ticker.textContent = `[LOG] ${logText.toUpperCase()}`;
    }

    const crtFlow = document.getElementById('crt-flow-val');
    if (crtFlow) {
      const flow = ((reactor.coolantPumps[0] + reactor.coolantPumps[1]) * 0.02).toFixed(2);
      crtFlow.textContent = flow;
    }

    if (events.emergencyActive && !document.getElementById('emergency-overlay')) {
      const ov = document.createElement('div');
      ov.id = 'emergency-overlay';
      ov.className = 'emergency-alarm-flash';
      document.body.appendChild(ov);
    } else if (!events.emergencyActive && document.getElementById('emergency-overlay')) {
      document.getElementById('emergency-overlay').remove();
    }
  }
}
