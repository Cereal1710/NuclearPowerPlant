import * as THREE from 'three';

/**
 * StaffBuilder - Procedural 3D stylized staff character models with:
 * - Industrial jumpsuits & Neutron Energy Corp safety hardhats
 * - Seated posture at desk chairs
 * - Idle typing and head-bob animations
 */
export class StaffBuilder {
  constructor(game) {
    this.game = game;
    this.characters = new Map();
    this.rootGroup = new THREE.Group();
    this.rootGroup.name = 'AllStaffCharacters';
  }

  build(scene, deskMap) {
    this.deskMap = deskMap;
    scene.add(this.rootGroup);
    this.syncWithRoster();
    return this.rootGroup;
  }

  createHumanoidMesh(staff) {
    const group = new THREE.Group();
    group.name = `StaffChar_${staff.id}`;

    // Materials
    const suitColor = new THREE.Color(staff.color || 0x38bdf8);
    const suitMat = new THREE.MeshStandardMaterial({
      color: suitColor,
      roughness: 0.6,
      metalness: 0.2
    });

    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xf5d0b5,
      roughness: 0.7
    });

    const hardhatMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15, // Yellow safety hardhat
      roughness: 0.3,
      metalness: 0.4
    });

    // 1. Torso / Jumpsuit
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.45, 0.24), suitMat);
    torso.position.y = 0.68;
    torso.castShadow = true;
    group.add(torso);

    // Neutron Energy Corp logo patch on chest
    const patchMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
    const patch = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.05, 0.01), patchMat);
    patch.position.set(0.09, 0.74, 0.125);
    group.add(patch);

    // 2. Head & Neck
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.08, 10), skinMat);
    neck.position.y = 0.94;
    group.add(neck);

    const headGroup = new THREE.Group();
    headGroup.position.set(0, 1.04, 0);

    const head = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.2), skinMat);
    head.castShadow = true;
    headGroup.add(head);

    // Hardhat
    const hardhat = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2), hardhatMat);
    hardhat.position.y = 0.06;
    headGroup.add(hardhat);

    const hardhatBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.02, 16), hardhatMat);
    hardhatBrim.position.y = 0.06;
    headGroup.add(hardhatBrim);

    group.add(headGroup);

    // 3. Seated Thighs & Legs
    const thighMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.7 });
    const leftThigh = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.38), thighMat);
    leftThigh.position.set(-0.1, 0.44, 0.16);
    group.add(leftThigh);

    const rightThigh = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.38), thighMat);
    rightThigh.position.set(0.1, 0.44, 0.16);
    group.add(rightThigh);

    // Shin / Boots down to floor
    const shinMat = new THREE.MeshStandardMaterial({ color: 0x0a0f18, roughness: 0.4 });
    const leftShin = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.38, 0.12), shinMat);
    leftShin.position.set(-0.1, 0.2, 0.34);
    group.add(leftShin);

    const rightShin = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.38, 0.12), shinMat);
    rightShin.position.set(0.1, 0.2, 0.34);
    group.add(rightShin);

    // 4. Arms reaching forward to keyboard
    const armGeo = new THREE.BoxGeometry(0.09, 0.09, 0.36);
    const armL = new THREE.Mesh(armGeo, suitMat);
    armL.position.set(-0.21, 0.62, 0.18);
    armL.rotation.x = -0.45;
    group.add(armL);

    const armR = new THREE.Mesh(armGeo, suitMat);
    armR.position.set(0.21, 0.62, 0.18);
    armR.rotation.x = -0.45;
    group.add(armR);

    return {
      group,
      headGroup,
      armL,
      armR,
      staffId: staff.id
    };
  }

  syncWithRoster() {
    const staffList = this.game.staffSim.staffMembers;

    // Check existing or create new
    for (const member of staffList) {
      let charObj = this.characters.get(member.id);
      if (!charObj) {
        charObj = this.createHumanoidMesh(member);
        this.characters.set(member.id, charObj);
        this.rootGroup.add(charObj.group);
      }

      // Position character at assigned desk or break lounge
      if (member.state === 'working' && member.station) {
        const desk = this.deskMap.find(d => d.id === member.station);
        if (desk) {
          charObj.group.visible = true;
          charObj.group.position.copy(desk.group.position);
          // Offset back to chair
          const chairOffset = new THREE.Vector3(0, 0, 0.85).applyEuler(desk.group.rotation);
          charObj.group.position.add(chairOffset);
          charObj.group.rotation.y = desk.group.rotation.y;
        } else {
          charObj.group.visible = false;
        }
      } else {
        // In break room / unassigned: place along back wall
        const idx = staffList.indexOf(member);
        charObj.group.visible = true;
        charObj.group.position.set(-4 + idx * 1.5, 0, 7.8);
        charObj.group.rotation.y = Math.PI;
      }
    }
  }

  update(dt) {
    const time = Date.now() * 0.003;
    for (const [id, charObj] of this.characters.entries()) {
      if (!charObj.group.visible) continue;
      // Gentle breathing & typing jitter
      charObj.headGroup.rotation.y = Math.sin(time + id.charCodeAt(id.length - 1)) * 0.08;
      charObj.headGroup.rotation.x = Math.sin(time * 0.5) * 0.04;

      charObj.armL.rotation.x = -0.45 + Math.sin(time * 4) * 0.04;
      charObj.armR.rotation.x = -0.45 + Math.cos(time * 4) * 0.04;
    }
  }
}

