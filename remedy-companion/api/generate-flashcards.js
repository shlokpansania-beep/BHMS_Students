import { generateFlashcardsFromText } from '../lib/ai/gemini.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { text, cardCount = 15 } = req.body || {};
    if (!text) {
      res.status(400).json({ error: 'Missing document text' });
      return;
    }
    const parsed = await generateFlashcardsFromText(text, cardCount);
    res.status(200).json(parsed);
  } catch (error) {
    console.error('[Flashcards]', error.message);
    res.status(500).json({ error: 'Failed to generate flashcards. ' + error.message });
  }
}
