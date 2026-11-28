import express from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {connectDB} from './db.mjs';
import authRoutes from './routes/auth.routes.mjs';
import healthRecordRoutes from './routes/healthRecords.routes.mjs';
import { requireAuth } from './middleware/requireAuth.mjs';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(projectRoot, '.env') });

const app = express();
const port = Number(process.env.PORT || 3000);
const geminiApiKey = process.env.GEMINI_API_KEY?.trim();
const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY?.trim() || '';
const gemini = geminiApiKey ? new GoogleGenAI({ apiKey: geminiApiKey }) : null;
const frontendRoot = path.join(projectRoot, 'frontend');
const campusHubRoot = path.join(projectRoot, 'campus-event-hub');
const weatherCache = new Map();
const weatherCacheTtlMs = 10 * 60 * 1000;

const weatherCodeDetails = {
  0: { label: 'Clear sky', icon: '☀' },
  1: { label: 'Mainly clear', icon: '🌤' },
  2: { label: 'Partly cloudy', icon: '⛅' },
  3: { label: 'Overcast', icon: '☁' },
  45: { label: 'Foggy', icon: '🌫' },
  48: { label: 'Rime fog', icon: '🌫' },
  51: { label: 'Light drizzle', icon: '🌦' },
  53: { label: 'Drizzle', icon: '🌦' },
  55: { label: 'Heavy drizzle', icon: '🌧' },
  56: { label: 'Freezing drizzle', icon: '🌧' },
  57: { label: 'Heavy freezing drizzle', icon: '🌧' },
  61: { label: 'Light rain', icon: '🌦' },
  63: { label: 'Rain', icon: '🌧' },
  65: { label: 'Heavy rain', icon: '🌧' },
  66: { label: 'Freezing rain', icon: '🌧' },
  67: { label: 'Heavy freezing rain', icon: '🌧' },
  71: { label: 'Light snow', icon: '🌨' },
  73: { label: 'Snow', icon: '🌨' },
  75: { label: 'Heavy snow', icon: '❄' },
  77: { label: 'Snow grains', icon: '❄' },
  80: { label: 'Light rain showers', icon: '🌦' },
  81: { label: 'Rain showers', icon: '🌧' },
  82: { label: 'Heavy rain showers', icon: '🌧' },
  85: { label: 'Snow showers', icon: '🌨' },
  86: { label: 'Heavy snow showers', icon: '🌨' },
  95: { label: 'Thunderstorm', icon: '⛈' },
  96: { label: 'Thunderstorm with hail', icon: '⛈' },
  99: { label: 'Heavy thunderstorm with hail', icon: '⛈' },
};

function weatherDetails(code) {
  return weatherCodeDetails[Number(code)] || { label: 'Conditions unavailable', icon: '•' };
}

function numericValue(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.use(express.json({ limit: '32kb' }));
app.use(express.static(frontendRoot));
app.use('/events', express.static(campusHubRoot));
app.get(/^\/(?:login|sign|home(?:\/.*)?|health-post(?:\/.*)?)$/, (_req, res) => {
  res.sendFile(path.join(frontendRoot, 'index.html'));
});
app.get(['/events', '/events/'], (_req, res) => {
  res.sendFile(path.join(campusHubRoot, 'index.html'));
});

app.use('/api/auth', authRoutes);
app.use('/api/health-records', requireAuth, healthRecordRoutes);

const assistantInstructions = `
You are MaatriSathi AI, a warm pregnancy companion for users in Nepal.
Reply in the same language as the user, using simple English or Nepali.
Give general pregnancy education and practical next steps, not a diagnosis.
Never tell a user to stop prescribed medicine or delay urgent care.
If the user describes severe pain, heavy bleeding, trouble breathing, fainting,
seizures, or another emergency, clearly tell them to contact local emergency
services or a qualified health worker immediately.
Keep normal answers concise and reassuring.
  Format replies for easy reading: use short paragraphs, Markdown headings when
  helpful, numbered lists for steps, bullet lists for multiple items, and bold
  labels for important terms. Leave a blank line between sections. Do not use
  HTML or put the whole answer into one long paragraph.
`;

function fallbackReply(message) {
  const lower = message.toLowerCase();
  if (lower.includes('emergency') || lower.includes('bleeding') || lower.includes('severe pain')) {
    return 'This may need urgent attention. Please contact your health worker or local emergency care immediately. If you feel unsafe, ask a trusted family member to stay with you.';
  }
  if (lower.includes('water') || lower.includes('hydrate')) {
    return 'Staying hydrated is helpful during pregnancy. Sip water regularly and follow the advice of your health worker, especially if you have vomiting, swelling, or another medical condition.';
  }
  if (lower.includes('exercise') || lower.includes('movement')) {
    return 'Gentle movement can be helpful for many people during pregnancy, but the right activity depends on your health. Discuss new exercise with your health worker and stop if you feel pain, dizziness, bleeding, or trouble breathing.';
  }
  if (lower.includes('food') || lower.includes('eat') || lower.includes('nutrition')) {
    return 'Choose varied meals with local vegetables, fruit, grains, protein, and enough fluids. Follow your prescribed supplements and ask your health worker about foods or supplements specific to you.';
  }
  return 'I’m MaatriSathi AI, ready to help with general pregnancy information. The live AI service is temporarily unavailable, so please try again later or contact your health worker for personal medical advice.';
}

async function createReply(message) {
  if (!gemini) return fallbackReply(message);
  try {
    const response = await gemini.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite',
      contents: message,
      config: {
        systemInstruction: assistantInstructions
      }
    });
    return response.text?.trim() || fallbackReply(message);
  } catch (error) {
    if (error.status === 429 || error.code === 'RESOURCE_EXHAUSTED') {
      console.warn('Gemini free-tier limit reached; using the local safety fallback.');
      return fallbackReply(message);
    }
    throw error;
  }
}

async function createSpeech(text) {
  if (!process.env.ELEVENLABS_API_KEY || !process.env.ELEVENLABS_VOICE_ID) return null;

  const modelId = process.env.ELEVENLABS_MODEL?.trim() || 'eleven_v4';
  // Nepali uses Devanagari script. Explicitly passing the language prevents
  // ElevenLabs from guessing English for short or mixed Nepali replies.
  const languageCode = /[\u0900-\u097F]/u.test(text) ? 'ne' : 'en';

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
        model_id: modelId,
        language_code: languageCode
      })
    }
  );

  if (!response.ok) throw new Error(`ElevenLabs returned ${response.status}: ${await response.text()}`);
  return Buffer.from(await response.arrayBuffer()).toString('base64');
}

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    chatbotConfigured: Boolean(gemini),
    voiceConfigured: Boolean(process.env.ELEVENLABS_API_KEY && process.env.ELEVENLABS_VOICE_ID),
    voiceModel: process.env.ELEVENLABS_MODEL?.trim() || 'eleven_v4'
  });
});

// Google Maps browser keys are public by design, but must be restricted by
// HTTP referrer in Google Cloud Console. This endpoint keeps local and hosted
// configuration in one place without hard-coding the key in the HTML.
app.get('/api/maps/config', (_req, res) => {
  res.json({ apiKey: googleMapsApiKey });
});

app.get('/api/weather', async (req, res) => {
  const latitude = Number(req.query.lat);
  const longitude = Number(req.query.lon);
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90
    || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    return res.status(400).json({ error: 'A valid latitude and longitude are required.' });
  }

  const cacheKey = `${latitude.toFixed(3)},${longitude.toFixed(3)}`;
  const cached = weatherCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return res.json(cached.data);

  const providerUrl = new URL('https://api.open-meteo.com/v1/forecast');
  providerUrl.search = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: [
      'temperature_2m',
      'apparent_temperature',
      'relative_humidity_2m',
      'precipitation',
      'rain',
      'showers',
      'weather_code',
      'wind_speed_10m',
    ].join(','),
    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'precipitation_probability_max',
      'precipitation_sum',
      'rain_sum',
    ].join(','),
    forecast_days: '4',
    timezone: 'auto',
    temperature_unit: 'celsius',
    wind_speed_unit: 'kmh',
  }).toString();

  try {
    const providerResponse = await fetch(providerUrl, {
      headers: { accept: 'application/json' },
      signal: AbortSignal.timeout(10000),
    });
    if (!providerResponse.ok) {
      throw new Error(`Weather provider returned HTTP ${providerResponse.status}.`);
    }

    const providerData = await providerResponse.json();
    const current = providerData.current || {};
    const daily = providerData.daily || {};
    const forecast = (daily.time || []).map((date, index) => {
      const code = numericValue(daily.weather_code?.[index]);
      return {
        date,
        weatherCode: code,
        condition: weatherDetails(code).label,
        icon: weatherDetails(code).icon,
        temperatureMaxC: numericValue(daily.temperature_2m_max?.[index]),
        temperatureMinC: numericValue(daily.temperature_2m_min?.[index]),
        precipitationProbability: numericValue(daily.precipitation_probability_max?.[index]),
        precipitationMm: numericValue(daily.precipitation_sum?.[index]),
        rainMm: numericValue(daily.rain_sum?.[index]),
      };
    });
    const code = numericValue(current.weather_code);
    const data = {
      source: 'Open-Meteo',
      timezone: providerData.timezone || 'auto',
      fetchedAt: new Date().toISOString(),
      location: { latitude, longitude },
      current: {
        weatherCode: code,
        condition: weatherDetails(code).label,
        icon: weatherDetails(code).icon,
        temperatureC: numericValue(current.temperature_2m),
        apparentTemperatureC: numericValue(current.apparent_temperature),
        relativeHumidityPct: numericValue(current.relative_humidity_2m),
        precipitationMm: numericValue(current.precipitation),
        rainMm: numericValue(current.rain),
        showersMm: numericValue(current.showers),
        windKph: numericValue(current.wind_speed_10m),
      },
      forecast,
    };
    weatherCache.set(cacheKey, { data, expiresAt: Date.now() + weatherCacheTtlMs });
    return res.json(data);
  } catch (error) {
    console.error('Weather request failed:', error.message);
    return res.status(502).json({ error: 'Weather data is temporarily unavailable.' });
  }
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
  res.status(500).json({ error: 'MaatriSathi AI could not respond right now. Please try again.' });
  }
});

await connectDB();
app.listen(port, () => console.log(`MaatriSathi is running at http://localhost:${port}`));
