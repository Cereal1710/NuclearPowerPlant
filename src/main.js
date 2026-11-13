import { GameManager } from './core/GameManager.js';

function init() {
  const world = document.getElementById('world');
  if (!world) {
    console.error('World container #world not found!');
    return;
  }

  // Launch Nuclear Plant Manager 100% 3D Simulation (Zero WebGL)
  const game = new GameManager();
  window.__NPP_GAME__ = game;
  console.log('⚡ Nuclearis Nuclear Power Plant (Neutron Energy Corp.) 3D Simulation Online.');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
