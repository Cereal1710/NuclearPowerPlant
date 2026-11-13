import * as THREE from 'three';
import { ReactorScreen } from '../screens/ReactorScreen.js';
import { ElectricalScreen } from '../screens/ElectricalScreen.js';
import { ShiftScreen } from '../screens/ShiftScreen.js';
import { MaintenanceScreen } from '../screens/MaintenanceScreen.js';
import { SafetyScreen } from '../screens/SafetyScreen.js';
import { WasteScreen } from '../screens/WasteScreen.js';

/**
 * DeskBuilder - Assembles all 6 interactive 3D Control Desks with:
 * - 3D Multi-monitors rendering live canvas textures
 * - 3D Physical Back buttons mounted on desk consoles
 * - 3D Physical SCRAM emergency mushroom button with flip cover
 * - 3D Floating world-space labels & hover highlights
 * - Ergonomic 3D swivel chairs
 */
export class DeskBuilder {
  constructor(game) {
    this.game = game;
    this.desks = [];
    this.interactiveObjects = []; // 3D buttons, monitors, scram button, back buttons
  }

  build(scene) {
    const rootGroup = new THREE.Group();
    rootGroup.name = 'AllDesksGroup';

    // Desk configurations
    const deskConfigs = [
      {
        id: 'reactor',
        title: 'REACTOR ENGINEER DESK',
        subtitle: 'Station 01 // Core Controls & SCRAM',
        pos: new THREE.Vector3(-5.2, 0, -2.0),
        rotY: 0.15,
        camPos: new THREE.Vector3(-5.2, 1.45, -0.65),
        camLookAt: new THREE.Vector3(-5.2, 1.25, -2.0),
        screenClass: ReactorScreen,
        accentColor: 0x38bdf8,
        hasScram: true
      },
      {
        id: 'electrical',
        title: 'ELECTRICAL MANAGER DESK',
        subtitle: 'Station 02 // Power Grid & Contracts',
        pos: new THREE.Vector3(0, 0, -2.6),
        rotY: 0,
        camPos: new THREE.Vector3(0, 1.45, -1.25),
        camLookAt: new THREE.Vector3(0, 1.25, -2.6),
        screenClass: ElectricalScreen,
        accentColor: 0xf59e0b
      },
      {
        id: 'shift',
        title: 'SHIFT MANAGER DESK',
        subtitle: 'Station 03 // Personnel & Audits',
        pos: new THREE.Vector3(5.2, 0, -2.0),
        rotY: -0.15,
        camPos: new THREE.Vector3(5.2, 1.45, -0.65),
        camLookAt: new THREE.Vector3(5.2, 1.25, -2.0),
        screenClass: ShiftScreen,
        accentColor: 0x10b981
      },
      {
        id: 'maintenance',
        title: 'MAINTENANCE ENGINEER DESK',
        subtitle: 'Station 04 // Hardware & Inventory',
        pos: new THREE.Vector3(-5.2, 0, 2.6),
        rotY: 0.1,
        camPos: new THREE.Vector3(-5.2, 1.45, 3.95),
        camLookAt: new THREE.Vector3(-5.2, 1.25, 2.6),
        screenClass: MaintenanceScreen,
        accentColor: 0xec4899
      },
      {
        id: 'safety',
        title: 'SAFETY OFFICER DESK',
        subtitle: 'Station 05 // Radiation & Protocols',
        pos: new THREE.Vector3(0, 0, 3.0),
        rotY: 0,
        camPos: new THREE.Vector3(0, 1.45, 4.35),
        camLookAt: new THREE.Vector3(0, 1.25, 3.0),
        screenClass: SafetyScreen,
        accentColor: 0x06b6d4
      },
      {
        id: 'waste',
        title: 'WASTE MANAGEMENT DESK',
        subtitle: 'Station 06 // Spent Fuel & Logistics',
        pos: new THREE.Vector3(5.2, 0, 2.6),
        rotY: -0.1,
        camPos: new THREE.Vector3(5.2, 1.45, 3.95),
        camLookAt: new THREE.Vector3(5.2, 1.25, 2.6),
        screenClass: WasteScreen,
        accentColor: 0x84cc16
      }
    ];

    for (const config of deskConfigs) {
      const deskObj = this.createDeskStation(config);
      rootGroup.add(deskObj.group);
      this.desks.push(deskObj);
    }

    scene.add(rootGroup);
    return this.desks;
  }

  createDeskStation(config) {
    const group = new THREE.Group();
    group.position.copy(config.pos);
    group.rotation.y = config.rotY;

    // 1. Desk Console Structure (Heavy industrial chamfered body)
    const deskWidth = 2.4;
    const deskDepth = 1.1;
    const deskHeight = 0.85;

    const deskMat = new THREE.MeshStandardMaterial({
      color: 0x1a2234,
      roughness: 0.45,
      metalness: 0.7
    });

    const deskTopMat = new THREE.MeshStandardMaterial({
      color: 0x0f1624,
      roughness: 0.3,
      metalness: 0.8
    });

    // Main desk body
    const body = new THREE.Mesh(new THREE.BoxGeometry(deskWidth, deskHeight, deskDepth), deskMat);
    body.position.set(0, deskHeight / 2, 0);
    body.castShadow = true;
    body.receiveShadow = true;
    group.add(body);

    // Console top plate with bevel
    const topPlate = new THREE.Mesh(new THREE.BoxGeometry(deskWidth + 0.08, 0.05, deskDepth + 0.08), deskTopMat);
    topPlate.position.set(0, deskHeight + 0.025, 0);
    topPlate.receiveShadow = true;
    group.add(topPlate);

    // Accent LED light strip along desk front edge
    const ledMat = new THREE.MeshBasicMaterial({ color: config.accentColor });
    const ledStrip = new THREE.Mesh(new THREE.BoxGeometry(deskWidth + 0.08, 0.015, 0.02), ledMat);
    ledStrip.position.set(0, deskHeight + 0.035, deskDepth / 2 + 0.04);
    group.add(ledStrip);

    // 2. Interactive 3D Screen UI
    const screenUI = new config.screenClass(this.game);
    const screenW = 1.4;
    const screenH = 0.875;

    // Monitor Stand
    const standMat = new THREE.MeshStandardMaterial({ color: 0x0a0d14, metalness: 0.9, roughness: 0.3 });
    const standPole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.45, 12), standMat);
    standPole.position.set(0, deskHeight + 0.25, -0.2);
    group.add(standPole);

    // Monitor Bevel Frame
    const monitorFrame = new THREE.Mesh(
      new THREE.BoxGeometry(screenW + 0.08, screenH + 0.08, 0.06),
      standMat
    );
    monitorFrame.position.set(0, deskHeight + 0.58, -0.2);
    // Slight upward tilt for natural desk viewing
    monitorFrame.rotation.x = -0.08;
    group.add(monitorFrame);

    // Monitor Screen Mesh (mapped to dynamic CanvasTexture)
    const screenMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(screenW, screenH),
      new THREE.MeshBasicMaterial({ map: screenUI.texture })
    );
    screenMesh.position.set(0, deskHeight + 0.58, -0.165);
    screenMesh.rotation.x = -0.08;
    group.add(screenMesh);

    // Tag screen mesh for raycaster interaction
    screenMesh.userData = {
      isScreen: true,
      deskId: config.id,
      screenUI: screenUI
    };
    this.interactiveObjects.push(screenMesh);

    // 3. 3D Keyboard and Mouse on Desk
    const keyboard = new THREE.Mesh(
      new THREE.BoxGeometry(0.48, 0.015, 0.16),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 })
    );
    keyboard.position.set(-0.15, deskHeight + 0.055, 0.22);
    group.add(keyboard);

    const mouse = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.02, 0.12),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 })
    );
    mouse.position.set(0.28, deskHeight + 0.06, 0.22);
    group.add(mouse);

    // 4. Physical 3D BACK Button mounted on Desk Console
    const backBtn = this.createPhysicalBackButton(config);
    backBtn.mesh.position.set(-0.85, deskHeight + 0.06, 0.25);
    group.add(backBtn.mesh);
    this.interactiveObjects.push(backBtn.mesh);

    // 5. Special Station Hardware
    let scramObj = null;
    if (config.hasScram) {
      // Physical 3D SCRAM emergency console box
      scramObj = this.createPhysicalScramBox();
      scramObj.group.position.set(0.85, deskHeight + 0.055, 0.18);
      group.add(scramObj.group);
      this.interactiveObjects.push(scramObj.buttonMesh);
    }

    // 6. 3D Swivel Chair behind desk
    const chair = this.createOfficeChair();
    chair.position.set(0, 0, 0.85);
    chair.rotation.y = Math.PI;
    group.add(chair);

    // 7. 3D Floating World-Space Label
    const floatingLabel = this.createFloatingLabel(config.title, config.subtitle);
    floatingLabel.position.set(0, deskHeight + 1.45, -0.15);
    group.add(floatingLabel);

    // 8. Desk Bounding Hitbox (for clicking desk from overview camera)
    const hitBox = new THREE.Mesh(
      new THREE.BoxGeometry(deskWidth + 0.2, deskHeight + 1.2, deskDepth + 0.4),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    hitBox.position.set(0, (deskHeight + 1.2) / 2, 0);
    hitBox.userData = {
      isDeskHitBox: true,
      deskId: config.id
    };
    group.add(hitBox);
    this.interactiveObjects.push(hitBox);

    // Visual highlight rim around desk (shown when hovered in overview)
    const highlightMesh = new THREE.Mesh(
      new THREE.BoxGeometry(deskWidth + 0.12, 0.03, deskDepth + 0.12),
      new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0,
        wireframe: true
      })
    );
    highlightMesh.position.set(0, deskHeight + 0.06, 0);
    group.add(highlightMesh);

    return {
      id: config.id,
      title: config.title,
      config,
      group,
      screenUI,
      screenMesh,
      backBtn,
      scramObj,
      chair,
      floatingLabel,
      hitBox,
      highlightMesh
    };
  }

  createPhysicalBackButton(config) {
    const btnGroup = new THREE.Group();

    // Metallic Base casing
    const casing = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.04, 0.14),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.9, roughness: 0.3 })
    );
    btnGroup.add(casing);

    // Embossed illuminated Button Face
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
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('◀ OVERVIEW', 128, 52);

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('[RETURN BACK]', 128, 88);

    const tex = new THREE.CanvasTexture(canvas);
    const faceMat = new THREE.MeshStandardMaterial({
      map: tex,
      color: 0xffffff,
      roughness: 0.4,
      metalness: 0.2
    });

    const buttonFace = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 0.04, 0.12),
      faceMat
    );
    buttonFace.position.y = 0.025;
    btnGroup.add(buttonFace);

    // Tag button face for click
    buttonFace.userData = {
      isBackButton: true,
      deskId: config.id,
      btnFace: buttonFace
    };

    return {
      mesh: buttonFace,
      group: btnGroup
    };
  }

  createPhysicalScramBox() {
    const scramGroup = new THREE.Group();

    // Hazard striped metal housing
    const boxMat = new THREE.MeshStandardMaterial({
      color: 0x7f1d1d,
      roughness: 0.4,
      metalness: 0.6
    });
    const box = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.12, 0.24), boxMat);
    box.position.y = 0.06;
    scramGroup.add(box);

    // Hazard caution rim
    const rimMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const rim = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.02, 0.26), rimMat);
    rim.position.y = 0.12;
    scramGroup.add(rim);

    // Large Red Mushroom Push-Button
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 0.06, 16),
      new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9 })
    );
    stem.position.y = 0.14;
    scramGroup.add(stem);

    const domeMat = new THREE.MeshStandardMaterial({
      color: 0xdc2626,
      roughness: 0.2,
      metalness: 0.4,
      emissive: 0x7f1d1d,
      emissiveIntensity: 0.4
    });

    const buttonMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.07, 0.04, 24),
      domeMat
    );
    buttonMesh.position.y = 0.18;
    scramGroup.add(buttonMesh);

    // Safety guard flip cover (transparent yellow acrylic)
    const coverMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      transparent: true,
      opacity: 0.55,
      roughness: 0.1
    });
    const cover = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.08, 0.2),
      coverMat
    );
    cover.position.set(0, 0.22, 0.02);
    scramGroup.add(cover);

    buttonMesh.userData = {
      isScramButton: true,
      buttonMesh: buttonMesh,
      coverMesh: cover
    };

    return {
      group: scramGroup,
      buttonMesh,
      cover
    };
  }

  createOfficeChair() {
    const chairGroup = new THREE.Group();

    // Wheel base
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x111827, metalness: 0.8, roughness: 0.4 });
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.42, 10), baseMat);
    stem.position.y = 0.21;
    chairGroup.add(stem);

    // 5 caster star base
    for (let a = 0; a < 5; a++) {
      const angle = (a * Math.PI * 2) / 5;
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.02, 0.03), baseMat);
      leg.position.set(Math.cos(angle) * 0.14, 0.04, Math.sin(angle) * 0.14);
      leg.rotation.y = -angle;
      chairGroup.add(leg);
    }

    // Padded seat cushion (Navy blue industrial fabric)
    const seatMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.07, 0.44), seatMat);
    seat.position.set(0, 0.44, 0);
    chairGroup.add(seat);

    // Backrest
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.52, 0.06), seatMat);
    back.position.set(0, 0.72, -0.2);
    chairGroup.add(back);

    // Armrests
    const armGeo = new THREE.BoxGeometry(0.05, 0.18, 0.24);
    const armL = new THREE.Mesh(armGeo, baseMat);
    armL.position.set(-0.25, 0.54, 0);
    const armR = new THREE.Mesh(armGeo, baseMat);
    armR.position.set(0.25, 0.54, 0);
    chairGroup.add(armL);
    chairGroup.add(armR);

    return chairGroup;
  }

  createFloatingLabel(title, subtitle) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 160;
    const ctx = canvas.getContext('2d');

    // Holographic rounded badge
    ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
    ctx.beginPath();
    ctx.roundRect(8, 8, 496, 144, 16);
    ctx.fill();

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Cyan accent dot
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(36, 48, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText(title, 56, 56);

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(subtitle, 56, 92);

    ctx.fillStyle = '#38bdf8';
    ctx.font = '13px sans-serif';
    ctx.fillText('[ CLICK DESK TO ZOOM & OPERATE ]', 56, 126);

    const tex = new THREE.CanvasTexture(canvas);
    const mat = new THREE.SpriteMaterial({
      map: tex,
      transparent: true,
      depthWrite: false
    });

    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(1.8, 0.56, 1);
    return sprite;
  }

  update(dt) {
    for (const desk of this.desks) {
      desk.screenUI.update();
    }
  }
}

