import { BaseScreen } from './BaseScreen.js';

export class ShiftScreen extends BaseScreen {
  constructor(game) {
    super(game, 1024, 640);
    this.showingReport = false;
    this.setupButtons();
  }

  setupButtons() {
    this.clearElements();

    if (this.showingReport) {
      this.registerButton('commence_next', 362, 530, 300, 48, () => {
        this.game.startNextShift();
        this.showingReport = false;
        this.setupButtons();
      }, 'COMMENCE NEXT SHIFT');
      return;
    }

    // Time speed buttons
    this.registerButton('speed_pause', 50, 95, 70, 34, () => {
      this.game.timeSpeed = 0;
      this.game.sound.playClick();
    }, '⏸ PAUSE');

    this.registerButton('speed_1x', 130, 95, 70, 34, () => {
      this.game.timeSpeed = 1;
      this.game.sound.playClick();
    }, '▶ 1x');

    this.registerButton('speed_2x', 210, 95, 70, 34, () => {
      this.game.timeSpeed = 2;
      this.game.sound.playClick();
    }, '⏩ 2x');

    // Mute toggle
    this.registerButton('toggle_audio', 300, 95, 110, 34, () => {
      this.game.sound.toggleMute();
      this.game.sound.playClick();
    }, 'AUDIO TOGGLE');

    // End shift button
    this.registerButton('end_shift', 680, 95, 300, 38, () => {
      this.game.endShift();
      this.showingReport = true;
      this.setupButtons();
    }, '🏁 COMPLETE & AUDIT SHIFT');

    // Staff actions
    const staff = this.game.staffSim.staffMembers;
    for (let i = 0; i < Math.min(staff.length, 6); i++) {
      const s = staff[i];
      const sy = 195 + i * 58;

      this.registerButton(`break_${s.id}`, 490, sy + 6, 75, 28, () => {
        this.game.staffSim.sendToBreak(s.id);
      }, s.state === 'resting' ? 'RESTING' : 'BREAK');

      const stations = ['reactor', 'electrical', 'shift', 'maintenance', 'safety', 'waste'];
      this.registerButton(`cycle_station_${s.id}`, 380, sy + 6, 100, 28, () => {
        const curIdx = stations.indexOf(s.station);
        const nextStation = stations[(curIdx + 1) % stations.length];
        this.game.staffSim.assignStaff(s.id, nextStation);
      }, 'REASSIGN');
    }

    // Hire candidate buttons
    const cands = this.game.staffSim.candidates;
    for (let j = 0; j < cands.length; j++) {
      const c = cands[j];
      const cy = 370 + j * 90;
      this.registerButton(`hire_${c.id}`, 650, cy + 35, 140, 30, () => {
        this.game.staffSim.hireCandidate(c.id);
        this.setupButtons();
      }, 'HIRE ($500)');
    }
  }

  render() {
    const ctx = this.ctx;

    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, this.width, this.height);

    if (this.showingReport) {
      this.renderShiftReport();
      return;
    }

    this.drawHeader('SHIFT OPERATIONS & ROSTER', 'PERSONNEL LOGISTICS', 'STATION 03 // SHIFT MANAGER');

    // Shift clock & Speed bar
    ctx.fillStyle = '#111827';
    ctx.roundRect(24, 82, this.width - 48, 62, 8);
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(`SHIFT #${this.game.shiftNumber}`, 440, 110);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px sans-serif';
    ctx.fillText(`TIME: ${this.game.getFormattedTime()} | SPEED: ${this.game.timeSpeed}x`, 440, 130);

    // Left Panel: Staff Table
    ctx.fillStyle = '#111827';
    ctx.roundRect(24, 156, 590, 460, 8);
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('ACTIVE ON-DUTY PERSONNEL', 44, 182);

    const staff = this.game.staffSim.staffMembers;
    for (let i = 0; i < Math.min(staff.length, 6); i++) {
      const s = staff[i];
      const sy = 195 + i * 58;

      ctx.fillStyle = '#0f172a';
      ctx.roundRect(38, sy, 562, 50, 6);
      ctx.fill();
      ctx.strokeStyle = s.state === 'working' ? '#334155' : '#1e293b';
      ctx.stroke();

      // Role tag color
      ctx.fillStyle = s.color;
      ctx.fillRect(38, sy, 5, 50);

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText(s.name, 52, sy + 20);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px sans-serif';
      ctx.fillText(`${s.role} | Skill: ${s.skill}% | Fatigue: ${Math.round(s.fatigue)}%`, 52, sy + 38);

      // Station badge
      ctx.fillStyle = '#334155';
      ctx.roundRect(250, sy + 12, 110, 24, 4);
      ctx.fill();
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(s.station.toUpperCase(), 305, sy + 28);
      ctx.textAlign = 'left';
    }

    // Right Panel: Candidate Recruitment & Shift Summary
    ctx.fillStyle = '#111827';
    ctx.roundRect(630, 156, 370, 460, 8);
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('NEUTRON ENERGY RECRUITMENT', 650, 184);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px sans-serif';
    ctx.fillText('Available certified nuclear facility candidates:', 650, 204);

    const cands = this.game.staffSim.candidates;
    if (cands.length === 0) {
      ctx.fillStyle = '#64748b';
      ctx.fillText('No additional applicants this shift.', 650, 260);
    } else {
      for (let j = 0; j < cands.length; j++) {
        const c = cands[j];
        const cy = 220 + j * 90;

        ctx.fillStyle = '#0f172a';
        ctx.roundRect(650, cy, 330, 80, 6);
        ctx.fill();
        ctx.strokeStyle = '#334155';
        ctx.stroke();

        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 13px sans-serif';
        ctx.fillText(c.name, 664, cy + 22);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '11px sans-serif';
        ctx.fillText(`${c.role} | Skill: ${c.skill}%`, 664, cy + 40);
        ctx.fillText(`Salary: $${c.salary}/shift`, 664, cy + 56);
      }
    }

    // Operational Guidelines Box
    ctx.fillStyle = '#0f172a';
    ctx.roundRect(650, 420, 330, 180, 6);
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('SHIFT PROTOCOL SUMMARY', 666, 444);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '12px sans-serif';
    ctx.fillText('• Keep fatigue below 80% to avoid human error.', 666, 472);
    ctx.fillText('• Rotate operators to Break Room when weary.', 666, 498);
    ctx.fillText('• Audit shifts to earn Neutron Energy bonuses.', 666, 524);
    ctx.fillText('• Treasury: $' + Math.round(this.game.finances.balance).toLocaleString(), 666, 550);

    // Draw buttons
    for (const btn of this.interactiveElements) {
      const isPrimary = btn.id === 'end_shift' || btn.id.startsWith('hire_');
      this.drawButton(btn, isPrimary);
    }
  }

  renderShiftReport() {
    const ctx = this.ctx;
    const rep = this.game.lastShiftReport || {
      shiftNum: 1,
      earned: 15400,
      wages: 6200,
      penalties: 0,
      net: 9200,
      safetyGrade: 'A',
      powerMWh: 3200
    };

    this.drawHeader(`SHIFT #${rep.shiftNum} PERFORMANCE AUDIT`, 'NEUTRON ENERGY CORP. EXECUTIVE REPORT', 'COMPLIANCE AUDIT');

    ctx.fillStyle = '#111827';
    ctx.roundRect(160, 100, 704, 480, 10);
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.lineWidth = 1;

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`SHIFT #${rep.shiftNum} PERFORMANCE CERTIFICATE`, 512, 146);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px sans-serif';
    ctx.fillText('Nuclearis Nuclear Power Plant // All Systems Logged', 512, 172);

    // Grade display
    ctx.fillStyle = rep.safetyGrade === 'A' ? '#10b981' : '#f59e0b';
    ctx.font = 'bold 64px sans-serif';
    ctx.fillText(rep.safetyGrade, 512, 245);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px sans-serif';
    ctx.fillText('OVERALL PLANT SAFETY & EFFICIENCY RATING', 512, 275);
    ctx.textAlign = 'left';

    // Metrics table
    const my = 310;
    ctx.fillStyle = '#0f172a';
    ctx.roundRect(200, my, 624, 190, 8);
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.stroke();

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '15px sans-serif';
    ctx.fillText('Total Electrical Energy Delivered:', 230, my + 38);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText(`${Math.round(rep.powerMWh)} MWh`, 660, my + 38);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '15px sans-serif';
    ctx.fillText('Commercial Power Inflow (+):', 230, my + 72);
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText(`+$${Math.round(rep.earned).toLocaleString()}`, 660, my + 72);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '15px sans-serif';
    ctx.fillText('Staff Salaries & Payroll (-):', 230, my + 106);
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText(`-$${Math.round(rep.wages).toLocaleString()}`, 660, my + 106);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '15px sans-serif';
    ctx.fillText('Grid Deficit & Incident Fines (-):', 230, my + 140);
    ctx.fillStyle = rep.penalties > 0 ? '#ef4444' : '#10b981';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText(`-$${Math.round(rep.penalties).toLocaleString()}`, 660, my + 140);

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('Net Shift Operating Balance:', 230, my + 174);
    ctx.fillStyle = rep.net >= 0 ? '#10b981' : '#ef4444';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(`$${Math.round(rep.net).toLocaleString()}`, 660, my + 174);

    for (const btn of this.interactiveElements) {
      this.drawButton(btn, true);
    }
  }
}

