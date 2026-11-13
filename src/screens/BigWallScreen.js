import { BaseScreen } from './BaseScreen.js';

export class BigWallScreen extends BaseScreen {
  constructor(game) {
    // Ultra high resolution wide aspect canvas (2048 x 768)
    super(game, 2048, 768);
    this.tickerOffset = 0;
  }

  render() {
    const ctx = this.ctx;
    const reactor = this.game.reactorSim;
    const grid = this.game.powerGridSim;
    const safety = this.game.safetySim;
    const events = this.game.eventSim;

    // Dark high tech background
    ctx.fillStyle = '#060911';
    ctx.fillRect(0, 0, this.width, this.height);

    // Subtle hexagonal / tech grid pattern
    ctx.strokeStyle = '#0e1726';
    ctx.lineWidth = 1;
    for (let x = 0; x < this.width; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.height);
      ctx.stroke();
    }
    for (let y = 0; y < this.height; y += 64) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.width, y);
      ctx.stroke();
    }

    // Emergency Flashing Mode
    if (events.emergencyActive) {
      const flash = Math.floor(Date.now() / 250) % 2 === 0;
      ctx.fillStyle = flash ? '#7f1d1d' : '#450a0a';
      ctx.fillRect(0, 0, this.width, 140);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 44px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`🚨 CRITICAL EMERGENCY: ${events.emergencyTitle} 🚨`, this.width / 2, 60);

      ctx.fillStyle = '#fca5a5';
      ctx.font = 'bold 36px sans-serif';
      const secLeft = Math.max(0, events.scramChallengeTimer).toFixed(1);
      ctx.fillText(`OPERATOR ACTION: ACTIVATE 3D SCRAM BUTTON ON REACTOR DESK! [TIME LEFT: ${secLeft}s]`, this.width / 2, 110);
      ctx.textAlign = 'left';
    } else {
      // Normal Top Header
      ctx.fillStyle = '#0b1324';
      ctx.fillRect(0, 0, this.width, 110);
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(0, 108, this.width, 3);

      // Logo & Plant name
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 40px sans-serif';
      ctx.fillText('⚛ NUCLEARIS NUCLEAR POWER PLANT', 40, 56);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '18px sans-serif';
      ctx.fillText('NEUTRON ENERGY CORP. // SECTOR-4 HIGH COMMAND MAIN DISPLAY', 42, 90);

      // Shift & Treasury Clock
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 32px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`SHIFT #${this.game.shiftNumber} [${this.game.getFormattedTime()}]`, this.width - 40, 52);

      ctx.fillStyle = '#10b981';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText(`TREASURY: $${Math.round(this.game.finances.balance).toLocaleString()}`, this.width - 40, 88);
      ctx.textAlign = 'left';
    }

    // 4 Grand Telemetry Blocks
    const blockY = 135;
    const blockW = 460;
    const blockH = 480;

    // Block 1: Reactor Core
    ctx.fillStyle = '#0d1527';
    ctx.roundRect(40, blockY, blockW, blockH, 12);
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('REACTOR CORE DYNAMICS', 65, blockY + 45);

    const tempCol = reactor.coreTemp > 380 ? '#ef4444' : reactor.coreTemp > 340 ? '#f59e0b' : '#10b981';
    ctx.fillStyle = '#94a3b8';
    ctx.font = '18px sans-serif';
    ctx.fillText('Core Temperature:', 65, blockY + 95);
    ctx.fillStyle = tempCol;
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText(`${reactor.coreTemp.toFixed(1)} °C`, 65, blockY + 140);
    this.drawProgressBar(65, blockY + 155, 410, 18, reactor.coreTemp, 500, tempCol);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '18px sans-serif';
    ctx.fillText('Reactivity:', 65, blockY + 210);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText(`${reactor.reactivity.toFixed(1)} %`, 65, blockY + 250);
    this.drawProgressBar(65, blockY + 265, 410, 18, reactor.reactivity, 100, '#38bdf8');

    ctx.fillStyle = '#94a3b8';
    ctx.font = '18px sans-serif';
    ctx.fillText('Steam Pressure:', 65, blockY + 320);
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText(`${reactor.steamPressure.toFixed(1)} Bar`, 65, blockY + 360);

    ctx.fillStyle = reactor.statusColor;
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(`STATUS: ${reactor.statusText}`, 65, blockY + 430);

    // Block 2: Electrical Output & City Demand
    const b2X = 530;
    ctx.fillStyle = '#0d1527';
    ctx.roundRect(b2X, blockY, blockW, blockH, 12);
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('METRO POWER GRID', b2X + 25, blockY + 45);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '18px sans-serif';
    ctx.fillText('Electric Generation:', b2X + 25, blockY + 95);
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText(`${Math.round(reactor.electricOutput)} MWe`, b2X + 25, blockY + 140);
    this.drawProgressBar(b2X + 25, blockY + 155, 410, 18, reactor.electricOutput, 1200, '#10b981');

    ctx.fillStyle = '#94a3b8';
    ctx.font = '18px sans-serif';
    ctx.fillText('City Grid Demand:', b2X + 25, blockY + 210);
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText(`${grid.totalDemand} MW`, b2X + 25, blockY + 250);
    this.drawProgressBar(b2X + 25, blockY + 265, 410, 18, grid.totalSupplied, grid.totalDemand, '#38bdf8');

    ctx.fillStyle = '#94a3b8';
    ctx.font = '18px sans-serif';
    ctx.fillText('Grid Stability Index:', b2X + 25, blockY + 320);
    const stabCol = grid.gridStability > 95 ? '#10b981' : '#f59e0b';
    ctx.fillStyle = stabCol;
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText(`${grid.gridStability.toFixed(1)}%`, b2X + 25, blockY + 360);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '18px sans-serif';
    ctx.fillText(`Revenue Flow: +$${grid.currentRevenueRate}/min | Pen: -$${grid.currentPenaltyRate}/min`, b2X + 25, blockY + 430);

    // Block 3: Safety, Containment & Waste
    const b3X = 1020;
    ctx.fillStyle = '#0d1527';
    ctx.roundRect(b3X, blockY, blockW, blockH, 12);
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('PLANT SAFETY & STORAGE', b3X + 25, blockY + 45);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '18px sans-serif';
    ctx.fillText('Safety Compliance Score:', b3X + 25, blockY + 95);
    const safeCol = safety.safetyIndex > 85 ? '#10b981' : '#f59e0b';
    ctx.fillStyle = safeCol;
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText(`${Math.round(safety.safetyIndex)}%`, b3X + 25, blockY + 140);
    this.drawProgressBar(b3X + 25, blockY + 155, 410, 18, safety.safetyIndex, 100, safeCol);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '18px sans-serif';
    ctx.fillText('Containment Rad (Primary):', b3X + 25, blockY + 210);
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText(`${safety.sensors[0].level.toFixed(3)} μSv/h`, b3X + 25, blockY + 250);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '18px sans-serif';
    ctx.fillText('Spent Fuel Pool Load:', b3X + 25, blockY + 320);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText(`${this.game.wasteSim.poolAssemblies} / ${this.game.wasteSim.poolCapacity} Assemblies`, b3X + 25, blockY + 360);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '18px sans-serif';
    ctx.fillText(`Dry Casks: ${this.game.wasteSim.dryCasksFilled}/12 | Pool Temp: ${this.game.wasteSim.poolTemp.toFixed(1)}°C`, b3X + 25, blockY + 430);

    // Block 4: Live Event Ticker & Desks Guide
    const b4X = 1510;
    ctx.fillStyle = '#0d1527';
    ctx.roundRect(b4X, blockY, blockW + 38, blockH, 12);
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('LIVE PLANT LOG & TELEMETRY', b4X + 25, blockY + 45);

    for (let l = 0; l < Math.min(events.logs.length, 7); l++) {
      const log = events.logs[l];
      const ly = blockY + 95 + l * 46;

      ctx.fillStyle = '#334155';
      ctx.roundRect(b4X + 25, ly, 448, 38, 4);
      ctx.fill();

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 13px monospace';
      ctx.fillText(`[${log.time}]`, b4X + 35, ly + 24);

      ctx.fillStyle = log.text.includes('EMERGENCY') ? '#ef4444' : log.text.includes('Warning') ? '#f59e0b' : '#cbd5e1';
      ctx.font = '13px sans-serif';
      ctx.fillText(log.text.length > 42 ? log.text.substring(0, 42) + '...' : log.text, b4X + 115, ly + 24);
    }

    // Bottom Ticker Bar
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 660, this.width, 108);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 658, this.width, 2);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('STATION DIRECTORY // CLICK ANY 3D WORKSTATION TO ZOOM IN & OPERATE:', 40, 700);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '18px sans-serif';
    ctx.fillText('[01] REACTOR DESK    [02] ELECTRICAL DESK    [03] SHIFT MANAGER    [04] MAINTENANCE    [05] SAFETY OFFICER    [06] WASTE MANAGEMENT', 40, 735);
  }
}

