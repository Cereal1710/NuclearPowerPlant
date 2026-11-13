import { BaseScreen } from './BaseScreen.js';

export class MaintenanceScreen extends BaseScreen {
  constructor(game) {
    super(game, 1024, 640);
    this.setupButtons();
  }

  setupButtons() {
    this.clearElements();

    const maint = this.game.maintenanceSim;

    // Subsystem repair buttons
    for (let i = 0; i < maint.subsystems.length; i++) {
      const sub = maint.subsystems[i];
      const sy = 165 + i * 72;

      this.registerButton(`repair_${sub.id}`, 470, sy + 18, 120, 32, () => {
        maint.startRepair(sub.id);
      }, sub.inRepair ? 'IN PROGRESS' : 'DISPATCH REPAIR');
    }

    // Warehouse order buttons
    this.registerButton('order_seal', 880, 215, 90, 28, () => {
      maint.orderPart('seal', 2);
    }, 'ORDER +2');

    this.registerButton('order_bearing', 880, 275, 90, 28, () => {
      maint.orderPart('bearing', 1);
    }, 'ORDER +1');

    this.registerButton('order_relay', 880, 335, 90, 28, () => {
      maint.orderPart('relay', 4);
    }, 'ORDER +4');

    this.registerButton('order_filter', 880, 395, 90, 28, () => {
      maint.orderPart('filter', 2);
    }, 'ORDER +2');
  }

  render() {
    const ctx = this.ctx;
    const maint = this.game.maintenanceSim;

    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, this.width, this.height);

    this.drawHeader('PLANT DIAGNOSTICS & HARDWARE INTEGRITY', 'PREVENTATIVE MAINTENANCE', 'STATION 04 // MAINTENANCE');

    // Left Panel: Subsystems
    ctx.fillStyle = '#111827';
    ctx.roundRect(24, 82, 590, 534, 8);
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('CRITICAL SUBSYSTEM TELEMETRY', 44, 112);

    for (let i = 0; i < maint.subsystems.length; i++) {
      const sub = maint.subsystems[i];
      const sy = 135 + i * 78;

      ctx.fillStyle = '#0f172a';
      ctx.roundRect(38, sy, 562, 70, 6);
      ctx.fill();

      const healthColor = sub.health > 75 ? '#10b981' : sub.health > 35 ? '#f59e0b' : '#ef4444';
      ctx.strokeStyle = sub.inRepair ? '#38bdf8' : healthColor;
      ctx.stroke();

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(sub.name, 54, sy + 24);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px sans-serif';
      ctx.fillText(`Part: ${maint.inventory[sub.partNeeded]?.name || 'Standard'} | Status: `, 54, sy + 44);

      ctx.fillStyle = healthColor;
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(sub.status, 285, sy + 44);

      // Mini bar
      const barVal = sub.inRepair ? sub.repairProgress : sub.health;
      const barMax = 100;
      const barCol = sub.inRepair ? '#06b6d4' : healthColor;
      this.drawProgressBar(360, sy + 26, 95, 18, barVal, barMax, barCol, `${Math.round(barVal)}%`);
    }

    // Right Panel: Spare Parts Warehouse & Deliveries
    ctx.fillStyle = '#111827';
    ctx.roundRect(630, 82, 370, 534, 8);
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('WAREHOUSE LOGISTICS & INVENTORY', 650, 112);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px sans-serif';
    ctx.fillText('Maintain spare stock to avoid uncontained wear.', 650, 134);

    const parts = [
      { key: 'seal', ...maint.inventory.seal },
      { key: 'bearing', ...maint.inventory.bearing },
      { key: 'relay', ...maint.inventory.relay },
      { key: 'filter', ...maint.inventory.filter }
    ];

    for (let p = 0; p < parts.length; p++) {
      const part = parts[p];
      const py = 165 + p * 60;

      ctx.fillStyle = '#0f172a';
      ctx.roundRect(650, py, 330, 52, 6);
      ctx.fill();
      ctx.strokeStyle = '#334155';
      ctx.stroke();

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText(part.name, 664, py + 22);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '11px sans-serif';
      ctx.fillText(`Stock: ${part.count} units | Cost: $${part.cost}/ea`, 664, py + 40);
    }

    // Deliveries in transit
    ctx.fillStyle = '#0f172a';
    ctx.roundRect(650, 420, 330, 175, 6);
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.stroke();

    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText('DELIVERIES IN TRANSIT (LOGISTICS TRUCK)', 666, 446);

    if (maint.activeDeliveries.length === 0) {
      ctx.fillStyle = '#64748b';
      ctx.font = '12px sans-serif';
      ctx.fillText('No active supply shipments en route.', 666, 480);
    } else {
      for (let d = 0; d < maint.activeDeliveries.length; d++) {
        const item = maint.activeDeliveries[d];
        ctx.fillStyle = '#38bdf8';
        ctx.font = '12px sans-serif';
        ctx.fillText(`🚚 ${item.qty}x ${item.name}`, 666, 475 + d * 35);

        ctx.fillStyle = '#f59e0b';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(`ETA: ${Math.ceil(item.remainingTime)}s`, 920, 475 + d * 35);
      }
    }

    // Draw buttons
    for (const btn of this.interactiveElements) {
      const isPrimary = btn.id.startsWith('repair_') || btn.id.startsWith('order_');
      this.drawButton(btn, isPrimary);
    }
  }
}

