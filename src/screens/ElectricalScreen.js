import { BaseScreen } from './BaseScreen.js';

export class ElectricalScreen extends BaseScreen {
  constructor(game) {
    super(game, 1024, 640);
    this.setupButtons();
  }

  setupButtons() {
    this.clearElements();

    // Auto-balance button
    this.registerButton('auto_balance', 400, 100, 200, 36, () => {
      this.game.powerGridSim.rebalance();
      this.game.sound.playClick();
    }, '⚡ AUTO-BALANCE GRID');

    // 4 Sectors
    for (let i = 0; i < 4; i++) {
      const sy = 195 + i * 95;

      this.registerButton(`toggle_sector_${i}`, 50, sy + 38, 90, 32, () => {
        this.game.powerGridSim.toggleSector(i);
        this.game.sound.playHeavySwitch();
      }, 'ON/OFF');

      this.registerButton(`sec_minus_${i}`, 400, sy + 38, 55, 32, () => {
        const sec = this.game.powerGridSim.sectors[i];
        sec.allocated = Math.max(0, sec.allocated - 20);
        this.game.sound.playClick();
      }, '-20');

      this.registerButton(`sec_plus_${i}`, 465, sy + 38, 55, 32, () => {
        const sec = this.game.powerGridSim.sectors[i];
        sec.allocated += 20;
        this.game.sound.playClick();
      }, '+20');

      this.registerButton(`sec_match_${i}`, 530, sy + 38, 85, 32, () => {
        const sec = this.game.powerGridSim.sectors[i];
        sec.allocated = sec.demand;
        this.game.sound.playClick();
      }, 'MATCH');
    }

    // Contract toggles
    this.registerButton('contract_peak', 650, 430, 320, 36, () => {
      this.game.powerGridSim.toggleContract('peak_surge');
    }, 'TOGGLE PEAK SURGE CONTRACT');

    this.registerButton('contract_green', 650, 480, 320, 36, () => {
      this.game.powerGridSim.toggleContract('green_tier');
    }, 'TOGGLE CLEAN ENERGY TIER');
  }

  render() {
    const ctx = this.ctx;
    const grid = this.game.powerGridSim;
    const reactor = this.game.reactorSim;

    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, this.width, this.height);

    this.drawHeader('POWER GRID & REVENUE DISTRIBUTION', 'ELECTRICAL LOAD DISPATCH', 'STATION 02 // ELECTRICAL');

    // Grid Stability banner
    const stabColor = grid.gridStability > 95 ? '#10b981' : grid.gridStability > 70 ? '#f59e0b' : '#ef4444';
    ctx.fillStyle = '#111827';
    ctx.roundRect(24, 82, this.width - 48, 70, 8);
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px sans-serif';
    ctx.fillText('GENERATION AVAILABLE:', 44, 110);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(`${reactor.electricOutput} MWe`, 44, 136);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px sans-serif';
    ctx.fillText('TOTAL CITY DEMAND:', 220, 110);
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(`${grid.totalDemand} MW`, 220, 136);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px sans-serif';
    ctx.fillText('GRID STABILITY:', 630, 110);
    ctx.fillStyle = stabColor;
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(`${grid.gridStability.toFixed(1)}%`, 630, 136);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px sans-serif';
    ctx.fillText('PUBLIC REPUTATION:', 820, 110);
    ctx.fillStyle = '#a855f7';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(`${grid.reputation.toFixed(1)}%`, 820, 136);

    // Left Panel: 4 Sectors
    ctx.fillStyle = '#111827';
    ctx.roundRect(24, 166, 600, 450, 8);
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('CITY LOAD CENTERS & SUBSTATION DISTRIBUTION', 44, 192);

    for (let i = 0; i < grid.sectors.length; i++) {
      const sec = grid.sectors[i];
      const sy = 205 + i * 95;

      ctx.fillStyle = '#0f172a';
      ctx.roundRect(38, sy, 572, 85, 6);
      ctx.fill();
      ctx.strokeStyle = sec.enabled ? '#334155' : '#7f1d1d';
      ctx.stroke();

      // Priority tag
      ctx.fillStyle = sec.color;
      ctx.fillRect(38, sy, 6, 85);

      ctx.fillStyle = sec.enabled ? '#f8fafc' : '#64748b';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText(`${sec.name} [P${sec.priority}]`, 56, sy + 24);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '13px sans-serif';
      ctx.fillText(`Demand: ${sec.demand} MW | Supplied: `, 300, sy + 24);

      const statusColor = !sec.enabled ? '#ef4444' : sec.allocated >= sec.demand ? '#10b981' : '#f59e0b';
      ctx.fillStyle = statusColor;
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(`${sec.allocated} MW`, 460, sy + 24);

      // Mini bar
      this.drawProgressBar(150, sy + 44, 230, 20, sec.allocated, Math.max(sec.demand, 1), statusColor);
    }

    // Right Panel: Financial & Contracts
    ctx.fillStyle = '#111827';
    ctx.roundRect(636, 166, 364, 450, 8);
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('FINANCES & POWER CONTRACTS', 654, 194);

    // Live revenue rates
    ctx.fillStyle = '#0f172a';
    ctx.roundRect(654, 212, 328, 120, 6);
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px sans-serif';
    ctx.fillText('Revenue Inflow:', 670, 240);
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(`+$${grid.currentRevenueRate} / min`, 820, 240);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px sans-serif';
    ctx.fillText('Deficit Penalties:', 670, 275);
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(`-$${grid.currentPenaltyRate} / min`, 820, 275);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px sans-serif';
    ctx.fillText('Treasury Balance:', 670, 310);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(`$${Math.round(this.game.finances.balance).toLocaleString()}`, 820, 310);

    // Active Contracts
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('COMMERCIAL CONTRACTS', 654, 360);

    for (let c = 0; c < grid.contracts.length; c++) {
      const con = grid.contracts[c];
      ctx.fillStyle = con.active ? '#10b981' : '#64748b';
      ctx.fillRect(654, 380 + c * 20, 10, 10);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '12px sans-serif';
      ctx.fillText(`${con.name} (${con.bonus}x)`, 674, 390 + c * 20);
    }

    // Draw buttons
    for (const btn of this.interactiveElements) {
      const isPrimary = btn.id === 'auto_balance';
      this.drawButton(btn, isPrimary);
    }
  }
}

