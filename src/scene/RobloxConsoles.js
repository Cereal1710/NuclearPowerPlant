import * as THREE from 'three';
import { TextureFactory } from './TextureFactory.js';

/**
 * RobloxConsoles - Builds the physical 3D control room consoles matching
 * user screenshots Image 1 & Image 2 (Analogue gauges, rotary switches,
 * glowing lamps, CRT monitors, SCRAM mushroom button, Back buttons).
 */
export class RobloxConsoles {
  constructor(game) {
    this.game = game;
    this.consoles = [];
    this.interactiveObjects = [];
    this.dynamicMeters = [];
    this.rotarySwitches = [];
    this.indicatorLamps = [];
  }

  build(scene) {
    const rootGroup = new THREE.Group();
    rootGroup.name = 'AllRobloxConsoles';

    // 1. Station 01: REACTOR PRIMARY (Central Horseshoe Island matching Image 1)
    const reactorStation = this.createConsoleStation({
      id: 'reactor',
      title: 'REACTOR PRIMARY',
      matTitle: 'REACTOR PRIMARY',
      pos: new THREE.Vector3(-4.5, 0, -1.5),
      rotY: 0.35,
      camPos: new THREE.Vector3(-4.5, 1.38, -0.2),
      camLookAt: new THREE.Vector3(-4.5, 1.15, -1.5),
      matColor: 0xd6d1c4,
      hasScram: true,
      hasFeedwater: true,
      crtTitle: 'FEEDWATER OVERVIEW'
    });
    rootGroup.add(reactorStation.group);
    this.consoles.push(reactorStation);

    // 2. Station 02: GRID CONTROL (Front Island matching Image 1)
    const gridStation = this.createConsoleStation({
      id: 'electrical',
      title: 'GRID CONTROL',
      matTitle: 'GRID CONTROL',
      pos: new THREE.Vector3(-1.0, 0, 1.8),
      rotY: 0.1,
      camPos: new THREE.Vector3(-1.0, 1.38, 3.1),
      camLookAt: new THREE.Vector3(-1.0, 1.15, 1.8),
      matColor: 0xd6d1c4,
      crtTitle: 'METRO GRID DISPATCH'
    });
    rootGroup.add(gridStation.group);
    this.consoles.push(gridStation);

    // 3. Station 03: SHIFT MANAGER (Right Side with blue carpet mat matching Image 1)
    const shiftStation = this.createConsoleStation({
      id: 'shift',
      title: 'SHIFT MANAGER',
      matTitle: 'SHIFT MANAGER',
      pos: new THREE.Vector3(4.5, 0, 0.8),
      rotY: -0.3,
      camPos: new THREE.Vector3(4.5, 1.38, 2.1),
      camLookAt: new THREE.Vector3(4.5, 1.15, 0.8),
      matColor: 0x94b3b8, // Blue-green mat
      crtTitle: 'STAFF LOGISTICS & SHIFT'
    });
    rootGroup.add(shiftStation.group);
    this.consoles.push(shiftStation);

    // 4. Station 04: TURBINES & MAINTENANCE (Rear Island matching Image 1)
    const maintStation = this.createConsoleStation({
      id: 'maintenance',
      title: 'TURBINES & GENERATOR',
      matTitle: 'TURBINES',
      pos: new THREE.Vector3(3.2, 0, -2.5),
      rotY: -0.2,
      camPos: new THREE.Vector3(3.2, 1.38, -1.2),
      camLookAt: new THREE.Vector3(3.2, 1.15, -2.5),
      matColor: 0xd4a79b, // Salmon mat
      crtTitle: 'TURBINE DIAGNOSTICS'
    });
    rootGroup.add(maintStation.group);
    this.consoles.push(maintStation);

    // 5. Station 05: SAFETY OFFICER
    const safetyStation = this.createConsoleStation({
      id: 'safety',
      title: 'SAFETY OFFICER',
      matTitle: 'SAFETY MONITORING',
      pos: new THREE.Vector3(1.2, 0, -3.2),
      rotY: 0,
      camPos: new THREE.Vector3(1.2, 1.38, -1.9),
      camLookAt: new THREE.Vector3(1.2, 1.15, -3.2),
      matColor: 0xbfd1c4,
      crtTitle: 'RADIATION SURVEILLANCE'
    });
    rootGroup.add(safetyStation.group);
    this.consoles.push(safetyStation);

    // 6. Station 06: WASTE MANAGEMENT
    const wasteStation = this.createConsoleStation({
      id: 'waste',
      title: 'WASTE MANAGEMENT',
      matTitle: 'SPENT FUEL DISPOSAL',
      pos: new THREE.Vector3(6.5, 0, -2.0),
      rotY: -0.45,
      camPos: new THREE.Vector3(6.5, 1.38, -0.7),
      camLookAt: new THREE.Vector3(6.5, 1.15, -2.0),
      matColor: 0xdad3b0,
      crtTitle: 'SPENT FUEL POOL'
    });
    rootGroup.add(wasteStation.group);
    this.consoles.push(wasteStation);

    scene.add(rootGroup);
    return this.consoles;
  }

  createConsoleStation(cfg) {
    const group = new THREE.Group();
    group.position.copy(cfg.pos);
    group.rotation.y = cfg.rotY;

    // A. Floor Mat with Station Stencil Text (Matching Image 1)
    const matGeo = new THREE.PlaneGeometry(3.6, 2.6);
    const matTex = TextureFactory.createStationMatTexture(cfg.matTitle, 'NEUTRON ENERGY CORP.');
    const matMaterial = new THREE.MeshStandardMaterial({
      map: matTex,
      roughness: 0.85,
      metalness: 0.1,
      color: cfg.matColor || 0xd6d1c4
    });
    const floorMat = new THREE.Mesh(matGeo, matMaterial);
    floorMat.rotation.x = -Math.PI / 2;
    floorMat.position.set(0, 0.005, 0.2);
    floorMat.receiveShadow = true;
    group.add(floorMat);

    // B. Console Base (Beige industrial body matching Image 1 & 2)
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0xd8d5cb, // Industrial cream/beige
      roughness: 0.5,
      metalness: 0.2
    });

    const consoleWidth = 3.2;
    const consoleDepth = 1.0;
    const consoleHeight = 0.85;

    // Lower cabinet
    const cabinet = new THREE.Mesh(
      new THREE.BoxGeometry(consoleWidth, consoleHeight, consoleDepth),
      baseMat
    );
    cabinet.position.set(0, consoleHeight / 2, 0);
    cabinet.castShadow = true;
    cabinet.receiveShadow = true;
    group.add(cabinet);

    // Angled Console Sloped Top (Where controls are mounted)
    const slopedTop = new THREE.Mesh(
      new THREE.BoxGeometry(consoleWidth + 0.08, 0.06, consoleDepth + 0.1),
      baseMat
    );
    slopedTop.position.set(0, consoleHeight + 0.03, 0);
    slopedTop.rotation.x = 0.14; // Slight ergonomic tilt towards operator
    group.add(slopedTop);

    // C. Steel-Blue Control Module Panels (Matching Image 2!)
    const panelMat = new THREE.MeshStandardMaterial({
      color: 0x5a758d, // Authentic steel-blue panel color from Image 2
      roughness: 0.4,
      metalness: 0.4
    });

    // 3 Inset Control Panels on desk
    const panelPositions = [-0.95, 0, 0.95];
    for (let p = 0; p < panelPositions.length; p++) {
      const pMesh = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.02, 0.8), panelMat);
      pMesh.position.set(panelPositions[p], consoleHeight + 0.065, 0);
      pMesh.rotation.x = 0.14;
      group.add(pMesh);
    }

    // D. Analogue Circular Dial Needle Meters (Matching Image 2!)
    const dial1 = TextureFactory.createDialTexture('Core Temp', 100, 500, '°C');
    const dial1Mesh = this.createMeterMesh(dial1.texture, 0.22);
    dial1Mesh.position.set(-0.78, consoleHeight + 0.14, -0.15);
    dial1Mesh.rotation.x = -Math.PI / 2 + 0.14;
    group.add(dial1Mesh);
    this.dynamicMeters.push({ update: () => dial1.update(this.game.reactorSim.coreTemp) });

    const dial2 = TextureFactory.createDialTexture('Steam Pres', 0, 100, 'Bar');
    const dial2Mesh = this.createMeterMesh(dial2.texture, 0.22);
    dial2Mesh.position.set(-0.78, consoleHeight + 0.11, 0.12);
    dial2Mesh.rotation.x = -Math.PI / 2 + 0.14;
    group.add(dial2Mesh);
    this.dynamicMeters.push({ update: () => dial2.update(this.game.reactorSim.steamPressure) });

    // E. Vertical Slider Bar Gauges (Matching Image 2!)
    const vGauge1 = TextureFactory.createVerticalGaugeTexture('ROD #1', 0, 100);
    const vGauge1Mesh = this.createMeterMesh(vGauge1.texture, 0.14, 0.38);
    vGauge1Mesh.position.set(-1.15, consoleHeight + 0.12, -0.02);
    vGauge1Mesh.rotation.x = -Math.PI / 2 + 0.14;
    group.add(vGauge1Mesh);
    this.dynamicMeters.push({ update: () => vGauge1.update(this.game.reactorSim.controlRods[0]) });

    // F. Rotary Heavy Switches (Clickable 3D Switches matching Image 2!)
    // Feedwater Pump 1 Switch
    const switch1 = this.createRotarySwitch('Pump 1', () => {
      this.game.reactorSim.togglePump(0);
      this.game.sound.playHeavySwitch();
    });
    switch1.mesh.position.set(-1.05, consoleHeight + 0.11, 0.26);
    switch1.mesh.rotation.x = -Math.PI / 2 + 0.14;
    group.add(switch1.mesh);
    this.interactiveObjects.push(switch1.hitbox);
    this.rotarySwitches.push({ switchObj: switch1, getState: () => this.game.reactorSim.pumpStates[0] });

    // Indicator LED lamp for Pump 1 (Green/Red glowing cylinder matching Image 2)
    const lamp1 = this.createIndicatorLamp();
    lamp1.mesh.position.set(-0.92, consoleHeight + 0.11, 0.26);
    lamp1.mesh.rotation.x = -Math.PI / 2 + 0.14;
    group.add(lamp1.mesh);
    this.indicatorLamps.push({ lampObj: lamp1, getState: () => this.game.reactorSim.pumpStates[0] });

    // Feedwater Pump 2 Switch
    const switch2 = this.createRotarySwitch('Pump 2', () => {
      this.game.reactorSim.togglePump(1);
      this.game.sound.playHeavySwitch();
    });
    switch2.mesh.position.set(-0.65, consoleHeight + 0.11, 0.26);
    switch2.mesh.rotation.x = -Math.PI / 2 + 0.14;
    group.add(switch2.mesh);
    this.interactiveObjects.push(switch2.hitbox);
    this.rotarySwitches.push({ switchObj: switch2, getState: () => this.game.reactorSim.pumpStates[1] });

    const lamp2 = this.createIndicatorLamp();
    lamp2.mesh.position.set(-0.52, consoleHeight + 0.11, 0.26);
    lamp2.mesh.rotation.x = -Math.PI / 2 + 0.14;
    group.add(lamp2.mesh);
    this.indicatorLamps.push({ lampObj: lamp2, getState: () => this.game.reactorSim.pumpStates[1] });

    // White Console Nameplate (Matching Image 2)
    const plateTex1 = TextureFactory.createNameplateTexture('Feedwater Control');
    const plate1Mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.38, 0.1),
      new THREE.MeshBasicMaterial({ map: plateTex1 })
    );
    plate1Mesh.position.set(-0.8, consoleHeight + 0.08, 0.36);
    plate1Mesh.rotation.x = -Math.PI / 2 + 0.14;
    group.add(plate1Mesh);

    // G. 3D Chunky CRT Monitor (Matching Image 2!)
    const crtScreen = TextureFactory.createCrtScreenTexture(cfg.crtTitle, [
      { label: 'REACTOR WATER LEVEL', value: '100.0%', color: '#4ade80' },
      { label: 'FEEDWATER FLOW (m³/s)', value: '1.83', color: '#38bdf8' }
    ]);

    const crtGroup = this.createCrtMonitor(crtScreen.texture);
    crtGroup.position.set(0.1, consoleHeight + 0.32, -0.28);
    crtGroup.rotation.y = 0.08;
    group.add(crtGroup);

    // Live CRT telemetry update hook
    this.dynamicMeters.push({
      update: () => {
        if (cfg.id === 'reactor') {
          crtScreen.update([
            { label: 'REACTOR WATER LEVEL', value: '100.0%', color: '#4ade80' },
            { label: 'CORE TEMPERATURE', value: `${this.game.reactorSim.coreTemp.toFixed(1)} °C`, color: this.game.reactorSim.coreTemp > 360 ? '#ef4444' : '#4ade80' },
            { label: 'FEEDWATER FLOW', value: `${(this.game.reactorSim.coolantPumps[0] * 0.022).toFixed(2)} m³/s`, color: '#38bdf8' }
          ]);
        } else if (cfg.id === 'electrical') {
          crtScreen.update([
            { label: 'GENERATION OUTPUT', value: `${Math.round(this.game.reactorSim.electricOutput)} MWe`, color: '#10b981' },
            { label: 'CITY GRID DEMAND', value: `${this.game.powerGridSim.totalDemand} MW`, color: '#f59e0b' },
            { label: 'GRID STABILITY', value: `${this.game.powerGridSim.gridStability.toFixed(1)}%`, color: '#38bdf8' }
          ]);
        } else if (cfg.id === 'shift') {
          crtScreen.update([
            { label: 'CURRENT SHIFT', value: `SHIFT #${this.game.shiftNumber}`, color: '#38bdf8' },
            { label: 'TIME ELAPSED', value: this.game.getFormattedTime(), color: '#f8fafc' },
            { label: 'PLANT REPUTATION', value: `${this.game.powerGridSim.reputation.toFixed(1)}%`, color: '#10b981' }
          ]);
        } else if (cfg.id === 'maintenance') {
          crtScreen.update([
            { label: 'TURBINE RPM', value: `${Math.round(this.game.reactorSim.electricOutput * 7.5)} RPM`, color: '#10b981' },
            { label: 'CONDENSER VACUUM', value: '-0.92 Bar', color: '#38bdf8' },
            { label: 'SUBSYSTEM HEALTH', value: `${Math.round(this.game.maintenanceSim.subsystems[0].health)}%`, color: '#4ade80' }
          ]);
        } else if (cfg.id === 'safety') {
          crtScreen.update([
            { label: 'SAFETY COMPLIANCE', value: `${Math.round(this.game.safetySim.safetyIndex)}%`, color: '#10b981' },
            { label: 'PRIMARY RAD LEVEL', value: `${this.game.safetySim.sensors[0].level.toFixed(3)} μSv/h`, color: '#38bdf8' },
            { label: 'FIRE PRESSURE', value: `${this.game.safetySim.fireSuppressionPressure.toFixed(1)} Bar`, color: '#4ade80' }
          ]);
        } else if (cfg.id === 'waste') {
          crtScreen.update([
            { label: 'SPENT FUEL POOL', value: `${this.game.wasteSim.poolAssemblies} / ${this.game.wasteSim.poolCapacity}`, color: '#38bdf8' },
            { label: 'POOL WATER TEMP', value: `${this.game.wasteSim.poolTemp.toFixed(1)} °C`, color: '#4ade80' },
            { label: 'DRY CASKS STORED', value: `${this.game.wasteSim.dryCasksFilled} / 12`, color: '#a855f7' }
          ]);
        }
      }
    });

    // H. Physical 3D SCRAM Mushroom Button (On Station 1: Reactor)
    if (cfg.hasScram) {
      const scramObj = this.createPhysicalScramConsole();
      scramObj.group.position.set(1.15, consoleHeight + 0.12, 0.1);
      group.add(scramObj.group);
      this.interactiveObjects.push(scramObj.hitbox);
    }

    // I. Physical 3D BACK Button (Mounted on Console)
    const backBtnObj = this.createPhysicalBackButton(cfg.id);
    backBtnObj.group.position.set(1.15, consoleHeight + 0.08, -0.25);
    group.add(backBtnObj.group);
    this.interactiveObjects.push(backBtnObj.hitbox);

    // J. 3D Floating Name Sign Banner above Console (Matching Image 1)
    const signGroup = this.createStationSignBanner(cfg.title);
    signGroup.position.set(0, consoleHeight + 1.25, -0.35);
    group.add(signGroup);

    // K. Hitbox for clicking desk from wide overview
    const deskHitbox = new THREE.Mesh(
      new THREE.BoxGeometry(consoleWidth + 0.4, consoleHeight + 1.0, consoleDepth + 0.6),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    deskHitbox.position.set(0, consoleHeight / 2 + 0.4, 0);
    deskHitbox.userData = { isDesk: true, config: cfg, floorMat };
    group.add(deskHitbox);
    this.interactiveObjects.push(deskHitbox);

    return {
      cfg,
      group,
      floorMat,
      deskHitbox
    };
  }

  createMeterMesh(texture, width = 0.22, height = 0.22) {
    const geo = new THREE.PlaneGeometry(width, height);
    const mat = new THREE.MeshBasicMaterial({ map: texture });
    return new THREE.Mesh(geo, mat);
  }

  createRotarySwitch(name, onClick) {
    const group = new THREE.Group();

    // Dark grey square mounting plate
    const plate = new THREE.Mesh(
      new THREE.BoxGeometry(0.11, 0.11, 0.02),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 })
    );
    group.add(plate);

    // Black rotary knob with pointer
    const knobGroup = new THREE.Group();
    const knob = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.04, 0.04, 16),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.8 })
    );
    knob.rotation.x = Math.PI / 2;
    knobGroup.add(knob);

    // White pointer indicator notch
    const pointer = new THREE.Mesh(
      new THREE.BoxGeometry(0.01, 0.035, 0.042),
      new THREE.MeshBasicMaterial({ color: 0xf8fafc })
    );
    pointer.position.set(0, 0.022, 0);
    knobGroup.add(pointer);

    group.add(knobGroup);

    // Hitbox
    const hitbox = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.12, 0.08),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    hitbox.userData = {
      isRotarySwitch: true,
      onClick,
      knobGroup
    };
    group.add(hitbox);

    return {
      mesh: group,
      knobGroup,
      hitbox
    };
  }

  createIndicatorLamp() {
    const group = new THREE.Group();

    // Dark bezel ring
    const ring = new THREE.Mesh(
      new THREE.CylinderGeometry(0.028, 0.028, 0.02, 16),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9 })
    );
    ring.rotation.x = Math.PI / 2;
    group.add(ring);

    // Glowing LED dome
    const domeMat = new THREE.MeshBasicMaterial({ color: 0x22c55e });
    const dome = new THREE.Mesh(
      new THREE.SphereGeometry(0.022, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
      domeMat
    );
    dome.rotation.x = Math.PI / 2;
    dome.position.z = 0.01;
    group.add(dome);

    return {
      mesh: group,
      domeMat
    };
  }

  createCrtMonitor(screenTexture) {
    const group = new THREE.Group();

    // Chunky Beige CRT Housing matching Image 2!
    const housingMat = new THREE.MeshStandardMaterial({
      color: 0xe0ddd3, // Retro beige plastic
      roughness: 0.6,
      metalness: 0.1
    });

    const housing = new THREE.Mesh(
      new THREE.BoxGeometry(0.68, 0.54, 0.44),
      housingMat
    );
    housing.castShadow = true;
    group.add(housing);

    // Curved Dark CRT Bezel
    const bezelMat = new THREE.MeshStandardMaterial({
      color: 0x1a1c22,
      roughness: 0.3
    });
    const bezel = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.46, 0.04),
      bezelMat
    );
    bezel.position.z = 0.21;
    group.add(bezel);

    // Screen Mesh
    const screenGeo = new THREE.PlaneGeometry(0.54, 0.4);
    const screenMat = new THREE.MeshBasicMaterial({ map: screenTexture });
    const screen = new THREE.Mesh(screenGeo, screenMat);
    screen.position.z = 0.235;
    group.add(screen);

    return group;
  }

  createPhysicalScramConsole() {
    const group = new THREE.Group();

    // Metal Base casing with caution stripes
    const casing = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.18, 0.28),
      new THREE.MeshStandardMaterial({ color: 0x1f242e, roughness: 0.5, metalness: 0.8 })
    );
    casing.position.y = 0.09;
    group.add(casing);

    // Hazard rim
    const rim = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.02, 0.3),
      new THREE.MeshBasicMaterial({ color: 0xf59e0b })
    );
    rim.position.y = 0.18;
    group.add(rim);

    // Red Mushroom Dome SCRAM Button
    const domeMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626,
      emissive: 0x7f1d1d,
      emissiveIntensity: 0.5,
      roughness: 0.2
    });

    const dome = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.08, 0.06, 24),
      domeMat
    );
    dome.position.y = 0.24;
    group.add(dome);

    // Hitbox
    const hitbox = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.28, 0.28),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    hitbox.position.y = 0.2;
    hitbox.userData = {
      isScramButton: true,
      domeMesh: dome,
      onClick: () => {
        // Slam animation
        dome.position.y -= 0.04;
        this.game.sound.playScramSlam();
        setTimeout(() => { dome.position.y += 0.04; }, 260);

        this.game.reactorSim.scram();
        if (this.game.eventSim.emergencyActive) {
          this.game.eventSim.handleEmergencySuccess();
        } else {
          this.game.eventSim.addLog('Manual emergency SCRAM triggered by operator.');
        }
      }
    };
    group.add(hitbox);

    return { group, hitbox, dome };
  }

  createPhysicalBackButton(stationId) {
    const group = new THREE.Group();

    const casing = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.06, 0.14),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8, roughness: 0.4 })
    );
    group.add(casing);

    // Button Face with embossed text
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 112;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, 256, 112);
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4;
    ctx.strokeRect(4, 4, 248, 104);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('◀ OVERVIEW', 128, 52);

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('[RETURN BACK]', 128, 86);

    const btnTex = new THREE.CanvasTexture(canvas);
    const buttonFace = new THREE.Mesh(
      new THREE.BoxGeometry(0.26, 0.04, 0.12),
      new THREE.MeshBasicMaterial({ map: btnTex })
    );
    buttonFace.position.y = 0.035;
    group.add(buttonFace);

    const hitbox = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.1, 0.16),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    hitbox.userData = {
      isBackButton: true,
      buttonFace,
      onClick: () => {
        buttonFace.position.y -= 0.02;
        this.game.sound.playClick(850);
        setTimeout(() => {
          buttonFace.position.y += 0.02;
          this.game.cameraController.returnToOverview();
        }, 120);
      }
    };
    group.add(hitbox);

    return { group, hitbox };
  }

  createStationSignBanner(title) {
    const group = new THREE.Group();

    // Two thin vertical poles holding sign
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9 });
    const pole1 = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.8, 8), poleMat);
    pole1.position.set(-0.8, -0.4, 0);
    group.add(pole1);

    const pole2 = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.8, 8), poleMat);
    pole2.position.set(0.8, -0.4, 0);
    group.add(pole2);

    // Stencil Signboard
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(241, 245, 249, 0.95)';
    ctx.fillRect(0, 0, 512, 128);
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 4;
    ctx.strokeRect(4, 4, 504, 120);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 32px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(title, 256, 56);

    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('NEUTRON ENERGY CORP. // ST-01', 256, 96);

    const tex = new THREE.CanvasTexture(canvas);
    const signMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1.6, 0.4),
      new THREE.MeshBasicMaterial({ map: tex })
    );
    group.add(signMesh);

    return group;
  }

  update(dt) {
    // Update live needles & telemetry
    for (const m of this.dynamicMeters) {
      m.update();
    }

    // Sync switches & indicator lamps
    for (const sw of this.rotarySwitches) {
      const active = sw.getState();
      const targetAngle = active ? 0.45 : -0.45;
      sw.switchObj.knobGroup.rotation.z = targetAngle;
    }

    for (const lp of this.indicatorLamps) {
      const active = lp.getState();
      lp.lampObj.domeMat.color.setHex(active ? 0x22c55e : 0xef4444);
    }
  }
}

