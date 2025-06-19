import express from 'express';
import OpenAI from 'openai';
import config from '../config/env.js';
console.log("🧪 API KEY LOADED:", config.OPENAI_API_KEY);

const router = express.Router();

// ✅ OpenAI client initialization
const openai = new OpenAI({
  apiKey: config.OPENAI_API_KEY,
});

// ✅ POST /api/ai-chat - chatbot response
router.post('/', async (req, res) => {
  const { message } = req.body;

  if (!message || message.trim() === '') {
    return res.status(400).json({ error: 'Message is required.' });
  }

  try {
    const chatResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are HealthBot, a helpful AI medical assistant. You only provide symptom-related suggestions. Always advise to consult a real doctor for serious issues.',
        },
        {
          role: 'user',
          content: message,
        },
      ],
    });

    const reply = chatResponse.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    console.error('❌ GPT Error:', error.message);
    res.status(500).json({ error: 'AI failed to respond. Please try again later.' });
  }
});

export default router;

