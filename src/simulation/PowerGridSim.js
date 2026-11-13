/**
 * PowerGridSim - Manages City Sectors, Grid Demand, Power Distribution & Energy Revenue
 */
export class PowerGridSim {
  constructor(game) {
    this.game = game;

    this.sectors = [
      {
        id: 'hospital',
        name: 'Metro Hospital & Emergency',
        demand: 120, // MW
        allocated: 120,
        enabled: true,
        priority: 1, // Critical
        color: '#ef4444'
      },
      {
        id: 'industrial',
        name: 'Heavy Industrial District',
        demand: 320,
        allocated: 320,
        enabled: true,
        priority: 2,
        color: '#f59e0b'
      },
      {
        id: 'residential',
        name: 'Civic Residential Zone',
        demand: 280,
        allocated: 280,
        enabled: true,
        priority: 3,
        color: '#3b82f6'
      },
      {
        id: 'transit',
        name: 'Electric Rail & Transit',
        demand: 160,
        allocated: 160,
        enabled: true,
        priority: 4,
        color: '#8b5cf6'
      }
    ];

    this.ratePerMWh = 65; // $ / MWh
    this.penaltyPerMWh = 120; // $ / MWh deficit
    this.totalDemand = 880;
    this.totalSupplied = 880;
    this.gridStability = 98.5; // %
    this.reputation = 92.0; // %
    this.currentRevenueRate = 0; // $/sec
    this.currentPenaltyRate = 0; // $/sec

    // Contracts
    this.contracts = [
      { id: 'municipal', name: 'Municipal Base Power', bonus: 1.0, active: true },
      { id: 'peak_surge', name: 'Peak-Hour Surge Guarantee', bonus: 1.35, penaltyRisk: 1.5, active: false },
      { id: 'green_tier', name: 'Zero-Emission Reliability Tier', bonus: 1.2, active: false }
    ];

    this.fluctuationTimer = 0;
  }

  toggleSector(index) {
    if (this.sectors[index]) {
      this.sectors[index].enabled = !this.sectors[index].enabled;
      this.rebalance();
    }
  }

  setSectorAllocation(index, ratio) {
    if (this.sectors[index]) {
      const max = this.sectors[index].demand * 1.25;
      this.sectors[index].allocated = Math.round(max * Math.max(0, Math.min(1, ratio)));
    }
  }

  toggleContract(id) {
    const c = this.contracts.find(item => item.id === id);
    if (c && c.id !== 'municipal') {
      c.active = !c.active;
      this.game.sound.playClick();
    }
  }

  rebalance() {
    const totalAvail = this.game.reactorSim.electricOutput;
    // Auto-balance according to priority
    let remaining = totalAvail;
    // Sort sectors by priority
    const sorted = [...this.sectors].sort((a, b) => a.priority - b.priority);

    for (const sec of sorted) {
      if (!sec.enabled) {
        sec.allocated = 0;
        continue;
      }
      const needed = sec.demand;
      if (remaining >= needed) {
        sec.allocated = needed;
        remaining -= needed;
      } else {
        sec.allocated = Math.max(0, remaining);
        remaining = 0;
      }
    }
  }

  tick(dt) {
    // Fluctuations in demand
    this.fluctuationTimer += dt;
    if (this.fluctuationTimer > 3.0) {
      this.fluctuationTimer = 0;
      for (const sec of this.sectors) {
        const delta = (Math.random() - 0.48) * 10;
        sec.demand = Math.round(Math.max(50, Math.min(450, sec.demand + delta)));
      }
    }

    const totalAvail = this.game.reactorSim.electricOutput;
    this.totalDemand = this.sectors.reduce((sum, s) => sum + (s.enabled ? s.demand : 0), 0);
    this.totalSupplied = this.sectors.reduce((sum, s) => sum + (s.enabled ? s.allocated : 0), 0);

    // Deficit calculation
    let totalDeficit = 0;
    for (const sec of this.sectors) {
      if (sec.enabled && sec.allocated < sec.demand) {
        const def = sec.demand - sec.allocated;
        totalDeficit += def;
        // Severe reputation hit if hospital unpowered
        if (sec.id === 'hospital') {
          this.reputation = Math.max(10, this.reputation - dt * 2.5);
        } else {
          this.reputation = Math.max(10, this.reputation - dt * 0.4);
        }
      }
    }

    // Grid Stability calculation
    if (this.totalDemand > 0) {
      const supplyRatio = Math.min(1.0, this.totalSupplied / this.totalDemand);
      this.gridStability = Math.max(20, Math.min(100, supplyRatio * 100));
    } else {
      this.gridStability = 100;
    }

    if (totalDeficit === 0 && this.reputation < 99) {
      this.reputation = Math.min(100, this.reputation + dt * 0.15);
    }

    // Revenue calculation
    let contractMultiplier = 1.0;
    for (const c of this.contracts) {
      if (c.active) contractMultiplier *= c.bonus;
    }

    // Convert MW to MWh/sec in game time
    const powerSoldMWh = (this.totalSupplied / 3600) * dt;
    const powerDeficitMWh = (totalDeficit / 3600) * dt;

    const earned = powerSoldMWh * this.ratePerMWh * contractMultiplier * 45; // Scaled for fast game shifts
    const fined = powerDeficitMWh * this.penaltyPerMWh * 45;

    this.currentRevenueRate = Math.round((this.totalSupplied * this.ratePerMWh * contractMultiplier) / 60);
    this.currentPenaltyRate = Math.round((totalDeficit * this.penaltyPerMWh) / 60);

    this.game.finances.totalEarned += earned;
    this.game.finances.penaltiesPaid += fined;
    this.game.finances.balance += (earned - fined);
  }
}

