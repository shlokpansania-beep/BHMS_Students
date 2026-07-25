import { askQuestionAboutText } from '../lib/ai/gemini.js';

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
    const { text, question } = req.body || {};
    if (!text || !question) {
      res.status(400).json({ error: 'Missing document text or question' });
      return;
    }
    const parsed = await askQuestionAboutText(text, question);
    res.status(200).json(parsed);
  } catch (error) {
    console.error('[Q&A]', error.message);
    res.status(500).json({ error: 'Failed to answer question. ' + error.message });
  }
}
