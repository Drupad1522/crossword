/**
 * CROSSWORD GRID ENGINE MODULE
 * Handles grid generation and word placement algorithm
 */

const GridEngine = {
  GRID_SIZE: 25, // Working grid size before trimming

  /**
   * Check if a word can be placed at given position
   * @param {Array} grid - 2D grid array
   * @param {string} word - Word to place
   * @param {number} row - Starting row
   * @param {number} col - Starting column
   * @param {boolean} isHorizontal - Direction
   * @returns {boolean} True if placement is valid
   */
  canPlaceWord(grid, word, row, col, isHorizontal) {
    const gridSize = grid.length;

    if (isHorizontal) {
      // Check bounds
      if (col + word.length > gridSize) return false;

      // Check each cell
      for (let i = 0; i < word.length; i++) {
        const c = col + i;
        const cell = grid[row][c];

        // Must be empty or matching letter
        if (cell !== null && cell !== word[i]) return false;

        // Check perpendicular neighbors (no touching words)
        if (cell === null) {
          if (row > 0 && grid[row - 1][c] !== null) return false;
          if (row < gridSize - 1 && grid[row + 1][c] !== null) return false;
        }
      }

      // Check word boundaries
      if (col > 0 && grid[row][col - 1] !== null) return false;
      if (col + word.length < gridSize && grid[row][col + word.length] !== null) return false;

      return true;
    } else {
      // Vertical placement
      if (row + word.length > gridSize) return false;

      for (let i = 0; i < word.length; i++) {
        const r = row + i;
        const cell = grid[r][col];

        if (cell !== null && cell !== word[i]) return false;

        if (cell === null) {
          if (col > 0 && grid[r][col - 1] !== null) return false;
          if (col < gridSize - 1 && grid[r][col + 1] !== null) return false;
        }
      }

      if (row > 0 && grid[row - 1][col] !== null) return false;
      if (row + word.length < gridSize && grid[row + word.length][col] !== null) return false;

      return true;
    }
  },

  /**
   * Place a word on the grid
   * @param {Array} grid - 2D grid array
   * @param {string} word - Word to place
   * @param {number} row - Starting row
   * @param {number} col - Starting column
   * @param {boolean} isHorizontal - Direction
   */
  placeWord(grid, word, row, col, isHorizontal) {
    if (isHorizontal) {
      for (let i = 0; i < word.length; i++) {
        grid[row][col + i] = word[i];
      }
    } else {
      for (let i = 0; i < word.length; i++) {
        grid[row + i][col] = word[i];
      }
    }
  },

  /**
   * Find all occurrences of a letter in the grid
   * @param {Array} grid - 2D grid array
   * @param {string} letter - Letter to find
   * @returns {Array} Array of {row, col} positions
   */
  findLetterPositions(grid, letter) {
    const positions = [];
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        if (grid[r][c] === letter) {
          positions.push({ row: r, col: c });
        }
      }
    }
    return positions;
  },

  /**
   * Trim grid to actual content with padding
   * @param {Array} grid - 2D grid array
   * @returns {Object} {grid: Array, offsets: {row, col}}
   */
  trimGrid(grid) {
    const gridSize = grid.length;
    let minRow = gridSize, maxRow = -1;
    let minCol = gridSize, maxCol = -1;

    // Find bounds
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (grid[r][c] !== null) {
          minRow = Math.min(minRow, r);
          maxRow = Math.max(maxRow, r);
          minCol = Math.min(minCol, c);
          maxCol = Math.max(maxCol, c);
        }
      }
    }

    // Add padding
    minRow = Math.max(0, minRow - 1);
    maxRow = Math.min(gridSize - 1, maxRow + 1);
    minCol = Math.max(0, minCol - 1);
    maxCol = Math.min(gridSize - 1, maxCol + 1);

    // Extract trimmed grid
    const trimmed = [];
    for (let r = minRow; r <= maxRow; r++) {
      trimmed.push(grid[r].slice(minCol, maxCol + 1));
    }

    return {
      grid: trimmed,
      offsets: { row: minRow, col: minCol }
    };
  },

  /**
   * Build crossword grid from clue data
   * @param {Array} clueData - Array of {word, clue} objects
   * @returns {Object} {grid: Array, placements: Array}
   */
  buildGrid(clueData) {
    // Sort by length (longest first for better interlocking)
    const sorted = [...clueData].sort((a, b) => b.word.length - a.word.length);

    // Initialize grid
    const grid = Array(this.GRID_SIZE)
      .fill(null)
      .map(() => Array(this.GRID_SIZE).fill(null));

    const placements = [];
    let clueNumber = 1;

    // Place first word horizontally in center
    const firstWord = sorted[0].word.toUpperCase();
    const centerRow = Math.floor(this.GRID_SIZE / 2);
    const centerCol = Math.floor((this.GRID_SIZE - firstWord.length) / 2);

    this.placeWord(grid, firstWord, centerRow, centerCol, true);
    placements.push({
      word: firstWord,
      clue: sorted[0].clue,
      row: centerRow,
      col: centerCol,
      direction: 'across',
      number: clueNumber++
    });

    // Place remaining words
    for (let w = 1; w < sorted.length; w++) {
      const word = sorted[w].word.toUpperCase();
      let placed = false;

      // Try to intersect with existing letters
      for (let i = 0; i < word.length && !placed; i++) {
        const letter = word[i];
        const positions = this.findLetterPositions(grid, letter);

        for (const pos of positions) {
          if (placed) break;

          // Try vertical placement
          const vRow = pos.row - i;
          if (this.canPlaceWord(grid, word, vRow, pos.col, false)) {
            this.placeWord(grid, word, vRow, pos.col, false);
            placements.push({
              word,
              clue: sorted[w].clue,
              row: vRow,
              col: pos.col,
              direction: 'down',
              number: clueNumber++
            });
            placed = true;
            break;
          }

          // Try horizontal placement
          const hCol = pos.col - i;
          if (this.canPlaceWord(grid, word, pos.row, hCol, true)) {
            this.placeWord(grid, word, pos.row, hCol, true);
            placements.push({
              word,
              clue: sorted[w].clue,
              row: pos.row,
              col: hCol,
              direction: 'across',
              number: clueNumber++
            });
            placed = true;
            break;
          }
        }
      }

      if (!placed) {
        console.warn(`Could not place word: ${word}`);
      }
    }

    // Trim grid
    const { grid: trimmedGrid, offsets } = this.trimGrid(grid);

    // Adjust placement coordinates
    placements.forEach(p => {
      p.row -= offsets.row;
      p.col -= offsets.col;
    });

    return {
      grid: trimmedGrid,
      placements: placements
    };
  },

  /**
   * Validate grid structure
   * @param {Object} puzzle - {grid, placements}
   * @returns {Object} {valid: boolean, error: string}
   */
  validateGrid(puzzle) {
    if (!puzzle.grid || puzzle.grid.length === 0) {
      return { valid: false, error: 'Grid is empty' };
    }

    if (!puzzle.placements || puzzle.placements.length === 0) {
      return { valid: false, error: 'No words placed' };
    }

    return { valid: true };
  }
};

// Make available globally
window.GridEngine = GridEngine;