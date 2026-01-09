/**
 * AI CLUE GENERATOR MODULE - NO API KEY VERSION
 * Generates clues locally without any external API calls
 * Works 100% offline!
 */

const AIClueGenerator = {
  /**
   * Generate clues without API (local generation)
   * @param {Array} words - Array of words
   * @param {Object} teamData - Original team data
   * @returns {Promise<Array>} Array of {word, clue} objects
   */
  async generateClues(words, teamData) {
    console.log('🎯 Generating clues locally (no API)...');
    console.log('Words:', words);
    
    // Simulate processing time (makes it feel more realistic)
    await this.delay(1500);

    // Generate clues for each word
    const clueData = words.map(word => {
      const clue = this.generateClueForWord(word, teamData);
      return { word: word.toUpperCase(), clue };
    });

    console.log('✅ Generated', clueData.length, 'clues');
    return clueData;
  },

  /**
   * Generate a single clue for a word
   * @param {string} word - The word
   * @param {Object} teamData - Team context
   * @returns {string} Clue text
   */
  generateClueForWord(word, teamData) {
    word = word.toUpperCase();
    const length = word.length;
    
    // Try to find context from team data
    const contextClue = this.findContextClue(word, teamData);
    if (contextClue) {
      return contextClue;
    }

    // Check if it's a common tech term
    const techClue = this.getTechClue(word);
    if (techClue) {
      return techClue;
    }

    // Generate generic but clever clue
    return this.generateGenericClue(word, length);
  },

  /**
   * Find context-based clue from team data
   * @param {string} word - The word
   * @param {Object} teamData - Team data
   * @returns {string|null} Context clue or null
   */
  findContextClue(word, teamData) {
    const members = Array.isArray(teamData) 
      ? teamData 
      : (teamData.team || []);
    
    for (const member of members) {
      const memberName = member.name ? 
        member.name.toUpperCase().replace(/[^A-Z]/g, '') : '';
      
      // If word is a name
      if (memberName === word) {
        const clues = [];
        
        if (member.title) {
          clues.push(`${member.title} on the team (${word.length})`);
          clues.push(`Team's ${member.title.toLowerCase()} (${word.length})`);
          clues.push(`${member.title} named ${member.name} (${word.length})`);
        }
        
        if (member.skills) {
          const skills = Array.isArray(member.skills) ? member.skills : [member.skills];
          const skillList = skills.slice(0, 2).join(' and ');
          clues.push(`${skillList} expert (${word.length})`);
        }
        
        if (clues.length > 0) {
          return clues[Math.floor(Math.random() * clues.length)];
        }
      }

      // If word is a skill
      if (member.skills) {
        const skills = Array.isArray(member.skills) ? member.skills : [member.skills];
        for (const skill of skills) {
          const skillNorm = skill.toUpperCase().replace(/[^A-Z]/g, '');
          if (skillNorm === word && member.name) {
            return `${member.name}'s expertise (${word.length})`;
          }
        }
      }

      // If word is from title
      if (member.title) {
        const titleWords = member.title.split(/\s+/);
        for (const titleWord of titleWords) {
          const titleNorm = titleWord.toUpperCase().replace(/[^A-Z]/g, '');
          if (titleNorm === word && member.name) {
            return `${member.name}'s role (${word.length})`;
          }
        }
      }
    }

    return null;
  },

  /**
   * Get tech-specific clue
   * @param {string} word - The word
   * @returns {string|null} Tech clue or null
   */
  getTechClue(word) {
    const techClues = {
      // Programming Languages
      'PYTHON': 'Snake-named programming language (6)',
      'JAVASCRIPT': 'Web scripting language (10)',
      'JAVA': 'Coffee-inspired programming language (4)',
      'CSHARP': 'Microsoft\'s object-oriented language (6)',
      'RUBY': 'Gem of a programming language (4)',
      'PHP': 'Server-side scripting language (3)',
      'SWIFT': 'Apple\'s modern programming language (5)',
      'KOTLIN': 'Modern Android development language (6)',
      'RUST': 'Memory-safe systems language (4)',
      'GO': 'Google\'s compiled language (2)',
      'TYPESCRIPT': 'JavaScript with types (10)',
      
      // Frameworks & Libraries
      'REACT': 'Facebook\'s UI library (5)',
      'ANGULAR': 'Google\'s web framework (7)',
      'VUE': 'Progressive JavaScript framework (3)',
      'DJANGO': 'Python web framework (6)',
      'FLASK': 'Lightweight Python framework (5)',
      'LARAVEL': 'PHP framework for web artisans (7)',
      'RAILS': 'Ruby web framework (5)',
      'EXPRESS': 'Minimal Node.js framework (7)',
      'NEXTJS': 'React framework for production (6)',
      'SPRING': 'Java enterprise framework (6)',
      
      // Databases
      'MONGODB': 'NoSQL document database (7)',
      'POSTGRESQL': 'Advanced open source database (10)',
      'MYSQL': 'Popular relational database (5)',
      'REDIS': 'In-memory data structure store (5)',
      'SQLITE': 'Embedded database engine (6)',
      'ORACLE': 'Enterprise database system (6)',
      
      // DevOps & Cloud
      'DOCKER': 'Container platform (6)',
      'KUBERNETES': 'Container orchestration system (10)',
      'AWS': 'Amazon\'s cloud platform (3)',
      'AZURE': 'Microsoft\'s cloud service (5)',
      'GCP': 'Google Cloud Platform (3)',
      'JENKINS': 'Automation server (7)',
      'GITLAB': 'DevOps platform (6)',
      'GITHUB': 'Code hosting platform (6)',
      'TERRAFORM': 'Infrastructure as code (9)',
      'ANSIBLE': 'IT automation tool (7)',
      
      // Frontend
      'HTML': 'Markup language for web pages (4)',
      'CSS': 'Styling language for web (3)',
      'SASS': 'CSS preprocessor (4)',
      'WEBPACK': 'Module bundler (7)',
      'BABEL': 'JavaScript compiler (5)',
      'TAILWIND': 'Utility-first CSS framework (8)',
      
      // Design Tools
      'FIGMA': 'Collaborative design tool (5)',
      'SKETCH': 'Mac design application (6)',
      'PHOTOSHOP': 'Image editing software (9)',
      'ILLUSTRATOR': 'Vector graphics editor (11)',
      'XD': 'Adobe experience design (2)',
      
      // Project Management
      'JIRA': 'Project tracking tool (4)',
      'TRELLO': 'Visual task management (6)',
      'ASANA': 'Work management platform (5)',
      'SLACK': 'Team communication app (5)',
      'NOTION': 'All-in-one workspace (6)',
      
      // Methodologies
      'AGILE': 'Iterative development method (5)',
      'SCRUM': 'Agile framework (5)',
      'KANBAN': 'Visual workflow method (6)',
      'DEVOPS': 'Development and operations (6)',
      'CICD': 'Continuous integration and deployment (4)',
      
      // Testing
      'JEST': 'JavaScript testing framework (4)',
      'SELENIUM': 'Browser automation tool (8)',
      'CYPRESS': 'End-to-end testing tool (7)',
      'JUNIT': 'Java testing framework (5)',
      'PYTEST': 'Python testing framework (6)',
      
      // Version Control
      'GIT': 'Version control system (3)',
      'SVN': 'Subversion control system (3)',
      'MERCURIAL': 'Distributed version control (9)',
      
      // Web Servers
      'NGINX': 'High-performance web server (5)',
      'APACHE': 'HTTP server software (6)',
      'TOMCAT': 'Java servlet container (6)',
      
      // Operating Systems
      'LINUX': 'Open source operating system (5)',
      'UBUNTU': 'Popular Linux distribution (6)',
      'DEBIAN': 'Linux distribution (6)',
      'MACOS': 'Apple operating system (5)',
      'WINDOWS': 'Microsoft operating system (7)',
      
      // Mobile
      'ANDROID': 'Google\'s mobile OS (7)',
      'IOS': 'Apple\'s mobile platform (3)',
      'FLUTTER': 'Cross-platform UI toolkit (7)',
      
      // Others
      'API': 'Application programming interface (3)',
      'REST': 'Web service architecture (4)',
      'GRAPHQL': 'Query language for APIs (7)',
      'JSON': 'Data interchange format (4)',
      'XML': 'Markup language (3)',
      'YAML': 'Human-readable data format (4)',
      'NODE': 'JavaScript runtime (4)',
      'NPM': 'Node package manager (3)',
      'YARN': 'Package manager (4)'
    };

    return techClues[word] || null;
  },

  /**
   * Generate generic but clever clue
   * @param {string} word - The word
   * @param {number} length - Word length
   * @returns {string} Generic clue
   */
  generateGenericClue(word, length) {
    const templates = [
      `Team member or skill (${length})`,
      `Key expertise on the team (${length})`,
      `Important team capability (${length})`,
      `Essential team element (${length})`,
      `Team's ${word.toLowerCase()} (${length})`,
      `Valued team attribute (${length})`,
      `Critical team component (${length})`
    ];

    return templates[Math.floor(Math.random() * templates.length)];
  },

  /**
   * Simulate delay (makes it feel more realistic)
   * @param {number} ms - Milliseconds to wait
   * @returns {Promise}
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * Test function (always returns true for mock)
   * @returns {Promise<boolean>}
   */
  async testConnection() {
    console.log('✅ Using local clue generation (no API required)');
    return true;
  }
};

// Make available globally
window.AIClueGenerator = AIClueGenerator;
