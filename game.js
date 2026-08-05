/**
 * VoltLoop - The LED Circuit Connection Puzzle
 * Game Logic & Solver Engine
 */

// Bitmask mappings: Top=1, Right=2, Bottom=4, Left=8
const MASK_TOP = 1;
const MASK_RIGHT = 2;
const MASK_BOTTOM = 4;
const MASK_LEFT = 8;

const BASE_MASKS = {
  empty: 0,
  straight: MASK_LEFT | MASK_RIGHT, // 10 (horizontal base)
  corner: MASK_TOP | MASK_RIGHT,    // 3 (Top-Right base)
  tee: MASK_LEFT | MASK_TOP | MASK_RIGHT, // 11 (Left-Top-Right base)
  cross: MASK_TOP | MASK_RIGHT | MASK_BOTTOM | MASK_LEFT // 15
};

// 10 Curated level designs
const LEVELS = [
  {
    id: 1,
    name: "System Boot",
    movesLimit: 8,
    tiles: [
      { type: 'straight', rot: 1, locked: false }, // Solved: rot=0 (H)
      { type: 'straight', rot: 1, locked: false }, // Solved: rot=0 (H)
      { type: 'straight', rot: 1, locked: false }, // Solved: rot=0 (H)
      { type: 'corner', rot: 0, locked: false },   // Solved: rot=2 (B-L)
      
      { type: 'empty', rot: 0, locked: false },
      { type: 'empty', rot: 0, locked: false },
      { type: 'empty', rot: 0, locked: false },
      { type: 'corner', rot: 2, locked: false },   // Solved: rot=0 (T-R)
      
      { type: 'empty', rot: 0, locked: false },
      { type: 'empty', rot: 0, locked: false },
      { type: 'empty', rot: 0, locked: false },
      { type: 'corner', rot: 0, locked: false },   // Solved: rot=1 (R-B)
      
      { type: 'straight', rot: 1, locked: false }, // Solved: rot=0 (H)
      { type: 'straight', rot: 1, locked: false }, // Solved: rot=0 (H)
      { type: 'straight', rot: 1, locked: false }, // Solved: rot=0 (H)
      { type: 'corner', rot: 1, locked: false }    // Solved: rot=3 (L-T)
    ]
  },
  {
    id: 2,
    name: "Short Circuit Guide",
    movesLimit: 6,
    tiles: [
      { type: 'straight', rot: 1, locked: false }, // (0,0) Solved: rot=0 (H)
      { type: 'straight', rot: 1, locked: false }, // (0,1) Solved: rot=0 (H)
      { type: 'corner', rot: 0, locked: false },   // (0,2) Solved: rot=2 (B-L)
      { type: 'empty', rot: 0, locked: false },
      
      { type: 'empty', rot: 0, locked: false },
      { type: 'empty', rot: 0, locked: false },
      { type: 'corner', rot: 2, locked: false },   // (1,2) Solved: rot=0 (T-R)
      { type: 'straight', rot: 1, locked: false }, // (1,3) Solved: rot=0 (H)
      
      { type: 'empty', rot: 0, locked: false },
      { type: 'empty', rot: 0, locked: false },
      { type: 'corner', rot: 0, locked: false },   // (2,2) Solved: rot=1 (R-B)
      { type: 'straight', rot: 1, locked: false }, // (2,3) Solved: rot=0 (H)
      
      { type: 'straight', rot: 1, locked: false }, // (3,0) Solved: rot=0 (H)
      { type: 'straight', rot: 1, locked: false }, // (3,1) Solved: rot=0 (H)
      { type: 'corner', rot: 1, locked: false },   // (3,2) Solved: rot=3 (L-T)
      { type: 'empty', rot: 0, locked: false }
    ]
  },
  {
    id: 3,
    name: "Winding Circuit",
    movesLimit: 10,
    tiles: [
      { type: 'corner', rot: 0, locked: false },   // (0,0) Solved: rot=2 (B-L)
      { type: 'empty', rot: 0, locked: false },
      { type: 'empty', rot: 0, locked: false },
      { type: 'empty', rot: 0, locked: false },
      
      { type: 'corner', rot: 2, locked: false },   // (1,0) Solved: rot=0 (T-R)
      { type: 'corner', rot: 0, locked: false },   // (1,1) Solved: rot=2 (B-L)
      { type: 'corner', rot: 3, locked: false },   // (1,2) Solved: rot=1 (R-B)
      { type: 'straight', rot: 1, locked: false }, // (1,3) Solved: rot=0 (H)
      
      { type: 'empty', rot: 0, locked: false },
      { type: 'corner', rot: 3, locked: false },   // (2,1) Solved: rot=0 (T-R)
      { type: 'corner', rot: 1, locked: false },   // (2,2) Solved: rot=3 (L-T)
      { type: 'corner', rot: 3, locked: false },   // (2,3) Solved: rot=1 (R-B)
      
      { type: 'straight', rot: 1, locked: false }, // (3,0) Solved: rot=0 (H)
      { type: 'straight', rot: 1, locked: false }, // (3,1) Solved: rot=0 (H)
      { type: 'straight', rot: 1, locked: false }, // (3,2) Solved: rot=0 (H)
      { type: 'corner', rot: 0, locked: false }    // (3,3) Solved: rot=3 (L-T)
    ]
  },
  {
    id: 4,
    name: "Static Core",
    movesLimit: 10,
    tiles: [
      { type: 'corner', rot: 0, locked: false },   // Solved: rot=2 (B-L)
      { type: 'corner', rot: 1, locked: true },    // LOCKED Solved: rot=1 (R-B)
      { type: 'corner', rot: 3, locked: false },   // Solved: rot=2 (B-L)
      { type: 'empty', rot: 0, locked: false },
      
      { type: 'straight', rot: 0, locked: false }, // Solved: rot=1 (V)
      { type: 'corner', rot: 0, locked: true },    // LOCKED Solved: rot=0 (T-R)
      { type: 'straight', rot: 1, locked: false }, // Solved: rot=0 (H)
      { type: 'straight', rot: 1, locked: false }, // Solved: rot=0 (H)
      
      { type: 'corner', rot: 1, locked: false },   // Solved: rot=0 (T-R)
      { type: 'straight', rot: 0, locked: true },    // LOCKED Solved: rot=0 (H)
      { type: 'corner', rot: 2, locked: false },   // Solved: rot=3 (L-T)
      { type: 'corner', rot: 0, locked: false },   // Solved: rot=1 (R-B)
      
      { type: 'straight', rot: 1, locked: false }, // Solved: rot=1 (V)
      { type: 'corner', rot: 1, locked: false },   // Solved: rot=3 (L-T)
      { type: 'straight', rot: 0, locked: false }, // Solved: rot=1 (V)
      { type: 'corner', rot: 2, locked: false }    // Solved: rot=3 (L-T)
    ]
  },
  {
    id: 5,
    name: "Grid Crossroads",
    movesLimit: 15,
    tiles: [
      { type: 'corner', rot: 1, locked: false },   // (0,0) Solved: rot=2 (B-L)
      { type: 'tee', rot: 3, locked: false },      // (0,1) Solved: rot=2 (L-B-R)
      { type: 'corner', rot: 0, locked: false },   // (0,2) Solved: rot=2 (B-L)
      { type: 'empty', rot: 0, locked: false },
      
      { type: 'straight', rot: 0, locked: false }, // (1,0) Solved: rot=1 (V)
      { type: 'cross', rot: 0, locked: false },    // (1,1) Solved: rot=0
      { type: 'straight', rot: 0, locked: false }, // (1,2) Solved: rot=1 (V)
      { type: 'corner', rot: 2, locked: false },   // (1,3) Solved: rot=0 (T-R)
      
      { type: 'straight', rot: 0, locked: false }, // (2,0) Solved: rot=1 (V)
      { type: 'straight', rot: 1, locked: false }, // (2,1) Solved: rot=1 (V)
      { type: 'cross', rot: 0, locked: true },     // (2,2) LOCKED Cross
      { type: 'corner', rot: 3, locked: false },   // (2,3) Solved: rot=1 (R-B)
      
      { type: 'corner', rot: 0, locked: false },   // (3,0) Solved: rot=3 (L-T)
      { type: 'tee', rot: 1, locked: false },      // (3,1) Solved: rot=0 (L-T-R)
      { type: 'corner', rot: 2, locked: false },   // (3,2) Solved: rot=3 (L-T)
      { type: 'corner', rot: 1, locked: false }    // (3,3) Solved: rot=3 (L-T)
    ]
  },
  {
    id: 6,
    name: "Short Circuit Danger",
    movesLimit: 14,
    tiles: [
      { type: 'tee', rot: 1, locked: false },      // Solved: rot=2 (L-B-R)
      { type: 'straight', rot: 1, locked: false }, // Solved: rot=0 (H)
      { type: 'corner', rot: 3, locked: false },   // Solved: rot=2 (B-L)
      { type: 'empty', rot: 0, locked: false },
      
      { type: 'straight', rot: 0, locked: false }, // Solved: rot=1 (V)
      { type: 'corner', rot: 2, locked: false },   // Solved: rot=0 (T-R)
      { type: 'tee', rot: 0, locked: false },      // Solved: rot=2 (L-B-R)
      { type: 'straight', rot: 1, locked: false }, // Solved: rot=0 (H)
      
      { type: 'corner', rot: 1, locked: false },   // Solved: rot=0 (T-R)
      { type: 'straight', rot: 1, locked: false }, // Solved: rot=0 (H)
      { type: 'corner', rot: 3, locked: false },   // Solved: rot=2 (B-L)
      { type: 'corner', rot: 0, locked: false },   // Solved: rot=1 (R-B)
      
      { type: 'straight', rot: 0, locked: false }, // Solved: rot=1 (V)
      { type: 'straight', rot: 1, locked: false }, // Solved: rot=0 (H)
      { type: 'corner', rot: 2, locked: false },   // Solved: rot=3 (L-T)
      { type: 'corner', rot: 1, locked: false }    // Solved: rot=3 (L-T)
    ]
  },
  {
    id: 7,
    name: "The Labyrinth",
    movesLimit: 18,
    tiles: [
      { type: 'corner', rot: 3, locked: false },
      { type: 'tee', rot: 1, locked: true },
      { type: 'corner', rot: 1, locked: false },
      { type: 'empty', rot: 0, locked: false },
      
      { type: 'straight', rot: 0, locked: false },
      { type: 'corner', rot: 0, locked: false },
      { type: 'cross', rot: 0, locked: false },
      { type: 'corner', rot: 2, locked: false },
      
      { type: 'corner', rot: 2, locked: true },
      { type: 'straight', rot: 1, locked: false },
      { type: 'tee', rot: 0, locked: false },
      { type: 'straight', rot: 0, locked: false },
      
      { type: 'straight', rot: 1, locked: false },
      { type: 'corner', rot: 0, locked: false },
      { type: 'corner', rot: 3, locked: false },
      { type: 'corner', rot: 1, locked: false }
    ]
  },
  {
    id: 8,
    name: "Coil Matrix",
    movesLimit: 16,
    tiles: [
      { type: 'corner', rot: 1, locked: false },
      { type: 'corner', rot: 0, locked: false },
      { type: 'corner', rot: 3, locked: false },
      { type: 'corner', rot: 2, locked: false },
      
      { type: 'corner', rot: 2, locked: false },
      { type: 'corner', rot: 3, locked: false },
      { type: 'corner', rot: 0, locked: false },
      { type: 'straight', rot: 1, locked: true },
      
      { type: 'straight', rot: 0, locked: true },
      { type: 'corner', rot: 1, locked: false },
      { type: 'corner', rot: 2, locked: false },
      { type: 'straight', rot: 1, locked: false },
      
      { type: 'corner', rot: 0, locked: false },
      { type: 'corner', rot: 3, locked: false },
      { type: 'corner', rot: 1, locked: false },
      { type: 'corner', rot: 0, locked: false }
    ]
  },
  {
    id: 9,
    name: "Grid Mesh",
    movesLimit: 22,
    tiles: [
      { type: 'tee', rot: 0, locked: false },
      { type: 'cross', rot: 0, locked: false },
      { type: 'tee', rot: 1, locked: false },
      { type: 'corner', rot: 2, locked: false },
      
      { type: 'straight', rot: 1, locked: false },
      { type: 'tee', rot: 2, locked: true },
      { type: 'cross', rot: 0, locked: false },
      { type: 'straight', rot: 0, locked: false },
      
      { type: 'tee', rot: 3, locked: false },
      { type: 'cross', rot: 0, locked: false },
      { type: 'tee', rot: 0, locked: true },
      { type: 'corner', rot: 1, locked: false },
      
      { type: 'corner', rot: 0, locked: false },
      { type: 'tee', rot: 1, locked: false },
      { type: 'corner', rot: 3, locked: false },
      { type: 'corner', rot: 2, locked: false }
    ]
  },
  {
    id: 10,
    name: "Antigravity Loop",
    movesLimit: 20,
    tiles: [
      { type: 'corner', rot: 1, locked: false },
      { type: 'straight', rot: 0, locked: true },
      { type: 'tee', rot: 2, locked: false },
      { type: 'corner', rot: 3, locked: false },
      
      { type: 'straight', rot: 1, locked: false },
      { type: 'corner', rot: 0, locked: false },
      { type: 'cross', rot: 0, locked: true },
      { type: 'corner', rot: 1, locked: false },
      
      { type: 'corner', rot: 2, locked: false },
      { type: 'cross', rot: 0, locked: false },
      { type: 'corner', rot: 3, locked: false },
      { type: 'straight', rot: 0, locked: true },
      
      { type: 'straight', rot: 1, locked: false },
      { type: 'tee', rot: 0, locked: false },
      { type: 'straight', rot: 0, locked: false },
      { type: 'corner', rot: 2, locked: false }
    ]
  }
];

class GameEngine {
  constructor() {
    this.currentLevelIndex = 0;
    this.moves = 0;
    this.elapsedSeconds = 0;
    this.timerInterval = null;
    this.boardState = []; // Holds current tile instances
    this.isLevelComplete = false;
    
    // Save progression in local storage
    this.unlockedLevels = JSON.parse(localStorage.getItem('voltloop_unlocked')) || [0];
    this.levelRatings = JSON.parse(localStorage.getItem('voltloop_ratings')) || {};

    this.audioInitiated = false;
  }

  init() {
    // Cache DOM Elements
    this.boardEl = document.getElementById('puzzle-board');
    this.movesEl = document.getElementById('moves-count');
    this.timerEl = document.getElementById('timer-display');
    this.levelDisplayEl = document.getElementById('current-level-display');
    
    this.startScreen = document.getElementById('start-screen');
    this.gameContainer = document.querySelector('.game-container');
    
    this.victoryModal = document.getElementById('victory-modal');
    this.helpModal = document.getElementById('help-modal');
    this.levelsModal = document.getElementById('levels-modal');
    
    this.btnPlay = document.getElementById('btn-play-game');
    this.btnHowTo = document.getElementById('btn-how-to');
    this.btnReset = document.getElementById('btn-reset');
    this.btnMute = document.getElementById('btn-mute');
    this.btnHelp = document.getElementById('btn-help');
    this.btnLevels = document.getElementById('btn-levels');
    
    this.btnNextLevel = document.getElementById('btn-next-level');
    this.btnReplay = document.getElementById('btn-replay');
    this.btnCloseHelp = document.getElementById('btn-close-help');
    this.btnDismissHelp = document.getElementById('btn-dismiss-help');
    this.btnCloseLevels = document.getElementById('btn-close-levels');

    this.logoBack = document.getElementById('logo-back');

    this.setupEventListeners();
    this.renderTutorialPreviews();
    this.updateMuteIcon();
  }

  setupEventListeners() {
    // Start Game Action
    this.btnPlay.addEventListener('click', () => {
      this.initAudio();
      this.startScreen.classList.remove('active');
      this.gameContainer.classList.remove('hidden');
      this.loadLevel(this.currentLevelIndex);
      window.gameAudio.playStart();
    });

    this.logoBack.addEventListener('click', () => {
      this.initAudio();
      this.startScreen.classList.add('active');
      this.gameContainer.classList.add('hidden');
      this.stopTimer();
    });

    this.btnHowTo.addEventListener('click', () => {
      this.initAudio();
      this.openModal(this.helpModal);
    });

    // In-game HUD actions
    this.btnReset.addEventListener('click', () => {
      if (this.isLevelComplete) return;
      this.initAudio();
      window.gameAudio.playClick();
      this.loadLevel(this.currentLevelIndex);
    });

    this.btnMute.addEventListener('click', () => {
      this.initAudio();
      const isMuted = window.gameAudio.toggleMute();
      this.updateMuteIcon();
    });

    this.btnHelp.addEventListener('click', () => {
      this.initAudio();
      window.gameAudio.playClick();
      this.openModal(this.helpModal);
    });

    this.btnLevels.addEventListener('click', () => {
      this.initAudio();
      window.gameAudio.playClick();
      this.renderLevelsGrid();
      this.openModal(this.levelsModal);
    });

    // Modal Close actions
    this.btnCloseHelp.addEventListener('click', () => { this.closeModal(this.helpModal); });
    this.btnDismissHelp.addEventListener('click', () => { this.closeModal(this.helpModal); });
    this.btnCloseLevels.addEventListener('click', () => { this.closeModal(this.levelsModal); });

    // Victory actions
    this.btnNextLevel.addEventListener('click', () => {
      this.closeModal(this.victoryModal);
      if (this.currentLevelIndex < LEVELS.length - 1) {
        this.currentLevelIndex++;
        this.loadLevel(this.currentLevelIndex);
      } else {
        // Wrap around or return to level selector
        this.renderLevelsGrid();
        this.openModal(this.levelsModal);
      }
    });

    this.btnReplay.addEventListener('click', () => {
      this.closeModal(this.victoryModal);
      this.loadLevel(this.currentLevelIndex);
    });

    // Close modals on clicking background overlay
    [this.helpModal, this.levelsModal].forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.closeModal(modal);
      });
    });
  }

  initAudio() {
    if (!this.audioInitiated) {
      window.gameAudio.init();
      this.audioInitiated = true;
    }
  }

  updateMuteIcon() {
    const isMuted = window.gameAudio.muted;
    if (isMuted) {
      document.querySelector('.icon-mute').classList.add('hidden');
      document.querySelector('.icon-unmute').classList.remove('hidden');
    } else {
      document.querySelector('.icon-mute').classList.remove('hidden');
      document.querySelector('.icon-unmute').classList.add('hidden');
    }
  }

  openModal(modal) {
    modal.classList.add('active');
  }

  closeModal(modal) {
    modal.classList.remove('active');
    if (this.audioInitiated) window.gameAudio.playClick();
  }

  loadLevel(levelIndex) {
    this.currentLevelIndex = levelIndex;
    const levelData = LEVELS[levelIndex];
    
    // Reset stage variables
    this.moves = 0;
    this.elapsedSeconds = 0;
    this.isLevelComplete = false;
    this.movesEl.textContent = '0';
    this.timerEl.textContent = '00:00';
    this.levelDisplayEl.textContent = String(levelData.id).padStart(2, '0');
    
    // Copy tiles representation and randomize rotation
    this.boardState = levelData.tiles.map((t, idx) => {
      // Scramble: keep locked tiles exactly as is, randomize rot (0-3) for others
      let scrambledRot = t.rot;
      if (!t.locked && t.type !== 'empty') {
        // Scramble unless it matches solved by luck, try to randomize
        scrambledRot = Math.floor(Math.random() * 4);
      }
      return {
        id: idx,
        type: t.type,
        rot: scrambledRot,
        locked: t.locked
      };
    });

    this.renderBoard();
    this.startTimer();
    this.solveCircuit();
  }

  renderBoard() {
    this.boardEl.innerHTML = '';
    
    this.boardState.forEach((tile, index) => {
      const cell = document.createElement('div');
      cell.className = 'tile-cell';
      cell.dataset.index = index;
      
      if (tile.locked) {
        cell.classList.add('locked');
        // Add lock badge overlay
        const badge = document.createElement('div');
        badge.className = 'lock-badge';
        badge.innerHTML = `
          <svg viewBox="0 0 24 24" width="8" height="8">
            <path fill="currentColor" d="M18,8H17V6A5,5 0 0,0 12,1A5,5 0 0,0 7,6V8H6A2,2 0 0,0 4,10V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V10A2,2 0 0,0 18,8M9,6A3,3 0 0,1 12,3A3,3 0 0,1 15,6V8H9V6M12,17A2,2 0 1,1 14,15A2,2 0 0,1 12,17Z"/>
          </svg>`;
        cell.appendChild(badge);
      }
      
      const svgHTML = this.getTileSVG(tile.type);
      cell.insertAdjacentHTML('beforeend', svgHTML);
      
      const svgEl = cell.querySelector('.tile-svg');
      if (svgEl) {
        svgEl.style.transform = `rotate(${tile.rot * 90}deg)`;
      }

      // Interaction
      if (!tile.locked && tile.type !== 'empty') {
        cell.addEventListener('click', () => this.handleTileClick(index, cell));
      }

      this.boardEl.appendChild(cell);
    });
  }

  handleTileClick(index, cellEl) {
    if (this.isLevelComplete) return;
    
    this.initAudio();
    window.gameAudio.playClick();
    
    const tile = this.boardState[index];
    tile.rot = (tile.rot + 1) % 4;
    
    const svgEl = cellEl.querySelector('.tile-svg');
    if (svgEl) {
      svgEl.style.transform = `rotate(${tile.rot * 90}deg)`;
    }
    
    this.moves++;
    this.movesEl.textContent = this.moves;
    
    this.solveCircuit();
  }

  getTileSVG(type) {
    if (type === 'empty') {
      return `<svg class="tile-svg" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="3" fill="#2d2a4a" />
      </svg>`;
    }
    
    let paths = '';
    if (type === 'straight') {
      paths = `
        <path class="wire-core" d="M 0 50 L 100 50" />
        <path class="wire-backlight" d="M 0 50 L 100 50" />
        <path class="wire-glow-line" d="M 0 50 L 100 50" />
      `;
    } else if (type === 'corner') {
      paths = `
        <path class="wire-core" d="M 50 0 Q 50 50, 100 50" />
        <path class="wire-backlight" d="M 50 0 Q 50 50, 100 50" />
        <path class="wire-glow-line" d="M 50 0 Q 50 50, 100 50" />
      `;
    } else if (type === 'tee') {
      paths = `
        <path class="wire-core" d="M 0 50 L 100 50" />
        <path class="wire-core" d="M 50 50 L 50 0" />
        <path class="wire-backlight" d="M 0 50 L 100 50" />
        <path class="wire-backlight" d="M 50 50 L 50 0" />
        <path class="wire-glow-line" d="M 0 50 L 100 50" />
        <path class="wire-glow-line" d="M 50 50 L 50 0" />
      `;
    } else if (type === 'cross') {
      paths = `
        <path class="wire-core" d="M 0 50 L 100 50" />
        <path class="wire-core" d="M 50 0 L 50 100" />
        <path class="wire-backlight" d="M 0 50 L 100 50" />
        <path class="wire-backlight" d="M 50 0 L 50 100" />
        <path class="wire-glow-line" d="M 0 50 L 100 50" />
        <path class="wire-glow-line" d="M 50 0 L 50 100" />
      `;
    }
    
    return `<svg class="tile-svg" viewBox="0 0 100 100">${paths}</svg>`;
  }

  // Rotate a bitmask clockwise by a number of steps
  rotateMask(mask, steps) {
    steps = (steps % 4 + 4) % 4;
    let r = mask;
    for (let s = 0; s < steps; s++) {
      let n = 0;
      if (r & MASK_TOP) n |= MASK_RIGHT;
      if (r & MASK_RIGHT) n |= MASK_BOTTOM;
      if (r & MASK_BOTTOM) n |= MASK_LEFT;
      if (r & MASK_LEFT) n |= MASK_TOP;
      r = n;
    }
    return r;
  }

  getRotatedPorts(tileIndex) {
    const tile = this.boardState[tileIndex];
    if (!tile || tile.type === 'empty') return 0;
    return this.rotateMask(BASE_MASKS[tile.type], tile.rot);
  }

  solveCircuit() {
    // Nodes index mapping:
    // -1 = BAT_POS (+), -2 = BAT_NEG (-), -3 = BULB_IN, -4 = BULB_OUT
    // 0..15 = Grid Cells
    const graph = {};
    for (let i = -4; i <= 15; i++) {
      graph[i] = [];
    }

    // 1. Build edges between grid cells based on ports matching
    for (let i = 0; i < 16; i++) {
      const tile = this.boardState[i];
      if (tile.type === 'empty') continue;
      
      const r = Math.floor(i / 4);
      const c = i % 4;
      const ports = this.getRotatedPorts(i);

      // Check Top neighbor
      if ((ports & MASK_TOP) && r > 0) {
        const j = i - 4;
        const jPorts = this.getRotatedPorts(j);
        if (jPorts & MASK_BOTTOM) {
          graph[i].push(j);
        }
      }

      // Check Bottom neighbor
      if ((ports & MASK_BOTTOM) && r < 3) {
        const j = i + 4;
        const jPorts = this.getRotatedPorts(j);
        if (jPorts & MASK_TOP) {
          graph[i].push(j);
        }
      }

      // Check Left neighbor & External terminals
      if (ports & MASK_LEFT) {
        if (c > 0) {
          const j = i - 1;
          const jPorts = this.getRotatedPorts(j);
          if (jPorts & MASK_RIGHT) {
            graph[i].push(j);
          }
        } else {
          // Left border columns -> Battery
          if (r === 0) { // Positive terminal
            graph[i].push(-1);
            graph[-1].push(i);
          } else if (r === 3) { // Negative terminal
            graph[i].push(-2);
            graph[-2].push(i);
          }
        }
      }

      // Check Right neighbor & External bulb terminals
      if (ports & MASK_RIGHT) {
        if (c < 3) {
          const j = i + 1;
          const jPorts = this.getRotatedPorts(j);
          if (jPorts & MASK_LEFT) {
            graph[i].push(j);
          }
        } else {
          // Right border columns -> Bulb
          if (r === 1) { // Bulb inlet
            graph[i].push(-3);
            graph[-3].push(i);
          } else if (r === 2) { // Bulb outlet
            graph[i].push(-4);
            graph[-4].push(i);
          }
        }
      }
    }

    // 2. Solve paths using the linear-time path nodes solver (no exponential DFS recursion)
    // Solve short circuits first (path from Positive to Negative without the bulb)
    const shortCircuitNodes = this.findPathNodes(graph, -1, -2);
    const isShortCircuited = shortCircuitNodes.size > 0;
    
    // Solve bulb connection (path from Positive to Inlet, and Outlet to Negative)
    const bulbInNodes = this.findPathNodes(graph, -1, -3);
    const bulbOutNodes = this.findPathNodes(graph, -4, -2);
    
    // Alternately, check if current flows backward (S to BULB_OUT and BULB_IN to T)
    const bulbInNodesRev = this.findPathNodes(graph, -1, -4);
    const bulbOutNodesRev = this.findPathNodes(graph, -3, -2);
    
    let isBulbLit = false;
    const energizedTiles = new Set();
    const shortTiles = new Set();
    
    if (bulbInNodes.size > 0 && bulbOutNodes.size > 0) {
      isBulbLit = true;
      bulbInNodes.forEach(node => { if (node >= 0) energizedTiles.add(node); });
      bulbOutNodes.forEach(node => { if (node >= 0) energizedTiles.add(node); });
    } else if (bulbInNodesRev.size > 0 && bulbOutNodesRev.size > 0) {
      isBulbLit = true;
      bulbInNodesRev.forEach(node => { if (node >= 0) energizedTiles.add(node); });
      bulbOutNodesRev.forEach(node => { if (node >= 0) energizedTiles.add(node); });
    }
    
    if (isShortCircuited) {
      shortCircuitNodes.forEach(node => { if (node >= 0) shortTiles.add(node); });
    }

    // 4. Calculate static charge flow (partial paths for helpful visual feedback)
    // Find everything connected to Battery (+) without crossing the bulb filament
    const posReachable = this.findReachableNodes(graph, -1, new Set([-3, -4]));
    // Find everything connected to Battery (-) without crossing the bulb filament
    const negReachable = this.findReachableNodes(graph, -2, new Set([-3, -4]));

    // 5. Update DOM states for each cell
    const cellElements = this.boardEl.querySelectorAll('.tile-cell');
    cellElements.forEach((cell, idx) => {
      // Clear previous classes
      cell.classList.remove('energized', 'short-circuit', 'charged-pos', 'charged-neg');

      // Set priority: active loop -> short circuit -> static charge
      if (energizedTiles.has(idx)) {
        cell.classList.add('energized');
      } else if (shortTiles.has(idx)) {
        cell.classList.add('short-circuit');
      } else if (posReachable.has(idx)) {
        cell.classList.add('charged-pos');
      } else if (negReachable.has(idx)) {
        cell.classList.add('charged-neg');
      }
    });

    // 6. Update terminal flows
    this.updateTerminals(posReachable, negReachable, energizedTiles, shortTiles);

    // 7. Check Victory condition
    const batteryStatusText = document.getElementById('battery-status-text');
    const batteryPanel = document.querySelector('.battery-panel');
    const bulbPanel = document.querySelector('.bulb-panel');

    if (isBulbLit && !isShortCircuited) {
      // Complete!
      batteryStatusText.textContent = "LOOP ACTIVE";
      batteryPanel.classList.add('energized');
      bulbPanel.classList.add('energized');
      document.querySelector('.board-neon-outline').classList.add('energized');
      
      window.gameAudio.startHum();
      
      // Delay victory pop slightly for juice
      if (!this.isLevelComplete) {
        this.isLevelComplete = true;
        this.stopTimer();
        setTimeout(() => this.triggerVictory(), 2500);
      }
    } else {
      window.gameAudio.stopHum();
      batteryPanel.classList.remove('energized');
      bulbPanel.classList.remove('energized');
      document.querySelector('.board-neon-outline').classList.remove('energized');
      
      if (isShortCircuited) {
        batteryStatusText.textContent = "SHORT CIRCUIT";
        batteryPanel.classList.add('energized'); // lights up flashing red due to short circuit
      } else if (posReachable.size > 1 || negReachable.size > 1) {
        batteryStatusText.textContent = "CHARGING...";
      } else {
        batteryStatusText.textContent = "STANDBY";
      }
    }
  }

  updateTerminals(posReachable, negReachable, energizedTiles, shortTiles) {
    const posTerminal = document.querySelector('.terminal-pos');
    const negTerminal = document.querySelector('.terminal-neg');
    const bulbInTerminal = document.querySelector('.terminal-bulb-in');
    const bulbOutTerminal = document.querySelector('.terminal-bulb-out');

    // Positive battery terminal wires
    if (energizedTiles.has(0) || shortTiles.has(0) || posReachable.has(0)) {
      posTerminal.classList.add('energized');
    } else {
      posTerminal.classList.remove('energized');
    }

    // Negative battery terminal wires
    if (energizedTiles.has(12) || shortTiles.has(12) || negReachable.has(12)) {
      negTerminal.classList.add('energized');
    } else {
      negTerminal.classList.remove('energized');
    }

    // Bulb input terminal (cell 7)
    if (energizedTiles.has(7)) {
      bulbInTerminal.classList.add('energized');
    } else {
      bulbInTerminal.classList.remove('energized');
    }

    // Bulb output terminal (cell 11)
    if (energizedTiles.has(11)) {
      bulbOutTerminal.classList.add('energized');
    } else {
      bulbOutTerminal.classList.remove('energized');
    }
  }

  // Linear-time path-node solver using BFS reachability and leaf pruning
  findPathNodes(graph, source, target) {
    const reachableFromSource = new Set();
    const qSource = [source];
    const visitedSource = new Set([source]);
    while (qSource.length > 0) {
      const u = qSource.shift();
      reachableFromSource.add(u);
      for (const v of graph[u] || []) {
        if (!visitedSource.has(v)) {
          visitedSource.add(v);
          qSource.push(v);
        }
      }
    }

    if (!reachableFromSource.has(target)) {
      return new Set();
    }

    const reachableFromTarget = new Set();
    const qTarget = [target];
    const visitedTarget = new Set([target]);
    while (qTarget.length > 0) {
      const u = qTarget.shift();
      reachableFromTarget.add(u);
      for (const v of graph[u] || []) {
        if (!visitedTarget.has(v)) {
          visitedTarget.add(v);
          qTarget.push(v);
        }
      }
    }

    const pathNodes = new Set();
    for (const node of reachableFromSource) {
      if (reachableFromTarget.has(node)) {
        pathNodes.add(node);
      }
    }

    const subGraph = {};
    for (const u of pathNodes) {
      subGraph[u] = new Set();
      for (const v of graph[u] || []) {
        if (pathNodes.has(v)) {
          subGraph[u].add(v);
        }
      }
    }

    let changed = true;
    while (changed) {
      changed = false;
      const toRemove = [];
      for (const u of pathNodes) {
        if (u === source || u === target) continue;
        if (subGraph[u].size < 2) {
          toRemove.push(u);
        }
      }
      if (toRemove.length > 0) {
        changed = true;
        for (const u of toRemove) {
          pathNodes.delete(u);
          for (const v of subGraph[u]) {
            subGraph[v].delete(u);
          }
          delete subGraph[u];
        }
      }
    }

    return pathNodes;
  }

  // BFS to find all reachable nodes from a source, skipping blocked nodes
  findReachableNodes(graph, startNode, blockedNodes) {
    const reachable = new Set();
    const queue = [startNode];
    const visited = new Set([startNode]);

    while (queue.length > 0) {
      const node = queue.shift();
      if (node >= 0) reachable.add(node); // Only store grid tiles

      const neighbors = graph[node] || [];
      for (const neighbor of neighbors) {
        // Skip blocked nodes
        if (blockedNodes.has(neighbor)) continue;
        
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }
    return reachable;
  }

  triggerVictory() {
    window.gameAudio.playSuccess();
    
    // Save level stars
    const stars = this.calculateStars();
    this.levelRatings[this.currentLevelIndex] = Math.max(
      this.levelRatings[this.currentLevelIndex] || 0,
      stars
    );
    localStorage.setItem('voltloop_ratings', JSON.stringify(this.levelRatings));

    // Unlock next level
    if (this.currentLevelIndex < LEVELS.length - 1) {
      const nextIndex = this.currentLevelIndex + 1;
      if (!this.unlockedLevels.includes(nextIndex)) {
        this.unlockedLevels.push(nextIndex);
        localStorage.setItem('voltloop_unlocked', JSON.stringify(this.unlockedLevels));
      }
    }

    // Populate victory screen stats
    document.getElementById('victory-time').textContent = this.formatTime(this.elapsedSeconds);
    document.getElementById('victory-moves').textContent = this.moves;
    
    // Render stars in Victory overlay
    const starsContainer = document.getElementById('victory-stars');
    starsContainer.innerHTML = '';
    for (let i = 1; i <= 3; i++) {
      const isStarred = i <= stars;
      const star = document.createElement('div');
      star.style.transform = `scale(${isStarred ? 1 : 0.85})`;
      star.innerHTML = `
        <svg viewBox="0 0 24 24" class="star-svg ${isStarred ? '' : 'empty'}">
          <path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z"/>
        </svg>`;
      starsContainer.appendChild(star);
    }

    // Setup Next Level button visibility
    if (this.currentLevelIndex === LEVELS.length - 1) {
      this.btnNextLevel.textContent = "ALL TESTS COMPLETED";
    } else {
      this.btnNextLevel.textContent = "PROCEED TO NEXT TEST";
    }

    this.openModal(this.victoryModal);
  }

  calculateStars() {
    const levelData = LEVELS[this.currentLevelIndex];
    if (this.moves <= levelData.movesLimit) return 3;
    if (this.moves <= Math.ceil(levelData.movesLimit * 1.5)) return 2;
    return 1;
  }

  // Timer functions
  startTimer() {
    this.stopTimer();
    this.elapsedSeconds = 0;
    this.timerInterval = setInterval(() => {
      this.elapsedSeconds++;
      this.timerEl.textContent = this.formatTime(this.elapsedSeconds);
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  renderLevelsGrid() {
    const selectionGrid = document.getElementById('level-selection-grid');
    selectionGrid.innerHTML = '';

    LEVELS.forEach((level, idx) => {
      const card = document.createElement('div');
      const isUnlocked = this.unlockedLevels.includes(idx);
      card.className = `level-card ${isUnlocked ? 'unlocked' : 'locked'}`;

      const numEl = document.createElement('span');
      numEl.className = 'num';
      numEl.textContent = idx + 1;
      card.appendChild(numEl);

      if (isUnlocked) {
        const rating = this.levelRatings[idx] || 0;
        const starsEl = document.createElement('span');
        starsEl.className = 'stars';
        starsEl.textContent = '★'.repeat(rating) + '☆'.repeat(3 - rating);
        card.appendChild(starsEl);

        card.addEventListener('click', () => {
          this.closeModal(this.levelsModal);
          this.loadLevel(idx);
        });
      } else {
        const starsEl = document.createElement('span');
        starsEl.className = 'stars';
        starsEl.innerHTML = `
          <svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor">
            <path d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8H17V6A5,5 0 0,0 12,1A5,5 0 0,0 7,6V8H6A2,2 0 0,0 4,10V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V10A2,2 0 0,0 18,8M9,6A3,3 0 0,1 12,3A3,3 0 0,1 15,6V8H9V6Z"/>
          </svg>`;
        card.appendChild(starsEl);
      }

      selectionGrid.appendChild(card);
    });
  }

  renderTutorialPreviews() {
    const previewStyles = [
      { id: 'preview-straight', type: 'straight', rot: 0 },
      { id: 'preview-corner', type: 'corner', rot: 0 },
      { id: 'preview-tee', type: 'tee', rot: 0 },
      { id: 'preview-cross', type: 'cross', rot: 0 }
    ];

    previewStyles.forEach(item => {
      const container = document.getElementById(item.id);
      if (container) {
        container.innerHTML = this.getTileSVG(item.type);
        const svgEl = container.querySelector('.tile-svg');
        if (svgEl) {
          svgEl.style.transform = `rotate(${item.rot * 90}deg)`;
        }
        // Force energized style in the preview so they look glowing and attractive
        container.querySelector('.tile-svg').parentNode.classList.add('energized');
      }
    });
  }
}

// Instantiate and start engine
window.addEventListener('DOMContentLoaded', () => {
  const game = new GameEngine();
  game.init();
  window.gameEngine = game;
});
