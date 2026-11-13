/**
 * WasteSim - Spent Fuel Pool Management, Dry Cask Storage & Disposal Logistics
 * (Fictional gameplay simulation only)
 */
export class WasteSim {
  constructor(game) {
    this.game = game;

    this.poolAssemblies = 14;
    this.poolCapacity = 36;
    this.poolTemp = 26.5; // °C (Normal < 35°C)
    this.poolCoolingActive = true;

    this.dryCasksFilled = 3;
    this.dryCasksMax = 12;

    this.transferInProgress = false;
    this.transferProgress = 0;
    this.transportConvoyScheduled = false;
    this.transportProgress = 0;
  }

  togglePoolCooling() {
    this.poolCoolingActive = !this.poolCoolingActive;
    this.game.sound.playClick();
  }

  startTransferToDryCask() {
    if (this.transferInProgress) return false;
    if (this.poolAssemblies < 4) {
      this.game.sound.playError();
      this.game.eventSim.addLog('Need at least 4 assemblies cooled to pack a Dry Cask.');
      return false;
    }
    if (this.dryCasksFilled >= this.dryCasksMax) {
      this.game.sound.playError();
      this.game.eventSim.addLog('Dry Cask Storage Yard is at maximum capacity (12/12).');
      return false;
    }
    if (this.game.finances.balance < 500) {
      this.game.sound.playError();
      this.game.eventSim.addLog('Insufficient funds ($500) for heavy cask encapsulation.');
      return false;
    }

    this.game.finances.balance -= 500;
    this.transferInProgress = true;
    this.transferProgress = 0;
    this.game.sound.playHeavySwitch();
    this.game.eventSim.addLog('Transfer crane active: Encapsulating 4 spent assemblies into Dry Cask.');
    return true;
  }

  dispatchOffsiteConvoy() {
    if (this.transportConvoyScheduled) return false;
    if (this.dryCasksFilled < 2) {
      this.game.sound.playError();
      this.game.eventSim.addLog('Need at least 2 loaded dry casks for offsite convoy transport.');
      return false;
    }
    if (this.game.finances.balance < 1200) {
      this.game.sound.playError();
      this.game.eventSim.addLog('Insufficient funds ($1200) for Neutron Energy Corp transport convoy.');
      return false;
    }

    this.game.finances.balance -= 1200;
    this.transportConvoyScheduled = true;
    this.transportProgress = 0;
    this.game.sound.playSuccess();
    this.game.eventSim.addLog('Heavy transport convoy departed for federal geological repository.');
    return true;
  }

  tick(dt) {
    // Pool temp dynamics
    if (this.poolCoolingActive) {
      this.poolTemp = Math.max(24.0, this.poolTemp - dt * 0.1);
    } else {
      this.poolTemp = Math.min(65.0, this.poolTemp + dt * 0.3);
      if (this.poolTemp > 45) {
        if (Math.random() < 0.01) {
          this.game.eventSim.addLog('Warning: Spent Fuel Pool temperature elevated (>45°C)!');
        }
      }
    }

    // Transfer crane progress
    if (this.transferInProgress) {
      this.transferProgress += dt * 10; // 10s
      if (this.transferProgress >= 100) {
        this.transferProgress = 100;
        this.transferInProgress = false;
        this.poolAssemblies -= 4;
        this.dryCasksFilled += 1;
        this.game.sound.playSuccess();
        this.game.eventSim.addLog(`Dry Cask sealed and stored in Yard (${this.dryCasksFilled}/${this.dryCasksMax}).`);
      }
    }

    // Transport progress
    if (this.transportConvoyScheduled) {
      this.transportProgress += dt * 7; // ~14s
      if (this.transportProgress >= 100) {
        this.transportProgress = 100;
        this.transportConvoyScheduled = false;
        this.dryCasksFilled -= 2;
        this.game.sound.playSuccess();
        this.game.eventSim.addLog('Offsite transport delivered 2 casks to permanent storage. Space freed.');
      }
    }
  }
}

