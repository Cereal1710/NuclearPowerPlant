/**
 * EventSim - Random Events, Incident Simulation & SCRAM Emergency Challenge
 */
export class EventSim {
  constructor(game) {
    this.game = game;

    this.logs = [
      { text: 'Nuclearis NPP initialized under Neutron Energy Corp supervision.', time: '08:00' },
      { text: 'Shift 1 commenced. All control systems online.', time: '08:02' }
    ];

    this.eventTimer = 0;
    this.nextEventInterval = 25 + Math.random() * 20;

    this.emergencyActive = false;
    this.emergencyTitle = '';
    this.scramChallengeTimer = 0;
    this.scramMaxTime = 6.0; // 6 seconds to press SCRAM
  }

  addLog(msg) {
    const timeStr = this.game.getFormattedTime();
    this.logs.unshift({ text: msg, time: timeStr });
    if (this.logs.length > 25) {
      this.logs.pop();
    }
  }

  triggerEmergency(reason = 'UNCONTROLLED THERMAL SURGE!') {
    if (this.emergencyActive) return;

    this.emergencyActive = true;
    this.emergencyTitle = reason;
    this.scramChallengeTimer = this.scramMaxTime;
    this.game.emergencyActive = true;

    this.game.sound.startAlarm();
    this.addLog(`🚨 EMERGENCY ALERT: ${reason}`);
    this.addLog(`⚡ OPERATOR ACTION REQUIRED: HIT SCRAM WITHIN ${Math.round(this.scramMaxTime)} SECONDS!`);
  }

  handleEmergencySuccess() {
    this.emergencyActive = false;
    this.game.emergencyActive = false;
    this.game.sound.stopAlarm();
    this.game.sound.playSuccess();
    this.addLog('✅ SCRAM ACTIVATED IN TIME! Emergency core shutdown executed successfully.');
    this.addLog('Plant safe. Incident logged in shift incident report.');
    this.game.safetySim.safetyIndex = Math.min(100, this.game.safetySim.safetyIndex + 5);
  }

  handleEmergencyFailure() {
    this.emergencyActive = false;
    this.game.emergencyActive = false;
    this.game.sound.stopAlarm();
    this.game.sound.playError();

    // Automatic hard trip & heavy penalty
    this.game.reactorSim.scram();
    const penalty = 2800;
    this.game.finances.balance -= penalty;
    this.game.finances.penaltiesPaid += penalty;
    this.game.safetySim.safetyIndex = Math.max(10, this.game.safetySim.safetyIndex - 25);
    this.game.powerGridSim.reputation = Math.max(15, this.game.powerGridSim.reputation - 20);

    this.addLog(`❌ SCRAM TIMEOUT! Automatic safety rupture burst triggered.`);
    this.addLog(`Grid blackout incurred. Neutron Energy Corp fine applied: -$${penalty}.`);
  }

  triggerRandomEvent() {
    const roll = Math.random();

    if (roll < 0.25) {
      // Emergency SCRAM event!
      const emergencies = [
        'PRIMARY COOLANT VALVE CAVITATION DETECTED!',
        'TURBINE FREQUENCY OVERLOAD SPIKE!',
        'CORE REACTIVITY EXCURSION ANOMALY!',
        'SECONDARY STEAM LINE PRESSURE SURGE!'
      ];
      const pick = emergencies[Math.floor(Math.random() * emergencies.length)];
      this.triggerEmergency(pick);
    } else if (roll < 0.50) {
      // Grid demand spike
      const boost = 60 + Math.floor(Math.random() * 50);
      this.game.powerGridSim.sectors[1].demand += boost; // Industrial
      this.addLog(`Grid Alert: Industrial zone ramped up production (+${boost} MW demand).`);
      this.game.sound.playBeep(920);
    } else if (roll < 0.75) {
      // Component wear accelerated
      const sub = this.game.maintenanceSim.subsystems[Math.floor(Math.random() * this.game.maintenanceSim.subsystems.length)];
      sub.health = Math.max(15, sub.health - 22);
      this.addLog(`Maintenance Notice: Sensor jitter on ${sub.name}. Inspection recommended.`);
      this.game.sound.playBeep(640);
    } else {
      // Regulatory or positive event
      this.game.finances.balance += 600;
      this.addLog('Neutron Energy Corp: High-reliability performance subsidy credited (+$600).');
      this.game.sound.playSuccess();
    }
  }

  tick(dt) {
    if (this.emergencyActive) {
      this.scramChallengeTimer -= dt;
      if (this.scramChallengeTimer <= 0) {
        this.handleEmergencyFailure();
      }
    } else {
      this.eventTimer += dt;
      if (this.eventTimer >= this.nextEventInterval) {
        this.eventTimer = 0;
        this.nextEventInterval = 35 + Math.random() * 30;
        this.triggerRandomEvent();
      }
    }
  }
}

