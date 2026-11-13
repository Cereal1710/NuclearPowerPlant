/**
 * CSS3DDesk - Assembles the 6 interactive 3D Control Desks in a Command Horseshoe Arc:
 * - Station 01: Reactor Engineer Desk (Far Left, angled 26deg, with 3D SCRAM button)
 * - Station 02: Electrical Manager Desk (Mid Left, angled 14deg)
 * - Station 03: Shift Manager Desk (Center Left, angled 4deg)
 * - Station 04: Maintenance Engineer Desk (Center Right, angled -4deg)
 * - Station 05: Safety Officer Desk (Mid Right, angled -14deg)
 * - Station 06: Waste Management Desk (Far Right, angled -26deg)
 */
export class CSS3DDesk {
  constructor(game, worldEl) {
    this.game = game;
    this.worldEl = worldEl;
    this.desks = [];
    this.buildAll();
  }

  buildAll() {
    const container = document.createElement('div');
    container.id = 'desks-container';
    container.className = 'obj-3d';

    const configs = [
      {
        id: 'reactor',
        title: 'REACTOR ENGINEER DESK',
        subtitle: 'Station 01 // Core Controls & SCRAM',
        x: -640,
        z: -270,
        rotY: 26,
        camX: 640,
        camY: 20,
        camZ: 310,
        camRotX: 5,
        camRotY: -26,
        hasScram: true
      },
      {
        id: 'electrical',
        title: 'ELECTRICAL MANAGER DESK',
        subtitle: 'Station 02 // Power Grid & Contracts',
        x: -380,
        z: -380,
        rotY: 14,
        camX: 380,
        camY: 20,
        camZ: 420,
        camRotX: 5,
        camRotY: -14
      },
      {
        id: 'shift',
        title: 'SHIFT MANAGER DESK',
        subtitle: 'Station 03 // Personnel & Audits',
        x: -125,
        z: -420,
        rotY: 4,
        camX: 125,
        camY: 20,
        camZ: 460,
        camRotX: 5,
        camRotY: -4
      },
      {
        id: 'maintenance',
        title: 'MAINTENANCE ENGINEER DESK',
        subtitle: 'Station 04 // Hardware & Diagnostics',
        x: 135,
        z: -420,
        rotY: -4,
        camX: -135,
        camY: 20,
        camZ: 460,
        camRotX: 5,
        camRotY: 4
      },
      {
        id: 'safety',
        title: 'SAFETY OFFICER DESK',
        subtitle: 'Station 05 // Radiation & Protocols',
        x: 390,
        z: -380,
        rotY: -14,
        camX: -390,
        camY: 20,
        camZ: 420,
        camRotX: 5,
        camRotY: 14
      },
      {
        id: 'waste',
        title: 'WASTE MANAGEMENT DESK',
        subtitle: 'Station 06 // Spent Fuel & Logistics',
        x: 650,
        z: -270,
        rotY: -26,
        camX: -650,
        camY: 20,
        camZ: 310,
        camRotX: 5,
        camRotY: 26
      }
    ];

    for (const cfg of configs) {
      const deskObj = this.createDesk(cfg);
      container.appendChild(deskObj.el);
      this.desks.push(deskObj);
    }

    this.worldEl.appendChild(container);
  }

  createDesk(cfg) {
    const el = document.createElement('div');
    el.className = 'desk-station-3d obj-3d';
    el.dataset.deskId = cfg.id;
    el.style.transform = `translateX(${cfg.x}px) translateZ(${cfg.z}px) rotateY(${cfg.rotY}deg)`;

    // 1. Desk Body (Volumetric)
    const deskBody = document.createElement('div');
    deskBody.className = 'desk-body-3d';
    deskBody.innerHTML = `
      <div class="desk-front-bezel">
        <div class="desk-led-accent"></div>
      </div>
    `;
    el.appendChild(deskBody);

    // 2. Monitor Stand & Housing
    const stand = document.createElement('div');
    stand.className = 'monitor-stand-pole';
    el.appendChild(stand);

    const monitor = document.createElement('div');
    monitor.className = 'monitor-housing-3d';
    monitor.id = `monitor-${cfg.id}`;
    el.appendChild(monitor);

    // 3. Physical 3D Back Button mounted on Desk Console
    const backBtn = document.createElement('div');
    backBtn.className = 'physical-back-btn-3d';
    backBtn.innerHTML = `
      <div class="back-btn-text-main">◀ OVERVIEW</div>
      <div class="back-btn-text-sub">[RETURN BACK]</div>
    `;
    backBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      backBtn.classList.add('pressed');
      this.game.sound.playClick(800);
      setTimeout(() => {
        backBtn.classList.remove('pressed');
        this.game.cameraManager.returnToOverview();
      }, 100);
    });
    el.appendChild(backBtn);

    // 4. Physical 3D SCRAM Console (for Station 1: Reactor Desk)
    if (cfg.hasScram) {
      const scramBox = document.createElement('div');
      scramBox.className = 'scram-console-box-3d';
      scramBox.innerHTML = `
        <div class="scram-hazard-stripes"></div>
        <div class="scram-mushroom-btn-3d" id="scram-btn-mesh">SCRAM</div>
      `;
      const scramBtn = scramBox.querySelector('#scram-btn-mesh');
      scramBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        scramBtn.classList.add('depressed');
        this.game.sound.playScramSlam();

        setTimeout(() => scramBtn.classList.remove('depressed'), 300);

        this.game.reactorSim.scram();
        if (this.game.eventSim.emergencyActive) {
          this.game.eventSim.handleEmergencySuccess();
        } else {
          this.game.eventSim.addLog('Manual emergency SCRAM triggered by operator.');
        }
      });
      el.appendChild(scramBox);
    }

    // 5. 3D Office Swivel Chair behind desk
    const chair = document.createElement('div');
    chair.className = 'chair-3d';
    chair.innerHTML = `
      <div class="chair-seat"></div>
      <div class="chair-backrest"></div>
    `;
    el.appendChild(chair);

    // 6. 3D Stylized Humanoid Staff Character
    const staffChar = document.createElement('div');
    staffChar.className = 'staff-character-3d';
    staffChar.id = `staff-char-${cfg.id}`;
    staffChar.innerHTML = `
      <div class="staff-torso">
        <div class="staff-logo-patch">NEC</div>
      </div>
      <div class="staff-head-group">
        <div class="staff-head">
          <div class="staff-hardhat"></div>
        </div>
      </div>
      <div class="staff-arms">
        <div class="staff-arm"></div>
        <div class="staff-arm"></div>
      </div>
    `;
    el.appendChild(staffChar);

    // 7. 3D Floating World-Space Title Badge
    const badge = document.createElement('div');
    badge.className = 'floating-label-3d';
    badge.innerHTML = `
      <div class="floating-label-title">${cfg.title}</div>
      <div class="floating-label-sub">${cfg.subtitle}</div>
      <div class="floating-label-hint">▼ CLICK TO ZOOM & OPERATE ▼</div>
    `;
    el.appendChild(badge);

    // Click on desk to zoom in
    el.addEventListener('click', (e) => {
      if (this.game.cameraManager.mode === 'overview') {
        this.game.sound.playClick(1100);
        this.game.cameraManager.transitionToDesk(cfg);
      }
    });

    el.addEventListener('mouseenter', () => {
      if (this.game.cameraManager.mode === 'overview') {
        el.classList.add('overview-hover');
      }
    });

    el.addEventListener('mouseleave', () => {
      el.classList.remove('overview-hover');
    });

    return {
      cfg,
      el,
      monitorEl: monitor,
      staffEl: staffChar
    };
  }

  update() {
    this.renderReactorScreen();
    this.renderElectricalScreen();
    this.renderShiftScreen();
    this.renderMaintenanceScreen();
    this.renderSafetyScreen();
    this.renderWasteScreen();
  }

  renderReactorScreen() {
    const mon = document.getElementById('monitor-reactor');
    if (!mon) return;

    const sim = this.game.reactorSim;
    const tempCol = sim.coreTemp > 380 ? '#ef4444' : sim.coreTemp > 340 ? '#f59e0b' : '#10b981';

    mon.innerHTML = `
      <div class="screen-content">
        <div class="screen-header">
          <div class="screen-header-title">⚡ REACTOR CORE DYNAMICS</div>
          <div class="screen-header-tag">STATION 01 // REACTOR</div>
        </div>
        <div class="screen-body">
          <div class="screen-row" style="border-left: 4px solid ${sim.statusColor};">
            <div>
              <div style="font-weight: 800; color: ${sim.statusColor};">${sim.statusText}</div>
              <div style="color: #94a3b8; font-size: 10px;">Ther: ${Math.round(sim.thermalOutput)} MWth | Elec: ${Math.round(sim.electricOutput)} MWe</div>
            </div>
            <button class="screen-btn ${sim.isScrammed ? 'primary' : ''}" id="btn-reset-scram">RESET SCRAM</button>
          </div>

          <!-- Control Rods -->
          <div style="background: #0b1220; padding: 6px; border-radius: 4px; border: 1px solid #1e293b;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="font-weight: 700; color: #38bdf8;">CONTROL RODS (%)</span>
              <span style="font-size: 10px; color: #94a3b8;">Avg: ${Math.round(sim.controlRods.reduce((a, b) => a + b, 0) / 4)}%</span>
            </div>
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px;">
              ${[0, 1, 2, 3].map(i => `
                <div style="background: #111827; padding: 3px; border-radius: 3px; text-align: center;">
                  <div style="font-size: 8px; color: #94a3b8;">#${i + 1}</div>
                  <div style="font-size: 12px; font-weight: 800; color: #f8fafc;">${Math.round(sim.controlRods[i])}%</div>
                  <div style="display: flex; gap: 2px; justify-content: center; margin-top: 2px;">
                    <button class="screen-btn" style="padding: 1px 3px; font-size: 8px;" onclick="window.__NPP_GAME__.reactorSim.setRod(${i}, ${sim.targetRods[i] - 10})">-10</button>
                    <button class="screen-btn" style="padding: 1px 3px; font-size: 8px;" onclick="window.__NPP_GAME__.reactorSim.setRod(${i}, ${sim.targetRods[i] + 10})">+10</button>
                  </div>
                </div>
              `).join('')}
            </div>
            <div style="display: flex; gap: 4px; margin-top: 4px;">
              <button class="screen-btn danger" style="flex: 1; padding: 3px;" onclick="for(let i=0;i<4;i++)window.__NPP_GAME__.reactorSim.setRod(i,100);">FULL IN</button>
              <button class="screen-btn primary" style="flex: 1; padding: 3px;" onclick="for(let i=0;i<4;i++)window.__NPP_GAME__.reactorSim.setRod(i,65);">NOMINAL</button>
              <button class="screen-btn" style="flex: 1; padding: 3px;" onclick="for(let i=0;i<4;i++)window.__NPP_GAME__.reactorSim.setRod(i,40);">MAX</button>
            </div>
          </div>

          <!-- Gauges -->
          <div style="display: flex; flex-direction: column; gap: 4px;">
            <div class="screen-row">
              <span>Core Temp: <b style="color: ${tempCol}">${sim.coreTemp.toFixed(1)} °C</b></span>
              <div class="screen-progress-track" style="width: 120px;">
                <div class="screen-progress-bar" style="width: ${(sim.coreTemp / 500) * 100}%; background: ${tempCol};"></div>
              </div>
            </div>
            <div class="screen-row">
              <span>Reactivity: <b style="color: #38bdf8">${sim.reactivity.toFixed(1)} %</b></span>
              <div class="screen-progress-track" style="width: 120px;">
                <div class="screen-progress-bar" style="width: ${sim.reactivity}%;"></div>
              </div>
            </div>
            <div class="screen-row">
              <span>Steam Pressure: <b>${sim.steamPressure.toFixed(1)} Bar</b></span>
              <div class="screen-progress-track" style="width: 120px;">
                <div class="screen-progress-bar" style="width: ${sim.steamPressure}%; background: #a855f7;"></div>
              </div>
            </div>
          </div>

          <!-- Coolant Pumps -->
          <div style="display: flex; gap: 4px;">
            ${[0, 1, 2].map(p => `
              <div style="flex: 1; background: #0f172a; padding: 4px; border-radius: 4px; border: 1px solid #1e293b; text-align: center;">
                <div style="font-size: 9px; color: ${sim.pumpStates[p] ? '#10b981' : '#ef4444'}; font-weight: 700;">PUMP ${['A', 'B', 'C'][p]}</div>
                <div style="font-size: 11px; font-weight: 800;">${sim.coolantPumps[p]}%</div>
                <button class="screen-btn" style="padding: 1px 4px; font-size: 8px; margin-top: 2px;" onclick="window.__NPP_GAME__.reactorSim.togglePump(${p})">${sim.pumpStates[p] ? 'OFF' : 'ON'}</button>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    const rstBtn = mon.querySelector('#btn-reset-scram');
    if (rstBtn) {
      rstBtn.addEventListener('click', () => {
        const ok = sim.resetTrip();
        if (ok) {
          this.game.sound.playSuccess();
          this.game.eventSim.addLog('Reactor SCRAM interlocks reset. Commencing startup.');
        } else {
          this.game.sound.playError();
        }
      });
    }
  }

  renderElectricalScreen() {
    const mon = document.getElementById('monitor-electrical');
    if (!mon) return;

    const grid = this.game.powerGridSim;
    const reactor = this.game.reactorSim;

    mon.innerHTML = `
      <div class="screen-content">
        <div class="screen-header">
          <div class="screen-header-title">⚡ POWER GRID & DISTRIBUTION</div>
          <div class="screen-header-tag">STATION 02 // ELECTRICAL</div>
        </div>
        <div class="screen-body">
          <div class="screen-row">
            <div>
              <span style="color: #94a3b8;">GEN: </span><b style="color: #10b981">${reactor.electricOutput} MWe</b>
              <span style="color: #94a3b8; margin-left: 6px;">DEM: </span><b>${grid.totalDemand} MW</b>
            </div>
            <button class="screen-btn primary" onclick="window.__NPP_GAME__.powerGridSim.rebalance()">AUTO-BALANCE</button>
          </div>

          <!-- 4 Sectors -->
          ${grid.sectors.map((sec, idx) => `
            <div class="screen-row" style="border-left: 3px solid ${sec.color}; padding: 3px 6px;">
              <div style="flex: 1;">
                <div style="font-weight: 700; font-size: 10px; color: ${sec.enabled ? '#f8fafc' : '#64748b'};">${sec.name} [P${sec.priority}]</div>
                <div style="font-size: 9px; color: #94a3b8;">Dem: ${sec.demand} MW | Alloc: <b>${sec.allocated} MW</b></div>
              </div>
              <div style="display: flex; gap: 2px;">
                <button class="screen-btn" style="padding: 1px 4px; font-size: 8px;" onclick="window.__NPP_GAME__.powerGridSim.sectors[${idx}].allocated = Math.max(0, window.__NPP_GAME__.powerGridSim.sectors[${idx}].allocated - 20)">-20</button>
                <button class="screen-btn" style="padding: 1px 4px; font-size: 8px;" onclick="window.__NPP_GAME__.powerGridSim.sectors[${idx}].allocated += 20">+20</button>
                <button class="screen-btn ${sec.enabled ? '' : 'danger'}" style="padding: 1px 4px; font-size: 8px;" onclick="window.__NPP_GAME__.powerGridSim.toggleSector(${idx})">${sec.enabled ? 'ON' : 'OFF'}</button>
              </div>
            </div>
          `).join('')}

          <div class="screen-row">
            <div>
              <span style="color: #94a3b8;">Stability: </span><b>${grid.gridStability.toFixed(1)}%</b>
              <span style="color: #94a3b8; margin-left: 6px;">Rep: </span><b style="color: #a855f7">${grid.reputation.toFixed(1)}%</b>
            </div>
            <div style="color: #10b981; font-weight: 700;">+$${grid.currentRevenueRate}/min</div>
          </div>

          <div style="display: gap: 4px; display: flex;">
            <button class="screen-btn ${grid.contracts[1].active ? 'primary' : ''}" style="flex: 1; font-size: 9px;" onclick="window.__NPP_GAME__.powerGridSim.toggleContract('peak_surge')">PEAK SURGE (1.35x)</button>
            <button class="screen-btn ${grid.contracts[2].active ? 'primary' : ''}" style="flex: 1; font-size: 9px;" onclick="window.__NPP_GAME__.powerGridSim.toggleContract('green_tier')">CLEAN TIER (1.20x)</button>
          </div>
        </div>
      </div>
    `;
  }

  renderShiftScreen() {
    const mon = document.getElementById('monitor-shift');
    if (!mon) return;

    const game = this.game;
    const staff = game.staffSim;

    mon.innerHTML = `
      <div class="screen-content">
        <div class="screen-header">
          <div class="screen-header-title">👥 SHIFT LOGISTICS & AUDITS</div>
          <div class="screen-header-tag">STATION 03 // SHIFT MGR</div>
        </div>
        <div class="screen-body">
          <div class="screen-row">
            <div>
              <b>SHIFT #${game.shiftNumber}</b> [${game.getFormattedTime()}] | Spd: <b>${game.timeSpeed}x</b>
            </div>
            <div style="display: flex; gap: 3px;">
              <button class="screen-btn" style="padding: 2px 5px;" onclick="window.__NPP_GAME__.timeSpeed = 0">⏸</button>
              <button class="screen-btn" style="padding: 2px 5px;" onclick="window.__NPP_GAME__.timeSpeed = 1">1x</button>
              <button class="screen-btn" style="padding: 2px 5px;" onclick="window.__NPP_GAME__.timeSpeed = 2">2x</button>
              <button class="screen-btn" style="padding: 2px 5px;" onclick="window.__NPP_GAME__.sound.toggleMute()">🔊</button>
            </div>
          </div>

          <!-- Staff Table -->
          <div style="max-height: 110px; overflow-y: auto; display: flex; flex-direction: column; gap: 3px;">
            ${staff.staffMembers.map(s => `
              <div class="screen-row" style="padding: 3px 5px;">
                <div style="flex: 1;">
                  <span style="font-weight: 700; color: ${s.color}; font-size: 10px;">${s.name}</span>
                  <span style="font-size: 8px; color: #94a3b8;"> (${s.station.toUpperCase()}) | Fat: ${Math.round(s.fatigue)}%</span>
                </div>
                <div style="display: flex; gap: 2px;">
                  <button class="screen-btn" style="padding: 1px 3px; font-size: 8px;" onclick="window.__NPP_GAME__.staffSim.sendToBreak('${s.id}')">BREAK</button>
                  <button class="screen-btn" style="padding: 1px 3px; font-size: 8px;" onclick="
                    const st = ['reactor','electrical','shift','maintenance','safety','waste'];
                    const nxt = st[(st.indexOf('${s.station}')+1)%st.length];
                    window.__NPP_GAME__.staffSim.assignStaff('${s.id}', nxt);
                  ">CYCLE</button>
                </div>
              </div>
            `).join('')}
          </div>

          <div style="display: flex; gap: 4px;">
            ${staff.candidates.length > 0 ? `
              <button class="screen-btn success" style="flex: 1; font-size: 9px; padding: 4px;" onclick="window.__NPP_GAME__.staffSim.hireCandidate('${staff.candidates[0].id}')">HIRE: ${staff.candidates[0].name} ($500)</button>
            ` : `<div style="color: #64748b; font-size: 9px; margin: auto;">No applicants this shift.</div>`}
          </div>

          <button class="screen-btn primary" style="padding: 8px; font-size: 11px;" onclick="window.__NPP_GAME__.endShift()">🏁 COMPLETE & AUDIT SHIFT</button>
        </div>
      </div>
    `;
  }

  renderMaintenanceScreen() {
    const mon = document.getElementById('monitor-maintenance');
    if (!mon) return;

    const maint = this.game.maintenanceSim;

    mon.innerHTML = `
      <div class="screen-content">
        <div class="screen-header">
          <div class="screen-header-title">🔧 HARDWARE & DIAGNOSTICS</div>
          <div class="screen-header-tag">STATION 04 // MAINT</div>
        </div>
        <div class="screen-body">
          <div style="max-height: 120px; overflow-y: auto; display: flex; flex-direction: column; gap: 3px;">
            ${maint.subsystems.map(sub => {
              const col = sub.health > 75 ? '#10b981' : sub.health > 35 ? '#f59e0b' : '#ef4444';
              return `
                <div class="screen-row" style="padding: 3px 5px;">
                  <div style="flex: 1;">
                    <div style="font-weight: 700; font-size: 10px;">${sub.name}</div>
                    <div style="font-size: 8px; color: ${col};">${sub.status} (${Math.round(sub.inRepair ? sub.repairProgress : sub.health)}%)</div>
                  </div>
                  <button class="screen-btn ${sub.inRepair ? '' : 'primary'}" style="padding: 1px 4px; font-size: 8px;" onclick="window.__NPP_GAME__.maintenanceSim.startRepair('${sub.id}')">${sub.inRepair ? 'REP...' : 'REPAIR'}</button>
                </div>
              `;
            }).join('')}
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 3px;">
            <button class="screen-btn" style="font-size: 8px; padding: 3px;" onclick="window.__NPP_GAME__.maintenanceSim.orderPart('seal', 2)">SEALS (${maint.inventory.seal.count}) +2 [$600]</button>
            <button class="screen-btn" style="font-size: 8px; padding: 3px;" onclick="window.__NPP_GAME__.maintenanceSim.orderPart('bearing', 1)">BEARING (${maint.inventory.bearing.count}) +1 [$650]</button>
            <button class="screen-btn" style="font-size: 8px; padding: 3px;" onclick="window.__NPP_GAME__.maintenanceSim.orderPart('relay', 4)">RELAYS (${maint.inventory.relay.count}) +4 [$600]</button>
            <button class="screen-btn" style="font-size: 8px; padding: 3px;" onclick="window.__NPP_GAME__.maintenanceSim.orderPart('filter', 2)">FILTERS (${maint.inventory.filter.count}) +2 [$400]</button>
          </div>

          <div style="font-size: 9px; color: #94a3b8; text-align: center;">
            ${maint.activeDeliveries.length > 0 ? `🚚 Delivery: ETA ${Math.ceil(maint.activeDeliveries[0].remainingTime)}s` : 'Stock nominal // Logistics clear'}
          </div>
        </div>
      </div>
    `;
  }

  renderSafetyScreen() {
    const mon = document.getElementById('monitor-safety');
    if (!mon) return;

    const safety = this.game.safetySim;
    const safeCol = safety.safetyIndex > 85 ? '#10b981' : '#f59e0b';

    mon.innerHTML = `
      <div class="screen-content">
        <div class="screen-header">
          <div class="screen-header-title">🛡️ SAFETY & RADIATION</div>
          <div class="screen-header-tag">STATION 05 // SAFETY</div>
        </div>
        <div class="screen-body">
          <div class="screen-row">
            <div>
              <div style="font-size: 9px; color: #94a3b8;">SAFETY COMPLIANCE:</div>
              <div style="font-size: 18px; font-weight: 800; color: ${safeCol}">${Math.round(safety.safetyIndex)}%</div>
            </div>
            <button class="screen-btn primary" onclick="window.__NPP_GAME__.safetySim.runSafetyAudit()">${safety.auditInProgress ? `AUDIT (${Math.round(safety.auditProgress)}%)` : 'AUDIT ($400)'}</button>
          </div>

          ${safety.sensors.map(s => `
            <div class="screen-row" style="padding: 3px 6px;">
              <span style="font-size: 9px;">${s.name}</span>
              <b style="font-size: 10px; color: ${s.status === 'ELEVATED' ? '#ef4444' : '#10b981'}">${s.level.toFixed(3)} ${s.unit}</b>
            </div>
          `).join('')}

          <div class="screen-row" style="padding: 3px 6px;">
            <span style="font-size: 9px;">Fire Suppression Line</span>
            <b style="font-size: 10px;">${safety.fireSuppressionPressure.toFixed(1)} Bar</b>
          </div>

          <button class="screen-btn" style="font-size: 9px; padding: 4px;" onclick="window.__NPP_GAME__.safetySim.testFireSuppression()">PURGE & TEST FIRE SUPPRESSION</button>
        </div>
      </div>
    `;
  }

  renderWasteScreen() {
    const mon = document.getElementById('monitor-waste');
    if (!mon) return;

    const waste = this.game.wasteSim;

    mon.innerHTML = `
      <div class="screen-content">
        <div class="screen-header">
          <div class="screen-header-title">☢️ SPENT FUEL & WASTE</div>
          <div class="screen-header-tag">STATION 06 // WASTE</div>
        </div>
        <div class="screen-body">
          <div class="screen-row">
            <div>
              <div style="font-weight: 700; font-size: 10px;">Spent Fuel Pool Inventory</div>
              <div style="font-size: 9px; color: #94a3b8;">${waste.poolAssemblies} / ${waste.poolCapacity} Assemblies (${waste.poolTemp.toFixed(1)} °C)</div>
            </div>
            <button class="screen-btn ${waste.poolCoolingActive ? 'primary' : 'danger'}" style="font-size: 9px; padding: 2px 6px;" onclick="window.__NPP_GAME__.wasteSim.togglePoolCooling()">${waste.poolCoolingActive ? 'COOLING ON' : 'PUMP OFF'}</button>
          </div>

          <div class="screen-row">
            <div>
              <div style="font-weight: 700; font-size: 10px;">Dry Cask Storage Yard</div>
              <div style="font-size: 9px; color: #94a3b8;">${waste.dryCasksFilled} / ${waste.dryCasksMax} Casks Encapsulated</div>
            </div>
          </div>

          <button class="screen-btn primary" style="font-size: 9px; padding: 5px;" onclick="window.__NPP_GAME__.wasteSim.startTransferToDryCask()">${waste.transferInProgress ? `ENCAPSULATING (${Math.round(waste.transferProgress)}%)` : 'SEAL TO DRY CASK (4 ASSY / $500)'}</button>

          <button class="screen-btn" style="font-size: 9px; padding: 5px;" onclick="window.__NPP_GAME__.wasteSim.dispatchOffsiteConvoy()">${waste.transportConvoyScheduled ? `CONVOY EN ROUTE (${Math.round(waste.transportProgress)}%)` : 'DISPATCH CONVOY (2 CASKS / $1,200)'}</button>
        </div>
      </div>
    `;
  }
}
