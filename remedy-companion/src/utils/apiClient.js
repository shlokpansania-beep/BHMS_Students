/**
 * API client for communicating with the Express backend.
 * Automatically resolves the API endpoint on local vs production hosts.
 */

const getApiBase = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return '/api';
  }
  
  // Self-healing Render subdomain routing:
  // if site is "xxx.onrender.com", backend is "xxx-api.onrender.com"
  if (hostname.endsWith('.onrender.com')) {
    const prefix = hostname.replace('.onrender.com', '');
    return `https://${prefix}-api.onrender.com/api`;
  }
  
  return '/api';
};

const API_BASE = getApiBase();

async function apiCall(endpoint, body) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `API request failed with status ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error(
        'Cannot connect to the AI server. On Vercel, set GEMINI_API_KEY. Locally, run npm run dev:full.'
      );
    }
    throw error;
  }
}

/**
 * Safely sample text from a document to reduce token count.
 * Extracts segments from the start, middle, and end of the text.
 */
function sampleText(text, maxChars = 25000) {
  if (!text) return '';
  if (text.length <= maxChars) return text;

  const segmentLen = Math.floor(maxChars / 3);
  const part1 = text.slice(0, segmentLen);
  
  const midPoint = Math.floor(text.length / 2);
  const part2 = text.slice(midPoint - Math.floor(segmentLen / 2), midPoint + Math.ceil(segmentLen / 2));
  
  const part3 = text.slice(text.length - segmentLen);

  return `${part1}\n\n[...]\n\n${part2}\n\n[...]\n\n${part3}`;
}

/**
 * Generate MCQ quiz questions from document text.
 * @param {string} text - Extracted document text
 * @param {number} questionCount - Number of questions to generate
 * @param {string} quizType - Quiz type ('mcq')
 * @returns {Promise<{ questions: Array<{ question, options, correctAnswer, explanation }> }>}
 */
export async function generateQuiz(text, questionCount = 15, quizType = 'mcq') {
  const sampledText = sampleText(text, 12000); // Optimized for TPM rate limits
  return apiCall('/generate-quiz', { text: sampledText, questionCount, quizType });
}

/**
 * Generate flashcards from document text.
 * @param {string} text - Extracted document text
 * @param {number} cardCount - Number of cards to generate
 * @returns {Promise<{ cards: Array<{ front, back }> }>}
 */
export async function generateFlashcards(text, cardCount = 15) {
  const sampledText = sampleText(text, 12000); // Optimized for TPM rate limits
  return apiCall('/generate-flashcards', { text: sampledText, cardCount });
}

/**
 * Ask a question about the uploaded document.
 * @param {string} text - Extracted document text
 * @param {string} question - The user's question
 * @returns {Promise<{ answer, example, diagram }>}
 */
export async function askQuestion(text, question) {
  const sampledText = sampleText(text, 15000); // Optimized for TPM rate limits
  return apiCall('/ask-question', { text: sampledText, question });
}

/**
 * Compare two topics from the uploaded document text.
 * @param {string} text - Extracted document text
 * @param {string} topicA - The first topic/term
 * @param {string} topicB - The second topic/term
 * @returns {Promise<{ comparison: string, table: string, summary: string }>}
 */
export async function compareTopics(text, topicA, topicB) {
  const sampledText = sampleText(text, 15000); // Optimized for TPM rate limits
  return apiCall('/compare-topics', { text: sampledText, topicA, topicB });
}

/**
 * Check if the backend server is running.
 * @returns {Promise<boolean>}
 */
export async function checkHealth() {
  try {
    const response = await fetch(`${API_BASE}/health`);
    return response.ok;
  } catch {
    return false;
  }
}
