import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '../utils/constants';

import { z } from 'zod';

export const UserPreferencesSchema = z.object({
  contentTone: z.enum(['professional', 'conversational', 'educational']),
  postFrequency: z.enum(['daily', 'weekly', 'monthly']),
  commentFrequency: z.enum(['low', 'medium', 'high']),
  aiGenerationEnabled: z.boolean(),
}).strict();

export type UserPreferences = z.infer<typeof UserPreferencesSchema>;

interface GeminiConfig {
  apiKey: string;
  model: string;
  safetySettings: {
    harassment: 'blockNone' | 'blockMost';
    toxicity: 'blockNone' | 'blockMost';
  };
}

interface UserStoreState {
  preferences: UserPreferences;
  geminiConfig: GeminiConfig;
  linkedinToken: string | null;
  setPreferences: (prefs: Partial<UserPreferences>) => void;
  setGeminiConfig: (config: Partial<GeminiConfig>) => void;
  setLinkedinToken: (token: string) => void;
  clearSensitiveData: () => void;
}

// Remove custom StorageValue and PersistStorage interfaces

// Use Zustand's PersistStorage<UserStoreState> type directly
const chromeStorage = {
  getItem: async (name: string): Promise<import('zustand/middleware').StorageValue<UserStoreState> | null> => {
    return new Promise((resolve) => {
      chrome.storage.sync.get([name], (items) => {
        if (items[name] === undefined) {
          resolve(null);
        } else {
          try {
            const value = JSON.parse(items[name]);
            resolve(value);
          } catch {
            resolve(null);
          }
        }
      });
    });
  },
  setItem: async (name: string, value: import('zustand/middleware').StorageValue<UserStoreState>): Promise<void> => {
    await chrome.storage.sync.set({ [name]: JSON.stringify(value) });
  },
  removeItem: async (name: string): Promise<void> => {
    await chrome.storage.sync.remove(name);
  }
};

export const useUserStore = create(
  persist<UserStoreState>(
    (set) => ({
      preferences: {
        contentTone: 'professional',
        postFrequency: 'weekly',
        commentFrequency: 'medium',
        aiGenerationEnabled: true,
      },
      geminiConfig: {
        apiKey: '',
        model: 'gemini-pro',
        safetySettings: {
          harassment: 'blockMost',
          toxicity: 'blockMost',
        },
      },
      linkedinToken: null,
      setPreferences: (prefs: Partial<UserPreferences>) =>
        set((state: UserStoreState) => ({
          preferences: UserPreferencesSchema.parse({
            ...state.preferences,
            ...prefs
          })
        })),
      setGeminiConfig: (config: Partial<GeminiConfig>) =>
        set((state: UserStoreState) => ({
          geminiConfig: {
            ...state.geminiConfig,
            ...config
          }
        })),
      setLinkedinToken: (token) => {
        const encryptedToken = btoa(token);
        set({ linkedinToken: encryptedToken });
      },
      clearSensitiveData: () => {
        set({
          geminiConfig: { ...useUserStore.getState().geminiConfig, apiKey: '' },
          linkedinToken: null,
        });
      },
    }),
    {
      name: STORAGE_KEYS.USER_PREFERENCES,
      storage: chromeStorage,
      partialize: (state) => ({
        preferences: state.preferences,
        geminiConfig: state.geminiConfig,
        linkedinToken: state.linkedinToken,
        setPreferences: state.setPreferences,
        setGeminiConfig: state.setGeminiConfig,
        setLinkedinToken: state.setLinkedinToken,
        clearSensitiveData: state.clearSensitiveData,
      }),
    }
  )
);