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

async function list() {
  try {
    console.log('Fetching available models from Gemini API...');
    
    // We can fetch using the standard fetch to check the endpoint
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `HTTP ${response.status}`);
    }
    const data = await response.json();
    console.log('\nAvailable Models:');
    data.models.forEach(model => {
      console.log(`- ${model.name} (${model.displayName})`);
      console.log(`  Supported methods: ${model.supportedGenerationMethods.join(', ')}`);
    });
  } catch (e) {
    console.error('Failed to list models:', e.message);
  }
}

list();
