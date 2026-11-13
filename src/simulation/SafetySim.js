/**
 * SafetySim - Radiation Monitoring, Safety Compliance, Containment Integrity & Inspections
 */
export class SafetySim {
  constructor(game) {
    this.game = game;

    this.safetyIndex = 96.5; // 0 to 100%
    this.fireSuppressionPressure = 12.4; // Bar
    this.containmentPressure = -42; // Pa
    this.auditInProgress = false;
    this.auditProgress = 0;

    this.sensors = [
      { id: 'containment', name: 'Reactor Primary Containment', level: 0.14, unit: 'μSv/h', threshold: 2.5, status: 'NORMAL' },
      { id: 'turbine_hall', name: 'Turbine Generator Hall', level: 0.08, unit: 'μSv/h', threshold: 1.5, status: 'NORMAL' },
      { id: 'coolant_bay', name: 'Primary Coolant Piping Bay', level: 0.18, unit: 'μSv/h', threshold: 3.0, status: 'NORMAL' },
      { id: 'perimeter', name: 'Perimeter Environmental Fence', level: 0.04, unit: 'μSv/h', threshold: 0.8, status: 'NORMAL' }
    ];

    this.complianceCert = 'CLASS A - NEUTRON ENERGY CORP. CERTIFIED';
    this.geigerTimer = 0;
  }

  runSafetyAudit() {
    if (this.auditInProgress) return false;
    if (this.game.finances.balance < 400) {
      this.game.sound.playError();
      this.game.eventSim.addLog('Insufficient funds ($400) for Safety Compliance Audit.');
      return false;
    }

    const safetyStaff = this.game.staffSim.getStaffAtStation('safety');
    if (!safetyStaff) {
      this.game.sound.playError();
      this.game.eventSim.addLog('Cannot audit: Safety Officer is not at the station.');
      return false;
    }

    this.game.finances.balance -= 400;
    this.auditInProgress = true;
    this.auditProgress = 0;
    this.game.sound.playClick();
    this.game.eventSim.addLog('Initiated comprehensive plant safety inspection audit.');
    return true;
  }

  testFireSuppression() {
    this.game.sound.playHiss(0.5);
    this.fireSuppressionPressure = 12.8;
    this.safetyIndex = Math.min(100, this.safetyIndex + 2.0);
    this.game.eventSim.addLog('Fire suppression lines purged and tested: 12.8 Bar. System OK.');
  }

  tick(dt) {
    this.geigerTimer += dt;
    if (this.geigerTimer > 2.5) {
      this.geigerTimer = 0;
      this.game.sound.playGeiger();
    }

    // Dynamic sensor jitter
    for (const sensor of this.sensors) {
      const jitter = (Math.random() - 0.49) * 0.015;
      sensor.level = Math.max(0.01, sensor.level + jitter);
      // If core is overheating, primary radiation rises
      if (this.game.reactorSim.coreTemp > 380) {
        sensor.level += dt * 0.05;
      }
      sensor.status = sensor.level > sensor.threshold ? 'ELEVATED' : 'NORMAL';
    }

    // Audit progress
    if (this.auditInProgress) {
      this.auditProgress += dt * 12; // takes ~8s
      if (this.auditProgress >= 100) {
        this.auditProgress = 100;
        this.auditInProgress = false;
        this.safetyIndex = Math.min(100, this.safetyIndex + 14.0);
        this.game.sound.playSuccess();
        this.game.eventSim.addLog('Safety Inspection Complete. Regulatory compliance score updated.');
      }
    }

    // Safety index decay if issues exist
    if (this.game.reactorSim.coreTemp > 360) {
      this.safetyIndex = Math.max(20, this.safetyIndex - dt * 0.8);
    }
  }
}

