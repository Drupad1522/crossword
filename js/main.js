/**
 * MAIN APPLICATION CONTROLLER
 * Orchestrates all modules and handles user interactions
 */

const App = {
  /**
   * Initialize the application
   */
  init() {
    console.log('🎯 Team Crossword Generator - Starting...');
    this.setupEventListeners();
    console.log('✅ Application ready');
  },

  /**
   * Setup all event listeners
   */
  setupEventListeners() {
    // Generate button
    const generateBtn = document.getElementById('generate-btn');
    generateBtn.addEventListener('click', () => this.handleGenerate());

    // New puzzle button
    const newPuzzleBtn = document.getElementById('new-puzzle-btn');
    newPuzzleBtn.addEventListener('click', () => this.handleNewPuzzle());

    // Enter key in textarea
    const textarea = document.getElementById('team-input');
    textarea.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'Enter') {
        this.handleGenerate();
      }
    });
  },

  /**
   * Handle generate puzzle button click
   */
  async handleGenerate() {
    console.log('📝 Generate button clicked');
    
    UIManager.hideError();
    
    // Get input
    const input = document.getElementById('team-input').value;
    
    // Validate input
    const validation = DataExtractor.validate(input);
    if (!validation.valid) {
      UIManager.showError(validation.error);
      return;
    }

    UIManager.showLoading();

    try {
      // Step 1: Extract data and words
      console.log('Step 1: Extracting data...');
      const { words, teamData, memberCount, wordCount } = DataExtractor.processTeamData(input);
      console.log(`✅ Extracted ${wordCount} words from ${memberCount} team members`);

      // Step 2: Generate AI clues
      console.log('Step 2: Generating AI clues...');
      const clueData = await AIClueGenerator.generateClues(words, teamData);
      console.log(`✅ Generated ${clueData.length} clues`);

      // Step 3: Build crossword grid
      console.log('Step 3: Building crossword grid...');
      const puzzle = GridEngine.buildGrid(clueData);
      console.log(`✅ Grid built: ${puzzle.grid.length}x${puzzle.grid[0].length}`);

      // Step 4: Validate grid
      const gridValidation = GridEngine.validateGrid(puzzle);
      if (!gridValidation.valid) {
        throw new Error(gridValidation.error);
      }

      // Step 5: Display puzzle
      console.log('Step 4: Displaying puzzle...');
      UIManager.displayPuzzle(puzzle);
      console.log('✅ Puzzle ready to play!');

    } catch (error) {
      console.error('❌ Error:', error);
      UIManager.showError(error.message || 'Failed to generate puzzle');
    } finally {
      UIManager.hideLoading();
    }
  },

  /**
   * Handle new puzzle button click
   */
  handleNewPuzzle() {
    console.log('🔄 Starting new puzzle');
    UIManager.resetToInput();
  }
};

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => App.init());
} else {
  App.init();
}

// Make available globally for debugging
window.App = App;