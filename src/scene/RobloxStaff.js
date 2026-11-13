import * as THREE from 'three';

/**
 * RobloxStaff - 3D Blocky Humanoid Characters matching user screenshots
 * Image 1 & Image 2 (Iconic blocky proportions, yellow hardhats,
 * high-vis safety vests with reflective stripes, animated postures).
 */
export class RobloxStaff {
  constructor(game) {
    this.game = game;
    this.characters = [];
  }

  build(scene, consoles) {
    const rootGroup = new THREE.Group();
    rootGroup.name = 'AllRobloxStaff';

    // Character spawn locations at consoles (matching Image 1!)
    const staffConfigs = [
      {
        id: 'staff_reactor_1',
        stationId: 'reactor',
        role: 'Reactor Primary Operator',
        offset: new THREE.Vector3(0, 0, 0.9),
        vestColor: 0xea580c // Orange high-vis vest
      },
      {
        id: 'staff_reactor_2',
        stationId: 'reactor',
        role: 'Coolant Specialist',
        offset: new THREE.Vector3(-0.9, 0, 0.85),
        vestColor: 0xeab308 // Yellow high-vis vest
      },
      {
        id: 'staff_grid',
        stationId: 'electrical',
        role: 'Grid Dispatcher',
        offset: new THREE.Vector3(0, 0, 0.9),
        vestColor: 0xeab308
      },
      {
        id: 'staff_shift',
        stationId: 'shift',
        role: 'Shift Manager',
        offset: new THREE.Vector3(0, 0, 0.9),
        vestColor: 0x0284c7 // Blue manager vest
      },
      {
        id: 'staff_maint',
        stationId: 'maintenance',
        role: 'Turbine Mechanic',
        offset: new THREE.Vector3(0, 0, 0.9),
        vestColor: 0xea580c
      }
    ];

    for (const sc of staffConfigs) {
      const station = consoles.find(c => c.cfg.id === sc.stationId);
      if (station) {
        const charMesh = this.createBlockyCharacter(sc);
        charMesh.group.position.copy(station.cfg.pos).add(sc.offset.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), station.cfg.rotY));
        charMesh.group.rotation.y = station.cfg.rotY;
        rootGroup.add(charMesh.group);
        this.characters.push(charMesh);
      }
    }

    scene.add(rootGroup);
    return rootGroup;
  }

  createBlockyCharacter(cfg) {
    const group = new THREE.Group();

    // 1. Legs (Blocky blue denim trousers)
    const legMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
    const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.65, 0.24), legMat);
    leftLeg.position.set(-0.14, 0.325, 0);
    leftLeg.castShadow = true;
    group.add(leftLeg);

    const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.65, 0.24), legMat);
    rightLeg.position.set(0.14, 0.325, 0);
    rightLeg.castShadow = true;
    group.add(rightLeg);

    // 2. Torso (Blocky shirt with High-Vis Safety Vest matching Image 1 & 2!)
    const vestMat = new THREE.MeshStandardMaterial({
      color: cfg.vestColor,
      roughness: 0.6,
      metalness: 0.1
    });

    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.62, 0.28), vestMat);
    torso.position.y = 0.96;
    torso.castShadow = true;
    group.add(torso);

    // Reflective Silver Stripe on Vest
    const stripeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.2, metalness: 0.8 });
    const stripeH = new THREE.Mesh(new THREE.BoxGeometry(0.57, 0.08, 0.29), stripeMat);
    stripeH.position.y = 0.92;
    group.add(stripeH);

    // Neutron Energy Corp logo patch on chest
    const patchMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
    const patch = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.06, 0.02), patchMat);
    patch.position.set(0.16, 1.08, 0.145);
    group.add(patch);

    // 3. Head & Yellow Safety Hardhat (Iconic Roblox style matching Image 1 & 2!)
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.45, 0);

    // Yellow / Peach skin tone
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.5 });
    const head = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.32, 16), skinMat);
    head.castShadow = true;
    headGroup.add(head);

    // Hardhat (Bright Yellow with Brim matching Image 1 & 2!)
    const hardhatMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15, // High-vis yellow hardhat
      roughness: 0.3,
      metalness: 0.3
    });

    const hardhatDome = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
      hardhatMat
    );
    hardhatDome.position.y = 0.12;
    headGroup.add(hardhatDome);

    const hardhatBrim = new THREE.Mesh(
      new THREE.CylinderGeometry(0.25, 0.25, 0.03, 16),
      hardhatMat
    );
    hardhatBrim.position.y = 0.12;
    headGroup.add(hardhatBrim);

    // Black safety glasses / visor line
    const visorMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.05, 0.04), visorMat);
    visor.position.set(0, 0.02, 0.16);
    headGroup.add(visor);

    group.add(headGroup);

    // 4. Blocky Arms reaching forward to operate console
    const armMat = new THREE.MeshStandardMaterial({ color: cfg.vestColor, roughness: 0.6 });
    const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.58, 0.2), armMat);
    leftArm.position.set(-0.38, 0.94, 0.12);
    leftArm.rotation.x = -0.55; // Reaching onto console
    group.add(leftArm);

    const rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.58, 0.2), armMat);
    rightArm.position.set(0.38, 0.94, 0.12);
    rightArm.rotation.x = -0.65;
    group.add(rightArm);

    return {
      group,
      headGroup,
      leftArm,
      rightArm
    };
  }

  update(dt) {
    const time = Date.now() * 0.003;
    for (let i = 0; i < this.characters.length; i++) {
      const c = this.characters[i];
      // Subtle idle breathing and head turns
      c.headGroup.rotation.y = Math.sin(time + i * 1.5) * 0.12;
      c.leftArm.rotation.x = -0.55 + Math.sin(time * 2 + i) * 0.05;
      c.rightArm.rotation.x = -0.65 + Math.cos(time * 2 + i) * 0.05;
    }
  }
}

