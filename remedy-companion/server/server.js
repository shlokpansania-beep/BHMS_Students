import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Import Gemini helper functions
import { 
  generateQuizFromText, 
  generateFlashcardsFromText, 
  askQuestionAboutText,
  compareTopicsFromText
} from '../lib/ai/gemini.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from the parent directory
dotenv.config({ path: join(__dirname, '../.env') });

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Helper to determine active AI provider
function getProvider() {
  const geminiKey = process.env.GEMINI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  const hasGemini = geminiKey && geminiKey !== 'your-gemini-api-key-here';
  const hasAnthropic = anthropicKey && anthropicKey !== 'your-api-key-here';

  if (hasGemini) {
    return { name: 'gemini' };
  } else if (hasAnthropic) {
    return { name: 'anthropic', client: new Anthropic({ apiKey: anthropicKey }) };
  }

  return { name: 'none' };
}

const CLAUDE_MODEL = 'claude-sonnet-4-20250514';

// Helper function to extract JSON from Claude's response
function extractJSON(text) {
  const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
  if (jsonMatch && jsonMatch[1]) {
    try {
      return JSON.parse(jsonMatch[1]);
    } catch (e) {
      console.error('Failed to parse JSON from markdown block', e.message);
    }
  }

  const braceMatch = text.match(/\{[\s\S]*\}/);
  if (braceMatch) {
    try {
      return JSON.parse(braceMatch[0]);
    } catch (e) {
      console.error('Failed to parse JSON from braces', e.message);
    }
  }

  const arrayMatch = text.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    try {
      return JSON.parse(arrayMatch[0]);
    } catch (e) {
      console.error('Failed to parse JSON array', e.message);
    }
  }

  throw new Error('Could not find valid JSON in response');
}

// Clean API response errors into human-friendly error descriptions
function cleanErrorMessage(msg) {
  if (msg.includes('429 Too Many Requests') || msg.includes('quota') || msg.includes('Quota exceeded')) {
    return 'Gemini API Free Tier Quota Exceeded (Too Many Requests). The Gemini API free tier has strict rate limits. Please wait 1 minute before trying again.';
  }
  if (msg.includes('API_KEY_INVALID') || msg.includes('API key not valid')) {
    return 'Invalid API Key. Please verify the Gemini or Anthropic API key entered in your .env file.';
  }
  return msg;
}

// ────────── Health Check ──────────
app.get('/api/health', (req, res) => {
  const provider = getProvider();
  res.json({
    status: 'ok',
    activeProvider: provider.name,
    apiKeySet: provider.name !== 'none',
  });
});

// ────────── Generate Quiz ──────────
app.post('/api/generate-quiz', async (req, res) => {
  try {
    const { text, questionCount = 15, quizType = 'mcq' } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Missing document text' });
    }

    const provider = getProvider();
    console.log(`[Quiz] Generating ${questionCount} ${quizType} questions using ${provider.name}...`);

    if (provider.name === 'none') {
      return res.status(400).json({ 
        error: 'No AI provider configured. Please edit the .env file in the project root and set GEMINI_API_KEY or ANTHROPIC_API_KEY.' 
      });
    }

    if (provider.name === 'gemini') {
      const result = await generateQuizFromText(text, questionCount, quizType);
      return res.json(result);
    }

    // Anthropic Claude fallback
    const response = await provider.client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 4096,
      system: `You are an expert medical educator creating exam questions. Generate exactly ${questionCount} MCQ questions STRICTLY from the provided document text. Do NOT invent facts beyond what the document contains.

For each question:
- Write a clear question stem testing comprehension, not trivial recall
- Provide 4 options labeled A, B, C, D
- Indicate the correct answer letter only (A, B, C, or D)
- Write a brief 1–2 sentence explanation referencing specific document content

Return ONLY valid JSON in this exact format:
\`\`\`json
{
  "questions": [
    {
      "question": "Question text here?",
      "options": ["A) First option", "B) Second option", "C) Third option", "D) Fourth option"],
      "correctAnswer": "A",
      "explanation": "Brief explanation referencing the document."
    }
  ]
}
\`\`\``,
      messages: [
        { role: 'user', content: `Generate ${questionCount} quiz questions from this document:\n\n${text}` },
      ],
    });

    const responseText = response.content[0].text;
    const parsed = extractJSON(responseText);
    res.json(parsed);
  } catch (error) {
    console.error('[Quiz] Error:', error.message);
    res.status(500).json({ error: cleanErrorMessage(error.message) });
  }
});

// ────────── Generate Flashcards ──────────
app.post('/api/generate-flashcards', async (req, res) => {
  try {
    const { text, cardCount = 15 } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Missing document text' });
    }

    const provider = getProvider();
    console.log(`[Flashcards] Generating ${cardCount} cards using ${provider.name}...`);

    if (provider.name === 'none') {
      return res.status(400).json({ 
        error: 'No AI provider configured. Please edit the .env file in the project root and set GEMINI_API_KEY or ANTHROPIC_API_KEY.' 
      });
    }

    if (provider.name === 'gemini') {
      const result = await generateFlashcardsFromText(text, cardCount);
      return res.json(result);
    }

    // Anthropic Claude fallback
    const response = await provider.client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 4096,
      system: `You are an expert educator creating study flashcards. Generate exactly ${cardCount} flashcards from the provided document text. Extract the most important concepts, definitions, and key facts.

Each card should have:
- front: A clear question, term, or concept prompt
- back: A concise but complete explanation or definition

Return ONLY valid JSON in this exact format:
\`\`\`json
{
  "cards": [
    {
      "front": "What is [concept]?",
      "back": "Clear explanation from the document."
    }
  ]
}
\`\`\``,
      messages: [
        { role: 'user', content: `Generate ${cardCount} flashcards from this document:\n\n${text}` },
      ],
    });

    const responseText = response.content[0].text;
    const parsed = extractJSON(responseText);
    res.json(parsed);
  } catch (error) {
    console.error('[Flashcards] Error:', error.message);
    res.status(500).json({ error: cleanErrorMessage(error.message) });
  }
});

// ────────── Ask Question ──────────
app.post('/api/ask-question', async (req, res) => {
  try {
    const { text, question } = req.body;

    if (!text || !question) {
      return res.status(400).json({ error: 'Missing document text or question' });
    }

    const provider = getProvider();
    console.log(`[Q&A] Question: "${question.slice(0, 80)}..." using ${provider.name}`);

    if (provider.name === 'none') {
      return res.status(400).json({ 
        error: 'No AI provider configured. Please edit the .env file in the project root and set GEMINI_API_KEY or ANTHROPIC_API_KEY.' 
      });
    }

    if (provider.name === 'gemini') {
      const result = await askQuestionAboutText(text, question);
      return res.json(result);
    }

    // Anthropic Claude fallback
    const response = await provider.client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 4096,
      system: `You are a friendly, knowledgeable study assistant for a BHMS (homeopathy) medical student. Answer questions based on the provided document.

Rules:
1. Use simple, clear language — explain like a helpful tutor, not a textbook
2. Ground your answer in the document content
3. Include a practical real-world or clinical example to illustrate the concept
4. If a visual diagram would genuinely help explain the concept, generate a clean inline SVG (flowchart, labeled diagram, or concept map) with clear labels and good spacing. Use colors #2a9d8f (teal) and #264653 (dark) for styling. If a table would be more appropriate, generate a clean HTML table instead.
5. If the document does NOT cover this topic, clearly state: "This topic isn't covered in your uploaded notes." — then you may add brief outside context, clearly labeled as supplementary.

Return ONLY valid JSON:
\`\`\`json
{
  "answer": "Your detailed answer in simple language",
  "example": "A real-world or clinical example illustrating the concept",
  "diagram": "<svg>...</svg> or <table>...</table> or null if no visual needed"
}
\`\`\``,
      messages: [
        { role: 'user', content: `Document:\n\n${text}\n\n---\nMy question: ${question}` },
      ],
    });

    const responseText = response.content[0].text;
    const parsed = extractJSON(responseText);
    res.json(parsed);
  } catch (error) {
    console.error('[Q&A] Error:', error.message);
    res.status(500).json({ error: cleanErrorMessage(error.message) });
  }
});

// ────────── Compare Topics ──────────
app.post('/api/compare-topics', async (req, res) => {
  try {
    const { text, topicA, topicB } = req.body;

    if (!text || !topicA || !topicB) {
      return res.status(400).json({ error: 'Missing document text, topic A, or topic B' });
    }

    const provider = getProvider();
    console.log(`[Compare] Comparing "${topicA}" and "${topicB}" using ${provider.name}`);

    if (provider.name === 'none') {
      return res.status(400).json({ 
        error: 'No AI provider configured. Please edit the .env file in the project root and set GEMINI_API_KEY or ANTHROPIC_API_KEY.' 
      });
    }

    if (provider.name === 'gemini') {
      const result = await compareTopicsFromText(text, topicA, topicB);
      return res.json(result);
    }

    // Anthropic Claude fallback
    const response = await provider.client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 4096,
      system: `You are a friendly, expert medical tutor for BHMS (homeopathy) students. Compare the two topics/terms provided by the user side-by-side, based STRICTLY on the provided document text.

Rules:
1. Explain what each topic/term is in simple, clear language.
2. Generate a structured side-by-side comparison table (HTML or markdown table) outlining key parameters of differences (e.g., location, function, characteristics, remedies, or clinical indications).
3. Provide a clear summary highlighting:
   - Shared similarities (what they have in common)
   - Key differences (what makes each unique)
4. Focus on what is in the document. If details are missing, state it honestly.

Return ONLY valid JSON:
\`\`\`json
{
  "comparison": "Structured Markdown text explaining similarities, differences, and key takeaways.",
  "table": "HTML or markdown table representation for side-by-side comparison",
  "summary": "Short 1-2 sentence final summary"
}
\`\`\``,
      messages: [
        { role: 'user', content: `Document:\n\n${text}\n\n---\nCompare the following two topics/terms side-by-side based on the document:\nTopic A: ${topicA}\nTopic B: ${topicB}` },
      ],
    });

    const responseText = response.content[0].text;
    const parsed = extractJSON(responseText);
    res.json(parsed);
  } catch (error) {
    console.error('[Compare] Error:', error.message);
    res.status(500).json({ error: cleanErrorMessage(error.message) });
  }
});

// ────────── Start Server ──────────
app.listen(port, () => {
  const provider = getProvider();
  console.log(`\n🌿 Remedy Companion API server running at http://localhost:${port}`);
  console.log(`   Health check: http://localhost:${port}/api/health`);
  
  if (provider.name === 'none') {
    console.warn('\n⚠️  WARNING: No AI Provider configured!');
    console.warn('   Edit the .env file in the project root and add GEMINI_API_KEY or ANTHROPIC_API_KEY.');
    console.warn('   - Get Gemini API key: https://aistudio.google.com/');
    console.warn('   - Get Claude API key: https://console.anthropic.com/\n');
  } else {
    console.log(`   ✅ Active AI Provider: ${provider.name.toUpperCase()}\n`);
  }
});
