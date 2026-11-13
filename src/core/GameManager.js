import { SoundManager } from '../audio/SoundManager.js';
import { ReactorSim } from '../simulation/ReactorSim.js';
import { PowerGridSim } from '../simulation/PowerGridSim.js';
import { StaffSim } from '../simulation/StaffSim.js';
import { MaintenanceSim } from '../simulation/MaintenanceSim.js';
import { SafetySim } from '../simulation/SafetySim.js';
import { WasteSim } from '../simulation/WasteSim.js';
import { EventSim } from '../simulation/EventSim.js';
import { Roblox3DCamera } from './Roblox3DCamera.js';
import { Roblox3DScene } from '../scene/Roblox3DScene.js';

/**
 * GameManager - 100% 3D Simulation Controller (Zero WebGL)
 * Recreating the authentic Nuclear Power Plant Simulator (Roblox) aesthetic.
 */
export class GameManager {
  constructor() {
    const cameraRigEl = document.getElementById('camera-rig');
    const worldEl = document.getElementById('world');

    this.shiftNumber = 1;
    this.shiftTime = 8 * 3600; // 08:00
    this.timeSpeed = 1;

    this.finances = {
      balance: 15400,
      totalEarned: 0,
      penaltiesPaid: 0,
      shiftStartBalance: 15400
    };

    // 1. Procedural Web Audio Engine
    this.sound = new SoundManager();

    // 2. Operational & Physical Simulations
    this.reactorSim = new ReactorSim(this);
    this.powerGridSim = new PowerGridSim(this);
    this.staffSim = new StaffSim(this);
    this.maintenanceSim = new MaintenanceSim(this);
    this.safetySim = new SafetySim(this);
    this.wasteSim = new WasteSim(this);
    this.eventSim = new EventSim(this);

    // 3. 3D Camera & 3D Scene (Zero WebGL - 100% Native CSS 3D)
    this.camera = new Roblox3DCamera(this, cameraRigEl);
    this.scene = new Roblox3DScene(this, worldEl);

    this.powerGridSim.rebalance();
    this.lastTimestamp = performance.now();

    // Start Simulation Loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  getFormattedTime() {
    const totalSecs = Math.floor(this.shiftTime);
    const hrs = Math.floor((totalSecs / 3600) % 24).toString().padStart(2, '0');
    const mins = Math.floor((totalSecs % 3600) / 60).toString().padStart(2, '0');
    return `${hrs}:${mins}`;
  }

  update(dt) {
    this.shiftTime += dt * this.timeSpeed;
    if (this.shiftTime >= 16 * 3600 && this.shiftNumber === 1) {
      this.shiftNumber = 2;
    }

    // Run core simulations
    this.reactorSim.update(dt);
    this.powerGridSim.update(dt);
    this.staffSim.update(dt);
    this.maintenanceSim.update(dt);
    this.safetySim.update(dt);
    this.wasteSim.update(dt);
    this.eventSim.update(dt);

    // Update real-time 3D telemetry
    this.scene.update();
  }

  animate(now) {
    const dt = Math.min((now - this.lastTimestamp) / 1000, 0.1);
    this.lastTimestamp = now;

    this.update(dt);

    requestAnimationFrame(this.animate);
  }
}
