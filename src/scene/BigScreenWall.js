import * as THREE from 'three';
import { BigWallScreen } from '../screens/BigWallScreen.js';

/**
 * BigScreenWall - Massive 3D Video Wall on the Front Wall of the Control Room
 */
export class BigScreenWall {
  constructor(game) {
    this.game = game;
    this.screenUI = new BigWallScreen(game);
  }

  build(scene) {
    const group = new THREE.Group();
    group.name = 'BigScreenWallGroup';

    const width = 14.5;
    const height = 5.4;

    // Beveled Industrial Frame
    const frameGeo = new THREE.BoxGeometry(width + 0.4, height + 0.4, 0.25);
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.85,
      roughness: 0.3
    });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    frame.position.set(0, 3.8, -9.8);
    group.add(frame);

    // Screen Mesh
    const screenGeo = new THREE.PlaneGeometry(width, height);
    const screenMat = new THREE.MeshBasicMaterial({
      map: this.screenUI.texture
    });
    const screenMesh = new THREE.Mesh(screenGeo, screenMat);
    screenMesh.position.set(0, 3.8, -9.67);
    group.add(screenMesh);

    // Glowing border frame light
    const borderMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
    const topBar = new THREE.Mesh(new THREE.BoxGeometry(width, 0.04, 0.04), borderMat);
    topBar.position.set(0, 3.8 + height / 2, -9.66);
    group.add(topBar);

    scene.add(group);
    return group;
  }

  update(dt) {
    this.screenUI.update();
  }
}

