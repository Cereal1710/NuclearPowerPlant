/**
 * CSS3DBigScreen - Massive 3D Front Wall Display
 * Renders master telemetry, branding, live tickers & emergency alarms in 3D.
 */
export class CSS3DBigScreen {
  constructor(game, worldEl) {
    this.game = game;
    this.worldEl = worldEl;
    this.build();
  }

  build() {
    this.el = document.createElement('div');
    this.el.className = 'big-wall-display-3d';

    this.el.innerHTML = `
      <div class="big-wall-header" id="big-wall-hdr">
        <div class="big-wall-title" id="big-wall-title">⚡ NUCLEARIS NUCLEAR POWER PLANT</div>
        <div class="big-wall-meta" id="big-wall-meta">SHIFT #1 // 08:00 | TREASURY: $14,800</div>
      </div>
      <div class="big-wall-body" id="big-wall-body">
        <!-- 4 Telemetry Cards injected dynamically in update() -->
      </div>
      <div class="big-wall-ticker" id="big-wall-ticker">
        [SYS] ALL PRIMARY SYSTEMS NOMINAL // NEUTRON ENERGY CORP MONITORING ACTIVE // CLICK ANY WORKSTATION TO OPERATE
      </div>
    `;

    this.worldEl.appendChild(this.el);
  }

  update() {
    const reactor = this.game.reactorSim;
    const grid = this.game.powerGridSim;
    const safety = this.game.safetySim;
    const waste = this.game.wasteSim;
    const events = this.game.eventSim;

    const hdrEl = document.getElementById('big-wall-hdr');
    const titleEl = document.getElementById('big-wall-title');
    const metaEl = document.getElementById('big-wall-meta');
    const bodyEl = document.getElementById('big-wall-body');
    const tickerEl = document.getElementById('big-wall-ticker');

    if (events.emergencyActive) {
      this.el.classList.add('emergency-active');
      if (hdrEl) hdrEl.classList.add('emergency');
      if (titleEl) {
        titleEl.textContent = `🚨 CRITICAL EMERGENCY: ${events.emergencyTitle} 🚨`;
        titleEl.style.color = '#ffffff';
      }
      if (metaEl) {
        metaEl.textContent = `HIT PHYSICAL 3D SCRAM BUTTON ON REACTOR DESK! [${Math.max(0, events.scramChallengeTimer).toFixed(1)}s]`;
        metaEl.style.color = '#fca5a5';
      }
    } else {
      this.el.classList.remove('emergency-active');
      if (hdrEl) hdrEl.classList.remove('emergency');
      if (titleEl) {
        titleEl.textContent = `⚡ NUCLEARIS NUCLEAR POWER PLANT // NEUTRON ENERGY CORP.`;
        titleEl.style.color = '#38bdf8';
      }
      if (metaEl) {
        metaEl.textContent = `SHIFT #${this.game.shiftNumber} [${this.game.getFormattedTime()}] | TREASURY: $${Math.round(this.game.finances.balance).toLocaleString()}`;
        metaEl.style.color = '#f8fafc';
      }
    }

    // Update body telemetry
    const tempCol = reactor.coreTemp > 380 ? '#ef4444' : reactor.coreTemp > 340 ? '#f59e0b' : '#10b981';
    const stabCol = grid.gridStability > 95 ? '#10b981' : '#f59e0b';
    const safeCol = safety.safetyIndex > 85 ? '#10b981' : '#f59e0b';

    bodyEl.innerHTML = `
      <div class="big-wall-card">
        <div class="big-wall-card-title">REACTOR CORE TELEMETRY</div>
        <div style="font-size: 12px; color: #94a3b8;">Core Temperature:</div>
        <div class="big-wall-card-val" style="color: ${tempCol}">${reactor.coreTemp.toFixed(1)} °C</div>
        <div style="font-size: 11px; color: #94a3b8;">Reactivity: <b style="color: #38bdf8">${reactor.reactivity.toFixed(1)}%</b> | Steam: <b>${reactor.steamPressure.toFixed(1)} Bar</b></div>
        <div style="font-size: 11px; color: ${reactor.statusColor}; font-weight: 800; margin-top: auto;">${reactor.statusText}</div>
      </div>

      <div class="big-wall-card">
        <div class="big-wall-card-title">METRO ELECTRICAL GRID</div>
        <div style="font-size: 12px; color: #94a3b8;">Electric Output / Demand:</div>
        <div class="big-wall-card-val" style="color: #10b981">${Math.round(reactor.electricOutput)} <span style="font-size: 16px; color: #94a3b8;">/ ${grid.totalDemand} MW</span></div>
        <div style="font-size: 11px; color: #94a3b8;">Grid Stability: <b style="color: ${stabCol}">${grid.gridStability.toFixed(1)}%</b></div>
        <div style="font-size: 11px; color: #38bdf8; font-weight: 700; margin-top: auto;">Inflow: +$${grid.currentRevenueRate}/min | Pen: -$${grid.currentPenaltyRate}/min</div>
      </div>

      <div class="big-wall-card">
        <div class="big-wall-card-title">SAFETY & RAD MONITORING</div>
        <div style="font-size: 12px; color: #94a3b8;">Plant Safety Compliance:</div>
        <div class="big-wall-card-val" style="color: ${safeCol}">${Math.round(safety.safetyIndex)}%</div>
        <div style="font-size: 11px; color: #94a3b8;">Containment Rad: <b style="color: #10b981">${safety.sensors[0].level.toFixed(3)} μSv/h</b></div>
        <div style="font-size: 11px; color: #cbd5e1; margin-top: auto;">Class A - Neutron Energy Corp Certified</div>
      </div>

      <div class="big-wall-card">
        <div class="big-wall-card-title">BYPRODUCT & WASTE STORAGE</div>
        <div style="font-size: 12px; color: #94a3b8;">Spent Fuel Pool Load:</div>
        <div class="big-wall-card-val" style="color: #38bdf8">${waste.poolAssemblies} <span style="font-size: 16px; color: #94a3b8;">/ ${waste.poolCapacity}</span></div>
        <div style="font-size: 11px; color: #94a3b8;">Dry Storage Casks: <b>${waste.dryCasksFilled} / 12 Casks</b></div>
        <div style="font-size: 11px; color: #94a3b8; margin-top: auto;">Pool Temp: <b>${waste.poolTemp.toFixed(1)} °C</b> (Cooling Active)</div>
      </div>
    `;

    // Live Ticker
    if (events.logs.length > 0) {
      const latest = events.logs[0];
      tickerEl.textContent = `[${latest.time}] ${latest.text.toUpperCase()}`;
      tickerEl.style.color = latest.text.includes('EMERGENCY') ? '#ef4444' : latest.text.includes('Warning') ? '#f59e0b' : '#38bdf8';
    }
  }
}

