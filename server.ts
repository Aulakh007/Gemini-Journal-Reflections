import express from 'express';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// 1. Top-Level Request Deserialization (Ordering Guarantee)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Lazy Google GenAI Client
let genAIInstance: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!genAIInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not set in the environment.');
    }
    genAIInstance = new GoogleGenAI({ apiKey: apiKey || '' });
  }
  return genAIInstance;
}

// Resilient Model Fallback Ladder
const MODEL_FALLBACK_LADDER = [
  'gemini-3.6-flash',
  'gemini-3.1-flash-lite',
  'gemini-flash-latest',
  'gemini-3.7-flash',
];

interface GenAIContentParam {
  contents: any;
  systemInstruction?: string;
}

/**
 * Resilient content generation helper that tries model ladder sequentially
 * on transient API errors (503, 429, 404, 500).
 */
async function generateContentWithFallback(params: GenAIContentParam): Promise<{ text: string; modelUsed: string }> {
  const ai = getGenAI();
  const errors: Array<{ model: string; error: string }> = [];

  for (const model of MODEL_FALLBACK_LADDER) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: params.systemInstruction ? { systemInstruction: params.systemInstruction } : undefined,
      });

      const responseText = response.text || '';
      return { text: responseText, modelUsed: model };
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      console.warn(`[Gemini Fallback] Model ${model} failed: ${errMsg}`);
      errors.push({ model, error: errMsg });
      // Continue to next model in the fallback ladder
    }
  }

  throw new Error(`All Gemini models in fallback ladder failed. Details: ${JSON.stringify(errors)}`);
}

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Multi-turn Reflection and Chat with Gemini
app.post('/api/gemini/reflect', async (req, res) => {
  try {
    const body = (req.body && typeof req.body === 'object') ? req.body : {};
    const {
      journalTitle = '',
      journalContent = '',
      category = 'General Reflection',
      mood = 'Neutral',
      conversation = [],
      persona = 'Empathetic Coach',
      userPrompt = '',
    } = body;

    const personaInstructions: Record<string, string> = {
      'Empathetic Coach': 'You are an empathetic, insightful mindfulness and personal growth coach. You listen deeply, validate feelings, identify strengths, and ask gentle reflective questions.',
      'Socratic Explorer': 'You are a thoughtful Socratic thinking partner. You challenge assumptions with curiosity, offer new perspectives, and encourage deep critical inquiry.',
      'Strategic Brainstormer': 'You are a structured, innovative brainstorming partner. You synthesize concepts into practical action steps, organize ideas, and spark creative possibilities.',
      'Summarizer & Synthesizer': 'You are an executive summarizer. You capture key themes, emotional nuance, core lessons, and actionable takeaways with crystal clarity.',
    };

    const activeInstruction = personaInstructions[persona] || personaInstructions['Empathetic Coach'];

    const systemInstruction = `
${activeInstruction}

Context:
The user is maintaining a private, secure personal journal and reflection space.
- Current Journal Title: "${journalTitle || 'Untitled Reflection'}"
- Category: "${category}"
- User Mood: "${mood}"
- Original Journal Content:
${journalContent || '(No initial text provided yet)'}

Instructions:
1. Provide a thoughtful, warm, and highly engaging reflection or response.
2. Balance encouragement with deep, thought-provoking follow-up questions.
3. If the user asks for suggestions or brainstorming, provide clearly formatted bullet points or numbered insights.
4. Keep the tone respectful, psychologically safe, and supportive.
5. Format your output with clean Markdown (headers, bullet points, italics).
`.trim();

    // Prepare contents array for multi-turn history
    const contents: any[] = [];

    if (Array.isArray(conversation) && conversation.length > 0) {
      for (const msg of conversation) {
        if (msg && typeof msg === 'object' && msg.content) {
          contents.push({
            role: msg.role === 'model' || msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: String(msg.content) }],
          });
        }
      }
    }

    // Append latest user prompt if provided and not already in conversation array
    if (userPrompt) {
      contents.push({
        role: 'user',
        parts: [{ text: String(userPrompt) }],
      });
    }

    // Fallback if empty
    if (contents.length === 0) {
      contents.push({
        role: 'user',
        parts: [{ text: `Please provide a thoughtful reflection and 2-3 insight questions based on my journal entry: "${journalTitle}". Content: ${journalContent}` }],
      });
    }

    const result = await generateContentWithFallback({
      contents,
      systemInstruction,
    });

    res.json({
      success: true,
      reply: result.text,
      modelUsed: result.modelUsed,
    });
  } catch (error: any) {
    console.error('Error in /api/gemini/reflect:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to generate reflection response with Gemini',
    });
  }
});

// Comprehensive Journal Summary & Takeaways Generator
app.post('/api/gemini/summarize', async (req, res) => {
  try {
    const body = (req.body && typeof req.body === 'object') ? req.body : {};
    const {
      journalTitle = '',
      journalContent = '',
      category = '',
      mood = '',
      conversation = [],
    } = body;

    const systemInstruction = `
You are an expert cognitive synthesizer and personal growth advisor.
Analyze the user's journal entry along with any dialogue exchanges.

Provide a structured, beautifully formatted Markdown summary with the following distinct sections:
1. 🌟 **Executive Summary** (2-3 sentences capturing the core essence)
2. 💡 **Key Insights & Themes** (3-4 bullet points analyzing emotional, mental, or practical themes)
3. 🎯 **Actionable Next Steps** (2-3 clear, gentle micro-actions or reflection practices)
4. 💭 **Recommended Deep Reflection Question** (1 powerful question for future exploration)

Maintain an encouraging, dignified, and insightful tone.
`.trim();

    let combinedText = `Journal Title: ${journalTitle}\nCategory: ${category}\nMood: ${mood}\n\nEntry Body:\n${journalContent}\n\n`;

    if (Array.isArray(conversation) && conversation.length > 0) {
      combinedText += `\n--- Multi-turn Reflection Dialogue ---\n`;
      conversation.forEach((m: any, idx: number) => {
        combinedText += `\n[${m.role === 'model' ? 'Gemini AI' : 'User'}]: ${m.content}\n`;
      });
    }

    const contents = [
      {
        role: 'user',
        parts: [{ text: `Please generate a structured executive summary and key takeaways for this journal session:\n\n${combinedText}` }],
      },
    ];

    const result = await generateContentWithFallback({
      contents,
      systemInstruction,
    });

    res.json({
      success: true,
      summary: result.text,
      modelUsed: result.modelUsed,
    });
  } catch (error: any) {
    console.error('Error in /api/gemini/summarize:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to synthesize journal summary',
    });
  }
});

// Dynamic Journal Prompts Generator
app.post('/api/gemini/prompts', async (req, res) => {
  try {
    const body = (req.body && typeof req.body === 'object') ? req.body : {};
    const { category = 'Personal Growth', mood = 'Contemplative' } = body;

    const systemInstruction = `
You are a creative mindfulness guide. Generate 4 unique, deeply engaging journaling prompts tailored to the user's current mood (${mood}) and focus category (${category}).
Return your response as a JSON array of strings: ["Prompt 1", "Prompt 2", "Prompt 3", "Prompt 4"]. Do not wrap in markdown codeblocks if possible, or return valid JSON.
`.trim();

    const result = await generateContentWithFallback({
      contents: [{ role: 'user', parts: [{ text: `Generate 4 inspiring journal prompts for mood: ${mood} and category: ${category}` }] }],
      systemInstruction,
    });

    let prompts: string[] = [];
    try {
      const cleanJson = result.text.replace(/```json\n?|\n?```/g, '').trim();
      prompts = JSON.parse(cleanJson);
    } catch {
      // Fallback extraction
      prompts = result.text
        .split('\n')
        .map(l => l.replace(/^\d+[\.\)]\s*|\-\s*/, '').trim())
        .filter(l => l.length > 5)
        .slice(0, 4);
    }

    if (!Array.isArray(prompts) || prompts.length === 0) {
      prompts = [
        "What is one moment from today that shifted your perspective?",
        "What emotion has been taking up the most space in your mind recently?",
        "If you could give your present self one piece of compassionate advice, what would it be?",
        "What is one small boundary or goal that would bring you more peace this week?"
      ];
    }

    res.json({ success: true, prompts, modelUsed: result.modelUsed });
  } catch (error: any) {
    console.error('Error in /api/gemini/prompts:', error);
    res.json({
      success: true,
      prompts: [
        "What is one challenge you navigated recently that made you stronger?",
        "What are 3 things you feel quiet gratitude for right now?",
        "What idea or project has been exciting you recently?",
        "How can you show yourself deeper patience today?"
      ],
      modelUsed: 'fallback-static',
    });
  }
});

// Static files and Vite Middleware integration
async function startServer() {
  const distPath = path.join(process.cwd(), 'dist');
  const distIndexExists = fs.existsSync(path.join(distPath, 'index.html'));
  const isProduction = process.env.NODE_ENV === 'production' || (!process.env.npm_lifecycle_event?.includes('dev') && distIndexExists);

  if (isProduction || distIndexExists) {
    if (distIndexExists) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  if (!isProduction) {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } catch (viteErr) {
      console.warn('Vite dev middleware could not be loaded, serving static fallback if present:', viteErr);
      if (distIndexExists) {
        app.use(express.static(distPath));
        app.get('*', (req, res) => {
          res.sendFile(path.join(distPath, 'index.html'));
        });
      }
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT} (env: ${process.env.NODE_ENV || 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
