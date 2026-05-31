const elements = [
  { id: 1, name: '氢', symbol: 'H', protons: 1, neutrons: 0, electrons: 1, atomic_number: 1, mass_number: 1 },
  { id: 2, name: '氦', symbol: 'He', protons: 2, neutrons: 2, electrons: 2, atomic_number: 2, mass_number: 4 },
  { id: 3, name: '锂', symbol: 'Li', protons: 3, neutrons: 4, electrons: 3, atomic_number: 3, mass_number: 7 },
  { id: 4, name: '铍', symbol: 'Be', protons: 4, neutrons: 5, electrons: 4, atomic_number: 4, mass_number: 9 },
  { id: 5, name: '硼', symbol: 'B', protons: 5, neutrons: 6, electrons: 5, atomic_number: 5, mass_number: 11 },
  { id: 6, name: '碳', symbol: 'C', protons: 6, neutrons: 6, electrons: 6, atomic_number: 6, mass_number: 12 },
  { id: 7, name: '氮', symbol: 'N', protons: 7, neutrons: 7, electrons: 7, atomic_number: 7, mass_number: 14 },
  { id: 8, name: '氧', symbol: 'O', protons: 8, neutrons: 8, electrons: 8, atomic_number: 8, mass_number: 16 },
  { id: 9, name: '氟', symbol: 'F', protons: 9, neutrons: 10, electrons: 9, atomic_number: 9, mass_number: 19 },
  { id: 10, name: '氖', symbol: 'Ne', protons: 10, neutrons: 10, electrons: 10, atomic_number: 10, mass_number: 20 },
  { id: 11, name: '钠', symbol: 'Na', protons: 11, neutrons: 12, electrons: 11, atomic_number: 11, mass_number: 23 },
  { id: 12, name: '镁', symbol: 'Mg', protons: 12, neutrons: 12, electrons: 12, atomic_number: 12, mass_number: 24 },
  { id: 13, name: '铝', symbol: 'Al', protons: 13, neutrons: 14, electrons: 13, atomic_number: 13, mass_number: 27 },
  { id: 14, name: '硅', symbol: 'Si', protons: 14, neutrons: 14, electrons: 14, atomic_number: 14, mass_number: 28 },
  { id: 15, name: '磷', symbol: 'P', protons: 15, neutrons: 16, electrons: 15, atomic_number: 15, mass_number: 31 },
  { id: 16, name: '硫', symbol: 'S', protons: 16, neutrons: 16, electrons: 16, atomic_number: 16, mass_number: 32 },
  { id: 17, name: '氯', symbol: 'Cl', protons: 17, neutrons: 18, electrons: 17, atomic_number: 17, mass_number: 35 },
  { id: 18, name: '氩', symbol: 'Ar', protons: 18, neutrons: 22, electrons: 18, atomic_number: 18, mass_number: 40 },
  { id: 19, name: '钾', symbol: 'K', protons: 19, neutrons: 20, electrons: 19, atomic_number: 19, mass_number: 39 },
  { id: 20, name: '钙', symbol: 'Ca', protons: 20, neutrons: 20, electrons: 20, atomic_number: 20, mass_number: 40 }
];

let scores = [];
let scoreIdCounter = 1;

const db = {
  getElements: (level = 1) => {
    const maxId = level * 5 + 5;
    const limit = Math.min(level + 4, 10);
    const filtered = elements.filter(el => el.id <= maxId);
    return filtered
      .sort(() => Math.random() - 0.5)
      .slice(0, limit);
  },

  getElementById: (id) => {
    return elements.find(el => el.id === parseInt(id));
  },

  addScore: (player_name, score, level) => {
    const newScore = {
      id: scoreIdCounter++,
      player_name,
      score,
      level,
      created_at: new Date().toISOString()
    };
    scores.push(newScore);
    return newScore;
  },

  getScores: (limit = 10) => {
    return [...scores]
      .sort((a, b) => b.score - a.score || new Date(a.created_at) - new Date(b.created_at))
      .slice(0, limit);
  },

  checkSynthesis: (element_id, protons, neutrons, electrons) => {
    const element = elements.find(el => el.id === parseInt(element_id));
    
    if (!element) {
      return null;
    }

    const errors = [];

    if (protons !== element.protons) {
      errors.push({
        type: 'protons',
        message: `质子数不符：需要 ${element.protons} 个，当前 ${protons} 个`
      });
    }

    if (neutrons !== element.neutrons) {
      errors.push({
        type: 'neutrons',
        message: `中子数不符：需要 ${element.neutrons} 个，当前 ${neutrons} 个`
      });
    }

    if (electrons !== element.electrons) {
      errors.push({
        type: 'electrons',
        message: `电子数不符：需要 ${element.electrons} 个，当前 ${electrons} 个`
      });
    }

    return {
      correct: errors.length === 0,
      element,
      errors,
      current: { protons, neutrons, electrons },
      required: {
        protons: element.protons,
        neutrons: element.neutrons,
        electrons: element.electrons
      }
    };
  }
};

module.exports = db;
