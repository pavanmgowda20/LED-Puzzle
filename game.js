/**
 * VoltLoop - The LED Circuit Connection Puzzle
 * Sliding Circuit Puzzle Engine with Instant Relayathon Timer Saving
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

// 10 Curated and 100% Verified Solvable Levels with Sliding Scrambling (Graduated Difficulty)
const LEVELS = [
  // Level 1: System Ignition (Easy - 2 empty slots, perimeter loop)
  {
    id: 1,
    name: "System Ignition",
    difficulty: "easy",
    emptySlots: [5, 6],
    scrambleMoves: 14,
    movesLimit: 14,
    tiles: [
      { type: 'straight', rot: 0 }, { type: 'straight', rot: 0 }, { type: 'straight', rot: 0 }, { type: 'corner', rot: 2 },
      { type: 'straight', rot: 1 }, { type: 'empty', rot: 0 },    { type: 'empty', rot: 0 },    { type: 'corner', rot: 0 },
      { type: 'straight', rot: 1 }, { type: 'corner', rot: 0 },   { type: 'corner', rot: 1 },   { type: 'corner', rot: 1 },
      { type: 'straight', rot: 0 }, { type: 'straight', rot: 0 }, { type: 'straight', rot: 0 }, { type: 'corner', rot: 3 }
    ]
  },
  // Level 2: Stepped Conduit (Easy+ - 2 empty slots, interior conduit)
  {
    id: 2,
    name: "Stepped Conduit",
    difficulty: "easy",
    emptySlots: [2, 3],
    scrambleMoves: 18,
    movesLimit: 18,
    tiles: [
      { type: 'straight', rot: 0 }, { type: 'corner', rot: 2 },   { type: 'empty', rot: 0 },    { type: 'empty', rot: 0 },
      { type: 'corner', rot: 1 },   { type: 'corner', rot: 0 },   { type: 'straight', rot: 0 }, { type: 'straight', rot: 0 },
      { type: 'corner', rot: 0 },   { type: 'corner', rot: 3 },   { type: 'corner', rot: 1 },   { type: 'straight', rot: 0 },
      { type: 'straight', rot: 0 }, { type: 'straight', rot: 0 }, { type: 'corner', rot: 3 },   { type: 'corner', rot: 2 }
    ]
  },
  // Level 3: Serpentine Lane (Medium-Easy - 1 empty slot, S-curve)
  {
    id: 3,
    name: "Serpentine Lane",
    difficulty: "med",
    emptySlots: [3],
    scrambleMoves: 24,
    movesLimit: 22,
    tiles: [
      { type: 'straight', rot: 0 }, { type: 'straight', rot: 0 }, { type: 'corner', rot: 2 },   { type: 'empty', rot: 0 },
      { type: 'corner', rot: 1 },   { type: 'straight', rot: 1 }, { type: 'corner', rot: 0 },   { type: 'straight', rot: 0 },
      { type: 'corner', rot: 0 },   { type: 'corner', rot: 2 },   { type: 'corner', rot: 1 },   { type: 'straight', rot: 0 },
      { type: 'straight', rot: 0 }, { type: 'straight', rot: 0 }, { type: 'corner', rot: 3 },   { type: 'corner', rot: 1 }
    ]
  },
  // Level 4: Static Core (Medium - 1 empty slot, 1 locked obstacle at [1,1])
  {
    id: 4,
    name: "Static Core",
    difficulty: "med",
    emptySlots: [6],
    scrambleMoves: 28,
    movesLimit: 26,
    tiles: [
      { type: 'straight', rot: 0 }, { type: 'straight', rot: 0 }, { type: 'straight', rot: 0 }, { type: 'corner', rot: 2 },
      { type: 'straight', rot: 1 }, { type: 'corner', rot: 2, locked: true }, { type: 'empty', rot: 0 }, { type: 'corner', rot: 0 },
      { type: 'corner', rot: 1 },   { type: 'straight', rot: 0 }, { type: 'straight', rot: 0 }, { type: 'straight', rot: 0 },
      { type: 'corner', rot: 3 },   { type: 'straight', rot: 0 }, { type: 'straight', rot: 0 }, { type: 'corner', rot: 3 }
    ]
  },
  // Level 5: Split Junctions (Medium+ - Tee branches, 1 empty slot)
  {
    id: 5,
    name: "Split Junctions",
    difficulty: "med",
    emptySlots: [9],
    scrambleMoves: 32,
    movesLimit: 30,
    tiles: [
      { type: 'straight', rot: 0 }, { type: 'tee', rot: 2 },      { type: 'straight', rot: 0 }, { type: 'corner', rot: 2 },
      { type: 'straight', rot: 1 }, { type: 'corner', rot: 0 },   { type: 'corner', rot: 1 },   { type: 'corner', rot: 0 },
      { type: 'corner', rot: 2 },   { type: 'empty', rot: 0 },    { type: 'straight', rot: 1 }, { type: 'corner', rot: 1 },
      { type: 'straight', rot: 0 }, { type: 'straight', rot: 0 }, { type: 'straight', rot: 0 }, { type: 'corner', rot: 3 }
    ]
  },
  // Level 6: Twin Anchors (Hard - 2 locked obstacle tiles at 5 and 10)
  {
    id: 6,
    name: "Twin Anchors",
    difficulty: "hard",
    emptySlots: [6],
    scrambleMoves: 35,
    movesLimit: 32,
    tiles: [
      { type: 'straight', rot: 0 }, { type: 'straight', rot: 0 }, { type: 'straight', rot: 0 }, { type: 'corner', rot: 2 },
      { type: 'corner', rot: 1 },   { type: 'corner', rot: 2, locked: true }, { type: 'empty', rot: 0 }, { type: 'corner', rot: 0 },
      { type: 'corner', rot: 0 },   { type: 'straight', rot: 1 }, { type: 'corner', rot: 1, locked: true }, { type: 'corner', rot: 1 },
      { type: 'straight', rot: 0 }, { type: 'straight', rot: 0 }, { type: 'straight', rot: 0 }, { type: 'corner', rot: 3 }
    ]
  },
  // Level 7: Quantum Crossing (Hard+ - Cross junction, 1 empty slot)
  {
    id: 7,
    name: "Quantum Crossing",
    difficulty: "hard",
    emptySlots: [2],
    scrambleMoves: 38,
    movesLimit: 34,
    tiles: [
      { type: 'straight', rot: 0 }, { type: 'corner', rot: 2 },   { type: 'empty', rot: 0 },    { type: 'corner', rot: 2 },
      { type: 'straight', rot: 1 }, { type: 'corner', rot: 0 },   { type: 'cross', rot: 0 },    { type: 'straight', rot: 0 },
      { type: 'corner', rot: 0 },   { type: 'straight', rot: 1 }, { type: 'corner', rot: 1 },   { type: 'straight', rot: 0 },
      { type: 'straight', rot: 0 }, { type: 'straight', rot: 0 }, { type: 'corner', rot: 3 },   { type: 'corner', rot: 1 }
    ]
  },
  // Level 8: Decoy Labyrinth (Very Hard - Multiple decoys & corners, 1 empty slot)
  {
    id: 8,
    name: "Decoy Labyrinth",
    difficulty: "hard",
    emptySlots: [9],
    scrambleMoves: 40,
    movesLimit: 36,
    tiles: [
      { type: 'straight', rot: 0 }, { type: 'straight', rot: 0 }, { type: 'straight', rot: 0 }, { type: 'corner', rot: 2 },
      { type: 'corner', rot: 0 },   { type: 'tee', rot: 1 },      { type: 'corner', rot: 3 },   { type: 'corner', rot: 0 },
      { type: 'corner', rot: 2 },   { type: 'empty', rot: 0 },    { type: 'straight', rot: 1 }, { type: 'corner', rot: 1 },
      { type: 'straight', rot: 0 }, { type: 'straight', rot: 0 }, { type: 'straight', rot: 0 }, { type: 'corner', rot: 3 }
    ]
  },
  // Level 9: Voltage Relay (Expert - 1 locked obstacle, 2 tee tiles, 45 scramble moves)
  {
    id: 9,
    name: "Voltage Relay",
    difficulty: "expert",
    emptySlots: [6],
    scrambleMoves: 45,
    movesLimit: 40,
    tiles: [
      { type: 'straight', rot: 0 }, { type: 'tee', rot: 2 },      { type: 'tee', rot: 2 },      { type: 'corner', rot: 2 },
      { type: 'corner', rot: 1 },   { type: 'corner', rot: 0, locked: true }, { type: 'empty', rot: 0 }, { type: 'corner', rot: 0 },
      { type: 'corner', rot: 0 },   { type: 'straight', rot: 1 }, { type: 'corner', rot: 2 },   { type: 'corner', rot: 1 },
      { type: 'straight', rot: 0 }, { type: 'straight', rot: 0 }, { type: 'straight', rot: 0 }, { type: 'corner', rot: 3 }
    ]
  },
  // Level 10: Grand Prix Final (Grand Master - 1 locked cross, 50 scramble moves)
  {
    id: 10,
    name: "Grand Prix Final",
    difficulty: "expert",
    emptySlots: [5],
    scrambleMoves: 50,
    movesLimit: 44,
    tiles: [
      { type: 'straight', rot: 0 }, { type: 'straight', rot: 0 }, { type: 'straight', rot: 0 }, { type: 'corner', rot: 2 },
      { type: 'straight', rot: 1 }, { type: 'empty', rot: 0 },    { type: 'cross', rot: 0, locked: true }, { type: 'corner', rot: 0 },
      { type: 'corner', rot: 1 },   { type: 'corner', rot: 0 },   { type: 'corner', rot: 3 },   { type: 'corner', rot: 1 },
      { type: 'straight', rot: 0 }, { type: 'straight', rot: 0 }, { type: 'straight', rot: 0 }, { type: 'corner', rot: 3 }
    ]
  }
];

class GameEngine {
  constructor() {
    this.currentLevelIndex = 0;
    this.moves = 0;
    this.roundSeconds = 0; // Master 30:00 Relayathon round timer
    this.stageSeconds = 0; // Split timer for the active puzzle
    this.totalRoundMoves = 0; // Cumulative moves across all levels
    this.completedLevels = new Set(); // Set of solved level IDs
    this.checkpoint30MinTriggered = false; // Flag for automatic 30:00 storage
    this.timerInterval = null;
    this.boardState = []; // 16 slots: { tileId, type, rot, locked }
    this.tileElements = {}; // tileId -> DOM Element
    this.isLevelComplete = false;
    this.participantName = localStorage.getItem('voltloop_current_runner') || 'Runner 1';
    
    // Save progression in local storage
    this.unlockedLevels = JSON.parse(localStorage.getItem('voltloop_unlocked')) || [0];
    this.levelRatings = JSON.parse(localStorage.getItem('voltloop_ratings')) || {};
    this.savedTimes = JSON.parse(localStorage.getItem('voltloop_saved_times')) || [];

    this.audioInitiated = false;
    this.dragData = null;
  }

  init() {
    // Cache DOM Elements
    this.boardEl = document.getElementById('puzzle-board');
    this.movesEl = document.getElementById('moves-count');
    this.timerEl = document.getElementById('timer-display');
    this.stageTimerEl = document.getElementById('stage-timer-display');
    this.levelDisplayEl = document.getElementById('current-level-display');
    this.participantInput = document.getElementById('participant-name-input');
    
    this.startScreen = document.getElementById('start-screen');
    this.gameContainer = document.querySelector('.game-container');
    
    this.victoryModal = document.getElementById('victory-modal');
    this.helpModal = document.getElementById('help-modal');
    this.levelsModal = document.getElementById('levels-modal');
    this.savedTimesModal = document.getElementById('saved-times-modal');
    this.checkpointModal = document.getElementById('checkpoint-modal');

    this.victoryStageTime = document.getElementById('victory-stage-time');
    this.victoryRoundTime = document.getElementById('victory-round-time');
    
    this.btnPlay = document.getElementById('btn-play-game');
    this.btnHowTo = document.getElementById('btn-how-to');
    this.btnReset = document.getElementById('btn-reset');
    this.btnMute = document.getElementById('btn-mute');
    this.btnHelp = document.getElementById('btn-help');
    this.btnLevels = document.getElementById('btn-levels');
    this.btnSavedTimes = document.getElementById('btn-saved-times');
    
    this.btnNextLevel = document.getElementById('btn-next-level');
    this.btnReplay = document.getElementById('btn-replay');
    this.btnVictoryViewTimes = document.getElementById('btn-victory-view-times');
    this.btnCloseHelp = document.getElementById('btn-close-help');
    this.btnDismissHelp = document.getElementById('btn-dismiss-help');
    this.btnCloseLevels = document.getElementById('btn-close-levels');
    this.btnCloseSavedTimes = document.getElementById('btn-close-saved-times');
    this.btnExportTimes = document.getElementById('btn-export-times');
    this.btnClearTimes = document.getElementById('btn-clear-times');
    this.btnNewRound = document.getElementById('btn-new-round');

    this.btnCheckpointNext = document.getElementById('btn-checkpoint-next');
    this.btnCheckpointContinue = document.getElementById('btn-checkpoint-continue');

    this.logoBack = document.getElementById('logo-back');

    if (this.participantInput) {
      this.participantInput.value = this.participantName;
      this.participantInput.addEventListener('input', (e) => {
        this.participantName = e.target.value.trim() || 'Runner 1';
        localStorage.setItem('voltloop_current_runner', this.participantName);
      });
    }

    this.setupEventListeners();
    this.setupKeyboardControls();
    this.renderTutorialPreviews();
    this.updateMuteIcon();

    window.addEventListener('resize', () => {
      this.repositionAllTiles();
    });
  }

  setupEventListeners() {
    // Start Game Action - initializes fresh 30:00 round timer
    this.btnPlay.addEventListener('click', () => {
      this.initAudio();
      this.startScreen.classList.remove('active');
      this.gameContainer.classList.remove('hidden');
      this.loadLevel(this.currentLevelIndex, true); // true = reset round timer for new competition run
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

    // In-game HUD reset action - resets current puzzle board, but round timer continues!
    this.btnReset.addEventListener('click', () => {
      if (this.isLevelComplete) return;
      this.initAudio();
      window.gameAudio.playClick();
      this.loadLevel(this.currentLevelIndex, false); // false = keep competition round timer running!
      this.showToast('Stage reset. Round timer continues.');
    });

    this.btnMute.addEventListener('click', () => {
      this.initAudio();
      window.gameAudio.toggleMute();
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

    this.btnSavedTimes.addEventListener('click', () => {
      this.initAudio();
      window.gameAudio.playClick();
      this.renderSavedTimesTable();
      this.openModal(this.savedTimesModal);
    });

    // 30:00 Round Checkpoint actions
    if (this.btnCheckpointNext) {
      this.btnCheckpointNext.addEventListener('click', () => {
        this.closeModal(this.checkpointModal);
        if (this.currentLevelIndex < LEVELS.length - 1) {
          this.currentLevelIndex++;
          this.loadLevel(this.currentLevelIndex, false); // Timer continues running!
        } else {
          this.showToast('Already on the Grand Prix Final stage! Continuing stage...');
        }
      });
    }

    if (this.btnCheckpointContinue) {
      this.btnCheckpointContinue.addEventListener('click', () => {
        this.closeModal(this.checkpointModal);
        this.showToast('Continuing current puzzle. Timer is running.');
      });
    }

    // Modal Close actions
    this.btnCloseHelp.addEventListener('click', () => { this.closeModal(this.helpModal); });
    this.btnDismissHelp.addEventListener('click', () => { this.closeModal(this.helpModal); });
    this.btnCloseLevels.addEventListener('click', () => { this.closeModal(this.levelsModal); });
    this.btnCloseSavedTimes.addEventListener('click', () => { this.closeModal(this.savedTimesModal); });

    // Saved times actions
    this.btnExportTimes.addEventListener('click', () => {
      this.exportSavedTimes();
    });

    this.btnClearTimes.addEventListener('click', () => {
      if (confirm('Clear all recorded Relayathon times?')) {
        this.savedTimes = [];
        localStorage.removeItem('voltloop_saved_times');
        this.renderSavedTimesTable();
        this.showToast('All recorded times cleared.');
      }
    });

    if (this.btnNewRound) {
      this.btnNewRound.addEventListener('click', () => {
        if (confirm('Start a fresh 30:00 competition round? This resets the master timer to 00:00.')) {
          this.closeModal(this.savedTimesModal);
          this.loadLevel(0, true); // true = reset round timer to 00:00
          this.showToast('Fresh 30:00 Relayathon round started!');
        }
      });
    }

    // Victory actions - Timer CONTINUES running across stages!
    this.btnNextLevel.addEventListener('click', () => {
      this.closeModal(this.victoryModal);
      if (this.currentLevelIndex < LEVELS.length - 1) {
        this.currentLevelIndex++;
        this.loadLevel(this.currentLevelIndex, false); // Timer continues!
      } else {
        this.renderLevelsGrid();
        this.openModal(this.levelsModal);
      }
    });

    this.btnReplay.addEventListener('click', () => {
      this.closeModal(this.victoryModal);
      this.loadLevel(this.currentLevelIndex, false); // Timer continues!
    });

    this.btnVictoryViewTimes.addEventListener('click', () => {
      this.closeModal(this.victoryModal);
      this.renderSavedTimesTable();
      this.openModal(this.savedTimesModal);
    });

    // Close modals on clicking background overlay
    [this.helpModal, this.levelsModal, this.savedTimesModal, this.checkpointModal].forEach(modal => {
      if (!modal) return;
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.closeModal(modal);
      });
    });
  }

  setupKeyboardControls() {
    window.addEventListener('keydown', (e) => {
      if (this.isLevelComplete) return;
      if (this.startScreen.classList.contains('active')) return;
      if (document.querySelector('.modal-overlay.active')) return;
      if (document.activeElement && document.activeElement.tagName === 'INPUT') return;

      const empties = this.getEmptySlotIndices();
      if (empties.length === 0) return;

      let slideCandidate = null;

      // Check all available empty slots (handles boards with 2 empty spaces like Levels 1 & 2)
      for (const targetEmpty of empties) {
        const er = Math.floor(targetEmpty / 4);
        const ec = targetEmpty % 4;

        if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
          // Slide tile below targetEmpty UP into it
          if (er < 3 && this.boardState[targetEmpty + 4] && !this.boardState[targetEmpty + 4].locked && this.boardState[targetEmpty + 4].type !== 'empty') {
            slideCandidate = targetEmpty + 4;
            break;
          }
        } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
          // Slide tile above targetEmpty DOWN into it
          if (er > 0 && this.boardState[targetEmpty - 4] && !this.boardState[targetEmpty - 4].locked && this.boardState[targetEmpty - 4].type !== 'empty') {
            slideCandidate = targetEmpty - 4;
            break;
          }
        } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
          // Slide tile to the right of targetEmpty LEFT into it
          if (ec < 3 && this.boardState[targetEmpty + 1] && !this.boardState[targetEmpty + 1].locked && this.boardState[targetEmpty + 1].type !== 'empty') {
            slideCandidate = targetEmpty + 1;
            break;
          }
        } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
          // Slide tile to the left of targetEmpty RIGHT into it
          if (ec > 0 && this.boardState[targetEmpty - 1] && !this.boardState[targetEmpty - 1].locked && this.boardState[targetEmpty - 1].type !== 'empty') {
            slideCandidate = targetEmpty - 1;
            break;
          }
        }
      }

      if (slideCandidate !== null) {
        e.preventDefault();
        this.trySlide(slideCandidate);
      }
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
    if (modal) modal.classList.add('active');
  }

  closeModal(modal) {
    if (modal) modal.classList.remove('active');
    if (this.audioInitiated) window.gameAudio.playClick();
  }

  getEmptySlotIndices() {
    const res = [];
    for (let i = 0; i < 16; i++) {
      if (this.boardState[i] && this.boardState[i].type === 'empty') {
        res.push(i);
      }
    }
    return res;
  }

  loadLevel(levelIndex, resetRound = false) {
    this.currentLevelIndex = levelIndex;
    const levelData = LEVELS[levelIndex];
    
    // Reset stage variables
    this.moves = 0;
    this.stageSeconds = 0;
    this.isLevelComplete = false;
    this.movesEl.textContent = '0';
    if (this.stageTimerEl) this.stageTimerEl.textContent = '00:00';
    this.levelDisplayEl.textContent = String(levelData.id).padStart(2, '0');

    if (resetRound) {
      this.roundSeconds = 0;
      this.totalRoundMoves = 0;
      this.completedLevels.clear();
      this.checkpoint30MinTriggered = false;
      this.timerEl.textContent = '00:00';
      this.timerEl.classList.remove('overtime');
    }
    
    // 1. Construct initial solved state with unique tile IDs
    const baseTiles = levelData.tiles.map((t, idx) => ({
      tileId: `tile-${levelData.id}-${idx}`,
      type: t.type,
      rot: t.rot,
      locked: !!t.locked
    }));

    // 2. Scramble using valid slide moves to guarantee 100% mathematical solvability
    // and verify the scrambled board is NOT already lit upon start
    let scrambleAttempts = 0;
    do {
      this.boardState = this.scramblePuzzle(baseTiles, levelData.scrambleMoves + scrambleAttempts * 2);
      scrambleAttempts++;
    } while (this.checkIfBoardSolved(this.boardState) && scrambleAttempts < 10);

    // 3. Render Board DOM
    this.renderBoard();
    this.startTimer();
  }

  // Scramble puzzle via valid sliding moves (random walk from empty slot)
  scramblePuzzle(solvedTiles, numMoves) {
    const board = solvedTiles.map(t => ({ ...t }));
    let lastMoved = null;

    for (let m = 0; m < numMoves; m++) {
      // Find current empty slots
      const empties = [];
      for (let i = 0; i < 16; i++) {
        if (board[i].type === 'empty') empties.push(i);
      }

      if (empties.length === 0) break;
      const emptySlot = empties[Math.floor(Math.random() * empties.length)];
      const er = Math.floor(emptySlot / 4);
      const ec = emptySlot % 4;

      // Find valid adjacent non-locked, non-empty tiles
      const candidates = [];
      if (er > 0) candidates.push(emptySlot - 4);
      if (er < 3) candidates.push(emptySlot + 4);
      if (ec > 0) candidates.push(emptySlot - 1);
      if (ec < 3) candidates.push(emptySlot + 1);

      const validCandidates = candidates.filter(pos => 
        board[pos].type !== 'empty' && !board[pos].locked && pos !== lastMoved
      );

      // Fallback if all candidates filtered
      const pool = validCandidates.length > 0 ? validCandidates : candidates.filter(pos => 
        board[pos].type !== 'empty' && !board[pos].locked
      );

      if (pool.length === 0) continue;

      const chosenPos = pool[Math.floor(Math.random() * pool.length)];

      // Swap chosen tile with empty slot
      const temp = board[chosenPos];
      board[chosenPos] = board[emptySlot];
      board[emptySlot] = temp;
      lastMoved = emptySlot;
    }

    return board;
  }

  getMetrics() {
    const tileSize = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--tile-size')) || 80;
    const boardGap = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--board-gap')) || 8;
    return { tileSize, boardGap };
  }

  renderBoard() {
    this.boardEl.innerHTML = '';
    this.tileElements = {};

    // 1. Create Background Sockets Layer
    const socketsLayer = document.createElement('div');
    socketsLayer.className = 'board-sockets-layer';
    for (let i = 0; i < 16; i++) {
      const socketEl = document.createElement('div');
      socketEl.className = 'board-socket';
      socketEl.dataset.slot = i;
      socketsLayer.appendChild(socketEl);
    }
    this.boardEl.appendChild(socketsLayer);

    const { tileSize, boardGap } = this.getMetrics();

    // 2. Create movable tile pieces
    this.boardState.forEach((tile, slotIndex) => {
      if (tile.type === 'empty') return;

      const r = Math.floor(slotIndex / 4);
      const c = slotIndex % 4;
      const x = c * (tileSize + boardGap);
      const y = r * (tileSize + boardGap);

      const pieceEl = document.createElement('div');
      pieceEl.className = 'tile-piece';
      pieceEl.dataset.tileId = tile.tileId;
      pieceEl.dataset.slotIndex = slotIndex;
      pieceEl.style.transform = `translate(${x}px, ${y}px)`;

      if (tile.locked) {
        pieceEl.classList.add('locked');
        const badge = document.createElement('div');
        badge.className = 'lock-badge';
        badge.innerHTML = `
          <svg viewBox="0 0 24 24" width="8" height="8">
            <path fill="currentColor" d="M18,8H17V6A5,5 0 0,0 12,1A5,5 0 0,0 7,6V8H6A2,2 0 0,0 4,10V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V10A2,2 0 0,0 18,8M9,6A3,3 0 0,1 12,3A3,3 0 0,1 15,6V8H9V6M12,17A2,2 0 1,1 14,15A2,2 0 0,1 12,17Z"/>
          </svg>`;
        pieceEl.appendChild(badge);
      }

      // Wire SVG (Tile orientation is permanently fixed by level design!)
      const svgHTML = this.getTileSVG(tile.type);
      pieceEl.insertAdjacentHTML('beforeend', svgHTML);
      const svgEl = pieceEl.querySelector('.tile-svg');
      if (svgEl) {
        svgEl.style.transform = `rotate(${tile.rot * 90}deg)`;
      }

      // Interaction listeners: Click & Pointer Drag
      this.attachTileInteractions(pieceEl, tile);

      this.boardEl.appendChild(pieceEl);
      this.tileElements[tile.tileId] = pieceEl;
    });

    this.updateSlidableIndicators();
  }

  attachTileInteractions(pieceEl, tile) {
    if (tile.locked) return;

    let startX = 0;
    let startY = 0;
    let isPointerDown = false;

    pieceEl.addEventListener('pointerdown', (e) => {
      if (this.isLevelComplete) return;
      isPointerDown = true;
      startX = e.clientX;
      startY = e.clientY;
      pieceEl.setPointerCapture(e.pointerId);
    });

    pieceEl.addEventListener('pointerup', (e) => {
      if (!isPointerDown) return;
      isPointerDown = false;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const currentSlot = parseInt(pieceEl.dataset.slotIndex, 10);

      // If swipe gesture detected
      if (Math.hypot(dx, dy) > 20) {
        this.handleSwipe(currentSlot, dx, dy);
      } else {
        // Normal click slide
        this.trySlide(currentSlot);
      }
    });

    pieceEl.addEventListener('pointercancel', () => {
      isPointerDown = false;
    });
  }

  handleSwipe(slotIndex, dx, dy) {
    const r = Math.floor(slotIndex / 4);
    const c = slotIndex % 4;
    let targetSlot = null;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0 && c < 3) targetSlot = slotIndex + 1;
      else if (dx < 0 && c > 0) targetSlot = slotIndex - 1;
    } else {
      if (dy > 0 && r < 3) targetSlot = slotIndex + 4;
      else if (dy < 0 && r > 0) targetSlot = slotIndex - 4;
    }

    if (targetSlot !== null && this.boardState[targetSlot].type === 'empty') {
      this.trySlide(slotIndex);
    }
  }

  trySlide(clickedSlot) {
    if (this.isLevelComplete) return;
    const tile = this.boardState[clickedSlot];
    if (!tile || tile.locked || tile.type === 'empty') return;

    const empties = this.getEmptySlotIndices();
    if (empties.length === 0) return;

    const cr = Math.floor(clickedSlot / 4);
    const cc = clickedSlot % 4;

    // Check if clicked slot is in the same row or column as any empty slot
    let targetEmpty = null;
    let minDistance = Infinity;

    for (const emptySlot of empties) {
      const er = Math.floor(emptySlot / 4);
      const ec = emptySlot % 4;

      if (cr === er) {
        const dist = Math.abs(cc - ec);
        if (dist < minDistance) {
          minDistance = dist;
          targetEmpty = emptySlot;
        }
      } else if (cc === ec) {
        const dist = Math.abs(cr - er);
        if (dist < minDistance) {
          minDistance = dist;
          targetEmpty = emptySlot;
        }
      }
    }

    if (targetEmpty === null) return; // Not aligned with any empty slot

    const er = Math.floor(targetEmpty / 4);
    const ec = targetEmpty % 4;

    // Check for locked obstacles in the line of motion
    if (cr === er) {
      const step = cc < ec ? 1 : -1;
      for (let c = cc; c !== ec; c += step) {
        const slot = cr * 4 + c;
        if (this.boardState[slot].locked) return; // Blocked by locked tile!
      }

      // Execute row slide: shift all tiles between cc and ec towards ec
      this.executeSlideMove(clickedSlot, targetEmpty, 'row', step);
    } else if (cc === ec) {
      const step = cr < er ? 1 : -1;
      for (let r = cr; r !== er; r += step) {
        const slot = r * 4 + cc;
        if (this.boardState[slot].locked) return; // Blocked by locked tile!
      }

      // Execute column slide: shift all tiles between cr and er towards er
      this.executeSlideMove(clickedSlot, targetEmpty, 'col', step);
    }
  }

  executeSlideMove(clickedSlot, targetEmpty, direction, step) {
    this.initAudio();
    window.gameAudio.playSlide();

    const { tileSize, boardGap } = this.getMetrics();
    const cr = Math.floor(clickedSlot / 4);
    const cc = clickedSlot % 4;
    const er = Math.floor(targetEmpty / 4);
    const ec = targetEmpty % 4;

    if (direction === 'row') {
      // Shift tiles horizontally from ec - step down to cc
      for (let c = ec - step; c !== cc - step; c -= step) {
        const fromSlot = cr * 4 + c;
        const toSlot = fromSlot + step;
        this.moveTile(fromSlot, toSlot, tileSize, boardGap);
      }
      this.boardState[clickedSlot] = { tileId: null, type: 'empty', rot: 0, locked: false };
    } else {
      // Shift tiles vertically from er - step down to cr
      for (let r = er - step; r !== cr - step; r -= step) {
        const fromSlot = r * 4 + cc;
        const toSlot = fromSlot + step * 4;
        this.moveTile(fromSlot, toSlot, tileSize, boardGap);
      }
      this.boardState[clickedSlot] = { tileId: null, type: 'empty', rot: 0, locked: false };
    }

    this.moves++;
    this.movesEl.textContent = this.moves;

    this.updateSlidableIndicators();
    this.solveCircuit();
  }

  moveTile(fromSlot, toSlot, tileSize, boardGap) {
    const tile = this.boardState[fromSlot];
    this.boardState[toSlot] = tile;

    const el = this.tileElements[tile.tileId];
    if (el) {
      el.dataset.slotIndex = toSlot;
      const r = Math.floor(toSlot / 4);
      const c = toSlot % 4;
      const x = c * (tileSize + boardGap);
      const y = r * (tileSize + boardGap);
      el.style.transform = `translate(${x}px, ${y}px)`;
    }
  }

  repositionAllTiles() {
    const { tileSize, boardGap } = this.getMetrics();
    this.boardState.forEach((tile, slotIndex) => {
      if (tile.type === 'empty') return;
      const el = this.tileElements[tile.tileId];
      if (el) {
        const r = Math.floor(slotIndex / 4);
        const c = slotIndex % 4;
        const x = c * (tileSize + boardGap);
        const y = r * (tileSize + boardGap);
        el.style.transform = `translate(${x}px, ${y}px)`;
      }
    });
  }

  updateSlidableIndicators() {
    const empties = this.getEmptySlotIndices();
    const slidableSlots = new Set();

    empties.forEach(emptySlot => {
      const er = Math.floor(emptySlot / 4);
      const ec = emptySlot % 4;

      // Direct adjacent slots
      if (er > 0 && !this.boardState[emptySlot - 4].locked) slidableSlots.add(emptySlot - 4);
      if (er < 3 && !this.boardState[emptySlot + 4].locked) slidableSlots.add(emptySlot + 4);
      if (ec > 0 && !this.boardState[emptySlot - 1].locked) slidableSlots.add(emptySlot - 1);
      if (ec < 3 && !this.boardState[emptySlot + 1].locked) slidableSlots.add(emptySlot + 1);
    });

    Object.values(this.tileElements).forEach(el => {
      const slot = parseInt(el.dataset.slotIndex, 10);
      if (slidableSlots.has(slot)) {
        el.classList.add('slidable');
      } else {
        el.classList.remove('slidable');
      }
    });
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
      if (!tile || tile.type === 'empty') continue;
      
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

    // 2. Solve paths using linear-time path nodes solver
    const shortCircuitNodes = this.findPathNodes(graph, -1, -2);
    const isShortCircuited = shortCircuitNodes.size > 0;
    
    const bulbInNodes = this.findPathNodes(graph, -1, -3);
    const bulbOutNodes = this.findPathNodes(graph, -4, -2);
    
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

    // 3. Partial static charge flow
    const posReachable = this.findReachableNodes(graph, -1, new Set([-3, -4]));
    const negReachable = this.findReachableNodes(graph, -2, new Set([-3, -4]));

    // 4. Update DOM states for each tile element
    Object.values(this.tileElements).forEach(pieceEl => {
      const slot = parseInt(pieceEl.dataset.slotIndex, 10);
      pieceEl.classList.remove('energized', 'short-circuit', 'charged-pos', 'charged-neg');

      if (energizedTiles.has(slot)) {
        pieceEl.classList.add('energized');
      } else if (shortTiles.has(slot)) {
        pieceEl.classList.add('short-circuit');
      } else if (posReachable.has(slot)) {
        pieceEl.classList.add('charged-pos');
      } else if (negReachable.has(slot)) {
        pieceEl.classList.add('charged-neg');
      }
    });

    // 5. Update terminal flows
    this.updateTerminals(posReachable, negReachable, energizedTiles, shortTiles);

    // 6. Check Victory condition
    const batteryStatusText = document.getElementById('battery-status-text');
    const batteryPanel = document.querySelector('.battery-panel');
    const bulbPanel = document.querySelector('.bulb-panel');

    if (isBulbLit && !isShortCircuited) {
      batteryStatusText.textContent = "LOOP ACTIVE";
      batteryPanel.classList.add('energized');
      bulbPanel.classList.add('energized');
      document.querySelector('.board-neon-outline').classList.add('energized');
      
      window.gameAudio.startHum();
      
      // Save completion time immediately without stopping the 30:00 competition timer!
      if (!this.isLevelComplete) {
        this.isLevelComplete = true;
        this.completedLevels.add(LEVELS[this.currentLevelIndex].id);
        this.totalRoundMoves += this.moves;

        this.saveCompletionTime();
        setTimeout(() => this.triggerVictory(), 1600);
      }
    } else {
      window.gameAudio.stopHum();
      batteryPanel.classList.remove('energized');
      bulbPanel.classList.remove('energized');
      document.querySelector('.board-neon-outline').classList.remove('energized');
      
      if (isShortCircuited) {
        batteryStatusText.textContent = "SHORT CIRCUIT";
        batteryPanel.classList.add('energized');
      } else if (posReachable.size > 1 || negReachable.size > 1) {
        batteryStatusText.textContent = "CHARGING...";
      } else {
        batteryStatusText.textContent = "STANDBY";
      }
    }
  }

  // Save completion time immediately to localStorage for the relayathon records
  saveCompletionTime() {
    const levelData = LEVELS[this.currentLevelIndex];
    const stageTimeFormatted = this.formatTime(this.stageSeconds);
    const roundTimeFormatted = this.formatTime(this.roundSeconds);
    const now = new Date();
    
    const record = {
      id: `${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: 'level_complete',
      participant: this.participantName,
      levelId: levelData.id,
      levelName: levelData.name,
      timeFormatted: stageTimeFormatted, // Stage split time
      timeSeconds: this.stageSeconds,
      roundTimeFormatted: roundTimeFormatted, // Cumulative round time
      roundTimeSeconds: this.roundSeconds,
      moves: this.moves,
      totalRoundMoves: this.totalRoundMoves,
      timeString: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      dateString: now.toLocaleDateString([], { month: 'short', day: 'numeric' })
    };

    // Store in savedTimes array (prepend newest)
    this.savedTimes.unshift(record);
    localStorage.setItem('voltloop_saved_times', JSON.stringify(this.savedTimes));

    // Save star rating
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

    console.log(`[Relayathon Record Saved] ${this.participantName} | Level ${levelData.id} | Stage: ${stageTimeFormatted} | Round: ${roundTimeFormatted}`);
  }

  updateTerminals(posReachable, negReachable, energizedTiles, shortTiles) {
    const posTerminal = document.querySelector('.terminal-pos');
    const negTerminal = document.querySelector('.terminal-neg');
    const bulbInTerminal = document.querySelector('.terminal-bulb-in');
    const bulbOutTerminal = document.querySelector('.terminal-bulb-out');

    if (energizedTiles.has(0) || shortTiles.has(0) || posReachable.has(0)) {
      posTerminal.classList.add('energized');
    } else {
      posTerminal.classList.remove('energized');
    }

    if (energizedTiles.has(12) || shortTiles.has(12) || negReachable.has(12)) {
      negTerminal.classList.add('energized');
    } else {
      negTerminal.classList.remove('energized');
    }

    if (energizedTiles.has(7)) {
      bulbInTerminal.classList.add('energized');
    } else {
      bulbInTerminal.classList.remove('energized');
    }

    if (energizedTiles.has(11)) {
      bulbOutTerminal.classList.add('energized');
    } else {
      bulbOutTerminal.classList.remove('energized');
    }
  }

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

  findReachableNodes(graph, startNode, blockedNodes) {
    const reachable = new Set();
    const queue = [startNode];
    const visited = new Set([startNode]);

    while (queue.length > 0) {
      const node = queue.shift();
      if (node >= 0) reachable.add(node);

      const neighbors = graph[node] || [];
      for (const neighbor of neighbors) {
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
    
    const stars = this.calculateStars();

    // Populate victory screen stats
    if (this.victoryStageTime) {
      this.victoryStageTime.textContent = this.formatTime(this.stageSeconds);
    }
    if (this.victoryRoundTime) {
      this.victoryRoundTime.textContent = `${this.formatTime(this.roundSeconds)} / 30:00`;
    }
    document.getElementById('victory-moves').textContent = this.moves;
    
    // Render stars
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

    if (this.currentLevelIndex === LEVELS.length - 1) {
      this.btnNextLevel.textContent = "CHAMPIONSHIP COMPLETED";
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

  // Master Timer functions - 00:00 to 30:00 and continuous competition clock
  startTimer() {
    if (this.timerInterval) return; // Already running continuously
    this.timerInterval = setInterval(() => {
      this.roundSeconds++;
      this.stageSeconds++;
      
      this.timerEl.textContent = this.formatTime(this.roundSeconds);
      if (this.stageTimerEl) {
        this.stageTimerEl.textContent = this.formatTime(this.stageSeconds);
      }

      if (this.roundSeconds >= 1800) {
        this.timerEl.classList.add('overtime');
      }

      // Automatically store round details when timer hits exactly 30:00 (1800 seconds)
      if (this.roundSeconds === 1800 && !this.checkpoint30MinTriggered) {
        this.checkpoint30MinTriggered = true;
        this.trigger30MinCheckpoint();
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  // Automatic 30:00 milestone handler
  trigger30MinCheckpoint() {
    if (window.gameAudio && window.gameAudio.playCheckpoint) {
      window.gameAudio.playCheckpoint();
    }

    const levelData = LEVELS[this.currentLevelIndex];
    const now = new Date();
    const completedArr = Array.from(this.completedLevels).sort((a,b) => a - b);

    const record = {
      id: `checkpoint-30m-${Date.now()}`,
      type: '30min_checkpoint',
      participant: this.participantName,
      levelId: levelData.id,
      levelName: levelData.name,
      timeFormatted: this.formatTime(this.stageSeconds), // stage split at 30:00
      timeSeconds: this.stageSeconds,
      roundTimeFormatted: '30:00',
      roundTimeSeconds: 1800,
      moves: this.moves,
      totalRoundMoves: this.totalRoundMoves + this.moves,
      completedCount: completedArr.length,
      timeString: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      dateString: now.toLocaleDateString([], { month: 'short', day: 'numeric' })
    };

    // Prepend to savedTimes and commit immediately
    this.savedTimes.unshift(record);
    localStorage.setItem('voltloop_saved_times', JSON.stringify(this.savedTimes));

    // Populate Checkpoint Modal
    const runnerEl = document.getElementById('checkpoint-runner');
    const solvedCountEl = document.getElementById('checkpoint-solved-count');
    const stageEl = document.getElementById('checkpoint-current-stage');
    const movesEl = document.getElementById('checkpoint-total-moves');

    if (runnerEl) runnerEl.textContent = this.participantName;
    if (solvedCountEl) solvedCountEl.textContent = `${completedArr.length} / 10`;
    if (stageEl) stageEl.textContent = `Level ${levelData.id} (${levelData.name})`;
    if (movesEl) movesEl.textContent = this.totalRoundMoves + this.moves;

    this.openModal(this.checkpointModal);
    this.showToast('⏱ 30:00 REACHED: Round details automatically stored to Relayathon Log!');
  }

  checkIfBoardSolved(boardState) {
    const graph = {};
    for (let i = -4; i <= 15; i++) graph[i] = [];

    for (let i = 0; i < 16; i++) {
      const tile = boardState[i];
      if (!tile || tile.type === 'empty') continue;
      const r = Math.floor(i / 4);
      const c = i % 4;
      const ports = this.rotateMask(BASE_MASKS[tile.type], tile.rot);

      if ((ports & MASK_TOP) && r > 0) {
        const j = i - 4;
        const jP = this.rotateMask(BASE_MASKS[boardState[j].type], boardState[j].rot);
        if (jP & MASK_BOTTOM) graph[i].push(j);
      }
      if ((ports & MASK_BOTTOM) && r < 3) {
        const j = i + 4;
        const jP = this.rotateMask(BASE_MASKS[boardState[j].type], boardState[j].rot);
        if (jP & MASK_TOP) graph[i].push(j);
      }
      if (ports & MASK_LEFT) {
        if (c > 0) {
          const j = i - 1;
          const jP = this.rotateMask(BASE_MASKS[boardState[j].type], boardState[j].rot);
          if (jP & MASK_RIGHT) graph[i].push(j);
        } else {
          if (r === 0) { graph[i].push(-1); graph[-1].push(i); }
          else if (r === 3) { graph[i].push(-2); graph[-2].push(i); }
        }
      }
      if (ports & MASK_RIGHT) {
        if (c < 3) {
          const j = i + 1;
          const jP = this.rotateMask(BASE_MASKS[boardState[j].type], boardState[j].rot);
          if (jP & MASK_LEFT) graph[i].push(j);
        } else {
          if (r === 1) { graph[i].push(-3); graph[-3].push(i); }
          else if (r === 2) { graph[i].push(-4); graph[-4].push(i); }
        }
      }
    }

    const shortCircuitNodes = this.findPathNodes(graph, -1, -2);
    if (shortCircuitNodes.size > 0) return false;

    const bIn = this.findPathNodes(graph, -1, -3);
    const bOut = this.findPathNodes(graph, -4, -2);
    const bInRev = this.findPathNodes(graph, -1, -4);
    const bOutRev = this.findPathNodes(graph, -3, -2);

    return (bIn.size > 0 && bOut.size > 0) || (bInRev.size > 0 && bOutRev.size > 0);
  }

  formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  // Render Saved Times Modal with Stage and Round split times
  renderSavedTimesTable() {
    const tbody = document.getElementById('saved-times-tbody');
    const emptyNotice = document.getElementById('no-saved-times-msg');
    const totalRunsEl = document.getElementById('summary-total-runs');
    const totalTimeEl = document.getElementById('summary-total-time');
    const bestStageEl = document.getElementById('summary-best-stage');

    tbody.innerHTML = '';

    if (this.savedTimes.length === 0) {
      emptyNotice.classList.remove('hidden');
      totalRunsEl.textContent = '0';
      totalTimeEl.textContent = '00:00';
      bestStageEl.textContent = '--:--';
      return;
    }

    emptyNotice.classList.add('hidden');

    let minStageSeconds = Infinity;

    this.savedTimes.forEach((rec, idx) => {
      if (rec.timeSeconds && rec.timeSeconds < minStageSeconds && rec.type !== '30min_checkpoint') {
        minStageSeconds = rec.timeSeconds;
      }

      const isCheckpoint = rec.type === '30min_checkpoint';
      const typeBadge = isCheckpoint 
        ? `<span class="cyber-chip orange">30:00 MILESTONE</span>`
        : `<span class="cyber-chip cyan">STAGE CLEAR</span>`;

      const stageDisplay = isCheckpoint
        ? `L${rec.levelId} <span style="color:var(--accent-orange); font-size:0.75rem;">(${rec.completedCount || 0}/10 Done)</span>`
        : `Level ${rec.levelId} <span style="color:var(--text-muted); font-size:0.75rem;">(${this.escapeHTML(rec.levelName)})</span>`;

      const roundTimeDisplay = rec.roundTimeFormatted || rec.timeFormatted || '--:--';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${idx + 1}</td>
        <td>${typeBadge}</td>
        <td class="participant-cell">${this.escapeHTML(rec.participant || 'Runner')}</td>
        <td>${stageDisplay}</td>
        <td class="time-cell cyan">${rec.timeFormatted}</td>
        <td class="time-cell orange">${roundTimeDisplay}</td>
        <td>${rec.moves}</td>
        <td>${rec.dateString} ${rec.timeString}</td>
        <td><button class="del-btn" title="Delete record" data-id="${rec.id}">&times;</button></td>
      `;

      tr.querySelector('.del-btn').addEventListener('click', () => {
        this.deleteSavedRecord(rec.id);
      });

      tbody.appendChild(tr);
    });

    totalRunsEl.textContent = this.savedTimes.length;
    totalTimeEl.textContent = this.formatTime(this.roundSeconds);
    bestStageEl.textContent = minStageSeconds !== Infinity ? this.formatTime(minStageSeconds) : '--:--';
  }

  deleteSavedRecord(recordId) {
    this.savedTimes = this.savedTimes.filter(r => r.id !== recordId);
    localStorage.setItem('voltloop_saved_times', JSON.stringify(this.savedTimes));
    this.renderSavedTimesTable();
  }

  exportSavedTimes() {
    if (this.savedTimes.length === 0) {
      this.showToast('No saved records to export.');
      return;
    }

    let csvContent = "Rank,Type,Participant,Level,Level Name,Stage Time (mm:ss),Stage Time (Seconds),Round Time (mm:ss),Round Time (Seconds),Moves,Date,Time\n";
    this.savedTimes.forEach((r, idx) => {
      const type = r.type === '30min_checkpoint' ? '30Min Checkpoint' : 'Stage Clear';
      const roundSec = r.roundTimeSeconds || r.timeSeconds || 0;
      const roundFmt = r.roundTimeFormatted || r.timeFormatted || '';
      csvContent += `${idx + 1},"${type}","${r.participant}",${r.levelId},"${r.levelName}",${r.timeFormatted},${r.timeSeconds},"${roundFmt}",${roundSec},${r.moves},"${r.dateString}","${r.timeString}"\n`;
    });

    navigator.clipboard.writeText(csvContent).then(() => {
      this.showToast('Copied to Clipboard for Relayathon scoring!');
    }).catch(() => {
      this.showToast('Export created in memory.');
    });
  }

  showToast(msg) {
    let toast = document.getElementById('game-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'game-toast';
      toast.className = 'game-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2800);
  }

  escapeHTML(str) {
    return String(str).replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  renderLevelsGrid() {
    const selectionGrid = document.getElementById('level-selection-grid');
    selectionGrid.innerHTML = '';

    LEVELS.forEach((level, idx) => {
      const card = document.createElement('div');
      const isUnlocked = this.unlockedLevels.includes(idx);
      card.className = `level-card ${isUnlocked ? 'unlocked' : 'locked'}`;

      const diffBadge = document.createElement('span');
      diffBadge.className = `difficulty-badge ${level.difficulty || 'easy'}`;
      diffBadge.textContent = (level.difficulty || 'easy').toUpperCase();
      card.appendChild(diffBadge);

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
          this.loadLevel(idx, false); // false = keep timer running!
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
