import * as THREE from 'three';
import { TextureFactory } from './TextureFactory.js';

/**
 * RobloxControlRoom - Constructs the authentic 3D industrial control room
 * matching Image 1 & Image 3 (Concrete walls, upper observation windows,
 * overhead telemetry board, potted planters, metal storage racks, lighting).
 */
export class RobloxControlRoom {
  constructor(game) {
    this.game = game;
    this.beacons = [];
  }

  build(scene) {
    const roomGroup = new THREE.Group();
    roomGroup.name = 'RobloxControlRoomArchitecture';

    // 1. Floor (Modular grey concrete industrial tiles)
    const floorGeo = new THREE.PlaneGeometry(28, 22);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x484b54, // Warm industrial grey matching Image 1
      roughness: 0.65,
      metalness: 0.2
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    roomGroup.add(floor);

    // 2. Back Wall with Observation Windows & Signage (Matching Image 1)
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x3d414a, // Dark industrial wall
      roughness: 0.8,
      metalness: 0.1
    });

    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(28, 9), wallMat);
    backWall.position.set(0, 4.5, -9.5);
    backWall.receiveShadow = true;
    roomGroup.add(backWall);

    // Upper Mezzanine Windows (Looking into upper offices matching Image 1)
    const windowFrameMat = new THREE.MeshStandardMaterial({ color: 0x1f232b, metalness: 0.8 });
    const windowGlassMat = new THREE.MeshStandardMaterial({
      color: 0x8ba3b8,
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.6
    });

    const windowMesh = new THREE.Mesh(new THREE.BoxGeometry(11, 2.4, 0.2), windowGlassMat);
    windowMesh.position.set(6.5, 6.2, -9.35);
    roomGroup.add(windowMesh);

    // 3. Stencil Text on Wall: "UNIT 01 PRIMARY CONTROL ROOM" (Matching Image 1)
    const signCanvas = document.createElement('canvas');
    signCanvas.width = 1024;
    signCanvas.height = 256;
    const sCtx = signCanvas.getContext('2d');
    sCtx.fillStyle = '#b8944d'; // Industrial stencil gold/yellow matching Image 1
    sCtx.font = 'bold 56px "Courier New", monospace';
    sCtx.fillText('UNIT 01 PRIMARY', 20, 80);
    sCtx.font = 'bold 38px "Courier New", monospace';
    sCtx.fillText('CONTROL ROOM', 20, 140);
    sCtx.fillStyle = '#94a3b8';
    sCtx.font = 'bold 22px sans-serif';
    sCtx.fillText('NUCLEARIS NPP // NEUTRON ENERGY CORP.', 20, 195);

    const signTex = new THREE.CanvasTexture(signCanvas);
    const signMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(6.5, 1.6),
      new THREE.MeshBasicMaterial({ map: signTex, transparent: true })
    );
    signMesh.position.set(6.5, 7.8, -9.35);
    roomGroup.add(signMesh);

    // 4. Giant Overhead Display Wall (Matching Image 1 & 3!)
    const overhead = TextureFactory.createOverheadBoardTexture(this.game);
    this.overheadBoard = overhead;

    const boardFrame = new THREE.Mesh(
      new THREE.BoxGeometry(10.6, 4.6, 0.3),
      new THREE.MeshStandardMaterial({ color: 0x1a1d24, metalness: 0.8, roughness: 0.4 })
    );
    boardFrame.position.set(-3.5, 5.6, -9.3);
    roomGroup.add(boardFrame);

    const boardScreen = new THREE.Mesh(
      new THREE.PlaneGeometry(10.2, 4.2),
      new THREE.MeshBasicMaterial({ map: overhead.texture })
    );
    boardScreen.position.set(-3.5, 5.6, -9.14);
    roomGroup.add(boardScreen);

    // Overhead Hanging Struts (Holding board from ceiling)
    const strutMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.9 });
    for (const sx of [-7.5, -3.5, 0.5]) {
      const strut = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.5, 8), strutMat);
      strut.position.set(sx, 8.2, -9.14);
      roomGroup.add(strut);
    }

    // 5. Environmental Details: Planters with green plants (Matching Image 1)
    const planterCoords = [
      [-10, 0, -4],
      [-10, 0, 2],
      [10, 0, -5],
      [10, 0, 3],
      [-2, 0, 7.5],
      [3, 0, 7.5]
    ];
    for (const [px, py, pz] of planterCoords) {
      const planter = this.createPlanter();
      planter.position.set(px, py, pz);
      roomGroup.add(planter);
    }

    // 6. Metal Storage Shelves with parts boxes (Matching Image 1)
    const rack1 = this.createStorageRack();
    rack1.position.set(11.5, 0, -2);
    rack1.rotation.y = -Math.PI / 2;
    roomGroup.add(rack1);

    // Waste Bins (Matching Image 1)
    const bin = this.createWasteBin();
    bin.position.set(-11, 0, 5);
    roomGroup.add(bin);

    // 7. Emergency Flashing Beacons
    this.addEmergencyBeacons(roomGroup);

    // 8. Soft Control Room Lighting
    this.setupLighting(roomGroup);

    scene.add(roomGroup);
    return roomGroup;
  }

  createPlanter() {
    const group = new THREE.Group();
    // Concrete trough planter
    const trough = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.5, 0.8),
      new THREE.MeshStandardMaterial({ color: 0x3d414a, roughness: 0.9 })
    );
    trough.position.y = 0.25;
    trough.castShadow = true;
    group.add(trough);

    // Soil
    const soil = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.1, 0.65),
      new THREE.MeshStandardMaterial({ color: 0x241d18, roughness: 1.0 })
    );
    soil.position.y = 0.48;
    group.add(soil);

    // Green Foliage
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x2e6f40, roughness: 0.7 });
    for (let i = 0; i < 4; i++) {
      const bush = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.35 + Math.random() * 0.1),
        leafMat
      );
      bush.position.set(-0.8 + i * 0.52, 0.7, (Math.random() - 0.5) * 0.2);
      group.add(bush);
    }

    return group;
  }

  createStorageRack() {
    const group = new THREE.Group();
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8, roughness: 0.4 });

    // 4 vertical posts
    for (const x of [-0.6, 0.6]) {
      for (const z of [-0.25, 0.25]) {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.04, 2.2, 0.04), metalMat);
        post.position.set(x, 1.1, z);
        group.add(post);
      }
    }

    // 4 shelves
    for (let s = 0; s < 4; s++) {
      const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.03, 0.54), metalMat);
      shelf.position.set(0, 0.3 + s * 0.55, 0);
      group.add(shelf);

      // Boxes on shelf
      const boxMat = new THREE.MeshStandardMaterial({ color: s % 2 === 0 ? 0xb45309 : 0x0369a1, roughness: 0.7 });
      const box = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.26, 0.34), boxMat);
      box.position.set(-0.25 + (s % 2) * 0.5, 0.45 + s * 0.55, 0);
      group.add(box);
    }

    return group;
  }

  createWasteBin() {
    const group = new THREE.Group();
    const binMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.24, 0.2, 0.65, 16),
      new THREE.MeshStandardMaterial({ color: 0x1e242e, roughness: 0.5, metalness: 0.7 })
    );
    binMesh.position.y = 0.325;
    group.add(binMesh);
    return group;
  }

  addEmergencyBeacons(parent) {
    const positions = [
      new THREE.Vector3(-8, 6.5, -4),
      new THREE.Vector3(8, 6.5, -4),
      new THREE.Vector3(-8, 6.5, 3),
      new THREE.Vector3(8, 6.5, 3)
    ];

    for (const pos of positions) {
      const domeMat = new THREE.MeshStandardMaterial({
        color: 0xdc2626,
        roughness: 0.2,
        transparent: true,
        opacity: 0.8
      });
      const dome = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 0.2, 16), domeMat);
      dome.position.copy(pos);
      parent.add(dome);

      const light = new THREE.PointLight(0xef4444, 0, 14);
      light.position.copy(pos);
      parent.add(light);

      this.beacons.push({ dome, light });
    }
  }

  setupLighting(parent) {
    // Soft industrial ambient lighting
    const ambient = new THREE.AmbientLight(0xdfe6ed, 1.4);
    parent.add(ambient);

    // Warm fluorescent ceiling downlights (matching Image 1)
    const mainLight = new THREE.DirectionalLight(0xfff6e8, 1.6);
    mainLight.position.set(-4, 12, 6);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.bias = -0.0005;
    parent.add(mainLight);

    // Accent fill lights for consoles
    const fillLight = new THREE.DirectionalLight(0x94b3cc, 0.8);
    fillLight.position.set(6, 8, -4);
    parent.add(fillLight);
  }

  update(dt, emergencyActive) {
    this.overheadBoard.update();

    if (emergencyActive) {
      const flash = Math.sin(Date.now() * 0.008) * 0.5 + 0.5;
      for (const b of this.beacons) {
        b.light.intensity = 2.5 * flash;
        b.dome.material.emissive = new THREE.Color(0xdc2626);
        b.dome.material.emissiveIntensity = flash * 0.8;
      }
    } else {
      for (const b of this.beacons) {
        if (b.light.intensity > 0) {
          b.light.intensity = 0;
          b.dome.material.emissiveIntensity = 0;
        }
      }
    }
  }
}

