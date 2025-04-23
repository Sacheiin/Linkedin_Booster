import { z } from 'zod';

export const ContentPreferencesSchema = z.object({
  userProfile: z.object({
    industry: z.string(),
    role: z.string(),
    interests: z.array(z.string())
  }),
  preferences: z.object({
    contentTone: z.enum(['professional', 'conversational', 'educational', 'inspiring'])
  }),
  count: z.number().int().positive().optional()
});

export const PostGenerationSchema = z.object({
  idea: z.string(),
  userProfile: z.object({
    industry: z.string(),
    role: z.string()
  }),
  preferences: z.object({
    contentTone: z.enum(['professional', 'conversational', 'educational', 'inspiring'])
  })
});

export const SchedulingSchema = z.object({
  userId: z.string(),
  content: z.string(),
  scheduledTime: z.string().datetime()
});