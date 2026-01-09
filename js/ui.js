/**
 * UI MANAGER MODULE
 * Handles all DOM manipulation and user interface updates
 */

const UIManager = {
  // Current puzzle state
  currentPuzzle: null,
  userAnswers: {},

  /**
   * Show error message
   * @param {string} message - Error message to display
   */
  showError(message) {
    const errorBox = document.getElementById('error-message');
    errorBox.textContent = message;
    errorBox.classList.remove('hidden');
  },

  /**
   * Hide error message
   */
  hideError() {
    const errorBox = document.getElementById('error-message');
    errorBox.classList.add('hidden');
  },

  /**
   * Show loading state on generate button
   */
  showLoading() {
    const btn = document.getElementById('generate-btn');
    const btnText = document.getElementById('btn-text');
    const btnLoader = document.getElementById('btn-loader');
    
    btn.disabled = true;
    btnText.classList.add('hidden');
    btnLoader.classList.remove('hidden');
  },

  /**
   * Hide loading state on generate button
   */
  hideLoading() {
    const btn = document.getElementById('generate-btn');
    const btnText = document.getElementById('btn-text');
    const btnLoader = document.getElementById('btn-loader');
    
    btn.disabled = false;
    btnText.classList.remove('hidden');
    btnLoader.classList.add('hidden');
  },

  /**
   * Switch between input and puzzle screens
   * @param {string} screen - 'input' or 'puzzle'
   */
  switchScreen(screen) {
    document.getElementById('input-screen').classList.remove('active');
    document.getElementById('puzzle-screen').classList.remove('active');
    
    if (screen === 'input') {
      document.getElementById('input-screen').classList.add('active');
    } else if (screen === 'puzzle') {
      document.getElementById('puzzle-screen').classList.add('active');
    }
  },

  /**
   * Render crossword grid
   * @param {Array} grid - 2D grid array
   * @param {Array} placements - Word placements
   */
  renderGrid(grid, placements) {
    const gridContainer = document.getElementById('crossword-grid');
    gridContainer.innerHTML = '';

    grid.forEach((row, r) => {
      const rowDiv = document.createElement('div');
      rowDiv.className = 'grid-row';

      row.forEach((cell, c) => {
        const cellDiv = document.createElement('div');
        cellDiv.className = 'grid-cell';

        if (cell === null) {
          cellDiv.classList.add('empty');
          rowDiv.appendChild(cellDiv);
          return;
        }

        // Check if this cell is the start of a word
        const placement = placements.find(p => p.row === r && p.col === c);
        
        if (placement) {
          const number = document.createElement('span');
          number.className = 'grid-cell-number';
          number.textContent = placement.number;
          cellDiv.appendChild(number);
        }

        // Create input
        const input = document.createElement('input');
        input.type = 'text';
        input.maxLength = 1;
        input.dataset.row = r;
        input.dataset.col = c;
        input.dataset.answer = cell;
        
        const key = `${r},${c}`;
        if (this.userAnswers[key]) {
          input.value = this.userAnswers[key];
          this.updateCellValidation(input);
        }

        input.addEventListener('input', (e) => this.handleCellInput(e));
        input.addEventListener('keydown', (e) => this.handleCellNavigation(e));

        cellDiv.appendChild(input);
        rowDiv.appendChild(cellDiv);
      });

      gridContainer.appendChild(rowDiv);
    });
  },

  /**
   * Render clues
   * @param {Array} placements - Word placements with clues
   */
  renderClues(placements) {
    const acrossContainer = document.getElementById('across-clues');
    const downContainer = document.getElementById('down-clues');
    
    acrossContainer.innerHTML = '';
    downContainer.innerHTML = '';

    const across = placements.filter(p => p.direction === 'across');
    const down = placements.filter(p => p.direction === 'down');

    across.forEach(p => {
      const clueDiv = document.createElement('div');
      clueDiv.className = 'clue-item';
      clueDiv.innerHTML = `<span class="clue-number">${p.number}.</span> ${p.clue}`;
      acrossContainer.appendChild(clueDiv);
    });

    down.forEach(p => {
      const clueDiv = document.createElement('div');
      clueDiv.className = 'clue-item';
      clueDiv.innerHTML = `<span class="clue-number">${p.number}.</span> ${p.clue}`;
      downContainer.appendChild(clueDiv);
    });
  },

  /**
   * Handle user input in a cell
   * @param {Event} event - Input event
   */
  handleCellInput(event) {
    const input = event.target;
    const row = input.dataset.row;
    const col = input.dataset.col;
    const key = `${row},${col}`;

    // Sanitize input (uppercase letters only)
    let value = input.value.toUpperCase().replace(/[^A-Z]/g, '');
    input.value = value;

    // Store answer
    this.userAnswers[key] = value;

    // Update cell styling
    this.updateCellValidation(input);

    // Update progress
    this.updateProgress();

    // Auto-advance to next cell
    if (value.length === 1) {
      this.focusNextCell(input);
    }
  },

  /**
   * Update cell validation styling
   * @param {HTMLElement} input - Input element
   */
  updateCellValidation(input) {
    const correct = input.dataset.answer;
    const userValue = input.value;

    input.classList.remove('correct', 'incorrect');

    if (userValue.length > 0) {
      if (userValue === correct) {
        input.classList.add('correct');
      } else {
        input.classList.add('incorrect');
      }
    }
  },

  /**
   * Handle keyboard navigation
   * @param {Event} event - Keydown event
   */
  handleCellNavigation(event) {
    const input = event.target;
    const row = parseInt(input.dataset.row);
    const col = parseInt(input.dataset.col);

    let targetRow = row;
    let targetCol = col;

    switch(event.key) {
      case 'ArrowUp':
        targetRow = row - 1;
        event.preventDefault();
        break;
      case 'ArrowDown':
        targetRow = row + 1;
        event.preventDefault();
        break;
      case 'ArrowLeft':
        targetCol = col - 1;
        event.preventDefault();
        break;
      case 'ArrowRight':
        targetCol = col + 1;
        event.preventDefault();
        break;
      case 'Backspace':
        if (input.value === '') {
          this.focusPreviousCell(input);
          event.preventDefault();
        }
        return;
      default:
        return;
    }

    const targetInput = document.querySelector(
      `input[data-row="${targetRow}"][data-col="${targetCol}"]`
    );
    
    if (targetInput) {
      targetInput.focus();
      targetInput.select();
    }
  },

  /**
   * Focus next cell (right, then down)
   * @param {HTMLElement} currentInput - Current input element
   */
  focusNextCell(currentInput) {
    const row = parseInt(currentInput.dataset.row);
    const col = parseInt(currentInput.dataset.col);

    // Try right first
    let nextInput = document.querySelector(
      `input[data-row="${row}"][data-col="${col + 1}"]`
    );

    // If no cell to the right, try down and leftmost
    if (!nextInput) {
      nextInput = document.querySelector(
        `input[data-row="${row + 1}"][data-col="0"]`
      );
    }

    if (nextInput) {
      nextInput.focus();
      nextInput.select();
    }
  },

  /**
   * Focus previous cell
   * @param {HTMLElement} currentInput - Current input element
   */
  focusPreviousCell(currentInput) {
    const row = parseInt(currentInput.dataset.row);
    const col = parseInt(currentInput.dataset.col);

    const prevInput = document.querySelector(
      `input[data-row="${row}"][data-col="${col - 1}"]`
    );

    if (prevInput) {
      prevInput.focus();
      prevInput.select();
    }
  },

  /**
   * Calculate and update progress display
   */
  updateProgress() {
    if (!this.currentPuzzle) return;

    let correct = 0;
    let total = 0;

    this.currentPuzzle.grid.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell !== null) {
          total++;
          const key = `${r},${c}`;
          if (this.userAnswers[key] === cell) {
            correct++;
          }
        }
      });
    });

    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

    document.getElementById('progress-percentage').textContent = `${percentage}%`;
    document.getElementById('progress-detail').textContent = `${correct} / ${total}`;
  },

  /**
   * Display puzzle
   * @param {Object} puzzle - {grid, placements}
   */
  displayPuzzle(puzzle) {
    this.currentPuzzle = puzzle;
    this.userAnswers = {};
    
    this.renderGrid(puzzle.grid, puzzle.placements);
    this.renderClues(puzzle.placements);
    this.updateProgress();
    this.switchScreen('puzzle');
  },

  /**
   * Reset to input screen
   */
  resetToInput() {
    this.currentPuzzle = null;
    this.userAnswers = {};
    document.getElementById('team-input').value = '';
    this.hideError();
    this.switchScreen('input');
  }
};

// Make available globally
window.UIManager = UIManager;