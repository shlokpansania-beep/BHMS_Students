import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';

function getModel(systemInstruction) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your-gemini-api-key-here') {
    throw new Error('GEMINI_API_KEY is not configured');
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction,
  });
}

export function extractJSON(text) {
  const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
  if (jsonMatch?.[1]) {
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

async function generateJson(systemInstruction, userPrompt) {
  const model = getModel(systemInstruction);
  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
    generationConfig: {
      maxOutputTokens: 8192,
      temperature: 0.4,
    },
  });
  const text = result.response.text();
  return extractJSON(text);
}

export async function generateQuizFromText(text, questionCount = 15, quizType = 'mcq') {
  const system = `You are an expert medical educator creating exam questions. Generate exactly ${questionCount} MCQ questions STRICTLY from the provided document text. Do NOT invent facts beyond what the document contains.

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
\`\`\``;

  return generateJson(system, `Generate ${questionCount} ${quizType} quiz questions from this document:\n\n${text}`);
}

export async function generateFlashcardsFromText(text, cardCount = 15) {
  const system = `You are an expert educator creating study flashcards. Generate exactly ${cardCount} flashcards from the provided document text. Extract the most important concepts, definitions, and key facts.

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
\`\`\``;

  return generateJson(system, `Generate ${cardCount} flashcards from this document:\n\n${text}`);
}

export async function askQuestionAboutText(text, question) {
  const system = `You are a friendly, knowledgeable study assistant for a BHMS (homeopathy) medical student. Answer questions based on the provided document.

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
\`\`\``;

  return generateJson(system, `Document:\n\n${text}\n\n---\nMy question: ${question}`);
}

export function isApiKeyConfigured() {
  const key = process.env.GEMINI_API_KEY;
  return !!(key && key !== 'your-gemini-api-key-here');
}

export async function compareTopicsFromText(text, topicA, topicB) {
  const system = `You are a friendly, expert medical tutor for BHMS (homeopathy) students. Compare the two topics/terms provided by the user side-by-side, based STRICTLY on the provided document text.

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
\`\`\``;

  return generateJson(system, `Document:\n\n${text}\n\n---\nCompare the following two topics/terms side-by-side based on the document:\nTopic A: ${topicA}\nTopic B: ${topicB}`);
}
