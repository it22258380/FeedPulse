import { analyzeFeedback } from '../services/gemini.service';
import { GoogleGenerativeAI } from '@google/generative-ai';

jest.mock('@google/generative-ai');

describe('Gemini Service', () => {
  beforeEach(() => {
    process.env.GEMINI_API_KEY = 'test-api-key';
    jest.clearAllMocks();
  });

  it('mock the API call and test parsing logic', async () => {
    const mockGenerateContent = jest.fn().mockResolvedValue({
      response: {
        text: () => JSON.stringify({
          category: 'Feature Request',
          sentiment: 'Positive',
          priority_score: 9,
          summary: 'A great new feature mocked summary',
          tags: ['feature', 'mock']
        })
      }
    });

    (GoogleGenerativeAI as jest.Mock).mockImplementation(() => ({
      getGenerativeModel: () => ({
        generateContent: mockGenerateContent
      })
    }));

    const result = await analyzeFeedback('Mock Title', 'Mock Description');

    expect(result.category).toBe('Feature Request');
    expect(result.sentiment).toBe('Positive');
    expect(result.priority_score).toBe(9);
    expect(result.summary).toBe('A great new feature mocked summary');
    expect(result.tags).toEqual(['feature', 'mock']);
    expect(mockGenerateContent).toHaveBeenCalled();
  });

  it('handles invalid json gracefully in analyzeFeedback', async () => {
    const mockGenerateContent = jest.fn().mockResolvedValue({
      response: {
        text: () => 'Not valid JSON'
      }
    });

    (GoogleGenerativeAI as jest.Mock).mockImplementation(() => ({
      getGenerativeModel: () => ({
        generateContent: mockGenerateContent
      })
    }));

    const result = await analyzeFeedback('Mock Title', 'Mock Description');
    expect(result.category).toBe('Other');
    expect(result.sentiment).toBe('Neutral');
  });

  it('throws error if API key is not set', async () => {
    delete process.env.GEMINI_API_KEY;
    await expect(analyzeFeedback('Title', 'Desc')).rejects.toThrow('GEMINI_API_KEY is not configured');
  });
});
