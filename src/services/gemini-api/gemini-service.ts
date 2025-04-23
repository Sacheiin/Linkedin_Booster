import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiService {
  private static instance: GeminiService;
  private genAI: GoogleGenerativeAI;
  private model: any;

  private constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
  }

  public static getInstance(): GeminiService {
    if (!GeminiService.instance) {
      // Get API key from storage or use a default for development
      const apiKey = process.env.GEMINI_API_KEY || 'default-key-for-development';
      GeminiService.instance = new GeminiService(apiKey);
    }
    return GeminiService.instance;
  }

  async generateContentIdeas(prompt: string): Promise<string[]> {
    const result = await this.model.generateContent(prompt);
    return result.response.text()
      .split(/\d+\./)
      .slice(1)
      .map((idea: string) => idea.trim())
      .filter((idea: string) => idea.length > 0);
  }

  async generatePostContent(prompt: string): Promise<string> {
    const result = await this.model.generateContent(prompt);
    return result.response.text();
  }

  async sendRequest({ prompt }: { prompt: string }): Promise<string> {
    try {
      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('Error generating content:', error);
      throw error;
    }
  }
}

export default GeminiService;
