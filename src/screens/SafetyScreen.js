import { BaseScreen } from './BaseScreen.js';

export class SafetyScreen extends BaseScreen {
  constructor(game) {
    super(game, 1024, 640);
    this.setupButtons();
  }

  setupButtons() {
    this.clearElements();

    const safety = this.game.safetySim;

    this.registerButton('run_audit', 650, 480, 330, 44, () => {
      safety.runSafetyAudit();
    }, safety.auditInProgress ? 'AUDIT IN PROGRESS...' : 'RUN REGULATORY AUDIT ($400)');

    this.registerButton('test_fire', 650, 540, 330, 40, () => {
      safety.testFireSuppression();
    }, 'PURGE & TEST FIRE SUPPRESSION');
  }

  render() {
    const ctx = this.ctx;
    const safety = this.game.safetySim;

    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, this.width, this.height);

    this.drawHeader('PLANT SAFETY & RADIATION SURVEILLANCE', 'ENVIRONMENTAL HEALTH & COMPLIANCE', 'STATION 05 // SAFETY');

    // Left Panel: Radiation Sensors & Atmospheric Containment
    ctx.fillStyle = '#111827';
    ctx.roundRect(24, 82, 590, 534, 8);
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('SECTOR RADIATION MONITORING SENSORS (GEIGER ARRAYS)', 44, 112);

    for (let i = 0; i < safety.sensors.length; i++) {
      const s = safety.sensors[i];
      const sy = 135 + i * 85;

      ctx.fillStyle = '#0f172a';
      ctx.roundRect(38, sy, 562, 75, 6);
      ctx.fill();

      const isElevated = s.status === 'ELEVATED';
      ctx.strokeStyle = isElevated ? '#ef4444' : '#334155';
      ctx.stroke();

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(s.name, 54, sy + 24);

      ctx.fillStyle = isElevated ? '#ef4444' : '#10b981';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText(`${s.level.toFixed(3)} ${s.unit}`, 54, sy + 54);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px sans-serif';
      ctx.fillText(`Max Permissible: < ${s.threshold} ${s.unit} | Status: ${s.status}`, 280, sy + 54);
    }

    // Atmospheric containment
    ctx.fillStyle = '#0f172a';
    ctx.roundRect(38, 480, 562, 115, 6);
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('CONTAINMENT INTEGRITY & NEGATIVE PRESSURE', 54, 506);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '13px sans-serif';
    ctx.fillText('Negative Differential Pressure:', 54, 538);
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(`${safety.containmentPressure} Pa (PASS - PREVENTS PARTICULATE OUTFLOW)`, 270, 538);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '13px sans-serif';
    ctx.fillText('Fire Suppression Pressure:', 54, 568);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(`${safety.fireSuppressionPressure.toFixed(1)} Bar (CHARGED & READY)`, 270, 568);

    // Right Panel: Plant Safety Score & Audit
    ctx.fillStyle = '#111827';
    ctx.roundRect(630, 82, 370, 534, 8);
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('SAFETY SCORE & AUDITS', 650, 112);

    // Giant Safety Index Ring / Display
    ctx.fillStyle = '#0f172a';
    ctx.roundRect(650, 135, 330, 170, 8);
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.stroke();

    const idxColor = safety.safetyIndex > 90 ? '#10b981' : safety.safetyIndex > 65 ? '#f59e0b' : '#ef4444';
    ctx.fillStyle = idxColor;
    ctx.font = 'bold 54px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${Math.round(safety.safetyIndex)}%`, 815, 215);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px sans-serif';
    ctx.fillText('PLANT COMPLIANCE RATING', 815, 245);
    ctx.textAlign = 'left';

    this.drawProgressBar(670, 265, 290, 16, safety.safetyIndex, 100, idxColor);

    // Certificate
    ctx.fillStyle = '#0f172a';
    ctx.roundRect(650, 320, 330, 135, 6);
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.stroke();

    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('REGULATORY STANDARDS', 666, 345);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px sans-serif';
    ctx.fillText('Authority: Neutron Energy Corp.', 666, 372);
    ctx.fillText('Classification: Nuclear Power Station Tier-4', 666, 396);
    ctx.fillText('Audit Status: ' + (safety.auditInProgress ? `In Progress (${Math.round(safety.auditProgress)}%)` : 'Active / Valid'), 666, 420);

    for (const btn of this.interactiveElements) {
      this.drawButton(btn, true);
    }
  }
}

