import express from 'express';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// 1. Top-Level Request Deserialization & Defensive Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Security & Caching Headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

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

// Resilient Model Fallback Ladder using valid public Gemini models
const MODEL_FALLBACK_LADDER = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-flash-latest',
  'gemini-2.5-pro',
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
    }
  }

  throw new Error(`All Gemini models in fallback ladder failed. Details: ${JSON.stringify(errors)}`);
}

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    data: { status: 'healthy', timestamp: new Date().toISOString() },
    error: null,
  });
});

// Multi-turn Reflection Dialogue with Gemini
app.post('/api/gemini/reflect', async (req, res) => {
  try {
    const body = (req.body && typeof req.body === 'object') ? req.body : {};
    const {
      journalTitle = '',
      journalContent = '',
      category = 'Daily Reflection',
      mood = 'Reflective',
      conversation = [],
      persona = 'Socratic Explorer',
      userPrompt = '',
    } = body;

    const personaInstructions: Record<string, string> = {
      'Socratic Explorer': `You are the Socratic Explorer in ReflectAI.
Your purpose is to help the user uncover underlying assumptions, see blind spots, and expand their perspective by asking thoughtful, curious, non-judgmental questions.
Keep your response structured, warm, and concise.
Whenever helpful, use the following clean layout:
### 👁️ Observation
(1-2 sentences noticing what stands out without judgment)

### 💭 A Question to Consider
(1-2 powerful, open-ended reflective questions)

### 👣 Possible Next Step
(A gentle suggestion or perspective experiment)`,

      'Empathetic Listener': `You are the Empathetic Listener in ReflectAI.
Your purpose is to help the user slow down, process emotions, feel genuinely heard, and cultivate self-compassion.
Validate feelings with sincerity, identify emotional strengths, and avoid rushing into premature problem-solving.
Structure:
### 🌿 Empathetic Reflection
(Warm validation of their experience and feelings)

### 💭 Gentle Inquiry
(A question that helps them explore how they are caring for themselves)

### 🕊️ Compassionate Reminder
(A grounding affirmation or mindful breath suggestion)`,

      'Pattern Finder': `You are the Pattern Finder in ReflectAI.
Your purpose is to connect dots, identify recurring cognitive or behavioral themes, and highlight tendencies or triggers.
Use balanced, non-dogmatic language like "A recurring theme appears to be...", "You may be noticing...", "One possible connection is...".
Structure:
### 🔍 Observed Pattern
(Clear, respectful synthesis of connections or themes)

### 💭 Pattern Reflection
(A question exploring what drives this pattern or what purpose it serves)

### 🔄 Habit Shift
(A practical way to test or reframe this pattern)`,

      'Practical Coach': `You are the Practical Coach in ReflectAI.
Your purpose is to turn reflection into realistic, high-leverage micro-actions without causing overwhelm.
Break complex thoughts into grounded, actionable momentum.
Structure:
### 🎯 Clarity Focus
(Summarize the core priority or challenge)

### ⚡ 2-3 Realistic Micro-Steps
(Direct, bite-sized actions with low friction)

### 💭 Accountability Check
(A question on what might get in the way and how to navigate it)`,
    };

    const activeInstruction = personaInstructions[persona] || personaInstructions['Socratic Explorer'];

    const systemInstruction = `
${activeInstruction}

Context:
The user is maintaining a private, secure personal reflection space.
- Current Reflection: "${journalTitle || 'Untitled Reflection'}"
- Category: "${category}"
- User Mood: "${mood}"
- Reflection Body:
${journalContent || '(No reflection text written yet)'}

Guidelines:
1. Provide a calm, intelligent, dignified, and emotionally safe response.
2. Avoid generic chatbot pleasantries or filler. Dive straight into thoughtful engagement.
3. Keep Markdown formatting clean and scannable.
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

    if (userPrompt) {
      contents.push({
        role: 'user',
        parts: [{ text: String(userPrompt) }],
      });
    }

    if (contents.length === 0) {
      contents.push({
        role: 'user',
        parts: [{ text: `Please offer a thoughtful reflection on my entry "${journalTitle}": ${journalContent}` }],
      });
    }

    const result = await generateContentWithFallback({
      contents,
      systemInstruction,
    });

    res.json({
      success: true,
      data: {
        reply: result.text,
        modelUsed: result.modelUsed,
      },
      error: null,
    });
  } catch (error: any) {
    console.error('Error in /api/gemini/reflect:', error);
    res.status(500).json({
      success: false,
      data: null,
      error: {
        code: 'REFLECTION_GENERATION_FAILED',
        message: error?.message || 'The reflection could not be generated. Please retry in a moment.',
      },
    });
  }
});

// Comprehensive Executive Insights & Action Generator
app.post('/api/gemini/summarize', async (req, res) => {
  try {
    const body = (req.body && typeof req.body === 'object') ? req.body : {};
    const {
      journalTitle = '',
      journalContent = '',
      category = 'Daily Reflection',
      mood = 'Reflective',
      conversation = [],
    } = body;

    const systemInstruction = `
You are the Executive Insight Engine in ReflectAI.
Analyze the user's reflection session and optional AI conversation.

You MUST respond strictly with a valid JSON object matching this schema:
{
  "summary": "2-3 sentence clear, dignified executive summary capturing the core emotional and cognitive essence.",
  "emotionalThemes": [
    { "theme": "Clarity & Direction", "score": 85, "description": "High focus on determining next steps." },
    { "theme": "Emotional Processing", "score": 60, "description": "Noticing tension between ambition and rest." }
  ],
  "observedPatterns": [
    "You tend to seek clarity by organizing thoughts before taking action.",
    "A recurring theme is balancing high standards with self-compassion."
  ],
  "suggestedActions": [
    "Block 30 minutes of uninterrupted focus time for priority #1 tomorrow morning.",
    "Practice a 2-minute pause before switching between demanding tasks."
  ],
  "deepQuestion": "What is one assumption you are holding that, if relaxed, would give you immediate breathing room?"
}

Rules:
- Non-clinical, supportive language ("You may be noticing...", "A recurring theme appears to be...").
- Return ONLY valid raw JSON. No markdown code blocks like \`\`\`json.
`.trim();

    let combinedText = `Title: ${journalTitle}\nCategory: ${category}\nMood: ${mood}\n\nReflection Text:\n${journalContent}\n\n`;

    if (Array.isArray(conversation) && conversation.length > 0) {
      combinedText += `\n--- AI Conversation Context ---\n`;
      conversation.forEach((m: any) => {
        combinedText += `\n[${m.role === 'model' ? 'AI' : 'User'}]: ${m.content}\n`;
      });
    }

    const result = await generateContentWithFallback({
      contents: [{ role: 'user', parts: [{ text: `Analyze and extract executive insights for this reflection:\n\n${combinedText}` }] }],
      systemInstruction,
    });

    let insightData: any = null;
    try {
      const cleanJson = result.text.replace(/```json\n?|\n?```/g, '').trim();
      insightData = JSON.parse(cleanJson);
    } catch {
      // Fallback structured generation
      insightData = {
        summary: result.text.substring(0, 300) || "A meaningful reflection exploring personal balance, clarity, and intentional growth.",
        emotionalThemes: [
          { theme: category || "Self-Reflection", score: 80, description: "Active thoughtful examination" },
          { theme: mood || "Clarity", score: 65, description: "Seeking calm alignment" }
        ],
        observedPatterns: [
          "You are actively dedicating time to structured self-awareness.",
          "Noticing emotional balance leads to clearer decision making."
        ],
        suggestedActions: [
          "Take one tangible micro-step on your primary thought today.",
          "Revisit this reflection in 3 days to notice subtle shifts."
        ],
        deepQuestion: "What would the most compassionate version of yourself choose next?"
      };
    }

    res.json({
      success: true,
      data: {
        insight: insightData,
        modelUsed: result.modelUsed,
      },
      error: null,
    });
  } catch (error: any) {
    console.error('Error in /api/gemini/summarize:', error);
    res.status(500).json({
      success: false,
      data: null,
      error: {
        code: 'INSIGHT_SYNTHESIS_FAILED',
        message: error?.message || 'Failed to synthesize executive insights.',
      },
    });
  }
});

// Dynamic "Inspire Me" Reflective Questions Generator
app.post('/api/gemini/prompts', async (req, res) => {
  try {
    const body = (req.body && typeof req.body === 'object') ? req.body : {};
    const { category = 'Life & Growth', mood = 'Reflective', recentTheme = '' } = body;

    const systemInstruction = `
You are the ReflectAI Prompt Guide.
Generate 4 deeply stimulating, psychologically safe, and elegant reflective questions tailored to the user's mood (${mood}) and category (${category}).
${recentTheme ? `Recent context theme: ${recentTheme}` : ''}

Format requirement:
Return ONLY a valid JSON array of strings containing exactly 4 questions:
["Question 1", "Question 2", "Question 3", "Question 4"]
Do not wrap in markdown or include numbering inside the strings.
`.trim();

    const result = await generateContentWithFallback({
      contents: [{ role: 'user', parts: [{ text: `Generate 4 inspiring reflection questions for mood: ${mood}, focus: ${category}` }] }],
      systemInstruction,
    });

    let prompts: string[] = [];
    try {
      const cleanJson = result.text.replace(/```json\n?|\n?```/g, '').trim();
      prompts = JSON.parse(cleanJson);
    } catch {
      prompts = result.text
        .split('\n')
        .map(l => l.replace(/^\d+[\.\)]\s*|\-\s*|"/g, '').trim())
        .filter(l => l.length > 10)
        .slice(0, 4);
    }

    if (!Array.isArray(prompts) || prompts.length === 0) {
      prompts = [
        "What are you avoiding because you already know the answer?",
        "What is currently energizing you, and what is subtly draining your attention?",
        "If you let go of trying to control the outcome, what feels true right now?",
        "What is one small boundary that would bring you immediate peace this week?"
      ];
    }

    res.json({
      success: true,
      data: {
        prompts,
        modelUsed: result.modelUsed,
      },
      error: null,
    });
  } catch (error: any) {
    console.error('Error in /api/gemini/prompts:', error);
    res.json({
      success: true,
      data: {
        prompts: [
          "What are you avoiding because you already know the answer?",
          "What is currently energizing you, and what is subtly draining your attention?",
          "If you let go of trying to control the outcome, what feels true right now?",
          "What is one small boundary that would bring you immediate peace this week?"
        ],
        modelUsed: 'fallback-static',
      },
      error: null,
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
