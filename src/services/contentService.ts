import { ApiService } from './api';
import { STORAGE_KEYS } from '../utils/constants';

export const DEFAULT_USER_PROFILE = {
  industry: 'Technology',
  role: 'Software Developer',
  interests: ['AI', 'Web Development', 'Career Growth'],
};

const DEFAULT_USER_PREFERENCES = {
  contentTone: 'professional',
  postFrequency: 'weekly',
  commentFrequency: 'daily',
};

export class ContentService {
  static async getUserProfile(): Promise<any> {
    return new Promise((resolve) => {
      chrome.storage.sync.get([STORAGE_KEYS.USER_PROFILE], (result) => {
        resolve(result[STORAGE_KEYS.USER_PROFILE] || DEFAULT_USER_PROFILE);
      });
    });
  }

  static async getUserPreferences(): Promise<any> {
    return new Promise((resolve) => {
      chrome.storage.sync.get([STORAGE_KEYS.USER_PREFERENCES], (result) => {
        resolve(result[STORAGE_KEYS.USER_PREFERENCES] || DEFAULT_USER_PREFERENCES);
      });
    });
  }

  static async generateContentIdeas(count: number = 3): Promise<string[]> {
    const userProfile = await this.getUserProfile();
    const preferences = await this.getUserPreferences();
    
    // Get trending topics from LinkedIn feed if available
    let trendingTopics: string[] = [];
    try {
      // Request trending topics from content script
      const insights = await new Promise<any>((resolve) => {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
          if (tabs[0]?.id) {
            chrome.tabs.sendMessage(tabs[0].id, { type: 'getPostInsights' }, (response) => {
              resolve(response || { trendingTopics: [] });
            });
          } else {
            resolve({ trendingTopics: [] });
          }
        });
      });
      trendingTopics = insights.trendingTopics || [];
    } catch (error) {
      console.error('Error getting trending topics:', error);
    }
    
    // Enhanced request with trending topics for better personalization
    const response = await ApiService.generateContentIdeas({ 
      userProfile, 
      preferences, 
      count,
      trendingTopics
    });
    
    return response.ideas;
  }

  static async generateFullPost(idea: string, options: {
    contentType?: 'text' | 'poll' | 'image' | 'video',
    contentLength?: 'short' | 'medium' | 'long',
    contentTone?: string
  } = {}): Promise<string> {
    const userProfile = await this.getUserProfile();
    const preferences = await this.getUserPreferences();
    
    // Apply custom options or use defaults from preferences
    const postOptions = {
      contentType: options.contentType || 'text',
      contentLength: options.contentLength || 'medium',
      contentTone: options.contentTone || preferences.contentTone
    };
    
    const response = await ApiService.generateFullPost({ 
      idea, 
      userProfile, 
      preferences: {
        ...preferences,
        contentTone: postOptions.contentTone
      },
      contentType: postOptions.contentType,
      contentLength: postOptions.contentLength
    });
    
    return response.post;
  }

  static async schedulePost(post: any): Promise<void> {
    const userProfile = await this.getUserProfile();
    const response = await ApiService.schedulePost({
      userId: userProfile.id || 'demo-user',
      content: post.content,
      scheduledTime: post.scheduledTime,
    });
    chrome.storage.sync.get([STORAGE_KEYS.CONTENT_CACHE], (result) => {
      const scheduledPosts = result[STORAGE_KEYS.CONTENT_CACHE]?.scheduledPosts || [];
      scheduledPosts.push({
        ...post,
        id: response.postId,
        created: new Date().toISOString(),
      });
      chrome.storage.sync.set({
        [STORAGE_KEYS.CONTENT_CACHE]: { ...result[STORAGE_KEYS.CONTENT_CACHE], scheduledPosts },
      });
    });
  }

  static async getScheduledPosts(): Promise<any[]> {
    return new Promise((resolve) => {
      chrome.storage.sync.get([STORAGE_KEYS.CONTENT_CACHE], (result) => {
        resolve(result[STORAGE_KEYS.CONTENT_CACHE]?.scheduledPosts || []);
      });
    });
  }
}