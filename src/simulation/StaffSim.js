/**
 * StaffSim - Staff Roster, Hiring, Station Assignments, Fatigue & Shift Roles
 */
export class StaffSim {
  constructor(game) {
    this.game = game;

    this.staffMembers = [
      {
        id: 'staff_1',
        name: 'Dr. Evelyn Vance',
        role: 'Reactor Engineer',
        skill: 88,
        reliability: 94,
        fatigue: 15,
        salary: 1200,
        station: 'reactor',
        state: 'working',
        color: '#3b82f6'
      },
      {
        id: 'staff_2',
        name: 'Marcus Hayes',
        role: 'Electrical Engineer',
        skill: 82,
        reliability: 89,
        fatigue: 20,
        salary: 950,
        station: 'electrical',
        state: 'working',
        color: '#f59e0b'
      },
      {
        id: 'staff_3',
        name: 'Sarah Connor',
        role: 'Shift Manager',
        skill: 95,
        reliability: 98,
        fatigue: 10,
        salary: 1400,
        station: 'shift',
        state: 'working',
        color: '#10b981'
      },
      {
        id: 'staff_4',
        name: 'Dmitri Rostov',
        role: 'Maintenance Worker',
        skill: 79,
        reliability: 85,
        fatigue: 25,
        salary: 800,
        station: 'maintenance',
        state: 'working',
        color: '#ec4899'
      },
      {
        id: 'staff_5',
        name: 'Elena Rostova',
        role: 'Safety Officer',
        skill: 91,
        reliability: 96,
        fatigue: 18,
        salary: 1100,
        station: 'safety',
        state: 'working',
        color: '#06b6d4'
      },
      {
        id: 'staff_6',
        name: 'Koji Tanaka',
        role: 'Waste Management Worker',
        skill: 76,
        reliability: 90,
        fatigue: 12,
        salary: 750,
        station: 'waste',
        state: 'working',
        color: '#84cc16'
      }
    ];

    this.candidates = [
      {
        id: 'cand_1',
        name: 'Hannah Abbott',
        role: 'Control Room Operator',
        skill: 74,
        reliability: 85,
        fatigue: 0,
        salary: 720,
        station: 'unassigned',
        state: 'resting',
        color: '#a855f7'
      },
      {
        id: 'cand_2',
        name: 'Liam Chen',
        role: 'Mechanical Engineer',
        skill: 85,
        reliability: 91,
        fatigue: 0,
        salary: 1050,
        station: 'unassigned',
        state: 'resting',
        color: '#f97316'
      }
    ];
  }

  getStaffAtStation(stationId) {
    return this.staffMembers.find(s => s.station === stationId && s.state === 'working');
  }

  assignStaff(staffId, stationId) {
    const member = this.staffMembers.find(s => s.id === staffId);
    if (!member) return;

    // Free up other member on that station
    const currentOccupant = this.staffMembers.find(s => s.station === stationId && s.id !== staffId);
    if (currentOccupant) {
      currentOccupant.station = 'unassigned';
      currentOccupant.state = 'resting';
    }

    member.station = stationId;
    member.state = 'working';
    this.game.sound.playClick();
    this.game.syncStaffMeshes();
  }

  sendToBreak(staffId) {
    const member = this.staffMembers.find(s => s.id === staffId);
    if (member) {
      member.station = 'break_room';
      member.state = 'resting';
      this.game.sound.playClick();
      this.game.syncStaffMeshes();
    }
  }

  hireCandidate(candidateId) {
    const idx = this.candidates.findIndex(c => c.id === candidateId);
    if (idx !== -1 && this.game.finances.balance >= 500) {
      const candidate = this.candidates.splice(idx, 1)[0];
      candidate.station = 'unassigned';
      candidate.state = 'resting';
      this.game.finances.balance -= 500; // Hiring fee
      this.staffMembers.push(candidate);
      this.game.sound.playSuccess();
      this.game.syncStaffMeshes();
    }
  }

  tick(dt) {
    for (const member of this.staffMembers) {
      if (member.state === 'working') {
        // Accumulate fatigue slowly
        member.fatigue = Math.min(100, member.fatigue + dt * 0.18);
        if (member.fatigue >= 90) {
          // Warning: highly fatigued staff reduces station efficiency
          if (Math.random() < 0.002) {
            this.game.eventSim.addLog(`Warning: ${member.name} (${member.role}) is exhausted!`);
          }
        }
      } else {
        // Resting recovers fatigue
        member.fatigue = Math.max(0, member.fatigue - dt * 0.8);
      }
    }
  }
}

