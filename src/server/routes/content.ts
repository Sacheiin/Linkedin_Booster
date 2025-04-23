import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Post from '../models/Post';

import axios from "axios";
import axiosRetry from "axios-retry";

// Helper function to provide tone-specific guidelines
function getToneGuidelines(tone: string): string {
  switch (tone.toLowerCase()) {
    case 'professional':
      return 'formal, authoritative, industry-specific terminology';
    case 'conversational':
      return 'friendly, approachable, using first-person perspective';
    case 'educational':
      return 'informative, clear explanations, data-backed insights';
    case 'inspiring':
      return 'motivational, story-driven, emotionally resonant';
    default:
      return 'balanced professional tone';
  }
}

// Helper function to provide content type specific instructions
function getContentTypeInstructions(contentType: string): string {
  switch (contentType.toLowerCase()) {
    case 'text':
      return 'text-only post with compelling narrative';
    case 'poll':
      return 'include 2-4 poll options about a relevant industry topic';
    case 'image':
      return 'describe an ideal image to accompany this post and provide caption text';
    case 'video':
      return 'suggest a brief video concept and provide script/talking points';
    default:
      return 'text-only post with compelling narrative';
  }
}

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

axiosRetry(axios, {
  retries: 3,
  retryDelay: (retryCount: number) => 1000,
  // shouldResetTimeout: true,
  retryCondition: (error: any) => {
    // Check for network errors or server errors (status >= 500)
    return (error.code === 'ECONNABORTED' || !error.response || (error.response?.status ?? 0) >= 500);
  }
});

router.post('/generate-ideas', async (req, res) => {
  const { userProfile, preferences, count = 3, trendingTopics = [] } = req.body;

  // Enhanced prompt with industry-specific engagement patterns and real-time trends
  const prompt = `
    Generate ${count} highly engaging LinkedIn post ideas for a professional with:
    - Industry: ${userProfile.industry}
    - Role: ${userProfile.role}
    - Expertise: ${userProfile.interests.join(', ')}
    - Tone: ${preferences.contentTone}

    Consider these LinkedIn engagement best practices:
    - Posts with questions get 50% more comments
    - Posts with 1-5 hashtags get 29% more engagement
    - Video content receives 5x more engagement than static posts
    - Polls average 450% higher engagement rate
    - Posts published Tuesday-Thursday between 8-10am get highest visibility
    
    ${trendingTopics.length > 0 ? `Current trending topics on LinkedIn: ${trendingTopics.join(', ')}. Incorporate these where relevant.` : ''}
    
    For each idea, include:
    1. A compelling hook/title (1-2 sentences)
    2. Content type suggestion (text, poll, image, video)
    3. 2-3 relevant hashtags
    
    Ideas should align with current ${userProfile.industry} trends and promote thought leadership.
    Format as numbered list with clear separation between ideas.
  `;

  try {
    const result = await model.generateContent(prompt)
      .catch(async (error) => {
        console.error('Gemini API Error:', error);
        if (error.response?.status >= 500) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          return model.generateContent(prompt);
        }
        throw new Error(`Content generation failed: ${error.message}`);
      });
    const ideas = result.response.text()
      .split(/\d+\./)
      .slice(1)
      .map(idea => idea.trim())
      .filter(idea => idea.length > 0);
    res.json({ ideas });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate content ideas' });
  }
});

router.post('/generate-post', async (req, res) => {
  const { idea, userProfile, preferences, contentType = 'text', contentLength = 'medium' } = req.body;

  // Map content length preference to word count ranges
  const lengthMap = {
    short: '100-150',
    medium: '200-300',
    long: '350-500'
  };

  // Enhanced prompt with customizable parameters
  const prompt = `
    Generate a highly engaging LinkedIn ${contentType} post based on: "${idea}"
    
    Professional background:
    - Industry: ${userProfile.industry}
    - Role: ${userProfile.role}
    - Expertise areas: ${userProfile.interests.join(', ')}
    
    Content requirements:
    - Tone: ${preferences.contentTone} (${getToneGuidelines(preferences.contentTone)})
    - Length: ${lengthMap[contentLength as keyof typeof lengthMap]} words
    - Content type: ${getContentTypeInstructions(contentType)}
    - Include 3-5 relevant hashtags that boost discoverability
    - Start with an attention-grabbing hook
    - End with a compelling question or call-to-action
    - Format optimized for LinkedIn readability (short paragraphs, line breaks)
    - Ensure content feels authentic and aligns with ${userProfile.industry} best practices
  `;

  try {
    const result = await model.generateContent(prompt)
      .catch(async (error) => {
        if (error.message.includes('quota')) {
          console.log('Rate limit hit, retrying with delay...');
          await new Promise(resolve => setTimeout(resolve, 2000));
          return model.generateContent(prompt);
        }
        throw new Error(`Content generation failed: ${error.message}`);
      });
    res.json({ post: result.response.text() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate post' });
  }
});

router.post('/schedule', async (req, res) => {
  const { userId, content, scheduledTime } = req.body;

  try {
    const post = new Post({
      userId,
      content,
      scheduledTime: new Date(scheduledTime),
    });
    await post.save();
    res.json({ message: 'Post scheduled', postId: post._id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to schedule post' });
  }
});

// Removed all validation middleware imports and usage

export default router;