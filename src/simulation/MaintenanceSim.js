/**
 * MaintenanceSim - Equipment Wear, Diagnostics, Spare Parts & Work Orders
 */
export class MaintenanceSim {
  constructor(game) {
    this.game = game;

    this.subsystems = [
      {
        id: 'pump_a',
        name: 'Coolant Pump A',
        health: 94, // %
        wearRate: 0.12, // % per second
        partNeeded: 'seal',
        repairCost: 300,
        inRepair: false,
        repairProgress: 0,
        status: 'NOMINAL'
      },
      {
        id: 'pump_b',
        name: 'Coolant Pump B',
        health: 88,
        wearRate: 0.14,
        partNeeded: 'seal',
        repairCost: 300,
        inRepair: false,
        repairProgress: 0,
        status: 'NOMINAL'
      },
      {
        id: 'turbine',
        name: 'Main Steam Turbine',
        health: 91,
        wearRate: 0.10,
        partNeeded: 'bearing',
        repairCost: 650,
        inRepair: false,
        repairProgress: 0,
        status: 'NOMINAL'
      },
      {
        id: 'transformer',
        name: 'Step-Up Transformer',
        health: 85,
        wearRate: 0.08,
        partNeeded: 'relay',
        repairCost: 150,
        inRepair: false,
        repairProgress: 0,
        status: 'NOMINAL'
      },
      {
        id: 'condenser',
        name: 'Steam Condenser Loop',
        health: 79,
        wearRate: 0.15,
        partNeeded: 'filter',
        repairCost: 200,
        inRepair: false,
        repairProgress: 0,
        status: 'NOMINAL'
      },
      {
        id: 'backup_gen',
        name: 'Emergency Diesel Gen',
        health: 100,
        wearRate: 0.02,
        partNeeded: 'relay',
        repairCost: 150,
        inRepair: false,
        repairProgress: 0,
        status: 'NOMINAL'
      }
    ];

    this.inventory = {
      seal: { name: 'Mechanical Pump Seal', count: 4, cost: 300 },
      bearing: { name: 'Turbine Ceramic Bearing', count: 2, cost: 650 },
      relay: { name: 'Solid-State Power Relay', count: 6, cost: 150 },
      filter: { name: 'Demineralizer Filter Cartridge', count: 5, cost: 200 }
    };

    this.activeDeliveries = [];
  }

  orderPart(partKey, qty = 1) {
    const part = this.inventory[partKey];
    if (!part) return false;
    const cost = part.cost * qty;
    if (this.game.finances.balance >= cost) {
      this.game.finances.balance -= cost;
      this.activeDeliveries.push({
        partKey,
        qty,
        name: part.name,
        remainingTime: 12.0 // 12 seconds delivery transit time
      });
      this.game.sound.playClick();
      this.game.eventSim.addLog(`Ordered ${qty}x ${part.name} (-$${cost}). Delivery en route.`);
      return true;
    } else {
      this.game.sound.playError();
      return false;
    }
  }

  startRepair(subsystemId) {
    const sub = this.subsystems.find(s => s.id === subsystemId);
    if (!sub || sub.inRepair || sub.health >= 98) return false;

    // Check spare part
    const part = this.inventory[sub.partNeeded];
    if (!part || part.count < 1) {
      this.game.sound.playError();
      this.game.eventSim.addLog(`Cannot repair ${sub.name}: Missing ${part ? part.name : 'part'}!`);
      return false;
    }

    // Check staff
    const maintStaff = this.game.staffSim.getStaffAtStation('maintenance');
    if (!maintStaff) {
      this.game.sound.playError();
      this.game.eventSim.addLog(`Cannot repair: No technician assigned to Maintenance Desk!`);
      return false;
    }

    // Consume part & start
    part.count -= 1;
    sub.inRepair = true;
    sub.repairProgress = 0;
    this.game.sound.playHeavySwitch();
    this.game.eventSim.addLog(`Dispatched maintenance on ${sub.name}.`);
    return true;
  }

  tick(dt) {
    // Deliveries
    for (let i = this.activeDeliveries.length - 1; i >= 0; i--) {
      const d = this.activeDeliveries[i];
      d.remainingTime -= dt;
      if (d.remainingTime <= 0) {
        this.inventory[d.partKey].count += d.qty;
        this.game.sound.playSuccess();
        this.game.eventSim.addLog(`Delivery Arrived: ${d.qty}x ${d.name} added to warehouse.`);
        this.activeDeliveries.splice(i, 1);
      }
    }

    // Subsystem wear & repair
    for (const sub of this.subsystems) {
      if (sub.inRepair) {
        sub.repairProgress += dt * 15; // takes ~7 seconds
        if (sub.repairProgress >= 100) {
          sub.repairProgress = 100;
          sub.inRepair = false;
          sub.health = 100;
          sub.status = 'NOMINAL';
          this.game.sound.playSuccess();
          this.game.eventSim.addLog(`Maintenance complete on ${sub.name}. Restored to 100%.`);
        } else {
          sub.status = `REPAIRING (${Math.round(sub.repairProgress)}%)`;
        }
      } else {
        // Natural wear
        sub.health = Math.max(0, sub.health - dt * sub.wearRate);
        if (sub.health <= 0) {
          sub.status = 'FAULT / FAILURE';
          // Chance to trigger emergency
          if (Math.random() < 0.05 && !this.game.emergencyActive) {
            this.game.eventSim.triggerEmergency(`EQUIPMENT FAILURE: ${sub.name.toUpperCase()} TRIPPED!`);
          }
        } else if (sub.health < 30) {
          sub.status = 'CRITICAL WEAR';
        } else if (sub.health < 65) {
          sub.status = 'DEGRADED';
        } else {
          sub.status = 'NOMINAL';
        }
      }
    }
  }
}

