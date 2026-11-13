import { BaseScreen } from './BaseScreen.js';

export class ReactorScreen extends BaseScreen {
  constructor(game) {
    super(game, 1024, 640);
    this.setupButtons();
  }

  setupButtons() {
    this.clearElements();

    // Control rods adjusters
    for (let i = 0; i < 4; i++) {
      const rx = 50 + i * 140;
      this.registerButton(`rod_down_${i}`, rx, 350, 56, 32, () => {
        const cur = this.game.reactorSim.targetRods[i];
        this.game.reactorSim.setRod(i, cur - 10);
        this.game.sound.playClick();
      }, '-10%');

      this.registerButton(`rod_up_${i}`, rx + 62, 350, 56, 32, () => {
        const cur = this.game.reactorSim.targetRods[i];
        this.game.reactorSim.setRod(i, cur + 10);
        this.game.sound.playClick();
      }, '+10%');
    }

    // Quick bank buttons
    this.registerButton('all_in', 50, 400, 120, 36, () => {
      for (let i = 0; i < 4; i++) this.game.reactorSim.setRod(i, 100);
      this.game.sound.playHeavySwitch();
    }, 'INSERT ALL (100%)');

    this.registerButton('all_nominal', 180, 400, 120, 36, () => {
      for (let i = 0; i < 4; i++) this.game.reactorSim.setRod(i, 65);
      this.game.sound.playHeavySwitch();
    }, 'NOMINAL (65%)');

    this.registerButton('all_max', 310, 400, 120, 36, () => {
      for (let i = 0; i < 4; i++) this.game.reactorSim.setRod(i, 40);
      this.game.sound.playHeavySwitch();
    }, 'HIGH OUTPUT (40%)');

    // Coolant pump controls
    for (let p = 0; p < 3; p++) {
      const px = 640 + p * 120;
      this.registerButton(`pump_toggle_${p}`, px, 260, 100, 32, () => {
        this.game.reactorSim.togglePump(p);
        this.game.sound.playHeavySwitch();
      }, 'TOGGLE PUMP');

      this.registerButton(`pump_down_${p}`, px, 350, 45, 30, () => {
        const cur = this.game.reactorSim.coolantPumps[p];
        this.game.reactorSim.setPump(p, cur - 10);
        this.game.sound.playClick();
      }, '-10%');

      this.registerButton(`pump_up_${p}`, px + 55, 350, 45, 30, () => {
        const cur = this.game.reactorSim.coolantPumps[p];
        this.game.reactorSim.setPump(p, cur + 10);
        this.game.sound.playClick();
      }, '+10%');
    }

    // Reset SCRAM button
    this.registerButton('reset_scram', 640, 560, 340, 48, () => {
      const ok = this.game.reactorSim.resetTrip();
      if (ok) {
        this.game.sound.playSuccess();
        this.game.eventSim.addLog('Reactor SCRAM interlocks reset. Commencing startup.');
      } else {
        this.game.sound.playError();
      }
    }, 'RESET SCRAM INTERLOCKS');
  }

  render() {
    const ctx = this.ctx;
    const sim = this.game.reactorSim;

    // Dark sleek background
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, this.width, this.height);

    this.drawHeader('REACTOR CORE DYNAMICS', 'PRIMARY THERMAL CONTROLS', 'STATION 01 // REACTOR');

    // Primary status banner
    ctx.fillStyle = sim.statusColor + '22';
    ctx.fillRect(24, 82, this.width - 48, 48);
    ctx.strokeStyle = sim.statusColor;
    ctx.strokeRect(24, 82, this.width - 48, 48);

    ctx.fillStyle = sim.statusColor;
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('STATUS: ' + sim.statusText, 44, 113);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`THERMAL: ${Math.round(sim.thermalOutput)} MWth | GENERATION: ${Math.round(sim.electricOutput)} MWe`, this.width - 44, 112);
    ctx.textAlign = 'left';

    // Left Panel: Core Metrics & Control Rods
    ctx.fillStyle = '#111827';
    ctx.roundRect(24, 142, 580, 474, 8);
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('CONTROL ROD BANKS (INDEPENDENT HYDRAULIC DRIVES)', 44, 172);

    // Rod visualizers
    for (let i = 0; i < 4; i++) {
      const rx = 50 + i * 140;
      const cur = Math.round(sim.controlRods[i]);
      const target = sim.targetRods[i];

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(rx, 190, 118, 110);
      ctx.strokeStyle = '#334155';
      ctx.strokeRect(rx, 190, 118, 110);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px sans-serif';
      ctx.fillText(`BANK #${i + 1}`, rx + 10, 210);

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText(`${cur}%`, rx + 10, 242);

      ctx.fillStyle = '#64748b';
      ctx.font = '11px sans-serif';
      ctx.fillText(`TARGET: ${target}%`, rx + 10, 264);

      // Rod depth mini bar
      this.drawProgressBar(rx + 10, 276, 98, 14, cur, 100, '#38bdf8');
    }

    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px sans-serif';
    ctx.fillText('Note: 0% = Fully Withdrawn (Maximum Power) | 100% = Fully Inserted (Shutdown)', 50, 330);

    // Core Gauges summary
    ctx.fillStyle = '#0f172a';
    ctx.roundRect(50, 460, 528, 136, 6);
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.stroke();

    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('CORE SENSOR TELEMETRY', 66, 488);

    // Core Temp Gauge
    const tempColor = sim.coreTemp > 380 ? '#ef4444' : sim.coreTemp > 340 ? '#f59e0b' : '#10b981';
    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px sans-serif';
    ctx.fillText('Core Temperature:', 66, 520);
    ctx.fillStyle = tempColor;
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(`${sim.coreTemp.toFixed(1)} °C`, 210, 520);
    this.drawProgressBar(310, 508, 250, 16, sim.coreTemp, 500, tempColor, `${sim.coreTemp.toFixed(0)} / 500 °C`);

    // Reactivity
    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px sans-serif';
    ctx.fillText('Reactivity Index:', 66, 550);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(`${sim.reactivity.toFixed(1)} %`, 210, 550);
    this.drawProgressBar(310, 538, 250, 16, sim.reactivity, 100, '#38bdf8');

    // Steam pressure
    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px sans-serif';
    ctx.fillText('Steam Pressure:', 66, 580);
    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(`${sim.steamPressure.toFixed(1)} Bar`, 210, 580);
    this.drawProgressBar(310, 568, 250, 16, sim.steamPressure, 100, '#a855f7', `${sim.steamPressure.toFixed(1)} Bar`);

    // Right Panel: Coolant Loops & SCRAM Notice
    ctx.fillStyle = '#111827';
    ctx.roundRect(620, 142, 380, 474, 8);
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('PRIMARY COOLANT PUMPS', 640, 172);

    for (let p = 0; p < 3; p++) {
      const px = 640 + p * 120;
      const pumpState = sim.pumpStates[p];
      const speed = sim.coolantPumps[p];

      ctx.fillStyle = '#1e293b';
      ctx.fillRect(px, 190, 108, 60);
      ctx.strokeStyle = '#334155';
      ctx.strokeRect(px, 190, 108, 60);

      ctx.fillStyle = pumpState ? '#10b981' : '#ef4444';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(`PUMP ${['A', 'B', 'C'][p]}: ${pumpState ? 'ONLINE' : 'OFF'}`, px + 8, 212);

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(`${speed}% RPM`, px + 8, 238);

      // speed bar
      this.drawProgressBar(px, 310, 100, 14, speed, 100, '#06b6d4');
    }

    // Physical SCRAM box notice
    ctx.fillStyle = '#450a0a';
    ctx.roundRect(640, 410, 340, 130, 8);
    ctx.fill();
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.lineWidth = 1;

    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('⚠️ EMERGENCY SCRAM SYSTEM', 660, 442);

    ctx.fillStyle = '#fca5a5';
    ctx.font = '13px sans-serif';
    ctx.fillText('To execute emergency SCRAM shutdown:', 660, 470);
    ctx.fillText('Click the PHYSICAL RED SCRAM CONSOLE', 660, 492);
    ctx.fillText('located directly to the right of this desk.', 660, 514);

    // Draw registered buttons
    for (const btn of this.interactiveElements) {
      const isDanger = btn.id === 'all_in';
      const isPrimary = btn.id.includes('nominal') || btn.id === 'reset_scram';
      this.drawButton(btn, isPrimary, isDanger);
    }
  }
}

