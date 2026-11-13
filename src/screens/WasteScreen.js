import { BaseScreen } from './BaseScreen.js';

export class WasteScreen extends BaseScreen {
  constructor(game) {
    super(game, 1024, 640);
    this.setupButtons();
  }

  setupButtons() {
    this.clearElements();

    const waste = this.game.wasteSim;

    this.registerButton('toggle_cooling', 430, 225, 170, 32, () => {
      waste.togglePoolCooling();
    }, waste.poolCoolingActive ? 'ACTIVE (PUMP ON)' : 'OFFLINE (PUMP OFF)');

    this.registerButton('transfer_cask', 650, 480, 330, 44, () => {
      waste.startTransferToDryCask();
    }, waste.transferInProgress ? 'TRANSFER IN PROGRESS...' : 'SEAL TO DRY CASK (4 ASSY / $500)');

    this.registerButton('dispatch_convoy', 650, 540, 330, 42, () => {
      waste.dispatchOffsiteConvoy();
    }, waste.transportConvoyScheduled ? 'CONVOY EN ROUTE...' : 'DISPATCH OFFSITE CONVOY (2 CASKS / $1,200)');
  }

  render() {
    const ctx = this.ctx;
    const waste = this.game.wasteSim;

    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, this.width, this.height);

    this.drawHeader('SPENT FUEL & BYPRODUCT MANAGEMENT', 'CONTAINMENT STORAGE & LOGISTICS', 'STATION 06 // WASTE');

    // Left Panel: Spent Fuel Pool
    ctx.fillStyle = '#111827';
    ctx.roundRect(24, 82, 590, 534, 8);
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('ACTIVE SPENT FUEL COOLING POOL (BORATED WATER)', 44, 112);

    // Pool metrics box
    ctx.fillStyle = '#0f172a';
    ctx.roundRect(38, 130, 562, 140, 6);
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.stroke();

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('Pool Inventory Load:', 56, 160);
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(`${waste.poolAssemblies} / ${waste.poolCapacity} Assemblies`, 260, 160);

    this.drawProgressBar(56, 175, 526, 20, waste.poolAssemblies, waste.poolCapacity, '#0284c7', `${Math.round((waste.poolAssemblies / waste.poolCapacity) * 100)}% CAPACITY`);

    // Temperature & cooling
    const tempColor = waste.poolTemp > 45 ? '#ef4444' : waste.poolTemp > 35 ? '#f59e0b' : '#10b981';
    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px sans-serif';
    ctx.fillText('Water Temperature:', 56, 235);
    ctx.fillStyle = tempColor;
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(`${waste.poolTemp.toFixed(1)} °C`, 200, 235);

    // Cask Encapsulation Crane status
    ctx.fillStyle = '#0f172a';
    ctx.roundRect(38, 290, 562, 140, 6);
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.stroke();

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('Submerged Transfer Gantry Crane', 56, 320);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px sans-serif';
    ctx.fillText('Status: ' + (waste.transferInProgress ? `Transferring 4 assemblies (${Math.round(waste.transferProgress)}%)` : 'Gantry parked / ready'), 56, 348);

    if (waste.transferInProgress) {
      this.drawProgressBar(56, 365, 526, 20, waste.transferProgress, 100, '#38bdf8', 'ENCAPSULATION IN PROGRESS');
    }

    // Dry Cask Yard overview in Left panel
    ctx.fillStyle = '#0f172a';
    ctx.roundRect(38, 450, 562, 145, 6);
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.stroke();

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('Dry Cask Shielded Storage Yard', 56, 480);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px sans-serif';
    ctx.fillText(`Casks Stored: ${waste.dryCasksFilled} / ${waste.dryCasksMax} Reinforced Concrete Casks`, 56, 508);

    this.drawProgressBar(56, 522, 526, 20, waste.dryCasksFilled, waste.dryCasksMax, '#8b5cf6', `${waste.dryCasksFilled} OF ${waste.dryCasksMax} SLOTS FILLED`);

    // Right Panel: Transport Logistics & Regulatory
    ctx.fillStyle = '#111827';
    ctx.roundRect(630, 82, 370, 534, 8);
    ctx.fill();
    ctx.strokeStyle = '#1e293b';
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText('DISPOSAL CONVOY LOGISTICS', 650, 112);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px sans-serif';
    ctx.fillText('Neutron Energy Corp. Heavy Transit Division', 650, 134);

    // Convoy info
    ctx.fillStyle = '#0f172a';
    ctx.roundRect(650, 160, 330, 150, 6);
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.stroke();

    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('OFFSITE REPOSITORY STATUS', 666, 186);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px sans-serif';
    ctx.fillText('Destination: Sector 9 Deep Geological Vault', 666, 214);
    ctx.fillText('Convoy Security: Class-5 Armored Escort', 666, 238);

    const convoyText = waste.transportConvoyScheduled ? `Transit En Route (${Math.round(waste.transportProgress)}%)` : 'Ready for dispatch (min. 2 casks)';
    ctx.fillStyle = waste.transportConvoyScheduled ? '#38bdf8' : '#10b981';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('Logistics: ' + convoyText, 666, 268);

    // Guidelines
    ctx.fillStyle = '#0f172a';
    ctx.roundRect(650, 330, 330, 135, 6);
    ctx.fill();
    ctx.strokeStyle = '#334155';
    ctx.stroke();

    ctx.fillStyle = '#cbd5e1';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('STORAGE COMPLIANCE RULES', 666, 355);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px sans-serif';
    ctx.fillText('• Pool overflow (>36 assy) stops reactor refueling.', 666, 380);
    ctx.fillText('• Pack 4 cooled assemblies into 1 Dry Cask.', 666, 404);
    ctx.fillText('• Ship 2 casks offsite to free up yard space.', 666, 428);

    for (const btn of this.interactiveElements) {
      const isPrimary = btn.id === 'transfer_cask' || btn.id === 'dispatch_convoy';
      this.drawButton(btn, isPrimary);
    }
  }
}

