const API_BASE_URL = 'http://localhost:3002/api';

const LOCAL_STORAGE_KEY = 'chemical_element_game_state';
const COLLECTION_KEY = 'chemical_element_collection';

class Game {
  constructor() {
    this.currentMode = null;
    this.currentLevel = 1;
    this.score = 0;
    this.timeLeft = 60;
    this.timer = null;
    this.isPlaying = false;
    this.currentElement = null;
    this.currentMolecule = null;
    this.lastElementId = null;
    this.lastMoleculeId = null;
    this.placedProtons = [];
    this.placedNeutrons = [];
    this.placedElectrons = [];
    this.particleIdCounter = 0;
    this.draggingParticle = null;
    this.touchStartPos = { x: 0, y: 0 };
    
    this.collection = this.loadCollection();
    
    this.currentMatch = null;
    this.matchedPlayer = null;
    
    this.placedMoleculeAtoms = [];
    this.placedMoleculeBonds = [];
    this.selectedBondAtom = null;
    this.moleculeAtomIdCounter = 0;
    
    this.init();
  }
  
  init() {
    this.resetGameState();
    this.bindEvents();
    this.setupDropZones();
    this.setupTouchEvents();
    this.createElectronShells();
  }
  
  loadCollection() {
    try {
      const saved = localStorage.getItem(COLLECTION_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  }
  
  saveCollection() {
    try {
      localStorage.setItem(COLLECTION_KEY, JSON.stringify(this.collection));
    } catch (e) {
      console.error('Failed to save collection:', e);
    }
  }
  
  addToCollection(elementId, elementSymbol) {
    if (!this.collection[elementSymbol]) {
      this.collection[elementSymbol] = {
        id: elementId,
        symbol: elementSymbol,
        collectedAt: Date.now()
      };
      this.saveCollection();
      return true;
    }
    return false;
  }
  
  resetGameState() {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    this.currentLevel = 1;
    this.score = 0;
    this.timeLeft = 60;
    this.isPlaying = false;
    this.currentElement = null;
    this.currentMolecule = null;
    this.lastElementId = null;
    this.lastMoleculeId = null;
    this.placedProtons = [];
    this.placedNeutrons = [];
    this.placedElectrons = [];
    this.particleIdCounter = 0;
    this.placedMoleculeAtoms = [];
    this.placedMoleculeBonds = [];
    this.selectedBondAtom = null;
    this.moleculeAtomIdCounter = 0;
  }
  
  bindEvents() {
    document.querySelectorAll('.mode-card').forEach(card => {
      const mode = card.dataset.mode;
      const btn = card.querySelector('button');
      btn.addEventListener('click', () => this.switchMode(mode));
      card.addEventListener('click', (e) => {
        if (e.target !== btn) {
          this.switchMode(mode);
        }
      });
    });
    
    document.getElementById('backToModeBtn').addEventListener('click', () => this.backToModeSelector());
    document.getElementById('backFromCollectionBtn').addEventListener('click', () => this.backToModeSelector());
    document.getElementById('backFromVersusBtn').addEventListener('click', () => this.backToModeSelector());
    
    document.getElementById('startBtn').addEventListener('click', () => this.startGame());
    document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
    document.getElementById('resetBtn').addEventListener('click', () => this.resetGame());
    document.getElementById('checkBtn').addEventListener('click', () => this.checkSynthesis());
    
    document.getElementById('playAgainBtn').addEventListener('click', () => {
      document.getElementById('gameOverModal').style.display = 'none';
      this.resetGame();
      this.startGame();
    });
    document.getElementById('closeLeaderboardBtn').addEventListener('click', () => {
      document.getElementById('leaderboardModal').style.display = 'none';
    });
    
    document.getElementById('closeDetailBtn').addEventListener('click', () => {
      document.getElementById('elementDetailModal').style.display = 'none';
    });
    document.getElementById('elementDetailModal').addEventListener('click', (e) => {
      if (e.target.id === 'elementDetailModal') {
        document.getElementById('elementDetailModal').style.display = 'none';
      }
    });
    
    document.getElementById('createMatchBtn').addEventListener('click', () => this.createMatch());
    document.getElementById('cancelMatchBtn').addEventListener('click', () => this.cancelMatch());
    document.getElementById('joinMatchBtn').addEventListener('click', () => this.joinMatch());
    
    document.getElementById('startVersusBtn').addEventListener('click', () => this.startVersusMatch());
    document.getElementById('endVersusBtn').addEventListener('click', () => this.endVersusMatch());
    document.getElementById('player1CompleteBtn').addEventListener('click', () => this.playerComplete(1));
    document.getElementById('player2CompleteBtn').addEventListener('click', () => this.playerComplete(2));
    
    document.getElementById('playAgainVersusBtn').addEventListener('click', () => this.playAgainVersus());
    document.getElementById('backToLobbyBtn').addEventListener('click', () => this.backToLobby());
    
    window.addEventListener('beforeunload', () => {
      this.saveGameState();
    });
    
    window.addEventListener('load', () => {
      this.loadGameState();
    });
  }
  
  switchMode(mode) {
    this.currentMode = mode;
    document.getElementById('modeSelector').style.display = 'none';
    document.getElementById('gameContainer').style.display = 'none';
    document.getElementById('collectionContainer').style.display = 'none';
    document.getElementById('versusContainer').style.display = 'none';
    
    if (mode === 'collection') {
      document.getElementById('collectionContainer').style.display = 'block';
      this.initPeriodicTable();
    } else if (mode === 'versus') {
      document.getElementById('versusContainer').style.display = 'block';
      this.showVersusLobby();
    } else {
      document.getElementById('gameContainer').style.display = 'block';
      this.setupForMode(mode);
    }
  }
  
  backToModeSelector() {
    this.resetGame();
    this.currentMode = null;
    document.getElementById('modeSelector').style.display = 'flex';
    document.getElementById('gameContainer').style.display = 'none';
    document.getElementById('collectionContainer').style.display = 'none';
    document.getElementById('versusContainer').style.display = 'none';
  }
  
  setupForMode(mode) {
    const elementReq = document.getElementById('elementRequirements');
    const moleculeReq = document.getElementById('moleculeRequirements');
    const particleTypes = document.getElementById('particleTypes');
    const atomTypes = document.getElementById('atomTypes');
    const atomModel = document.getElementById('atomModel');
    const moleculeWorkspace = document.getElementById('moleculeWorkspace');
    const moleculeControls = document.getElementById('moleculeControls');
    
    if (mode === 'molecule') {
      elementReq.style.display = 'none';
      moleculeReq.style.display = 'block';
      particleTypes.style.display = 'none';
      atomTypes.style.display = 'block';
      atomModel.style.display = 'none';
      moleculeWorkspace.style.display = 'block';
      moleculeControls.style.display = 'block';
    } else {
      elementReq.style.display = 'block';
      moleculeReq.style.display = 'none';
      particleTypes.style.display = 'block';
      atomTypes.style.display = 'none';
      atomModel.style.display = 'block';
      moleculeWorkspace.style.display = 'none';
      moleculeControls.style.display = 'none';
    }
    
    document.getElementById('targetSymbol').textContent = '?';
    document.getElementById('targetName').textContent = '请开始游戏';
  }
  
  saveGameState() {
    const state = {
      currentMode: this.currentMode,
      currentLevel: this.currentLevel,
      score: this.score,
      timeLeft: this.timeLeft,
      isPlaying: this.isPlaying,
      currentElement: this.currentElement,
      currentMolecule: this.currentMolecule,
      lastElementId: this.lastElementId,
      lastMoleculeId: this.lastMoleculeId,
      timestamp: Date.now()
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  }
  
  loadGameState() {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!saved) return;
    
    try {
      const state = JSON.parse(saved);
      const now = Date.now();
      const timeSinceSave = now - state.timestamp;
      
      if (timeSinceSave > 10000) {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        return;
      }
      
      if (state.isPlaying) {
        this.showMessage('检测到未完成的游戏已重置', 'info');
      }
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (e) {
      console.error('Failed to load game state:', e);
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }
  
  setupDropZones() {
    const nucleus = document.getElementById('nucleus');
    nucleus.addEventListener('dragover', (e) => {
      e.preventDefault();
      nucleus.classList.add('drag-over');
    });
    nucleus.addEventListener('dragleave', () => {
      nucleus.classList.remove('drag-over');
    });
    nucleus.addEventListener('drop', (e) => {
      e.preventDefault();
      nucleus.classList.remove('drag-over');
      this.handleNucleusDrop(e);
    });
  }
  
  setupTouchEvents() {
    document.addEventListener('touchmove', (e) => {
      if (this.draggingParticle) {
        e.preventDefault();
      }
    }, { passive: false });
  }
  
  createElectronShells() {
    const electronShells = document.getElementById('electronShells');
    const shellSizes = [90, 140, 180];
    const maxElectrons = [2, 8, 8];
    
    for (let i = 0; i < 3; i++) {
      const shell = document.createElement('div');
      shell.className = `shell shell-${i + 1}`;
      shell.dataset.shell = i;
      shell.dataset.maxElectrons = maxElectrons[i];
      
      shell.addEventListener('dragover', (e) => {
        e.preventDefault();
        shell.classList.add('drag-over');
      });
      shell.addEventListener('dragleave', () => {
        shell.classList.remove('drag-over');
      });
      shell.addEventListener('drop', (e) => {
        e.preventDefault();
        shell.classList.remove('drag-over');
        this.handleShellDrop(e, shell, shellSizes[i]);
      });
      
      electronShells.appendChild(shell);
    }
  }
  
  async startGame() {
    if (this.isPlaying) return;
    
    this.isPlaying = true;
    document.getElementById('startBtn').style.display = 'none';
    document.getElementById('pauseBtn').style.display = 'inline-block';
    
    await this.startLevel();
    this.startTimer();
  }
  
  togglePause() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      document.getElementById('pauseBtn').textContent = '继续';
      this.showMessage('游戏已暂停', 'info');
    } else {
      this.startTimer();
      document.getElementById('pauseBtn').textContent = '暂停';
      this.showMessage('游戏继续', 'info');
    }
  }
  
  startTimer() {
    if (this.timer) clearInterval(this.timer);
    
    this.timer = setInterval(() => {
      this.timeLeft--;
      document.getElementById('timeLeft').textContent = this.timeLeft;
      
      if (this.timeLeft <= 10) {
        document.getElementById('timeLeft').style.color = '#ff6b6b';
      }
      
      if (this.timeLeft <= 0) {
        this.endGame();
      }
    }, 1000);
  }
  
  async startLevel() {
    const timeLimit = Math.max(60 - (this.currentLevel - 1) * 5, 20);
    this.timeLeft = timeLimit;
    document.getElementById('timeLeft').textContent = this.timeLeft;
    document.getElementById('timeLeft').style.color = '#4ecdc4';
    document.getElementById('currentLevel').textContent = this.currentLevel;
    
    if (this.currentMode === 'molecule') {
      await this.getNextMolecule();
      this.clearMoleculeWorkspace();
      this.generateAtomRack();
    } else {
      await this.getNextElement();
      this.clearAtom();
      this.generateParticles();
    }
    document.getElementById('checkBtn').disabled = false;
  }
  
  async getNextElement() {
    try {
      let url = `${API_BASE_URL}/elements?level=${this.currentLevel}`;
      if (this.lastElementId !== null) {
        url += `&exclude_id=${this.lastElementId}`;
      }
      
      const response = await fetch(url);
      const elements = await response.json();
      
      if (elements.length > 0) {
        const newElement = elements[Math.floor(Math.random() * elements.length)];
        
        if (elements.length > 1 && this.lastElementId !== null) {
          const availableElements = elements.filter(el => el.id !== this.lastElementId);
          if (availableElements.length > 0) {
            this.currentElement = availableElements[Math.floor(Math.random() * availableElements.length)];
          } else {
            this.currentElement = newElement;
          }
        } else {
          this.currentElement = newElement;
        }
        
        this.lastElementId = this.currentElement.id;
        this.updateTargetDisplay();
      }
    } catch (error) {
      console.error('Failed to fetch element:', error);
      this.showMessage('无法连接服务器，请确保后端已启动', 'error');
    }
  }
  
  async getNextMolecule() {
    try {
      let url = `${API_BASE_URL}/molecules?level=${this.currentLevel}`;
      if (this.lastMoleculeId !== null) {
        url += `&exclude_id=${this.lastMoleculeId}`;
      }
      
      const response = await fetch(url);
      const molecules = await response.json();
      
      if (molecules.length > 0) {
        const newMolecule = molecules[Math.floor(Math.random() * molecules.length)];
        
        if (molecules.length > 1 && this.lastMoleculeId !== null) {
          const availableMolecules = molecules.filter(m => m.id !== this.lastMoleculeId);
          if (availableMolecules.length > 0) {
            this.currentMolecule = availableMolecules[Math.floor(Math.random() * availableMolecules.length)];
          } else {
            this.currentMolecule = newMolecule;
          }
        } else {
          this.currentMolecule = newMolecule;
        }
        
        this.lastMoleculeId = this.currentMolecule.id;
        this.updateMoleculeTargetDisplay();
      }
    } catch (error) {
      console.error('Failed to fetch molecule:', error);
      this.showMessage('无法连接服务器，请确保后端已启动', 'error');
    }
  }
  
  updateTargetDisplay() {
    if (!this.currentElement) return;
    
    document.getElementById('targetSymbol').textContent = this.currentElement.symbol;
    document.getElementById('targetName').textContent = this.currentElement.name;
    document.getElementById('requiredProtons').textContent = this.currentElement.protons;
    document.getElementById('requiredNeutrons').textContent = this.currentElement.neutrons;
    document.getElementById('requiredElectrons').textContent = this.currentElement.electrons;
    
    this.showMessage(`合成 ${this.currentElement.name} (${this.currentElement.symbol})`, 'info');
  }
  
  updateMoleculeTargetDisplay() {
    if (!this.currentMolecule) return;
    
    document.getElementById('targetSymbol').textContent = this.currentMolecule.formula;
    document.getElementById('targetName').textContent = this.currentMolecule.name;
    
    const atomsDiv = document.getElementById('moleculeAtoms');
    atomsDiv.innerHTML = '<strong>原子：</strong>' + 
      this.currentMolecule.atoms.map(a => `${a.element}×${a.count}`).join(', ');
    
    const bondsDiv = document.getElementById('moleculeBonds');
    const bondNames = { single: '单键', double: '双键', triple: '三键', ionic: '离子键', polar: '极性键' };
    bondsDiv.innerHTML = '<strong>化学键：</strong>' + 
      this.currentMolecule.bonds.map(b => `${b.from}-${b.to} ${bondNames[b.type]}×${b.count}`).join(', ');
    
    this.showMessage(`合成 ${this.currentMolecule.name} (${this.currentMolecule.formula})`, 'info');
  }
  
  generateParticles() {
    const maxParticles = 25;
    
    this.generateParticleType('proton', maxParticles);
    this.generateParticleType('neutron', maxParticles);
    this.generateParticleType('electron', maxParticles);
  }
  
  generateAtomRack() {
    const container = document.getElementById('atomRackContainer');
    container.innerHTML = '';
    
    if (!this.currentMolecule) return;
    
    const uniqueElements = [...new Set(this.currentMolecule.atoms.map(a => a.element))];
    
    uniqueElements.forEach(symbol => {
      const atomData = this.currentMolecule.atoms.find(a => a.element === symbol);
      const totalCount = atomData ? atomData.count * 2 : 2;
      
      const group = document.createElement('div');
      group.className = 'particle-group';
      group.innerHTML = `<div class="particle-label">${symbol}</div>`;
      
      const rack = document.createElement('div');
      rack.className = 'particle-rack';
      
      for (let i = 0; i < totalCount; i++) {
        const atomEl = this.createMoleculeAtom(symbol);
        rack.appendChild(atomEl);
      }
      
      group.appendChild(rack);
      container.appendChild(group);
    });
  }
  
  createMoleculeAtom(symbol) {
    const atom = document.createElement('div');
    atom.className = 'particle molecule-atom';
    atom.textContent = symbol;
    atom.dataset.symbol = symbol;
    atom.dataset.id = this.moleculeAtomIdCounter++;
    atom.draggable = true;
    
    atom.style.background = this.getElementColor(symbol);
    
    atom.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', JSON.stringify({
        type: 'moleculeAtom',
        symbol: symbol,
        id: atom.dataset.id
      }));
      this.draggingParticle = atom;
    });
    
    atom.addEventListener('dragend', () => {
      this.draggingParticle = null;
    });
    
    atom.addEventListener('click', () => {
      if (atom.dataset.placed === 'true') {
        this.handleMoleculeAtomClick(atom);
      }
    });
    
    return atom;
  }
  
  getElementColor(symbol) {
    const colors = {
      'H': '#FF6B6B',
      'He': '#FFD93D',
      'Li': '#6BCB77',
      'Be': '#4ECDC4',
      'B': '#95E1D3',
      'C': '#F38181',
      'N': '#AA96DA',
      'O': '#FCBAD3',
      'F': '#A8D8EA',
      'Ne': '#FFD93D',
      'Na': '#6BCB77',
      'Mg': '#4ECDC4',
      'Al': '#B8B8B8',
      'Si': '#95E1D3',
      'P': '#AA96DA',
      'S': '#FCBAD3',
      'Cl': '#A8D8EA',
      'Ar': '#FFD93D',
      'K': '#6BCB77',
      'Ca': '#4ECDC4'
    };
    return colors[symbol] || '#888888';
  }
  
  handleMoleculeAtomClick(atom) {
    if (this.selectedBondAtom === null) {
      this.selectedBondAtom = atom;
      atom.classList.add('selected-for-bond');
      this.showMessage('选择第二个原子来创建化学键', 'info');
    } else if (this.selectedBondAtom === atom) {
      this.selectedBondAtom.classList.remove('selected-for-bond');
      this.selectedBondAtom = null;
    } else {
      const bondType = document.getElementById('bondTypeSelect').value;
      this.createBond(this.selectedBondAtom, atom, bondType);
      this.selectedBondAtom.classList.remove('selected-for-bond');
      this.selectedBondAtom = null;
    }
  }
  
  createBond(atom1, atom2, bondType) {
    const id1 = atom1.dataset.placedId;
    const id2 = atom2.dataset.placedId;
    const symbol1 = atom1.dataset.symbol;
    const symbol2 = atom2.dataset.symbol;
    
    if (id1 === id2) {
      this.showMessage('不能选择同一个原子', 'error');
      return;
    }
    
    this.placedMoleculeBonds.push({
      from: symbol1,
      to: symbol2,
      type: bondType,
      atom1Id: id1,
      atom2Id: id2
    });
    
    this.showMessage(`已创建 ${symbol1}-${symbol2} ${this.getBondTypeName(bondType)}`, 'success');
    this.drawMoleculeBonds();
  }
  
  getBondTypeName(type) {
    const names = { single: '单键', double: '双键', triple: '三键', ionic: '离子键', polar: '极性键' };
    return names[type] || '键';
  }
  
  clearMoleculeWorkspace() {
    this.placedMoleculeAtoms = [];
    this.placedMoleculeBonds = [];
    this.selectedBondAtom = null;
    document.getElementById('atomRackContainer').innerHTML = '';
    
    const canvas = document.getElementById('moleculeCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  
  setupMoleculeCanvas() {
    const canvas = document.getElementById('moleculeCanvas');
    const container = document.getElementById('moleculeWorkspace');
    canvas.width = container.clientWidth;
    canvas.height = 400;
    
    canvas.addEventListener('dragover', (e) => {
      e.preventDefault();
    });
    
    canvas.addEventListener('drop', (e) => {
      e.preventDefault();
      this.handleCanvasDrop(e, canvas);
    });
    
    canvas.addEventListener('click', (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const clickedAtom = this.findAtomAtPosition(x, y);
      if (clickedAtom && clickedAtom.element) {
        this.handleMoleculeAtomClick(clickedAtom.element);
      }
    });
  }
  
  handleCanvasDrop(e, canvas) {
    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
    if (data.type !== 'moleculeAtom') return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const placedId = this.moleculeAtomIdCounter++;
    const symbol = data.symbol;
    
    const newAtom = this.createMoleculeAtom(symbol);
    newAtom.dataset.placed = 'true';
    newAtom.dataset.placedId = placedId;
    newAtom.style.position = 'absolute';
    newAtom.style.left = (x - 15) + 'px';
    newAtom.style.top = (y - 15) + 'px';
    newAtom.style.zIndex = '10';
    newAtom.style.cursor = 'pointer';
    
    document.getElementById('moleculeWorkspace').appendChild(newAtom);
    
    this.placedMoleculeAtoms.push({
      id: placedId,
      symbol: symbol,
      x: x,
      y: y,
      element: newAtom
    });
    
    this.draggingParticle = null;
  }
  
  findAtomAtPosition(x, y) {
    return this.placedMoleculeAtoms.find(atom => {
      const dx = Math.abs(atom.x - x);
      const dy = Math.abs(atom.y - y);
      return dx < 25 && dy < 25;
    });
  }
  
  drawMoleculeBonds() {
    const canvas = document.getElementById('moleculeCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    this.placedMoleculeBonds.forEach(bond => {
      const atom1 = this.placedMoleculeAtoms.find(a => a.id == bond.atom1Id);
      const atom2 = this.placedMoleculeAtoms.find(a => a.id == bond.atom2Id);
      
      if (atom1 && atom2) {
        ctx.beginPath();
        ctx.strokeStyle = '#4ecdc4';
        ctx.lineWidth = bond.type === 'triple' ? 6 : bond.type === 'double' ? 4 : 2;
        
        if (bond.type === 'triple') {
          for (let i = -1; i <= 1; i++) {
            const perpX = -(atom2.y - atom1.y) / 50 * i * 5;
            const perpY = (atom2.x - atom1.x) / 50 * i * 5;
            ctx.beginPath();
            ctx.moveTo(atom1.x + perpX, atom1.y + perpY);
            ctx.lineTo(atom2.x + perpX, atom2.y + perpY);
            ctx.stroke();
          }
        } else if (bond.type === 'double') {
          const perpX = -(atom2.y - atom1.y) / 50 * 4;
          const perpY = (atom2.x - atom1.x) / 50 * 4;
          ctx.beginPath();
          ctx.moveTo(atom1.x + perpX, atom1.y + perpY);
          ctx.lineTo(atom2.x + perpX, atom2.y + perpY);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(atom1.x - perpX, atom1.y - perpY);
          ctx.lineTo(atom2.x - perpX, atom2.y - perpY);
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.moveTo(atom1.x, atom1.y);
          ctx.lineTo(atom2.x, atom2.y);
          ctx.stroke();
        }
      }
    });
  }
  
  generateParticleType(type, count) {
    const rack = document.getElementById(`${type}Rack`);
    rack.innerHTML = '';
    
    for (let i = 0; i < count; i++) {
      const particle = this.createParticle(type);
      rack.appendChild(particle);
    }
  }
  
  createParticle(type) {
    const particle = document.createElement('div');
    particle.className = `particle ${type}-icon`;
    particle.textContent = type === 'proton' ? 'P' : type === 'neutron' ? 'N' : 'E';
    particle.dataset.type = type;
    particle.dataset.id = this.particleIdCounter++;
    particle.draggable = true;
    
    particle.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', JSON.stringify({
        type,
        id: particle.dataset.id,
        placed: particle.dataset.placed === 'true'
      }));
      this.draggingParticle = particle;
    });
    
    particle.addEventListener('dragend', () => {
      this.draggingParticle = null;
    });
    
    particle.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.handleTouchStart(e, particle);
    }, { passive: false });
    
    particle.addEventListener('click', () => {
      if (particle.dataset.placed === 'true') {
        this.removeParticle(particle);
      }
    });
    
    return particle;
  }
  
  handleTouchStart(e, particle) {
    const touch = e.touches[0];
    this.touchStartPos = { x: touch.clientX, y: touch.clientY };
    this.draggingParticle = particle;
    
    const clone = particle.cloneNode(true);
    clone.style.position = 'fixed';
    clone.style.zIndex = '9999';
    clone.style.pointerEvents = 'none';
    clone.style.opacity = '0.8';
    clone.style.transform = 'scale(1.2)';
    clone.style.transition = 'none';
    document.body.appendChild(clone);
    
    const updatePosition = (touchEvent) => {
      const t = touchEvent.touches[0];
      clone.style.left = (t.clientX - 12) + 'px';
      clone.style.top = (t.clientY - 12) + 'px';
    };
    
    const handleTouchMove = (moveEvent) => {
      updatePosition(moveEvent);
    };
    
    const handleTouchEnd = (endEvent) => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      
      const endTouch = endEvent.changedTouches[0];
      const elementBelow = document.elementFromPoint(endTouch.clientX, endTouch.clientY);
      
      clone.style.transition = 'all 0.2s ease-out';
      clone.style.opacity = '0';
      clone.style.transform = 'scale(0.8)';
      
      setTimeout(() => clone.remove(), 200);
      
      if (elementBelow) {
        const nucleus = document.getElementById('nucleus');
        const shells = document.querySelectorAll('.shell');
        
        if (nucleus.contains(elementBelow) || elementBelow === nucleus) {
          const type = particle.dataset.type;
          const id = particle.dataset.id;
          
          if (type === 'electron') {
            this.showMessage('电子应该放在电子轨道上！', 'error');
          } else {
            this.addToNucleus(type, id);
          }
        } else {
          for (const shell of shells) {
            if (shell.contains(elementBelow) || elementBelow === shell) {
              const type = particle.dataset.type;
              const id = particle.dataset.id;
              
              if (type !== 'electron') {
                this.showMessage('质子和中子应该放在原子核里！', 'error');
              } else {
                const shellSizes = [90, 140, 180];
                const shellIndex = parseInt(shell.dataset.shell);
                this.handleShellDropTouch(shell, shellIndex, shellSizes[shellIndex], type, id);
              }
              break;
            }
          }
        }
      }
      
      this.draggingParticle = null;
    };
    
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);
    
    updatePosition(e);
  }
  
  handleNucleusDrop(e) {
    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
    
    if (data.type === 'electron') {
      this.showMessage('电子应该放在电子轨道上！', 'error');
      return;
    }
    
    if (data.type === 'proton' || data.type === 'neutron') {
      this.addToNucleus(data.type, data.id);
    }
  }
  
  handleShellDrop(e, shell, orbitRadius) {
    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
    
    if (data.type !== 'electron') {
      this.showMessage('质子和中子应该放在原子核里！', 'error');
      return;
    }
    
    const currentElectrons = this.placedElectrons.filter(el => el.shell === parseInt(shell.dataset.shell)).length;
    const maxElectrons = parseInt(shell.dataset.maxElectrons);
    
    if (currentElectrons >= maxElectrons) {
      this.showMessage(`第${parseInt(shell.dataset.shell) + 1}层电子已满（最多${maxElectrons}个）`, 'error');
      return;
    }
    
    this.addToShell(data.type, data.id, shell, orbitRadius);
  }
  
  handleShellDropTouch(shell, shellIndex, orbitRadius, type, id) {
    const currentElectrons = this.placedElectrons.filter(el => el.shell === shellIndex).length;
    const maxElectrons = parseInt(shell.dataset.maxElectrons);
    
    if (currentElectrons >= maxElectrons) {
      this.showMessage(`第${shellIndex + 1}层电子已满（最多${maxElectrons}个）`, 'error');
      return;
    }
    
    this.addToShell(type, id, shell, orbitRadius);
  }
  
  addToNucleus(type, id) {
    const nucleusParticles = document.getElementById('nucleusParticles');
    
    let particle;
    if (this.isParticlePlaced(type, id)) {
      particle = document.querySelector(`[data-id="${id}"][data-placed="true"]`);
      if (particle) {
        this.removePlacedParticleFromTracking(type, id);
      }
    } else {
      particle = this.createParticle(type);
      particle.dataset.placed = 'true';
    }
    
    particle.classList.add('particle-in-nucleus');
    nucleusParticles.appendChild(particle);
    
    const trackingData = { id, element: particle };
    if (type === 'proton') {
      this.placedProtons.push(trackingData);
    } else {
      this.placedNeutrons.push(trackingData);
    }
    
    this.updateCounts();
    this.showParticleAnimation(particle);
  }
  
  addToShell(type, id, shell, orbitRadius) {
    let particle;
    if (this.isParticlePlaced(type, id)) {
      particle = document.querySelector(`[data-id="${id}"][data-placed="true"]`);
      if (particle) {
        this.removePlacedParticleFromTracking(type, id);
      }
    } else {
      particle = this.createParticle(type);
      particle.dataset.placed = 'true';
    }
    
    const shellIndex = parseInt(shell.dataset.shell);
    const electronsInShell = this.placedElectrons.filter(el => el.shell === shellIndex).length;
    const maxElectrons = parseInt(shell.dataset.maxElectrons);
    const animationDelay = electronsInShell * 0.5;
    
    particle.classList.add('electron-particle');
    particle.style.cssText = `
      --orbit-radius: ${orbitRadius}px;
      top: 50%;
      left: 50%;
      transform-origin: center;
      animation-delay: -${animationDelay}s;
      animation-duration: ${4 + shellIndex}s;
    `;
    
    const electronShells = document.getElementById('electronShells');
    electronShells.appendChild(particle);
    
    this.placedElectrons.push({ id, element: particle, shell: shellIndex });
    
    this.updateCounts();
    this.showParticleAnimation(particle);
  }
  
  isParticlePlaced(type, id) {
    const trackingArray = type === 'proton' ? this.placedProtons :
                         type === 'neutron' ? this.placedNeutrons :
                         this.placedElectrons;
    return trackingArray.some(item => item.id === id);
  }
  
  removePlacedParticleFromTracking(type, id) {
    const trackingArray = type === 'proton' ? this.placedProtons :
                         type === 'neutron' ? this.placedNeutrons :
                         this.placedElectrons;
    const index = trackingArray.findIndex(item => item.id === id);
    if (index > -1) {
      trackingArray.splice(index, 1);
    }
    this.updateCounts();
  }
  
  removeParticle(particle) {
    const type = particle.dataset.type;
    const id = particle.dataset.id;
    
    this.removePlacedParticleFromTracking(type, id);
    particle.remove();
    this.updateCounts();
  }
  
  showParticleAnimation(particle) {
    particle.style.transform = 'scale(0)';
    particle.style.opacity = '0';
    
    requestAnimationFrame(() => {
      particle.style.transition = 'all 0.3s ease';
      particle.style.transform = 'scale(1)';
      particle.style.opacity = '1';
    });
  }
  
  updateCounts() {
    document.getElementById('currentProtons').textContent = this.placedProtons.length;
    document.getElementById('currentNeutrons').textContent = this.placedNeutrons.length;
    document.getElementById('currentElectrons').textContent = this.placedElectrons.length;
  }
  
  clearAtom() {
    const nucleusParticles = document.getElementById('nucleusParticles');
    nucleusParticles.innerHTML = '';
    
    const electronShells = document.getElementById('electronShells');
    const particles = electronShells.querySelectorAll('.particle');
    particles.forEach(p => p.remove());
    
    this.placedProtons = [];
    this.placedNeutrons = [];
    this.placedElectrons = [];
    
    this.updateCounts();
  }
  
  async checkSynthesis() {
    if (this.currentMode === 'molecule') {
      await this.checkMoleculeSynthesis();
    } else {
      await this.checkElementSynthesis();
    }
  }
  
  async checkElementSynthesis() {
    if (!this.currentElement) {
      this.showMessage('请先开始游戏！', 'error');
      return;
    }
    
    const currentProtons = this.placedProtons.length;
    const currentNeutrons = this.placedNeutrons.length;
    const currentElectrons = this.placedElectrons.length;
    
    try {
      const response = await fetch(`${API_BASE_URL}/check-synthesis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          element_id: this.currentElement.id,
          protons: currentProtons,
          neutrons: currentNeutrons,
          electrons: currentElectrons
        })
      });
      
      const result = await response.json();
      
      if (result.correct) {
        this.handleCorrectElementSynthesis();
      } else {
        this.handleIncorrectSynthesis(result.errors, result.warnings);
      }
    } catch (error) {
      console.error('Check failed:', error);
      this.localCheckSynthesis(currentProtons, currentNeutrons, currentElectrons);
    }
  }
  
  async checkMoleculeSynthesis() {
    if (!this.currentMolecule) {
      this.showMessage('请先开始游戏！', 'error');
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/check-molecule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          molecule_id: this.currentMolecule.id,
          placed_atoms: this.placedMoleculeAtoms.map(a => ({ symbol: a.symbol })),
          placed_bonds: this.placedMoleculeBonds.map(b => ({
            from: b.from,
            to: b.to,
            type: b.type
          }))
        })
      });
      
      const result = await response.json();
      
      if (result.correct) {
        this.handleCorrectMoleculeSynthesis();
      } else {
        this.handleIncorrectSynthesis(result.errors, result.warnings);
      }
    } catch (error) {
      console.error('Check failed:', error);
      this.showMessage('无法连接服务器，请确保后端已启动', 'error');
    }
  }
  
  localCheckSynthesis(currentProtons, currentNeutrons, currentElectrons) {
    const required = {
      protons: this.currentElement.protons,
      neutrons: this.currentElement.neutrons,
      electrons: this.currentElement.electrons
    };
    
    const errors = [];
    const warnings = [];
    
    const protonCorrect = currentProtons === required.protons;
    const neutronCorrect = currentNeutrons === required.neutrons;
    const electronCorrect = currentElectrons === required.electrons;
    
    if (!protonCorrect) {
      errors.push({ message: `质子数不符：需要 ${required.protons} 个，当前 ${currentProtons} 个` });
    }
    
    if (!neutronCorrect) {
      if (protonCorrect) {
        warnings.push({
          message: `⚠️ 质子数正确，但中子数不同，这是${this.currentElement.name}的同位素（质量数=${currentProtons + currentNeutrons}），目标是${this.currentElement.mass_number}`
        });
      }
      errors.push({ message: `中子数不符：需要 ${required.neutrons} 个，当前 ${currentNeutrons} 个` });
    }
    
    if (!electronCorrect) {
      const charge = currentProtons - currentElectrons;
      if (charge !== 0) {
        warnings.push({
          message: `⚠️ 电荷不平衡：原子应为电中性（质子数=电子数），当前电荷为${charge > 0 ? '+' : ''}${charge}`
        });
      }
      errors.push({ message: `电子数不符：需要 ${required.electrons} 个，当前 ${currentElectrons} 个` });
    }
    
    if (errors.length === 0) {
      this.handleCorrectElementSynthesis();
    } else {
      this.handleIncorrectSynthesis(errors, warnings);
    }
  }
  
  handleCorrectElementSynthesis() {
    const baseScore = 100;
    const timeBonus = Math.floor(this.timeLeft * 2);
    const levelBonus = this.currentLevel * 20;
    const totalScore = baseScore + timeBonus + levelBonus;
    
    this.score += totalScore;
    document.getElementById('currentScore').textContent = this.score;
    
    this.addToCollection(this.currentElement.id, this.currentElement.symbol);
    
    this.showMessage(`🎉 合成成功！+${totalScore}分（基础${baseScore}+时间${timeBonus}+关卡${levelBonus}），已收集到图鉴！`, 'success');
    
    this.playSuccessAnimation();
    
    setTimeout(() => {
      this.currentLevel++;
      if (this.currentLevel > 10) {
        this.showMessage('🏆 恭喜通关所有关卡！', 'success');
        setTimeout(() => this.endGame(true), 2000);
      } else {
        this.startLevel();
      }
    }, 2000);
  }
  
  handleCorrectMoleculeSynthesis() {
    const baseScore = 200;
    const timeBonus = Math.floor(this.timeLeft * 2);
    const levelBonus = this.currentLevel * 30;
    const totalScore = baseScore + timeBonus + levelBonus;
    
    this.score += totalScore;
    document.getElementById('currentScore').textContent = this.score;
    
    this.showMessage(`🎉 分子合成成功！+${totalScore}分（基础${baseScore}+时间${timeBonus}+关卡${levelBonus}）`, 'success');
    
    this.playSuccessAnimation();
    
    setTimeout(() => {
      this.currentLevel++;
      if (this.currentLevel > 10) {
        this.showMessage('🏆 恭喜通关所有关卡！', 'success');
        setTimeout(() => this.endGame(true), 2000);
      } else {
        this.startLevel();
      }
    }, 2000);
  }
  
  handleIncorrectSynthesis(errors, warnings = []) {
    let message = '❌ 合成失败：';
    const allMessages = [];
    
    if (warnings && warnings.length > 0) {
      allMessages.push(...warnings.map(w => w.message));
    }
    
    if (errors && errors.length > 0) {
      allMessages.push(...errors.map(e => e.message));
    }
    
    message += allMessages.join('；');
    this.showMessage(message, 'error');
    
    this.timeLeft = Math.max(this.timeLeft - 5, 0);
    document.getElementById('timeLeft').textContent = this.timeLeft;
    
    this.playErrorAnimation();
  }
  
  playSuccessAnimation() {
    const atomModel = document.getElementById('atomModel');
    atomModel.style.animation = 'pulse 0.5s ease 3';
    
    setTimeout(() => {
      atomModel.style.animation = '';
    }, 1500);
  }
  
  playErrorAnimation() {
    const atomModel = document.getElementById('atomModel');
    atomModel.style.animation = 'shake 0.5s ease';
    
    setTimeout(() => {
      atomModel.style.animation = '';
    }, 500);
  }
  
  showMessage(text, type) {
    const messageArea = document.getElementById('messageArea');
    if (messageArea) {
      messageArea.textContent = text;
      messageArea.className = `message-area message-${type}`;
      
      if (type !== 'info') {
        setTimeout(() => {
          messageArea.className = 'message-area';
          messageArea.textContent = '';
        }, 4000);
      }
    }
  }
  
  async endGame(won = false) {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    
    this.isPlaying = false;
    document.getElementById('startBtn').style.display = 'inline-block';
    document.getElementById('pauseBtn').style.display = 'none';
    document.getElementById('checkBtn').disabled = true;
    
    const playerName = document.getElementById('playerName').value || '匿名玩家';
    
    try {
      await fetch(`${API_BASE_URL}/scores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          player_name: playerName,
          score: this.score,
          level: this.currentLevel
        })
      });
    } catch (error) {
      console.error('Failed to save score:', error);
    }
    
    document.getElementById('gameOverTitle').textContent = won ? '🎉 恭喜通关！' : '游戏结束';
    document.getElementById('finalScore').textContent = this.score;
    document.getElementById('finalLevel').textContent = Math.min(this.currentLevel, 10);
    document.getElementById('gameOverModal').style.display = 'flex';
    
    await this.showLeaderboard();
    
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }
  
  async showLeaderboard() {
    try {
      const response = await fetch(`${API_BASE_URL}/scores?limit=10`);
      const scores = await response.json();
      
      const leaderboardList = document.getElementById('leaderboardList');
      leaderboardList.innerHTML = '';
      
      scores.forEach((score, index) => {
        const item = document.createElement('div');
        item.className = 'leaderboard-item';
        item.innerHTML = `
          <span>${index + 1}. ${score.player_name}</span>
          <span>${score.score}分 (关卡${score.level})</span>
        `;
        leaderboardList.appendChild(item);
      });
      
      if (scores.length === 0) {
        leaderboardList.innerHTML = '<p style="color: rgba(255,255,255,0.5);">暂无记录</p>';
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    }
  }
  
  resetGame() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    
    this.resetGameState();
    
    document.getElementById('currentLevel').textContent = '1';
    document.getElementById('currentScore').textContent = '0';
    document.getElementById('timeLeft').textContent = '60';
    document.getElementById('timeLeft').style.color = '#4ecdc4';
    document.getElementById('startBtn').style.display = 'inline-block';
    document.getElementById('pauseBtn').style.display = 'none';
    document.getElementById('pauseBtn').textContent = '暂停';
    document.getElementById('checkBtn').disabled = true;
    
    document.getElementById('targetSymbol').textContent = '?';
    document.getElementById('targetName').textContent = '请开始游戏';
    document.getElementById('requiredProtons').textContent = '0';
    document.getElementById('requiredNeutrons').textContent = '0';
    document.getElementById('requiredElectrons').textContent = '0';
    
    this.clearAtom();
    this.clearMoleculeWorkspace();
    this.clearParticleRacks();
    this.showMessage('', 'info');
  }
  
  clearParticleRacks() {
    document.getElementById('protonRack').innerHTML = '';
    document.getElementById('neutronRack').innerHTML = '';
    document.getElementById('electronRack').innerHTML = '';
    document.getElementById('atomRackContainer').innerHTML = '';
  }
  
  async initPeriodicTable() {
    try {
      const response = await fetch(`${API_BASE_URL}/periodic-table`);
      const elements = await response.json();
      
      this.renderPeriodicTable(elements);
      this.updateCollectionStats();
    } catch (error) {
      console.error('Failed to load periodic table:', error);
      this.showMessage('无法加载元素周期表数据', 'error');
    }
  }
  
  renderPeriodicTable(elements) {
    const container = document.getElementById('periodicTable');
    container.innerHTML = '';
    
    const layout = [
      [1, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, 2],
      [3, 4, null, null, null, null, null, null, null, null, null, null, 5, 6, 7, 8, 9, 10],
      [11, 12, null, null, null, null, null, null, null, null, null, null, 13, 14, 15, 16, 17, 18],
      [19, 20, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
    ];
    
    layout.forEach(row => {
      const rowEl = document.createElement('div');
      rowEl.className = 'periodic-row';
      
      row.forEach(elementId => {
        if (elementId === null) {
          const emptyEl = document.createElement('div');
          emptyEl.className = 'periodic-empty';
          rowEl.appendChild(emptyEl);
        } else {
          const element = elements.find(el => el.id === elementId);
          if (element) {
            const cellEl = this.createElementCell(element);
            rowEl.appendChild(cellEl);
          }
        }
      });
      
      container.appendChild(rowEl);
    });
  }
  
  createElementCell(element) {
    const cell = document.createElement('div');
    cell.className = 'periodic-element';
    
    const isCollected = this.collection[element.symbol] !== undefined;
    if (isCollected) {
      cell.classList.add('collected');
    }
    
    cell.style.background = isCollected ? element.color : '#3a3a5c';
    cell.style.borderColor = element.color;
    
    cell.innerHTML = `
      <div class="element-number">${element.atomic_number}</div>
      <div class="element-symbol-cell">${element.symbol}</div>
      <div class="element-name-cell">${element.name}</div>
    `;
    
    cell.addEventListener('click', () => this.showElementDetail(element));
    
    return cell;
  }
  
  async showElementDetail(element) {
    document.getElementById('detailSymbol').textContent = element.symbol;
    document.getElementById('detailName').textContent = element.name;
    document.getElementById('detailAtomicNumber').textContent = element.atomic_number;
    document.getElementById('detailMassNumber').textContent = element.mass_number;
    document.getElementById('detailProtons').textContent = element.protons;
    document.getElementById('detailNeutrons').textContent = element.neutrons;
    document.getElementById('detailElectrons').textContent = element.electrons;
    document.getElementById('detailCategory').textContent = element.category_name || '未知';
    document.getElementById('detailPeriod').textContent = element.period || '-';
    document.getElementById('detailGroup').textContent = element.group || '-';
    
    const isCollected = this.collection[element.symbol] !== undefined;
    const statusEl = document.getElementById('detailStatus');
    statusEl.innerHTML = isCollected 
      ? '<span class="status-collected">✅ 已收集</span>' 
      : '<span class="status-locked">🔒 未收集 - 在游戏中合成该元素来解锁</span>';
    
    document.getElementById('elementDetailModal').style.display = 'flex';
  }
  
  updateCollectionStats() {
    const collectedCount = Object.keys(this.collection).length;
    document.getElementById('collectedCount').textContent = collectedCount;
    
    const percentage = (collectedCount / 20) * 100;
    document.getElementById('progressFill').style.width = percentage + '%';
  }
  
  showVersusLobby() {
    document.getElementById('versusLobby').style.display = 'block';
    document.getElementById('versusGame').style.display = 'none';
    document.getElementById('versusResult').style.display = 'none';
    this.refreshAvailableMatches();
  }
  
  async refreshAvailableMatches() {
    try {
      const response = await fetch(`${API_BASE_URL}/matches/available`);
      const matches = await response.json();
      
      const container = document.getElementById('availableMatches');
      container.innerHTML = '<h4>可加入的房间：</h4>';
      
      if (matches.length === 0) {
        container.innerHTML += '<p style="color: rgba(255,255,255,0.5);">暂无可用房间</p>';
      } else {
        matches.forEach(match => {
          const matchEl = document.createElement('div');
          matchEl.className = 'available-match';
          matchEl.innerHTML = `
            <span>房间 #${match.id}</span>
            <span>房主: ${match.player1.name}</span>
            <button class="btn btn-small btn-primary" data-match="${match.id}">加入</button>
          `;
          matchEl.querySelector('button').addEventListener('click', () => {
            document.getElementById('joinMatchId').value = match.id;
          });
          container.appendChild(matchEl);
        });
      }
    } catch (error) {
      console.error('Failed to load matches:', error);
    }
  }
  
  async createMatch() {
    const playerName = document.getElementById('createPlayerName').value || '玩家1';
    
    try {
      const response = await fetch(`${API_BASE_URL}/matches/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player_name: playerName })
      });
      
      const match = await response.json();
      this.currentMatch = match;
      this.matchedPlayer = 1;
      
      document.getElementById('createdMatchId').textContent = match.id;
      document.getElementById('createdMatch').style.display = 'block';
      
      this.pollMatchStatus();
    } catch (error) {
      console.error('Failed to create match:', error);
      this.showMessage('创建房间失败', 'error');
    }
  }
  
  async cancelMatch() {
    if (this.currentMatch) {
      try {
        await fetch(`${API_BASE_URL}/matches/${this.currentMatch.id}/end`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ winner_num: null })
        });
      } catch (e) {}
    }
    
    this.currentMatch = null;
    document.getElementById('createdMatch').style.display = 'none';
  }
  
  async joinMatch() {
    const matchId = document.getElementById('joinMatchId').value;
    const playerName = document.getElementById('joinPlayerName').value || '玩家2';
    
    if (!matchId) {
      this.showMessage('请输入房间号', 'error');
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/matches/${matchId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player_name: playerName })
      });
      
      if (response.status === 404) {
        this.showMessage('房间不存在或不可加入', 'error');
        return;
      }
      
      const match = await response.json();
      this.currentMatch = match;
      this.matchedPlayer = 2;
      
      this.showVersusGame();
    } catch (error) {
      console.error('Failed to join match:', error);
      this.showMessage('加入房间失败', 'error');
    }
  }
  
  pollMatchStatus() {
    const poll = async () => {
      if (!this.currentMatch) return;
      
      try {
        const response = await fetch(`${API_BASE_URL}/matches/${this.currentMatch.id}`);
        const match = await response.json();
        
        if (match.status === 'ready' && this.matchedPlayer === 1) {
          this.showVersusGame();
          return;
        }
        
        if (match.status !== 'waiting' && match.status !== 'ready') {
          return;
        }
        
        setTimeout(poll, 2000);
      } catch (error) {
        console.error('Poll error:', error);
      }
    };
    
    poll();
  }
  
  showVersusGame() {
    document.getElementById('versusLobby').style.display = 'none';
    document.getElementById('versusGame').style.display = 'block';
    document.getElementById('versusResult').style.display = 'none';
    
    if (this.currentMatch) {
      document.getElementById('player1Name').textContent = this.currentMatch.player1.name;
      if (this.currentMatch.player2) {
        document.getElementById('player2Name').textContent = this.currentMatch.player2.name;
      }
    }
    
    document.getElementById('player1Score').textContent = '0';
    document.getElementById('player2Score').textContent = '0';
    document.getElementById('player1Completed').textContent = '0';
    document.getElementById('player2Completed').textContent = '0';
  }
  
  async startVersusMatch() {
    if (!this.currentMatch) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/matches/${this.currentMatch.id}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const match = await response.json();
      this.currentMatch = match;
      
      if (match.current_element) {
        document.getElementById('versusSymbol').textContent = match.current_element.symbol;
        document.getElementById('versusName').textContent = match.current_element.name;
      }
      
      document.getElementById('startVersusBtn').style.display = 'none';
      this.showMessage('对战开始！快速合成当前元素获得分数！', 'info');
      
      this.startVersusPolling();
    } catch (error) {
      console.error('Failed to start match:', error);
    }
  }
  
  startVersusPolling() {
    const poll = async () => {
      if (!this.currentMatch) return;
      
      try {
        const response = await fetch(`${API_BASE_URL}/matches/${this.currentMatch.id}`);
        const match = await response.json();
        
        if (match.status === 'finished') {
          this.showVersusResult(match);
          return;
        }
        
        if (match.current_element) {
          document.getElementById('versusSymbol').textContent = match.current_element.symbol;
          document.getElementById('versusName').textContent = match.current_element.name;
        }
        
        document.getElementById('player1Score').textContent = match.player1.score;
        document.getElementById('player2Score').textContent = match.player2 ? match.player2.score : 0;
        document.getElementById('player1Completed').textContent = match.player1.elements_completed.length;
        document.getElementById('player2Completed').textContent = match.player2 ? match.player2.elements_completed.length : 0;
        
        setTimeout(poll, 1000);
      } catch (error) {
        console.error('Poll error:', error);
      }
    };
    
    poll();
  }
  
  async playerComplete(playerNum) {
    if (!this.currentMatch) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/matches/${this.currentMatch.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player_num: playerNum, score_bonus: 100 })
      });
      
      const match = await response.json();
      this.currentMatch = match;
      
      const player = playerNum === 1 ? match.player1 : match.player2;
      this.showMessage(`${player.name} 完成了一个元素！+100分`, 'success');
      
      document.getElementById('player1Score').textContent = match.player1.score;
      document.getElementById('player2Score').textContent = match.player2 ? match.player2.score : 0;
      
      if (match.current_element) {
        document.getElementById('versusSymbol').textContent = match.current_element.symbol;
        document.getElementById('versusName').textContent = match.current_element.name;
      }
    } catch (error) {
      console.error('Complete failed:', error);
    }
  }
  
  async endVersusMatch() {
    if (!this.currentMatch) return;
    
    try {
      const p1Score = this.currentMatch.player1.score;
      const p2Score = this.currentMatch.player2 ? this.currentMatch.player2.score : 0;
      const winner = p1Score > p2Score ? 1 : (p2Score > p1Score ? 2 : 0);
      
      const response = await fetch(`${API_BASE_URL}/matches/${this.currentMatch.id}/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ winner_num: winner })
      });
      
      const match = await response.json();
      this.showVersusResult(match);
    } catch (error) {
      console.error('End match failed:', error);
    }
  }
  
  showVersusResult(match) {
    document.getElementById('versusGame').style.display = 'none';
    document.getElementById('versusResult').style.display = 'block';
    
    document.getElementById('resultPlayer1Name').textContent = match.player1.name;
    document.getElementById('resultPlayer2Name').textContent = match.player2 ? match.player2.name : '玩家2';
    document.getElementById('resultPlayer1Score').textContent = match.player1.score;
    document.getElementById('resultPlayer2Score').textContent = match.player2 ? match.player2.score : 0;
    
    const p1Score = match.player1.score;
    const p2Score = match.player2 ? match.player2.score : 0;
    
    if (match.winner === 1) {
      document.getElementById('versusResultTitle').textContent = `🎉 ${match.player1.name} 获胜！`;
    } else if (match.winner === 2) {
      document.getElementById('versusResultTitle').textContent = `🎉 ${match.player2.name} 获胜！`;
    } else {
      document.getElementById('versusResultTitle').textContent = '🤝 平局！';
    }
  }
  
  playAgainVersus() {
    this.currentMatch = null;
    this.showVersusLobby();
  }
  
  backToLobby() {
    this.currentMatch = null;
    this.showVersusLobby();
  }
}

const style = document.createElement('style');
style.textContent = `
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-10px); }
    75% { transform: translateX(10px); }
  }
  @media (hover: none) and (pointer: coarse) {
    .particle {
      touch-action: none;
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      user-select: none;
    }
  }
`;
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', () => {
  new Game();
});
