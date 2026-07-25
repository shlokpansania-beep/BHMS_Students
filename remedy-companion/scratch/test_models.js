import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey || apiKey === 'your-gemini-api-key-here') {
  console.error('Error: GEMINI_API_KEY is not configured in .env');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

const testModels = [
  'gemini-2.0-flash-lite',
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash',
  'gemini-3.6-flash'
];

async function testAll() {
  for (const modelName of testModels) {
    try {
      console.log(`Testing model: ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: 'Say "Working!" in exactly one word.' }] }],
        generationConfig: { maxOutputTokens: 20 }
      });
      const text = result.response.text().trim();
      console.log(`  🚀 SUCCESS! Output: "${text}"\n`);
    } catch (e) {
      console.error(`  ❌ FAILED: ${e.message}\n`);
    }
  }
}

testAll();
