import * as THREE from 'three';

/**
 * TextureFactory - Procedural Canvas Textures matching the authentic aesthetic
 * of Nuclear Power Plant Simulator / Scram (Roblox aesthetic in user screenshots).
 */
export class TextureFactory {
  /**
   * Giant Overhead Display Board (Matching Image 3)
   */
  static createOverheadBoardTexture(game) {
    const canvas = document.createElement('canvas');
    canvas.width = 1600;
    canvas.height = 700;
    const ctx = canvas.getContext('2d');

    const updateTexture = (tex) => {
      const reactor = game.reactorSim;
      const grid = game.powerGridSim;
      const events = game.eventSim;

      // Dark slate background with industrial bevel border
      ctx.fillStyle = '#14161a';
      ctx.fillRect(0, 0, 1600, 700);

      ctx.strokeStyle = '#383b42';
      ctx.lineWidth = 8;
      ctx.strokeRect(4, 4, 1592, 692);

      // Top Title Bar
      ctx.fillStyle = '#0d0e12';
      ctx.fillRect(8, 8, 1584, 60);

      ctx.fillStyle = '#e2b342';
      ctx.font = 'bold 26px "Courier New", monospace';
      ctx.fillText('⚡ UNIT 01 PRIMARY CONTROL ROOM // NUCLEARIS NPP (NEUTRON ENERGY CORP.)', 32, 48);

      const timeStr = game.getFormattedTime();
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 20px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`SHIFT #${game.shiftNumber} [${timeStr}] | TIME LEFT: 420s`, 1560, 48);
      ctx.textAlign = 'left';

      // LEFT COLUMN: Coolant, Rod Insertion, Feedwater, Fuel, Reactor Overview
      const lx = 32;
      let ly = 95;

      // COOLANT BADGE
      ctx.fillStyle = '#1e3a5f';
      ctx.fillRect(lx, ly, 180, 48);
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.strokeRect(lx, ly, 180, 48);
      ctx.fillStyle = '#93c5fd';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('COOLANT', lx + 14, ly + 30);
      ctx.fillStyle = '#60a5fa';
      ctx.fillText('OPEN ➔', lx + 105, ly + 30);

      ly += 60;
      // ROD INSERTION
      const avgRod = Math.round(reactor.controlRods.reduce((a, b) => a + b, 0) / 4);
      ctx.fillStyle = '#5c1d1d';
      ctx.fillRect(lx, ly, 220, 56);
      ctx.strokeStyle = '#ef4444';
      ctx.strokeRect(lx, ly, 220, 56);
      ctx.fillStyle = '#fca5a5';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('ROD INSERTION ➔', lx + 12, ly + 26);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 22px monospace';
      ctx.fillText(`${avgRod}%`, lx + 12, ly + 49);

      ly += 68;
      // FEEDWATER BADGE
      ctx.fillStyle = '#4c1d95';
      ctx.fillRect(lx, ly, 220, 52);
      ctx.strokeStyle = '#8b5cf6';
      ctx.strokeRect(lx, ly, 220, 52);
      ctx.fillStyle = '#ddd6fe';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText('FEEDWATER ➔', lx + 12, ly + 25);
      ctx.fillStyle = '#a78bfa';
      ctx.font = 'bold 18px monospace';
      ctx.fillText('3/3 PUMPS ACTIVE', lx + 12, ly + 46);

      ly += 64;
      // FUEL STATUS
      ctx.fillStyle = '#7f1d1d';
      ctx.fillRect(lx, ly, 220, 52);
      ctx.strokeStyle = '#dc2626';
      ctx.strokeRect(lx, ly, 220, 52);
      ctx.fillStyle = '#fca5a5';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText('FUEL INTEGRITY ➔', lx + 12, ly + 25);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px monospace';
      ctx.fillText('98.4% NOMINAL', lx + 12, ly + 46);

      ly += 68;
      // REACTOR OVERVIEW BOX
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(lx, ly, 260, 110);
      ctx.strokeStyle = '#475569';
      ctx.strokeRect(lx, ly, 260, 110);

      ctx.fillStyle = '#e2e8f0';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText('REACTOR OVERVIEW', lx + 14, ly + 26);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '13px monospace';
      ctx.fillText(`PRES: ${(reactor.steamPressure * 10).toFixed(1)} kPa`, lx + 14, ly + 56);
      ctx.fillText(`TEMP: ${(reactor.coreTemp + 273.15).toFixed(1)} K (${reactor.coreTemp.toFixed(1)} °C)`, lx + 14, ly + 80);
      ctx.fillText(`REACTIVITY: ${reactor.reactivity.toFixed(1)} %`, lx + 14, ly + 102);

      // CENTER: CIRCULAR REACTOR CORE CHANNEL LATTICE (Just like Image 3!)
      const cx = 460;
      const cy = 380;
      const coreRadius = 170;

      // Dark circular core vessel outline
      ctx.fillStyle = '#0a0d14';
      ctx.beginPath();
      ctx.arc(cx, cy, coreRadius + 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Core grid channels (circular lattice)
      const cellSize = 16;
      for (let rx = -9; rx <= 9; rx++) {
        for (let ry = -9; ry <= 9; ry++) {
          const dist = Math.sqrt(rx * rx + ry * ry);
          if (dist <= 8.5) {
            const px = cx + rx * cellSize;
            const py = cy + ry * cellSize;

            // Fuel channel colors
            let col = '#22c55e'; // Green nominal
            if ((rx + ry) % 5 === 0) col = '#38bdf8'; // Blue coolant
            if (reactor.coreTemp > 350 && dist < 4) col = '#f59e0b'; // Amber hot
            if (reactor.isScrammed) col = '#ef4444'; // Red scrammed

            ctx.fillStyle = col;
            ctx.fillRect(px - 5, py - 5, 11, 11);

            ctx.strokeStyle = '#05070a';
            ctx.lineWidth = 1;
            ctx.strokeRect(px - 5, py - 5, 11, 11);
          }
        }
      }

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('CORE FUEL CHANNEL LATTICE', cx, cy + coreRadius + 38);
      ctx.textAlign = 'left';

      // RIGHT COLUMN: Facility Grid Overview, Power Orders, Shift Management
      const rxCol = 700;
      let ryCol = 95;

      // FACILITY GRID OVERVIEW
      ctx.fillStyle = '#181b22';
      ctx.fillRect(rxCol, ryCol, 860, 110);
      ctx.strokeStyle = '#334155';
      ctx.strokeRect(rxCol, ryCol, 860, 110);

      ctx.fillStyle = '#e2b342';
      ctx.font = 'bold 16px monospace';
      ctx.fillText('⚡ FACILITY GRID OVERVIEW', rxCol + 20, ryCol + 28);

      // Power flow path diagram
      const boxes = [
        { label: 'GRID DATA', val: 'SYNC 60Hz', col: '#10b981' },
        { label: 'EXTERNAL', val: '400 kV LINE', col: '#3b82f6' },
        { label: 'PRIMARY GEN', val: `${Math.round(reactor.electricOutput)} MWe`, col: '#22c55e' },
        { label: 'AUX BUS', val: '12.8 kV OK', col: '#8b5cf6' }
      ];

      for (let b = 0; b < boxes.length; b++) {
        const bx = rxCol + 20 + b * 205;
        const by = ryCol + 42;
        ctx.fillStyle = '#0f1218';
        ctx.fillRect(bx, by, 185, 52);
        ctx.strokeStyle = boxes[b].col;
        ctx.strokeRect(bx, by, 185, 52);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '11px sans-serif';
        ctx.fillText(boxes[b].label, bx + 10, by + 20);

        ctx.fillStyle = boxes[b].col;
        ctx.font = 'bold 16px monospace';
        ctx.fillText(boxes[b].val, bx + 10, by + 42);

        if (b < boxes.length - 1) {
          ctx.fillStyle = '#64748b';
          ctx.font = 'bold 18px sans-serif';
          ctx.fillText('➔', bx + 192, by + 34);
        }
      }

      ryCol += 130;
      // POWER ORDERS (IN PROGRESS)
      ctx.fillStyle = '#181b22';
      ctx.fillRect(rxCol, ryCol, 860, 150);
      ctx.strokeStyle = '#334155';
      ctx.strokeRect(rxCol, ryCol, 860, 150);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('POWER ORDERS // IN PROGRESS', rxCol + 20, ryCol + 32);

      // Target vs Current MW progress meter
      ctx.fillStyle = '#090c12';
      ctx.fillRect(rxCol + 20, ryCol + 50, 820, 36);

      const supplyRatio = Math.min(1.0, grid.totalSupplied / Math.max(grid.totalDemand, 1));
      ctx.fillStyle = supplyRatio > 0.9 ? '#10b981' : '#f59e0b';
      ctx.fillRect(rxCol + 20, ryCol + 50, 820 * supplyRatio, 36);
      ctx.strokeStyle = '#475569';
      ctx.strokeRect(rxCol + 20, ryCol + 50, 820, 36);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px monospace';
      ctx.fillText(`SUPPLY: ${grid.totalSupplied} MW / TARGET DEMAND: ${grid.totalDemand} MW (${(supplyRatio * 100).toFixed(1)}%)`, rxCol + 36, ryCol + 74);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '14px monospace';
      ctx.fillText(`CURRENT POWER FLOW: +$${grid.currentRevenueRate}/min  |  GRID STABILITY: ${grid.gridStability.toFixed(1)}%  |  PENALTIES: -$${grid.currentPenaltyRate}/min`, rxCol + 20, ryCol + 120);

      ryCol += 170;
      // SHIFT AUDIT & TELEMETRY TICKER
      ctx.fillStyle = '#0a0d14';
      ctx.fillRect(rxCol, ryCol, 860, 150);
      ctx.strokeStyle = '#334155';
      ctx.strokeRect(rxCol, ryCol, 860, 150);

      ctx.fillStyle = '#e2b342';
      ctx.font = 'bold 16px monospace';
      ctx.fillText('SHIFT AUDIT & COMPLIANCE TELEMETRY', rxCol + 20, ryCol + 30);

      ctx.fillStyle = '#cbd5e1';
      ctx.font = '13px monospace';
      ctx.fillText(`STATUS: ${reactor.statusText}`, rxCol + 20, ryCol + 62);
      ctx.fillText(`SAFETY INDEX: ${Math.round(game.safetySim.safetyIndex)}%  |  RAD: ${game.safetySim.sensors[0].level.toFixed(3)} μSv/h`, rxCol + 20, ryCol + 90);

      const latestLog = events.logs[0] ? events.logs[0].text : 'ALL PRIMARY CIRCUITS NOMINAL';
      ctx.fillStyle = latestLog.includes('EMERGENCY') ? '#ef4444' : '#38bdf8';
      ctx.font = 'bold 13px monospace';
      ctx.fillText(`[LOG] ${latestLog.toUpperCase()}`, rxCol + 20, ryCol + 122);

      // EMERGENCY OVERLAY IF ACTIVE
      if (events.emergencyActive) {
        ctx.fillStyle = 'rgba(220, 38, 38, 0.45)';
        ctx.fillRect(8, 8, 1584, 684);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 38px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`🚨 CRITICAL EMERGENCY: ${events.emergencyTitle} 🚨`, 800, 340);
        ctx.font = 'bold 28px monospace';
        ctx.fillText(`HIT SCRAM BUTTON ON REACTOR DESK! [${Math.max(0, events.scramChallengeTimer).toFixed(1)}s]`, 800, 390);
        ctx.textAlign = 'left';
      }

      tex.needsUpdate = true;
    };

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    updateTexture(texture);

    return { texture, update: () => updateTexture(texture) };
  }

  /**
   * Analogue Dial Meter Texture (Circular needle dial matching Image 2)
   */
  static createDialTexture(label, minVal, maxVal, unit) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    const update = (currentVal, tex) => {
      // White beveled gauge face
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(128, 128, 120, 0, Math.PI * 2);
      ctx.fill();

      // Outer dark bezel
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 10;
      ctx.stroke();

      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(128, 128, 110, 0, Math.PI * 2);
      ctx.stroke();

      // Dial ticks (240 deg arc from 150 deg to 390 deg)
      const startAngle = Math.PI * 0.8;
      const endAngle = Math.PI * 2.2;
      const totalArc = endAngle - startAngle;

      for (let i = 0; i <= 10; i++) {
        const angle = startAngle + (i / 10) * totalArc;
        const x1 = 128 + Math.cos(angle) * 105;
        const y1 = 128 + Math.sin(angle) * 105;
        const x2 = 128 + Math.cos(angle) * (i % 2 === 0 ? 88 : 95);
        const y2 = 128 + Math.sin(angle) * (i % 2 === 0 ? 88 : 95);

        ctx.strokeStyle = i >= 8 ? '#ef4444' : '#1e293b';
        ctx.lineWidth = i % 2 === 0 ? 3 : 2;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        if (i % 2 === 0) {
          const valLabel = Math.round(minVal + (i / 10) * (maxVal - minVal));
          const tx = 128 + Math.cos(angle) * 74;
          const ty = 128 + Math.sin(angle) * 74;
          ctx.fillStyle = '#334155';
          ctx.font = 'bold 13px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(valLabel.toString(), tx, ty);
        }
      }

      // Title & Unit in center
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 15px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, 128, 160);

      ctx.fillStyle = '#64748b';
      ctx.font = '12px sans-serif';
      ctx.fillText(unit, 128, 180);

      // Rotating Needle
      const norm = Math.max(0, Math.min(1, (currentVal - minVal) / (maxVal - minVal)));
      const needleAngle = startAngle + norm * totalArc;

      ctx.save();
      ctx.translate(128, 128);
      ctx.rotate(needleAngle);

      // Needle shadow
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.beginPath();
      ctx.moveTo(-4, 0);
      ctx.lineTo(0, -92);
      ctx.lineTo(4, 0);
      ctx.closePath();
      ctx.fill();

      // Sharp Red needle
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(-3, 0);
      ctx.lineTo(0, -95);
      ctx.lineTo(3, 0);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Center pivot cap
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(128, 128, 10, 0, Math.PI * 2);
      ctx.fill();

      tex.needsUpdate = true;
    };

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    update(minVal, texture);

    return { texture, update: (val) => update(val, texture) };
  }

  /**
   * Vertical Slider Bar Gauge (Matching Image 2)
   */
  static createVerticalGaugeTexture(label, minVal, maxVal) {
    const canvas = document.createElement('canvas');
    canvas.width = 96;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');

    const update = (val, tex) => {
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, 96, 256);
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 6;
      ctx.strokeRect(3, 3, 90, 250);

      // Vertical slot
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(36, 24, 24, 208);

      // Level fill
      const norm = Math.max(0, Math.min(1, (val - minVal) / (maxVal - minVal)));
      const h = 208 * norm;
      ctx.fillStyle = norm > 0.85 ? '#ef4444' : '#38bdf8';
      ctx.fillRect(38, 232 - h, 20, h);

      // Red slider knob
      const knobY = 232 - h;
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(16, knobY - 5, 64, 10);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.strokeRect(16, knobY - 5, 64, 10);

      // Label at bottom
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(label, 48, 248);

      tex.needsUpdate = true;
    };

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    update(minVal, texture);
    return { texture, update: (val) => update(val, texture) };
  }

  /**
   * Nameplate Texture (White industrial console plate matching Image 2)
   */
  static createNameplateTexture(text) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(0, 0, 256, 64);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 3;
    ctx.strokeRect(2, 2, 252, 60);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 20px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 128, 32);

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    return texture;
  }

  /**
   * CRT / LCD Retro Monitor Screen (Matching Image 2)
   */
  static createCrtScreenTexture(stationTitle, defaultMetrics = []) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 360;
    const ctx = canvas.getContext('2d');

    const update = (metrics, tex) => {
      // CRT Black curved screen
      ctx.fillStyle = '#04070d';
      ctx.fillRect(0, 0, 512, 360);

      // Scanline effect
      ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
      for (let y = 0; y < 360; y += 4) {
        ctx.fillRect(0, y, 512, 2);
      }

      // Green CRT Title
      ctx.fillStyle = '#22c55e';
      ctx.font = 'bold 22px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(stationTitle, 256, 42);

      ctx.strokeStyle = '#15803d';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(32, 54);
      ctx.lineTo(480, 54);
      ctx.stroke();

      // Render Telemetry metrics
      let my = 95;
      for (const m of metrics) {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '16px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(m.label, 256, my);

        ctx.fillStyle = m.color || '#4ade80';
        ctx.font = 'bold 36px monospace';
        ctx.fillText(m.value, 256, my + 44);

        my += 85;
      }

      tex.needsUpdate = true;
    };

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    update(defaultMetrics, texture);
    return { texture, update: (m) => update(m, texture) };
  }

  /**
   * Station Floor Mat Texture (Matching Image 1)
   */
  static createStationMatTexture(name, subtitle = '') {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 380;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#2a2e38';
    ctx.fillRect(0, 0, 512, 380);

    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 6;
    ctx.strokeRect(8, 8, 496, 364);

    // Hazard border lines
    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 32px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(name, 256, 180);

    if (subtitle) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(subtitle, 256, 220);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    return texture;
  }
}

