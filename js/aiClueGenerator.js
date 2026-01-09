/**
 * AI CLUE GENERATOR MODULE
 * Handles all AI API calls for generating crossword clues
 */

const AIClueGenerator = {
  // API Configuration
  API_URL: 'https://api.groq.com/openai/v1/chat/completions',
  MODEL: 'openai/gpt-oss-120b',
  MAX_TOKENS: 1000,
  
  // ⚠️ IMPORTANT: Add your API key here
  // Get it from: https://console.anthropic.com/
API_KEY: 'gsk_xxxxxxxxxxxxxxxxxx',

  /**
   * Build the prompt for Claude AI
   */
  buildPrompt(words, teamData) {
    const context = JSON.stringify(teamData, null, 2);
    
    return `You are a professional crossword puzzle creator. Generate clever, concise crossword clues for a team-based puzzle.

TEAM DATA CONTEXT:
${context}

WORDS TO CREATE CLUES FOR:
${words.join(', ')}

REQUIREMENTS:
1. Each clue should be 5-12 words maximum
2. Make clues clever but solvable (reference the person's role, skill usage, or context from the team data)
3. Use crossword conventions: wordplay, definitions, cryptic hints, puns
4. DO NOT use the word itself in the clue
5. End each clue with the word length in parentheses, e.g., "(5)" for a 5-letter word
6. Make clues fun and engaging - this is for team building!

RESPONSE FORMAT:
Return ONLY a JSON array with this EXACT structure (no markdown, no backticks, no explanation):

[
  {"word": "ALICE", "clue": "Python expert who leads the backend team (5)"},
  {"word": "REACT", "clue": "Facebook's UI library for modern interfaces (5)"}
]

CRITICAL: Return ONLY the JSON array. No markdown formatting, no \`\`\`json\`\`\`, no additional text.`;
  },

  /**
   * Call Claude AI API
   */
  async callAPI(prompt) {
    // Check if API key is set
    if (!this.API_KEY || this.API_KEY === 'YOUR_API_KEY_HERE') {
      throw new Error('API Key not configured. Please add your Anthropic API key to aiClueGenerator.js');
    }

    try {
      console.log('🌐 Calling Claude API...');

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: this.MODEL,
          max_tokens: this.MAX_TOKENS,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error Response:', errorData);
        
        if (response.status === 401) {
          throw new Error('Invalid API key. Please check your API key in aiClueGenerator.js');
        }
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment and try again.');
        }
        
        throw new Error(`API request failed: ${response.status} - ${errorData.error?.message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      
      if (error.message.includes('fetch') || error.message.includes('NetworkError')) {
        throw new Error('Network error. Please check your internet connection and ensure you are running from a local server (not file://)');
      }
      
      throw error;
    }
  },

  /**
   * Extract and parse JSON from AI response
   */
  parseResponse(apiResponse) {
    try {
      const textContent = apiResponse.content.find(c => c.type === 'text');
      if (!textContent || !textContent.text) {
        throw new Error('No text content in API response');
      }

      let text = textContent.text.trim();

      // Remove markdown code fences if present
      text = text.replace(/^```json\s*/i, '');
      text = text.replace(/^```\s*/, '');
      text = text.replace(/\s*```$/, '');
      text = text.trim();

      const clueData = JSON.parse(text);

      if (!Array.isArray(clueData)) {
        throw new Error('Response is not an array');
      }

      clueData.forEach((item, index) => {
        if (!item.word || !item.clue) {
          throw new Error(`Invalid clue format at index ${index}`);
        }
      });

      return clueData;
    } catch (error) {
      console.error('Parse Error:', error);
      console.error('Raw response:', apiResponse);
      throw new Error(`Failed to parse AI response: ${error.message}`);
    }
  },

  /**
   * Generate clues for all words
   */
  async generateClues(words, teamData) {
    console.log('🤖 Generating clues for:', words);
    
    const prompt = this.buildPrompt(words, teamData);
    console.log('📝 Prompt built');

    const apiResponse = await this.callAPI(prompt);
    console.log('✅ API response received');

    const clueData = this.parseResponse(apiResponse);
    console.log('✅ Clues generated:', clueData.length);

    // Ensure all words have clues
    const missingWords = words.filter(
      word => !clueData.find(c => c.word.toUpperCase() === word.toUpperCase())
    );

    if (missingWords.length > 0) {
      console.warn('⚠️ Missing clues for:', missingWords);
      missingWords.forEach(word => {
        clueData.push({
          word: word,
          clue: `Team member or skill: ${word.toLowerCase()} (${word.length})`
        });
      });
    }

    return clueData;
  },

  /**
   * Test function to verify API connectivity
   */
  async testConnection() {
    if (!this.API_KEY || this.API_KEY === 'YOUR_API_KEY_HERE') {
      console.error('❌ API Key not configured');
      return false;
    }

    try {
      const testPrompt = 'Reply with just the word "OK"';
      const response = await this.callAPI(testPrompt);
      console.log('✅ API connection successful');
      return response && response.content && response.content.length > 0;
    } catch (error) {
      console.error('❌ Connection test failed:', error);
      return false;
    }
  }
};

// Make available globally
window.AIClueGenerator = AIClueGenerator;