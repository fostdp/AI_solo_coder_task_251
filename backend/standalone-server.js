const http = require('http');

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
let lastElementId = null;

const molecules = [
  { 
    id: 1, 
    name: '水', 
    formula: 'H₂O', 
    description: '水分子，生命之源',
    atoms: [{ element: 'H', count: 2 }, { element: 'O', count: 1 }],
    bonds: [{ from: 'O', to: 'H', type: 'single', count: 2 }],
    difficulty: 1
  },
  { 
    id: 2, 
    name: '二氧化碳', 
    formula: 'CO₂', 
    description: '二氧化碳，温室气体',
    atoms: [{ element: 'C', count: 1 }, { element: 'O', count: 2 }],
    bonds: [{ from: 'C', to: 'O', type: 'double', count: 2 }],
    difficulty: 2
  },
  { 
    id: 3, 
    name: '甲烷', 
    formula: 'CH₄', 
    description: '甲烷，最简单的有机化合物',
    atoms: [{ element: 'C', count: 1 }, { element: 'H', count: 4 }],
    bonds: [{ from: 'C', to: 'H', type: 'single', count: 4 }],
    difficulty: 1
  },
  { 
    id: 4, 
    name: '氨气', 
    formula: 'NH₃', 
    description: '氨气，有刺激性气味',
    atoms: [{ element: 'N', count: 1 }, { element: 'H', count: 3 }],
    bonds: [{ from: 'N', to: 'H', type: 'single', count: 3 }],
    difficulty: 1
  },
  { 
    id: 5, 
    name: '氧气', 
    formula: 'O₂', 
    description: '氧气，呼吸必需气体',
    atoms: [{ element: 'O', count: 2 }],
    bonds: [{ from: 'O', to: 'O', type: 'double', count: 1 }],
    difficulty: 1
  },
  { 
    id: 6, 
    name: '氮气', 
    formula: 'N₂', 
    description: '氮气，大气主要成分',
    atoms: [{ element: 'N', count: 2 }],
    bonds: [{ from: 'N', to: 'N', type: 'triple', count: 1 }],
    difficulty: 2
  },
  { 
    id: 7, 
    name: '氯化钠', 
    formula: 'NaCl', 
    description: '食盐，离子化合物',
    atoms: [{ element: 'Na', count: 1 }, { element: 'Cl', count: 1 }],
    bonds: [{ from: 'Na', to: 'Cl', type: 'ionic', count: 1 }],
    difficulty: 2
  },
  { 
    id: 8, 
    name: '氢气', 
    formula: 'H₂', 
    description: '氢气，最轻的气体',
    atoms: [{ element: 'H', count: 2 }],
    bonds: [{ from: 'H', to: 'H', type: 'single', count: 1 }],
    difficulty: 1
  },
  { 
    id: 9, 
    name: '氯化氢', 
    formula: 'HCl', 
    description: '氯化氢，水溶液为盐酸',
    atoms: [{ element: 'H', count: 1 }, { element: 'Cl', count: 1 }],
    bonds: [{ from: 'H', to: 'Cl', type: 'polar', count: 1 }],
    difficulty: 2
  },
  { 
    id: 10, 
    name: '硫化氢', 
    formula: 'H₂S', 
    description: '硫化氢，有臭鸡蛋气味',
    atoms: [{ element: 'H', count: 2 }, { element: 'S', count: 1 }],
    bonds: [{ from: 'S', to: 'H', type: 'single', count: 2 }],
    difficulty: 2
  },
  { 
    id: 11, 
    name: '二氧化硫', 
    formula: 'SO₂', 
    description: '二氧化硫，空气污染物',
    atoms: [{ element: 'S', count: 1 }, { element: 'O', count: 2 }],
    bonds: [{ from: 'S', to: 'O', type: 'double', count: 2 }],
    difficulty: 3
  },
  { 
    id: 12, 
    name: '氧化镁', 
    formula: 'MgO', 
    description: '氧化镁，白色固体',
    atoms: [{ element: 'Mg', count: 1 }, { element: 'O', count: 1 }],
    bonds: [{ from: 'Mg', to: 'O', type: 'ionic', count: 1 }],
    difficulty: 2
  }
];

const elementCategories = {
  'H': { category: 'nonmetal', period: 1, group: 1, color: '#FF6B6B' },
  'He': { category: 'noble', period: 1, group: 18, color: '#FFD93D' },
  'Li': { category: 'alkali', period: 2, group: 1, color: '#6BCB77' },
  'Be': { category: 'alkaline', period: 2, group: 2, color: '#4ECDC4' },
  'B': { category: 'metalloid', period: 2, group: 13, color: '#95E1D3' },
  'C': { category: 'nonmetal', period: 2, group: 14, color: '#F38181' },
  'N': { category: 'nonmetal', period: 2, group: 15, color: '#AA96DA' },
  'O': { category: 'nonmetal', period: 2, group: 16, color: '#FCBAD3' },
  'F': { category: 'halogen', period: 2, group: 17, color: '#A8D8EA' },
  'Ne': { category: 'noble', period: 2, group: 18, color: '#FFD93D' },
  'Na': { category: 'alkali', period: 3, group: 1, color: '#6BCB77' },
  'Mg': { category: 'alkaline', period: 3, group: 2, color: '#4ECDC4' },
  'Al': { category: 'metal', period: 3, group: 13, color: '#B8B8B8' },
  'Si': { category: 'metalloid', period: 3, group: 14, color: '#95E1D3' },
  'P': { category: 'nonmetal', period: 3, group: 15, color: '#AA96DA' },
  'S': { category: 'nonmetal', period: 3, group: 16, color: '#FCBAD3' },
  'Cl': { category: 'halogen', period: 3, group: 17, color: '#A8D8EA' },
  'Ar': { category: 'noble', period: 3, group: 18, color: '#FFD93D' },
  'K': { category: 'alkali', period: 4, group: 1, color: '#6BCB77' },
  'Ca': { category: 'alkaline', period: 4, group: 2, color: '#4ECDC4' }
};

const categoryNames = {
  'alkali': '碱金属',
  'alkaline': '碱土金属',
  'transition': '过渡金属',
  'metal': '金属',
  'metalloid': '类金属',
  'nonmetal': '非金属',
  'halogen': '卤素',
  'noble': '稀有气体'
};

const bondTypes = {
  'single': { name: '单键', electrons: 2, symbol: '-' },
  'double': { name: '双键', electrons: 4, symbol: '=' },
  'triple': { name: '三键', electrons: 6, symbol: '≡' },
  'ionic': { name: '离子键', electrons: 0, symbol: '↔' },
  'polar': { name: '极性键', electrons: 2, symbol: '→' }
};

let playerSessions = {};
let activeMatches = {};
let matchIdCounter = 1;

const db = {
  getElements: (level = 1, excludeId = null) => {
    const maxId = level * 5 + 5;
    const limit = Math.min(level + 4, 10);
    let filtered = elements.filter(el => el.id <= maxId);
    
    if (excludeId !== null && filtered.length > 1) {
      filtered = filtered.filter(el => el.id !== excludeId);
    }
    
    return filtered.sort(() => Math.random() - 0.5).slice(0, limit);
  },
  getElementById: (id) => elements.find(el => el.id === parseInt(id)),
  getElementBySymbol: (symbol) => elements.find(el => el.symbol === symbol),
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
  getScores: (limit = 10) => [...scores].sort((a, b) => b.score - a.score).slice(0, limit),
  checkSynthesis: (element_id, protons, neutrons, electrons) => {
    const element = elements.find(el => el.id === parseInt(element_id));
    if (!element) return null;
    
    const errors = [];
    const warnings = [];
    
    const protonCorrect = protons === element.protons;
    const neutronCorrect = neutrons === element.neutrons;
    const electronCorrect = electrons === element.electrons;
    
    if (!protonCorrect) {
      errors.push({ 
        type: 'protons', 
        message: '质子数不符：需要 ' + element.protons + ' 个，当前 ' + protons + ' 个' 
      });
    }
    
    if (!neutronCorrect) {
      if (protonCorrect) {
        warnings.push({
          type: 'isotope',
          message: '⚠️ 质子数正确，但中子数不同，这是' + element.name + '的同位素（质量数=' + (protons + neutrons) + '），目标是' + element.mass_number
        });
      }
      errors.push({ 
        type: 'neutrons', 
        message: '中子数不符：需要 ' + element.neutrons + ' 个，当前 ' + neutrons + ' 个' 
      });
    }
    
    if (!electronCorrect) {
      const charge = protons - electrons;
      if (charge !== 0) {
        warnings.push({
          type: 'charge',
          message: '⚠️ 电荷不平衡：原子应为电中性（质子数=电子数），当前电荷为' + (charge > 0 ? '+' : '') + charge
        });
      }
      errors.push({ 
        type: 'electrons', 
        message: '电子数不符：需要 ' + element.electrons + ' 个，当前 ' + electrons + ' 个' 
      });
    }
    
    return {
      correct: errors.length === 0,
      element,
      errors,
      warnings,
      current: { protons, neutrons, electrons },
      required: {
        protons: element.protons,
        neutrons: element.neutrons,
        electrons: element.electrons
      }
    };
  },
  
  getMolecules: (level = 1, excludeId = null) => {
    const maxDifficulty = Math.min(level + 1, 3);
    let filtered = molecules.filter(m => m.difficulty <= maxDifficulty);
    
    if (excludeId !== null && filtered.length > 1) {
      filtered = filtered.filter(m => m.id !== excludeId);
    }
    
    const limit = Math.min(level + 3, 8);
    return filtered.sort(() => Math.random() - 0.5).slice(0, limit);
  },
  getMoleculeById: (id) => molecules.find(m => m.id === parseInt(id)),
  
  checkMoleculeSynthesis: (molecule_id, placedAtoms, placedBonds) => {
    const molecule = molecules.find(m => m.id === parseInt(molecule_id));
    if (!molecule) return null;
    
    const errors = [];
    const warnings = [];
    
    const atomCountMap = {};
    placedAtoms.forEach(atom => {
      atomCountMap[atom.symbol] = (atomCountMap[atom.symbol] || 0) + 1;
    });
    
    molecule.atoms.forEach(required => {
      const actual = atomCountMap[required.element] || 0;
      if (actual < required.count) {
        errors.push({
          type: 'atoms',
          message: required.element + '原子数量不足：需要 ' + required.count + ' 个，当前 ' + actual + ' 个'
        });
      } else if (actual > required.count) {
        errors.push({
          type: 'atoms',
          message: required.element + '原子数量过多：需要 ' + required.count + ' 个，当前 ' + actual + ' 个'
        });
      }
    });
    
    const requiredTotal = molecule.atoms.reduce((sum, a) => sum + a.count, 0);
    if (placedAtoms.length > requiredTotal) {
      errors.push({
        type: 'atoms',
        message: '原子总数过多：需要 ' + requiredTotal + ' 个，当前 ' + placedAtoms.length + ' 个'
      });
    }
    
    const bondTypeCount = {};
    placedBonds.forEach(bond => {
      const key = bond.from + '-' + bond.to + '-' + bond.type;
      bondTypeCount[key] = (bondTypeCount[key] || 0) + 1;
    });
    
    molecule.bonds.forEach(required => {
      const key1 = required.from + '-' + required.to + '-' + required.type;
      const key2 = required.to + '-' + required.from + '-' + required.type;
      const actual = (bondTypeCount[key1] || 0) + (bondTypeCount[key2] || 0);
      
      if (actual < required.count) {
        const bondInfo = bondTypes[required.type];
        errors.push({
          type: 'bonds',
          message: required.from + '-' + required.to + ' ' + bondInfo.name + '数量不足：需要 ' + required.count + ' 个，当前 ' + actual + ' 个'
        });
      }
    });
    
    return {
      correct: errors.length === 0,
      molecule,
      errors,
      warnings,
      current: { atomCount: placedAtoms.length, bondCount: placedBonds.length },
      required: molecule
    };
  },
  
  getElementDetails: (symbol) => {
    const element = elements.find(el => el.symbol === symbol);
    if (!element) return null;
    
    const categoryInfo = elementCategories[symbol] || {};
    return {
      ...element,
      ...categoryInfo,
      category_name: categoryNames[categoryInfo.category] || '未知'
    };
  },
  
  getPeriodicTableData: () => {
    return elements.map(el => {
      const categoryInfo = elementCategories[el.symbol] || {};
      return {
        ...el,
        ...categoryInfo,
        category_name: categoryNames[categoryInfo.category] || '未知'
      };
    });
  },
  
  getCategories: () => {
    return Object.keys(categoryNames).map(key => ({
      id: key,
      name: categoryNames[key]
    }));
  },
  
  getBondTypes: () => {
    return Object.keys(bondTypes).map(key => ({
      id: key,
      ...bondTypes[key]
    }));
  },
  
  createMatch: (player_name) => {
    const matchId = matchIdCounter++;
    const match = {
      id: matchId,
      status: 'waiting',
      player1: { name: player_name, ready: false, score: 0, elements_completed: [] },
      player2: null,
      current_element: null,
      startTime: null,
      winner: null
    };
    activeMatches[matchId] = match;
    return match;
  },
  
  joinMatch: (match_id, player_name) => {
    const match = activeMatches[match_id];
    if (!match || match.status !== 'waiting') return null;
    
    match.player2 = { name: player_name, ready: false, score: 0, elements_completed: [] };
    match.status = 'ready';
    return match;
  },
  
  getAvailableMatches: () => {
    return Object.values(activeMatches).filter(m => m.status === 'waiting');
  },
  
  getMatch: (match_id) => activeMatches[match_id],
  
  startMatch: (match_id) => {
    const match = activeMatches[match_id];
    if (!match || match.status !== 'ready') return null;
    
    match.status = 'playing';
    match.startTime = Date.now();
    const elementsForMatch = db.getElements(1);
    if (elementsForMatch.length > 0) {
      match.current_element = elementsForMatch[Math.floor(Math.random() * elementsForMatch.length)];
    }
    return match;
  },
  
  playerCompleteElement: (match_id, player_num, score_bonus) => {
    const match = activeMatches[match_id];
    if (!match || match.status !== 'playing') return null;
    
    const player = player_num === 1 ? match.player1 : match.player2;
    player.score += score_bonus;
    player.elements_completed.push(match.current_element.id);
    
    const nextElements = db.getElements(1, match.current_element.id);
    if (nextElements.length > 0) {
      match.current_element = nextElements[Math.floor(Math.random() * nextElements.length)];
    }
    
    return match;
  },
  
  endMatch: (match_id, winner_num) => {
    const match = activeMatches[match_id];
    if (!match) return null;
    
    match.status = 'finished';
    match.winner = winner_num;
    match.endTime = Date.now();
    
    return match;
  },
  
  removeMatch: (match_id) => {
    delete activeMatches[match_id];
  }
};

const PORT = 3002;

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = new URL(req.url, 'http://localhost:' + PORT);
  let body = '';
  
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    const sendJSON = (status, data) => {
      res.writeHead(status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
    };

    try {
      if (req.method === 'GET' && url.pathname === '/api/elements') {
        const level = parseInt(url.searchParams.get('level')) || 1;
        const excludeId = url.searchParams.get('exclude_id') ? parseInt(url.searchParams.get('exclude_id')) : null;
        sendJSON(200, db.getElements(level, excludeId));
      } 
      else if (req.method === 'GET' && url.pathname.startsWith('/api/elements/')) {
        const id = url.pathname.split('/')[3];
        const element = db.getElementById(id);
        element ? sendJSON(200, element) : sendJSON(404, { error: 'Element not found' });
      } 
      else if (req.method === 'GET' && url.pathname === '/api/levels') {
        const levels = [];
        for (let i = 1; i <= 10; i++) {
          levels.push({ 
            level: i, 
            timeLimit: Math.max(60 - (i-1)*5, 20), 
            targetScore: i*100 
          });
        }
        sendJSON(200, levels);
      } 
      else if (req.method === 'POST' && url.pathname === '/api/scores') {
        const { player_name, score, level } = JSON.parse(body || '{}');
        if (!player_name || score === undefined || !level) {
          return sendJSON(400, { error: 'Missing required fields' });
        }
        sendJSON(201, db.addScore(player_name, score, level));
      } 
      else if (req.method === 'GET' && url.pathname === '/api/scores') {
        const limit = parseInt(url.searchParams.get('limit')) || 10;
        sendJSON(200, db.getScores(limit));
      } 
      else if (req.method === 'POST' && url.pathname === '/api/check-synthesis') {
        const { element_id, protons, neutrons, electrons } = JSON.parse(body || '{}');
        if (!element_id || protons === undefined || neutrons === undefined || electrons === undefined) {
          return sendJSON(400, { error: 'Missing required fields' });
        }
        const result = db.checkSynthesis(element_id, protons, neutrons, electrons);
        result === null ? sendJSON(404, { error: 'Element not found' }) : sendJSON(200, result);
      } 
      else if (req.method === 'GET' && url.pathname === '/api/molecules') {
        const level = parseInt(url.searchParams.get('level')) || 1;
        const excludeId = url.searchParams.get('exclude_id') ? parseInt(url.searchParams.get('exclude_id')) : null;
        sendJSON(200, db.getMolecules(level, excludeId));
      }
      else if (req.method === 'GET' && url.pathname.startsWith('/api/molecules/')) {
        const id = url.pathname.split('/')[3];
        const molecule = db.getMoleculeById(id);
        molecule ? sendJSON(200, molecule) : sendJSON(404, { error: 'Molecule not found' });
      }
      else if (req.method === 'POST' && url.pathname === '/api/check-molecule') {
        const { molecule_id, placed_atoms, placed_bonds } = JSON.parse(body || '{}');
        if (!molecule_id || !placed_atoms || !placed_bonds) {
          return sendJSON(400, { error: 'Missing required fields' });
        }
        const result = db.checkMoleculeSynthesis(molecule_id, placed_atoms, placed_bonds);
        result === null ? sendJSON(404, { error: 'Molecule not found' }) : sendJSON(200, result);
      }
      else if (req.method === 'GET' && url.pathname === '/api/bond-types') {
        sendJSON(200, db.getBondTypes());
      }
      else if (req.method === 'GET' && url.pathname === '/api/periodic-table') {
        sendJSON(200, db.getPeriodicTableData());
      }
      else if (req.method === 'GET' && url.pathname.startsWith('/api/element-details/')) {
        const symbol = url.pathname.split('/')[3];
        const details = db.getElementDetails(symbol);
        details ? sendJSON(200, details) : sendJSON(404, { error: 'Element not found' });
      }
      else if (req.method === 'GET' && url.pathname === '/api/categories') {
        sendJSON(200, db.getCategories());
      }
      else if (req.method === 'POST' && url.pathname === '/api/matches/create') {
        const { player_name } = JSON.parse(body || '{}');
        if (!player_name) {
          return sendJSON(400, { error: 'Missing player_name' });
        }
        const match = db.createMatch(player_name);
        sendJSON(201, match);
      }
      else if (req.method === 'GET' && url.pathname === '/api/matches/available') {
        sendJSON(200, db.getAvailableMatches());
      }
      else if (req.method === 'GET' && url.pathname.startsWith('/api/matches/')) {
        const id = url.pathname.split('/')[3];
        const match = db.getMatch(parseInt(id));
        match ? sendJSON(200, match) : sendJSON(404, { error: 'Match not found' });
      }
      else if (req.method === 'POST' && url.pathname.startsWith('/api/matches/') && url.pathname.endsWith('/join')) {
        const matchId = parseInt(url.pathname.split('/')[3]);
        const { player_name } = JSON.parse(body || '{}');
        if (!player_name) {
          return sendJSON(400, { error: 'Missing player_name' });
        }
        const match = db.joinMatch(matchId, player_name);
        match ? sendJSON(200, match) : sendJSON(404, { error: 'Match not found or not available' });
      }
      else if (req.method === 'POST' && url.pathname.startsWith('/api/matches/') && url.pathname.endsWith('/start')) {
        const matchId = parseInt(url.pathname.split('/')[3]);
        const match = db.startMatch(matchId);
        match ? sendJSON(200, match) : sendJSON(404, { error: 'Match not found or not ready' });
      }
      else if (req.method === 'POST' && url.pathname.startsWith('/api/matches/') && url.pathname.endsWith('/complete')) {
        const matchId = parseInt(url.pathname.split('/')[3]);
        const { player_num, score_bonus } = JSON.parse(body || '{}');
        if (!player_num || score_bonus === undefined) {
          return sendJSON(400, { error: 'Missing required fields' });
        }
        const match = db.playerCompleteElement(matchId, player_num, score_bonus);
        match ? sendJSON(200, match) : sendJSON(404, { error: 'Match not found or not playing' });
      }
      else if (req.method === 'POST' && url.pathname.startsWith('/api/matches/') && url.pathname.endsWith('/end')) {
        const matchId = parseInt(url.pathname.split('/')[3]);
        const { winner_num } = JSON.parse(body || '{}');
        const match = db.endMatch(matchId, winner_num);
        match ? sendJSON(200, match) : sendJSON(404, { error: 'Match not found' });
      }
      else {
        sendJSON(404, { error: 'Not found' });
      }
    } catch (error) {
      console.error('Error:', error);
      sendJSON(500, { error: 'Internal server error' });
    }
  });
});

server.listen(PORT, () => {
  console.log('Backend server running on http://localhost:' + PORT);
});
