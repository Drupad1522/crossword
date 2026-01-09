/**
 * DATA EXTRACTOR MODULE
 * Handles parsing JSON and extracting crossword words
 */

const DataExtractor = {
  /**
   * Parse team data from JSON string
   * @param {string} jsonString - Raw JSON input
   * @returns {Object} Parsed team data
   */
  parseJSON(jsonString) {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      throw new Error('Invalid JSON format. Please check your input.');
    }
  },

  /**
   * Extract team members array from various JSON formats
   * @param {Object} data - Parsed JSON data
   * @returns {Array} Array of team members
   */
  extractTeamMembers(data) {
    // Handle array format: [{"name": "Alice"}, ...]
    if (Array.isArray(data)) {
      return data;
    }
    
    // Handle object with 'team' property: {"team": [...]}
    if (data.team && Array.isArray(data.team)) {
      return data.team;
    }
    
    // Handle single member object: {"name": "Alice", ...}
    if (data.name) {
      return [data];
    }
    
    throw new Error('Unable to find team data in JSON. Expected array or {team: [...]}');
  },

  /**
   * Normalize a string into a valid crossword word
   * @param {string} text - Input text
   * @returns {string} Uppercase letters only
   */
  normalizeWord(text) {
    if (!text) return '';
    return text.toString().toUpperCase().replace(/[^A-Z]/g, '');
  },

  /**
   * Extract all valid crossword words from team data
   * @param {Array} members - Array of team member objects
   * @returns {Array} Array of unique words (min 3 letters)
   */
  extractWords(members) {
    const words = new Set();

    members.forEach(member => {
      // Extract name
      if (member.name) {
        const normalized = this.normalizeWord(member.name);
        if (normalized.length >= 3) {
          words.add(normalized);
        }
      }

      // Extract skills (handle both array and string)
      if (member.skills) {
        const skills = Array.isArray(member.skills) 
          ? member.skills 
          : [member.skills];
        
        skills.forEach(skill => {
          const normalized = this.normalizeWord(skill);
          if (normalized.length >= 3) {
            words.add(normalized);
          }
        });
      }

      // Extract title words (split multi-word titles)
      if (member.title) {
        const titleWords = member.title.split(/\s+/);
        titleWords.forEach(word => {
          const normalized = this.normalizeWord(word);
          if (normalized.length >= 3) {
            words.add(normalized);
          }
        });
      }

      // Optional: Extract from phone extensions (numbers removed by normalizeWord)
      // This is just for demonstration - usually we skip phone numbers
    });

    return Array.from(words);
  },

  /**
   * Main function: Process raw JSON input and return words
   * @param {string} jsonString - Raw JSON input
   * @returns {Object} {words: Array, teamData: Object}
   */
  processTeamData(jsonString) {
    // Step 1: Parse JSON
    const parsed = this.parseJSON(jsonString);
    
    // Step 2: Extract team members
    const members = this.extractTeamMembers(parsed);
    
    if (members.length === 0) {
      throw new Error('No team members found in the data.');
    }
    
    // Step 3: Extract words
    const words = this.extractWords(members);
    
    if (words.length < 2) {
      throw new Error('Need at least 2 valid words (3+ letters each) to create a crossword.');
    }
    
    return {
      words: words,
      teamData: parsed,
      memberCount: members.length,
      wordCount: words.length
    };
  },

  /**
   * Validate input before processing
   * @param {string} input - User input
   * @returns {Object} {valid: boolean, error: string}
   */
  validate(input) {
    if (!input || input.trim().length === 0) {
      return { valid: false, error: 'Please enter team data.' };
    }

    try {
      JSON.parse(input);
      return { valid: true };
    } catch (error) {
      return { 
        valid: false, 
        error: 'Invalid JSON format. Check for missing brackets, quotes, or commas.' 
      };
    }
  }
};

// Make available globally
window.DataExtractor = DataExtractor;