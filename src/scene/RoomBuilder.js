import * as THREE from 'three';

/**
 * RoomBuilder - Constructs the 3D Industrial Control Room Architecture
 */
export class RoomBuilder {
  constructor(game) {
    this.game = game;
    this.emergencyBeacons = [];
  }

  build(scene) {
    const roomGroup = new THREE.Group();
    roomGroup.name = 'ControlRoomArchitecture';

    // Room dimensions: 24m wide, 8m high, 20m deep
    const width = 24;
    const height = 7.5;
    const depth = 20;

    // Floor Material (High-tech industrial panels)
    const floorGeo = new THREE.PlaneGeometry(width, depth, 12, 10);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x111622,
      roughness: 0.35,
      metalness: 0.65
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    roomGroup.add(floor);

    // Floor Hazard Inlay Lines (Yellow/Black stripes around central perimeter)
    const floorLines = this.createFloorHazardLines();
    roomGroup.add(floorLines);

    // Ceiling with industrial beams
    const ceilingGeo = new THREE.PlaneGeometry(width, depth);
    const ceilingMat = new THREE.MeshStandardMaterial({
      color: 0x0a0f18,
      roughness: 0.9,
      metalness: 0.2
    });
    const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
    ceiling.position.y = height;
    ceiling.rotation.x = Math.PI / 2;
    roomGroup.add(ceiling);

    // Ceiling structural I-beams
    for (let z = -depth / 2 + 3; z <= depth / 2 - 3; z += 4.5) {
      const beamGeo = new THREE.BoxGeometry(width, 0.4, 0.5);
      const beamMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.4 });
      const beam = new THREE.Mesh(beamGeo, beamMat);
      beam.position.set(0, height - 0.2, z);
      roomGroup.add(beam);
    }

    // Walls
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x0e1726,
      roughness: 0.7,
      metalness: 0.3
    });

    // Front Wall (where the big screen and brand logo are)
    const frontWall = new THREE.Mesh(new THREE.PlaneGeometry(width, height), wallMat);
    frontWall.position.set(0, height / 2, -depth / 2);
    frontWall.receiveShadow = true;
    roomGroup.add(frontWall);

    // Back Wall
    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(width, height), wallMat);
    backWall.position.set(0, height / 2, depth / 2);
    backWall.rotation.y = Math.PI;
    roomGroup.add(backWall);

    // Left Wall
    const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(depth, height), wallMat);
    leftWall.position.set(-width / 2, height / 2, 0);
    leftWall.rotation.y = Math.PI / 2;
    roomGroup.add(leftWall);

    // Right Wall
    const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(depth, height), wallMat);
    rightWall.position.set(width / 2, height / 2, 0);
    rightWall.rotation.y = -Math.PI / 2;
    roomGroup.add(rightWall);

    // Architectural Pillars along side walls
    for (let z = -depth / 2 + 2; z <= depth / 2 - 2; z += 4) {
      const pillarGeo = new THREE.BoxGeometry(0.7, height, 0.7);
      const pillarMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5, metalness: 0.7 });

      const pLeft = new THREE.Mesh(pillarGeo, pillarMat);
      pLeft.position.set(-width / 2 + 0.35, height / 2, z);
      roomGroup.add(pLeft);

      const pRight = new THREE.Mesh(pillarGeo, pillarMat);
      pRight.position.set(width / 2 - 0.35, height / 2, z);
      roomGroup.add(pRight);
    }

    // Server Racks along Back and Left Walls
    this.addServerRacks(roomGroup, width, height, depth);

    // 3D Wall Signage: "NUCLEARIS NUCLEAR POWER PLANT" & "NEUTRON ENERGY CORP."
    this.addWallSignage(roomGroup);

    // Emergency Ceiling Beacons
    this.addEmergencyBeacons(roomGroup, height);

    // Lighting Setup
    this.setupLighting(roomGroup);

    scene.add(roomGroup);
    return roomGroup;
  }

  createFloorHazardLines() {
    const group = new THREE.Group();
    const lineMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });

    // Grid accent strips embedded in floor
    const coords = [-6, 0, 6];
    for (const x of coords) {
      const strip = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 16), lineMat);
      strip.rotation.x = -Math.PI / 2;
      strip.position.set(x, 0.005, 0);
      group.add(strip);
    }

    // Front safety caution boundary
    const borderMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const cautionStrip = new THREE.Mesh(new THREE.PlaneGeometry(18, 0.12), borderMat);
    cautionStrip.rotation.x = -Math.PI / 2;
    cautionStrip.position.set(0, 0.006, -5.5);
    group.add(cautionStrip);

    return group;
  }

  addServerRacks(parent, w, h, d) {
    const rackGeo = new THREE.BoxGeometry(0.9, 3.6, 1.2);
    const rackMat = new THREE.MeshStandardMaterial({ color: 0x0a0e17, metalness: 0.8, roughness: 0.3 });

    // Left side server racks
    for (let i = 0; i < 4; i++) {
      const rack = new THREE.Mesh(rackGeo, rackMat);
      rack.position.set(-w / 2 + 0.8, 1.8, -4 + i * 2.2);
      parent.add(rack);

      // Blinking status LEDs on rack face
      const ledCanvas = document.createElement('canvas');
      ledCanvas.width = 128;
      ledCanvas.height = 256;
      const ctx = ledCanvas.getContext('2d');
      ctx.fillStyle = '#050811';
      ctx.fillRect(0, 0, 128, 256);

      for (let row = 0; row < 12; row++) {
        for (let col = 0; col < 6; col++) {
          const on = Math.random() > 0.3;
          ctx.fillStyle = on ? (Math.random() > 0.85 ? '#38bdf8' : '#10b981') : '#042f2e';
          ctx.fillRect(16 + col * 16, 16 + row * 18, 8, 8);
        }
      }

      const ledTex = new THREE.CanvasTexture(ledCanvas);
      const ledPanel = new THREE.Mesh(
        new THREE.PlaneGeometry(0.8, 3.0),
        new THREE.MeshBasicMaterial({ map: ledTex })
      );
      ledPanel.rotation.y = Math.PI / 2;
      ledPanel.position.set(-w / 2 + 1.26, 1.8, -4 + i * 2.2);
      parent.add(ledPanel);
    }
  }

  addWallSignage(parent) {
    // 3D Illuminated High Banner above Front Big Screen
    const bannerCanvas = document.createElement('canvas');
    bannerCanvas.width = 1024;
    bannerCanvas.height = 128;
    const ctx = bannerCanvas.getContext('2d');

    ctx.fillStyle = '#090f1d';
    ctx.fillRect(0, 0, 1024, 128);

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4;
    ctx.strokeRect(4, 4, 1016, 120);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 42px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⚡ NUCLEARIS NUCLEAR POWER PLANT ⚡', 512, 54);

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('FACILITY MANAGED BY NEUTRON ENERGY CORP. // SECTOR 4', 512, 98);

    const bannerTex = new THREE.CanvasTexture(bannerCanvas);
    const bannerMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(12, 1.5),
      new THREE.MeshBasicMaterial({ map: bannerTex })
    );
    bannerMesh.position.set(0, 7.0, -9.85);
    parent.add(bannerMesh);
  }

  addEmergencyBeacons(parent, roomH) {
    const beaconPositions = [
      new THREE.Vector3(-6, roomH - 0.4, -4),
      new THREE.Vector3(6, roomH - 0.4, -4),
      new THREE.Vector3(-6, roomH - 0.4, 4),
      new THREE.Vector3(6, roomH - 0.4, 4)
    ];

    for (const pos of beaconPositions) {
      const group = new THREE.Group();
      group.position.copy(pos);

      // Mount base
      const base = new THREE.Mesh(
        new THREE.CylinderGeometry(0.2, 0.25, 0.15, 12),
        new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.9 })
      );
      group.add(base);

      // Glass dome
      const dome = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
        new THREE.MeshStandardMaterial({
          color: 0xef4444,
          transparent: true,
          opacity: 0.8,
          roughness: 0.1
        })
      );
      dome.position.y = 0.08;
      group.add(dome);

      // Pointlight for alarm
      const light = new THREE.PointLight(0xef4444, 0, 15);
      light.position.y = 0.1;
      group.add(light);

      parent.add(group);
      this.emergencyBeacons.push({ group, light, dome });
    }
  }

  setupLighting(parent) {
    // Soft Ambient Light for control room
    const ambient = new THREE.AmbientLight(0x182234, 1.8);
    parent.add(ambient);

    // Directional Key Light from top-front
    const dirLight = new THREE.DirectionalLight(0x93c5fd, 1.4);
    dirLight.position.set(0, 10, 5);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    parent.add(dirLight);

    // Subtle blue accent downlights over desk stations
    const deskLights = [
      [-5, 4.5, -2],
      [0, 4.5, -2.5],
      [5, 4.5, -2],
      [-5, 4.5, 2.5],
      [0, 4.5, 2.8],
      [5, 4.5, 2.5]
    ];

    for (const [x, y, z] of deskLights) {
      const pLight = new THREE.PointLight(0x38bdf8, 0.9, 6.5);
      pLight.position.set(x, y, z);
      parent.add(pLight);
    }
  }

  update(dt, emergencyActive) {
    // Emergency red revolving beacons
    if (emergencyActive) {
      const time = Date.now() * 0.006;
      const intensity = 3.5 + Math.sin(time * 3) * 2.5;

      for (const beacon of this.emergencyBeacons) {
        beacon.light.intensity = intensity;
        beacon.dome.material.emissive = new THREE.Color(0xef4444);
        beacon.dome.material.emissiveIntensity = intensity * 0.4;
      }
    } else {
      for (const beacon of this.emergencyBeacons) {
        if (beacon.light.intensity > 0) {
          beacon.light.intensity = 0;
          beacon.dome.material.emissive = new THREE.Color(0x000000);
          beacon.dome.material.emissiveIntensity = 0;
        }
      }
    }
  }
}

