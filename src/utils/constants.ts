// Storage keys matching Zod schema requirements
export const STORAGE_KEYS = {
  USER_PROFILE: 'userProfile',
  USER_PREFERENCES: 'userPreferences',
  GEMINI_CONFIG: 'geminiConfig',
  LINKEDIN_TOKEN: 'linkedinToken',
  CONTENT_CACHE: 'contentCache',
} as const;

// Type safety enums
export const CONTENT_TONE = {
  PROFESSIONAL: 'professional',
  CONVERSATIONAL: 'conversational',
  EDUCATIONAL: 'educational',
  INSPIRING: 'inspiring'
} as const;

export const FREQUENCY = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly'
} as const;

// API configuration
export const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';