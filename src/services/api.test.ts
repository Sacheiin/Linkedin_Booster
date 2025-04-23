import { ApiService } from './api';
import chrome from 'jest-webextension-mock';

describe('ApiService', () => {
  beforeEach(() => {
    chrome.storage.sync.clear();
    ApiService['token'] = null;
  });

  test('should handle auth token storage', async () => {
    await ApiService.setToken('test-token');
    expect(chrome.storage.sync.set).toBeCalledWith({ authToken: 'test-token' });
    expect(ApiService['token']).toBe('test-token');
  });

  test('should generate content ideas through API', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ ideas: ['Test Idea 1', 'Test Idea 2'] })
      })
    ) as jest.Mock;

    const response = await ApiService.generateContentIdeas({
      userProfile: { industry: 'Tech', role: 'Developer' },
      preferences: { contentTone: 'professional' },
      count: 5
    });

    expect(response.ideas.length).toBe(2);
    expect(fetch).toBeCalledWith(expect.stringContaining('/generate-ideas'), expect.any(Object));
  });
});