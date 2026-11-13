/**
 * ReactorSim - Fictional Reactor Simulation for Nuclearis Nuclear Power Plant
 * (Gameplay-focused fictional parameters; not reflecting real-world engineering)
 */
export class ReactorSim {
  constructor(game) {
    this.game = game;

    // Fictional Core parameters
    this.controlRods = [70, 70, 70, 70]; // % insertion (0% = out/max power, 100% = in/shutdown)
    this.targetRods = [70, 70, 70, 70];
    this.coolantPumps = [80, 80, 80]; // % pump speed A, B, C
    this.pumpStates = [true, true, true]; // on/off

    this.coreTemp = 305.0; // °C (Normal range: 280 - 330 °C)
    this.reactivity = 22.0; // %
    this.steamPressure = 68.5; // Bar (Normal: 65 - 75 bar)
    this.thermalOutput = 1200; // MWth
    this.electricOutput = 400; // MWe (~1/3 thermal efficiency)
    this.maxElectricCapacity = 1200; // MWe max rated

    this.isScrammed = false;
    this.scramCooldown = 0; // seconds before restart allowed
    this.meltdownRisk = 0; // 0 to 100%
    this.statusText = 'NOMINAL';
    this.statusColor = '#10b981'; // Green
  }

  setRod(index, targetPercent) {
    if (this.isScrammed) return;
    this.targetRods[index] = Math.max(0, Math.min(100, targetPercent));
  }

  setPump(index, speed) {
    this.coolantPumps[index] = Math.max(0, Math.min(100, speed));
  }

  togglePump(index) {
    this.pumpStates[index] = !this.pumpStates[index];
  }

  scram() {
    this.isScrammed = true;
    this.targetRods = [100, 100, 100, 100];
    this.controlRods = [100, 100, 100, 100]; // Instant slam
    this.scramCooldown = 15; // 15 seconds lockout
    this.statusText = 'SCRAM EMERGENCY SHUTDOWN';
    this.statusColor = '#ef4444';
  }

  resetTrip() {
    if (this.scramCooldown > 0) return false;
    this.isScrammed = false;
    this.targetRods = [75, 75, 75, 75];
    this.statusText = 'RESTARTING';
    this.statusColor = '#f59e0b';
    return true;
  }

  tick(dt) {
    // Interpolate control rod motion (simulate motor drive)
    for (let i = 0; i < 4; i++) {
      if (this.controlRods[i] < this.targetRods[i]) {
        this.controlRods[i] = Math.min(this.targetRods[i], this.controlRods[i] + dt * 15);
      } else if (this.controlRods[i] > this.targetRods[i]) {
        this.controlRods[i] = Math.max(this.targetRods[i], this.controlRods[i] - dt * 15);
      }
    }

    if (this.scramCooldown > 0) {
      this.scramCooldown = Math.max(0, this.scramCooldown - dt);
    }

    // Average control rod insertion (0 to 100)
    const avgRod = this.controlRods.reduce((a, b) => a + b, 0) / 4;
    // Effective withdrawal (100 - avgRod)
    const withdrawal = 100 - avgRod;

    // Active coolant flow (based on pump speed and on/off state)
    let totalFlow = 0;
    for (let i = 0; i < 3; i++) {
      if (this.pumpStates[i]) {
        totalFlow += this.coolantPumps[i];
      }
    }
    const avgFlow = totalFlow / 3; // 0 to 100

    if (this.isScrammed) {
      // Rapid decay heat dissipation
      this.reactivity = Math.max(0, this.reactivity - dt * 12);
      this.coreTemp = Math.max(85, this.coreTemp - dt * 18);
      this.steamPressure = Math.max(10, this.steamPressure - dt * 6);
      this.thermalOutput = Math.max(40, this.thermalOutput - dt * 80);
      this.electricOutput = Math.max(0, this.thermalOutput * 0.33);
      this.meltdownRisk = 0;
      this.statusText = this.scramCooldown > 0 ? `SCRAM TRIP (LOCK: ${Math.ceil(this.scramCooldown)}s)` : 'TRIPPED - READY TO RESET';
      this.statusColor = '#ef4444';
      return;
    }

    // Fictional reactivity formula
    const targetReactivity = withdrawal * 0.95;
    this.reactivity += (targetReactivity - this.reactivity) * dt * 0.4;

    // Heat generation vs cooling equilibrium
    const heatGen = this.reactivity * 18; // arbitrary units
    const heatCool = (avgFlow * 1.8) + (this.coreTemp - 20) * 0.2;
    const netHeat = heatGen - heatCool;

    this.coreTemp += netHeat * dt * 0.25;
    // Ambient dissipation clamp
    this.coreTemp = Math.max(90, Math.min(520, this.coreTemp));

    // Thermal & Electric generation
    const efficiency = 0.34;
    this.thermalOutput = Math.max(0, (this.coreTemp - 80) * 4.2);
    this.electricOutput = Math.round(this.thermalOutput * efficiency);

    // Steam pressure
    const targetPressure = 15 + (this.coreTemp - 100) * 0.24;
    this.steamPressure += (targetPressure - this.steamPressure) * dt * 0.5;
    this.steamPressure = Math.max(5, this.steamPressure);

    // Evaluate danger & status
    if (this.coreTemp > 420) {
      this.statusText = 'CRITICAL OVERHEAT!';
      this.statusColor = '#ef4444';
      this.meltdownRisk = Math.min(100, this.meltdownRisk + dt * 15);
      if (this.meltdownRisk >= 100 && !this.game.emergencyActive) {
        // Trigger Emergency SCRAM challenge
        this.game.eventSim.triggerEmergency('CRITICAL CORE OVERHEAT!');
      }
    } else if (this.coreTemp > 360) {
      this.statusText = 'HIGH TEMPERATURE WARNING';
      this.statusColor = '#f59e0b';
      this.meltdownRisk = Math.max(0, this.meltdownRisk - dt * 2);
    } else if (this.electricOutput < 100) {
      this.statusText = 'LOW GENERATION IDLE';
      this.statusColor = '#3b82f6';
      this.meltdownRisk = 0;
    } else {
      this.statusText = 'NOMINAL POWER GENERATION';
      this.statusColor = '#10b981';
      this.meltdownRisk = 0;
    }
  }
}

