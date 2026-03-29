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

const getClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured');
  return new GoogleGenerativeAI(apiKey);
};

export const analyzeFeedback = async (title: string, description: string): Promise<GeminiAnalysis> => {
  const model = getClient().getGenerativeModel({ model: 'gemini-1.5-flash' });

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
  const parsed = JSON.parse(cleaned) as GeminiAnalysis;

  return {
    category: parsed.category || 'Other',
    sentiment: (['Positive', 'Neutral', 'Negative'].includes(parsed.sentiment) ? parsed.sentiment : 'Neutral') as 'Positive' | 'Neutral' | 'Negative',
    priority_score: Math.min(10, Math.max(1, Number(parsed.priority_score) || 5)),
    summary: parsed.summary || 'No summary available',
    tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 5) : [],
  };
};

export const generateWeeklySummary = async (
  items: Array<{ title: string; description: string; ai_tags?: string[]; ai_sentiment?: string }>
): Promise<WeeklySummary> => {
  const model = getClient().getGenerativeModel({ model: 'gemini-1.5-flash' });

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
  const parsed = JSON.parse(cleaned);
  return { ...parsed, generated_at: new Date().toISOString() };
};
