import { API_BASE_URL } from '../utils/constants';

export class ApiService {
  private static token: string | null = null;

  static init(): void {
    chrome.storage.sync.get(['authToken'], (result) => {
      if (result.authToken) {
        this.token = result.authToken;
      }
    });
  }

  static setToken(token: string): void {
    this.token = token;
    chrome.storage.sync.set({ authToken: token });
  }

  static clearToken(): void {
    this.token = null;
    chrome.storage.sync.remove('authToken');
  }

  static async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = new Headers({
      'Content-Type': 'application/json',
      ...options.headers,
    });

    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }

    const config = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  static get(endpoint: string): Promise<any> {
    return this.request(endpoint, { method: 'GET' });
  }

  static post(endpoint: string, data: any): Promise<any> {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static generateContentIdeas(data: {
    userProfile: any;
    preferences: any;
    count: number;
    trendingTopics?: string[];
  }): Promise<any> {
    return this.post('/api/content/generate-ideas', data);
  }

  static generateFullPost(data: {
    idea: string;
    userProfile: any;
    preferences: any;
    contentType?: 'text' | 'poll' | 'image' | 'video';
    contentLength?: 'short' | 'medium' | 'long';
  }): Promise<any> {
    return this.post('/api/content/generate-post', data);
  }

  static schedulePost(data: any): Promise<any> {
    return this.post('/api/content/schedule', data);
  }
}

ApiService.init();