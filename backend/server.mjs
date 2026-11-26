import express from 'express';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 3000);
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const frontendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'frontend');

const allowedOrigins = (process.env.FRONTEND_ORIGIN || '*')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use((req, res, next) => {
  const requestOrigin = req.headers.origin;
  if (allowedOrigins.includes('*') || (requestOrigin && allowedOrigins.includes(requestOrigin))) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigins.includes('*') ? '*' : requestOrigin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.use(express.json({ limit: '32kb' }));
app.use(express.static(frontendRoot));
app.get(/^\/(?:login|home(?:\/.*)?)$/, (_req, res) => {
  res.sendFile(path.join(frontendRoot, 'index.html'));
});

const assistantInstructions = `
You are Aama AI, a warm pregnancy companion for users in Nepal.
Reply in the same language as the user, using simple English or Nepali.
Give general pregnancy education and practical next steps, not a diagnosis.
Never tell a user to stop prescribed medicine or delay urgent care.
If the user describes severe pain, heavy bleeding, trouble breathing, fainting,
seizures, or another emergency, clearly tell them to contact local emergency
services or a qualified health worker immediately.
Keep normal answers concise and reassuring.
`;

function fallbackReply(message) {
  const lower = message.toLowerCase();
  if (lower.includes('emergency') || lower.includes('bleeding') || lower.includes('severe pain')) {
    return 'This may need urgent attention. Please contact your health worker or local emergency care immediately. If you feel unsafe, ask a trusted family member to stay with you.';
  }
  return 'I’m ready to help with general pregnancy information. Please configure OPENAI_API_KEY to enable live AI answers, and contact your health worker for personal medical advice.';
}

async function createReply(message) {
  if (!openai) return fallbackReply(message);
  const response = await openai.responses.create({
    model: process.env.OPENAI_MODEL || 'gpt-5-mini',
    instructions: assistantInstructions,
    input: message
  });
  return response.output_text?.trim() || fallbackReply(message);
}

async function createSpeech(text) {
  if (!process.env.ELEVENLABS_API_KEY || !process.env.ELEVENLABS_VOICE_ID) return null;

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(process.env.ELEVENLABS_VOICE_ID)}?output_format=mp3_44100_128`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': process.env.ELEVENLABS_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text,
        model_id: process.env.ELEVENLABS_MODEL || 'eleven_flash_v2_5'
      })
    }
  );

  if (!response.ok) throw new Error(`ElevenLabs returned ${response.status}: ${await response.text()}`);
  return Buffer.from(await response.arrayBuffer()).toString('base64');
}

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    chatbotConfigured: Boolean(openai),
    voiceConfigured: Boolean(process.env.ELEVENLABS_API_KEY && process.env.ELEVENLABS_VOICE_ID)
  });
});

app.post('/api/chat', async (req, res) => {
  const message = String(req.body?.message || '').trim();
  if (!message) return res.status(400).json({ error: 'Please enter a message.' });
  if (message.length > 2000) return res.status(400).json({ error: 'Please keep your message under 2,000 characters.' });

  try {
    const reply = await createReply(message);
    let audio = null;
    try {
      audio = await createSpeech(reply);
    } catch (speechError) {
      console.error(speechError.message);
    }
    res.json({ reply, audio, mimeType: 'audio/mpeg' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Aama AI could not respond right now. Please try again.' });
  }
});

app.listen(port, () => console.log(`AamaCare is running at http://localhost:${port}`));
