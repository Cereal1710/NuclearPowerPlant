/**
 * CSS3DRoom - Pure 3D Architecture (Zero WebGL)
 * Floor, Front Wall, Side Walls, Server Racks, Wall Banners, Emergency Beacons
 * (Ceiling and Back Wall omitted to prevent camera occlusion)
 */
export class CSS3DRoom {
  constructor(game, worldEl) {
    this.game = game;
    this.worldEl = worldEl;
    this.beacons = [];
    this.build();
  }

  build() {
    const roomEl = document.createElement('div');
    roomEl.className = 'room-shell';

    // 1. Floor
    const floor = document.createElement('div');
    floor.className = 'room-floor';
    floor.innerHTML = '<div class="room-floor-grid-lines"></div>';
    roomEl.appendChild(floor);

    // 2. Walls (Front, Left, Right)
    const wallFront = document.createElement('div');
    wallFront.className = 'room-wall-front';
    roomEl.appendChild(wallFront);

    const wallLeft = document.createElement('div');
    wallLeft.className = 'room-wall-left';
    roomEl.appendChild(wallLeft);

    const wallRight = document.createElement('div');
    wallRight.className = 'room-wall-right';
    roomEl.appendChild(wallRight);

    // 3. Server Racks on Left Wall
    for (let r = 0; r < 4; r++) {
      const rack = document.createElement('div');
      rack.className = 'server-rack-3d';
      rack.style.transform = `translateX(-1160px) translateY(-140px) translateZ(${-400 + r * 260}px) rotateY(90deg)`;

      for (let u = 0; u < 9; u++) {
        const unit = document.createElement('div');
        unit.className = 'server-rack-unit';
        const ledType = u % 3 === 0 ? 'blue' : u % 2 === 0 ? '' : 'amber';
        unit.innerHTML = `
          <div class="server-led ${ledType}"></div>
          <div class="server-led ${ledType}"></div>
          <div style="font-size: 8px; color: #64748b; font-family: monospace; margin-left: auto;">SYS_${r}${u}</div>
        `;
        rack.appendChild(unit);
      }
      roomEl.appendChild(rack);
    }

    // 4. 3D Wall Signage Banner
    const banner = document.createElement('div');
    banner.className = 'wall-banner-3d';
    banner.innerHTML = `
      <div class="wall-banner-logo">⚛ NUCLEARIS NUCLEAR POWER PLANT</div>
      <div class="wall-banner-sub">FACILITY OPERATED BY NEUTRON ENERGY CORP. // SECTOR 4</div>
    `;
    roomEl.appendChild(banner);

    // 5. Emergency Beacons along walls
    const beaconCoords = [
      { x: -500, z: -860, y: -300 },
      { x: 500, z: -860, y: -300 },
      { x: -1180, z: -100, y: -300 },
      { x: 1180, z: -100, y: -300 }
    ];

    for (const coord of beaconCoords) {
      const beacon = document.createElement('div');
      beacon.className = 'emergency-beacon-3d';
      beacon.style.transform = `translateX(${coord.x}px) translateY(${coord.y}px) translateZ(${coord.z}px)`;
      roomEl.appendChild(beacon);
      this.beacons.push(beacon);
    }

    this.worldEl.appendChild(roomEl);
  }

  update(emergencyActive) {
    for (const b of this.beacons) {
      if (emergencyActive) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    }
  }
}
