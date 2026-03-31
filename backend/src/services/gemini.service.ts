import { GoogleGenerativeAI } from '@google/generative-ai';

export interface GeminiAnalysis {
  category: string;
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  priority_score: number;
  summary: string;
  tags: string[];
}

export interface WeeklySummary {
  top_themes: { theme: string; count: number; description: string }[];
  overall_sentiment: string;
  key_insight: string;
  generated_at: string;
}
// Helper function to create Gemini client
const getClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured');//check if Gemini API key 
  return new GoogleGenerativeAI(apiKey);
};
// Default to a generally available flash model; allow override via env if needed
const MODEL_ID = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
// Analyze feedback using Gemini AI
export const analyzeFeedback = async (title: string, description: string): Promise<GeminiAnalysis> => {
  const model = getClient().getGenerativeModel({ model: MODEL_ID });
  const prompt = `Analyse this product feedback. Return ONLY valid JSON with these exact fields, no markdown, no explanation:
{
  "category": "Bug | Feature Request | Improvement | Other",
  "sentiment": "Positive | Neutral | Negative",
  "priority_score": <number 1-10>,
  "summary": "<one sentence summary>",
  "tags": ["<tag1>", "<tag2>", "<tag3>"]
}

Feedback Title: ${title}
Feedback Description: ${description}`;

  const result = await model.generateContent(prompt);
  const cleaned = result.response.text().trim().replace(/```json|```/g, '').trim();

  let parsed: Partial<GeminiAnalysis> = {};
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    // keep parsed empty; we’ll fall back below
  }

  return {
    category: parsed.category || 'Other',
    sentiment: (['Positive', 'Neutral', 'Negative'].includes(parsed.sentiment ?? '') ? parsed.sentiment : 'Neutral') as
      | 'Positive'
      | 'Neutral'
      | 'Negative',
    priority_score: Math.min(10, Math.max(1, Number(parsed.priority_score) || 5)),
    summary: parsed.summary || 'No summary available',
    tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 5) : [],
  };
};

export const generateWeeklySummary = async (
  items: Array<{ title: string; description: string; ai_tags?: string[]; ai_sentiment?: string }>
): Promise<WeeklySummary> => {
  const model = getClient().getGenerativeModel({ model: MODEL_ID });

  if (items.length === 0) {
    return {
      top_themes: [],
      overall_sentiment: 'Unknown',
      key_insight: 'Not enough feedback in the last 7 days to generate insights.',
      generated_at: new Date().toISOString(),
    };
  }

  const feedbackText = items
    .map((f, i) => `${i + 1}. Title: ${f.title}\n   Tags: ${(f.ai_tags || []).join(', ')}\n   Sentiment: ${f.ai_sentiment || 'Unknown'}`)
    .join('\n\n');

  const prompt = `Analyse these ${items.length} product feedback items from the last 7 days. Return ONLY valid JSON:
{
  "top_themes": [
    {"theme": "<name>", "count": <number>, "description": "<brief>"},
    {"theme": "<name>", "count": <number>, "description": "<brief>"},
    {"theme": "<name>", "count": <number>, "description": "<brief>"}
  ],
  "overall_sentiment": "Positive | Neutral | Negative | Mixed",
  "key_insight": "<one actionable insight>"
}

Feedback:
${feedbackText}`;

  const result = await model.generateContent(prompt);
  const cleaned = result.response.text().trim().replace(/```json|```/g, '').trim();

  let parsed: Partial<WeeklySummary> = {};
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    parsed = {};
  }

  return {
    top_themes: Array.isArray(parsed.top_themes) ? parsed.top_themes : [],
    overall_sentiment: parsed.overall_sentiment || 'Unknown',
    key_insight: parsed.key_insight || 'No insight generated.',
    generated_at: new Date().toISOString(),
  };
};
