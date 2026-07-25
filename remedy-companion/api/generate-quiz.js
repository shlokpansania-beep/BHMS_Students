import { generateQuizFromText } from '../lib/ai/gemini.js';

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
    const { text, questionCount = 15, quizType = 'mcq' } = req.body || {};
    if (!text) {
      res.status(400).json({ error: 'Missing document text' });
      return;
    }
    const parsed = await generateQuizFromText(text, questionCount, quizType);
    res.status(200).json(parsed);
  } catch (error) {
    console.error('[Quiz]', error.message);
    res.status(500).json({ error: 'Failed to generate quiz. ' + error.message });
  }
}
