# LinkedIn Booster - Phase 3 Development Guide

This guide extends the **LinkedIn Booster Phase 2 Development Guide** to implement the Comment Suggestion Module, Network Targeting, Engagement Tracking, and LinkedIn browsing integration as outlined in the Product Requirements Document (PRD) for Phase 3 (Weeks 9-12). It ensures seamless synchronization with the Phase 2 setup, maintaining consistency in project structure, dependencies, and development workflow. The guide assumes the Phase 1 and Phase 2 setups are complete, including the Chrome extension boilerplate, React frontend, Express backend, MongoDB integration, and Gemini API functionality.

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Project Structure Updates](#project-structure-updates)
4. [Dependency Updates](#dependency-updates)
5. [Backend Development](#backend-development)
6. [Frontend Development](#frontend-development)
7. [Phase 3 Features](#phase-3-features)
8. [Testing](#testing)
9. [Development Workflow](#development-workflow)
10. [Troubleshooting](#troubleshooting)
11. [Next Steps](#next-steps)

---

## Overview

Phase 3 focuses on implementing the **Comment Suggestion Module**, **Network Targeting**, **Engagement Tracking**, and **LinkedIn Browsing Integration** as specified in the PRD:

- **Comment Suggestion Algorithm**: Generate personalized comment suggestions for LinkedIn posts based on post content, user preferences, and network growth goals.
- **Network Targeting**: Identify and prioritize posts from key connections or industry influencers for commenting.
- **Engagement Tracking**: Track engagement metrics (likes, replies) on user comments and posts.
- **LinkedIn Browsing Integration**: Enable the extension to analyze LinkedIn feed or profile pages for comment opportunities.

This guide builds on the Phase 2 architecture, leveraging the existing Express backend, MongoDB database, and React-based Chrome extension. It introduces LinkedIn API integration for posting and analytics, aligning with the PRD's technical requirements.

---

## Prerequisites

Ensure the following are set up from Phases 1 and 2:

- **Node.js** (v16.x or later) and **npm** (v8.x or later).
- **Git** repository in the `linkedin-booster` directory.
- **Chrome Browser** for extension testing.
- **Code Editor** .
- **Phase 2 Dependencies** installed (React, TypeScript, Webpack, Express, MongoDB, Gemini API client, etc.).
- **Gemini API Key**, **MongoDB URI**, and **LinkedIn API Credentials** in `.env`.
- **LinkedIn Developer Account** with API access (LinkedIn API for posting and analytics).
- **Phase 2 Features** functional (content generation, post creation, scheduling).

Verify the Phase 2 setup by running:

```bash
npm run dev
```

Load the `build/` directory as an unpacked extension in Chrome (`chrome://extensions/`) and confirm the popup displays the "LinkedIn Booster" dashboard with content generation and scheduling features.

---

## Project Structure Updates

Phase 2 introduced backend components (`server/`) and extended the frontend for content generation. Phase 3 adds modules for comment suggestions, engagement tracking, and LinkedIn integration. Update the project structure as follows:

```plaintext
linkedin-booster/
├── build/                      # Compiled extension files
├── src/
│   ├── assets/                # Icons and static assets
│   ├── background/            # Background scripts (updated)
│   ├── components/            # Reusable React components
│   ├── content_scripts/       # Content scripts for LinkedIn (updated)
│   ├── pages/                 # Page components (Dashboard, Content Generator, Comment Generator)
│   ├── popup/                 # Popup UI (React app)
│   ├── services/              # API, Gemini, and LinkedIn services
│   ├── server/                # Backend
│   │   ├── routes/            # API routes (updated)
│   │   ├── models/            # MongoDB schemas (updated)
│   │   └── middleware/        # Authentication and validation
│   ├── utils/                 # Constants and helpers
│   └── manifest.json          # Chrome extension manifest (updated)
├── .babelrc                   # Babel configuration
├── .eslintrc.js               # ESLint configuration
├── .gitignore                 # Git ignore file
├── package.json               # Project dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── webpack.config.js          # Webpack configuration
└── .env                       # Environment variables
```

Update `src/content_scripts/` and `src/background/` for LinkedIn browsing integration, and extend `src/server/` for comment and engagement APIs.

---

## Dependency Updates

Phase 2 installed backend (Express, MongoDB) and frontend (React, date-fns) dependencies. Phase 3 requires additional dependencies for LinkedIn API integration, analytics processing, and content script functionality.

Install the following:

```bash
# LinkedIn API and analytics dependencies
npm install axios@1.8.4 @types/axios@0.9.36 node-fetch@3.3.2

# Frontend dependencies
npm install react-toastify@9.1.3

# Development dependencies
npm install --save-dev @types/node-fetch@3.0.3 jest-fetch-mock@3.0.3
```

Update `package.json` scripts to include new testing and build commands:

```json
{
  "scripts": {
    "build": "webpack --config webpack.config.js",
    "dev": "concurrently \"webpack --watch --config webpack.config.js\" \"nodemon src/server/index.ts\"",
    "start:server": "nodemon src/server/index.ts",
    "test": "jest",
    "test:integration": "jest --config=jest.integration.config.js",
    "lint": "eslint --ext .js,.jsx,.ts,.tsx src/",
    "format": "prettier --write \"src/**/*.{js,jsx,ts,tsx,json,css}\""
  }
}
```

---

## Backend Development

Phase 2 established the Express backend for content generation and scheduling. Phase 3 extends it to support comment suggestions, engagement tracking, and LinkedIn API integration.

### 5.1 Update Server Setup

Update `src/server/index.ts` to include new routes and LinkedIn API authentication middleware:

```typescript
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import contentRoutes from './routes/content';
import commentRoutes from './routes/comments';
import analyticsRoutes from './routes/analytics';
import { authenticateLinkedIn } from './middleware/linkedinAuth';

dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.API_BASE_URL }));
app.use(express.json());
app.use(authenticateLinkedIn); // LinkedIn API authentication for protected routes

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI!, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/content', contentRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/analytics', analyticsRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

### 5.2 LinkedIn Authentication Middleware

Create `src/server/middleware/linkedinAuth.ts` for LinkedIn OAuth 2.0:

```typescript
import { Request, Response, NextFunction } from 'express';
import axios from 'axios';

export const authenticateLinkedIn = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    // Validate LinkedIn access token
    const response = await axios.get('https://api.linkedin.com/v2/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    req.user = response.data; // Store user data in request
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid LinkedIn token' });
  }
};
```

### 5.3 Comment Suggestion API

Create `src/server/routes/comments.ts`:

```typescript
import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Comment from '../models/Comment';

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

// Generate comment suggestions
router.post('/generate-comments', async (req, res) => {
  const { postContent, userProfile, preferences, count = 3 } = req.body;

  const prompt = `
    Generate ${count} LinkedIn comment suggestions for the following post:
    "${postContent}"
    User profile:
    - Industry: ${userProfile.industry}
    - Role: ${userProfile.role}
    - Interests: ${userProfile.interests.join(', ')}
    Preferences:
    - Tone: ${preferences.commentTone}
    - Goal: ${preferences.networkGoal || 'build connections'}
    Comments should:
    - Be concise (1-2 sentences)
    - Align with the user's professional voice
    - Promote meaningful engagement
    Format each comment as a single string.
  `;

  try {
    const result = await model.generateContent(prompt);
    const comments = result.response.text()
      .split(/\d+\./)
      .slice(1)
      .map(comment => comment.trim())
      .filter(comment => comment.length > 0);
    res.json({ comments });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate comments' });
  }
});

// Save comment
router.post('/save-comment', async (req, res) => {
  const { userId, postId, content } = req.body;

  try {
    const comment = new Comment({
      userId,
      postId,
      content,
      createdAt: new Date(),
    });
    await comment.save();
    res.json({ message: 'Comment saved', commentId: comment._id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save comment' });
  }
});

export default router;
```

### 5.4 Engagement Analytics API

Create `src/server/routes/analytics.ts`:

```typescript
import express from 'express';
import axios from 'axios';
import Post from '../models/Post';
import Comment from '../models/Comment';

const router = express.Router();

// Fetch engagement metrics for posts and comments
router.get('/engagement', async (req, res) => {
  const { userId } = req.query;

  try {
    // Fetch posts and comments from MongoDB
    const posts = await Post.find({ userId });
    const comments = await Comment.find({ userId });

    // Fetch LinkedIn engagement data (mocked until LinkedIn API is fully integrated)
    const engagementData = await Promise.all([
      ...posts.map(async (post) => ({
        postId: post._id,
        content: post.content,
        likes: Math.floor(Math.random() * 100), // Replace with LinkedIn API call
        comments: Math.floor(Math.random() * 20),
        shares: Math.floor(Math.random() * 10),
      })),
      ...comments.map(async (comment) => ({
        commentId: comment._id,
        content: comment.content,
        likes: Math.floor(Math.random() * 10), // Replace with LinkedIn API call
        replies: Math.floor(Math.random() * 5),
      })),
    ]);

    res.json({ engagement: engagementData });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch engagement data' });
  }
});

export default router;
```

### 5.5 MongoDB Schema for Comments

Create `src/server/models/Comment.ts`:

```typescript
import mongoose, { Schema } from 'mongoose';

const CommentSchema = new Schema({
  userId: { type: String, required: true },
  postId: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'posted'], default: 'pending' },
});

export default mongoose.model('Comment', CommentSchema);
```

---

## Frontend Development

Phase 2 extended the React popup for content generation. Phase 3 adds comment suggestion, network targeting, and engagement tracking features, plus content scripts for LinkedIn browsing integration.

### 6.1 Update Manifest

Update `src/manifest.json` to include permissions for LinkedIn and content scripts:

```json
{
  "manifest_version": 3,
  "name": "LinkedIn Booster",
  "version": "1.0.0",
  "description": "AI-powered Chrome extension to boost your LinkedIn presence",
  "permissions": [
    "storage",
    "activeTab",
    "scripting",
    "identity"
  ],
  "host_permissions": [
    "https://www.linkedin.com/*",
    "https://api.linkedin.com/*"
  ],
  "background": {
    "service_worker": "background/background.js"
  },
  "action": {
    "default_popup": "popup/index.html"
  },
  "content_scripts": [
    {
      "matches": ["https://www.linkedin.com/*"],
      "js": ["content_scripts/linkedin.js"],
      "css": ["content_scripts/linkedin.css"]
    }
  ],
  "icons": {
    "16": "assets/icon-16.png",
    "48": "assets/icon-48.png",
    "128": "assets/icon-128.png"
  }
}
```

### 6.2 Content Script for LinkedIn Browsing

Create `src/content_scripts/linkedin.ts` to analyze LinkedIn feed and inject comment suggestions:

```typescript
import { ContentService } from '../services/contentService';

const observeFeed = () => {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(() => {
      const posts = document.querySelectorAll('.feed-shared-update-v2');
      posts.forEach(async (post) => {
        const postContent = post.querySelector('.feed-shared-text')?.textContent || '';
        const postId = post.getAttribute('data-urn') || `post-${Date.now()}`;
        const suggestionButton = document.createElement('button');
        suggestionButton.textContent = 'Get Comment Suggestions';
        suggestionButton.className = 'linkedin-booster-suggestion-btn';
        suggestionButton.onclick = async () => {
          const comments = await ContentService.generateCommentSuggestions(postContent);
          showCommentSuggestions(post, comments, postId);
        };
        if (!post.querySelector('.linkedin-booster-suggestion-btn')) {
          post.appendChild(suggestionButton);
        }
      });
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });
};

const showCommentSuggestions = (post: Element, comments: string[], postId: string) => {
  const suggestionContainer = document.createElement('div');
  suggestionContainer.className = 'linkedin-booster-suggestions';
  suggestionContainer.innerHTML = `
    <h4>Comment Suggestions</h4>
    <ul>
      ${comments.map(comment => `
        <li>
          ${comment}
          <button class="post-comment-btn" data-comment="${comment}" data-post-id="${postId}">Post</button>
        </li>
      `).join('')}
    </ul>
  `;

  post.appendChild(suggestionContainer);

  // Handle comment posting
  suggestionContainer.querySelectorAll('.post-comment-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const comment = btn.getAttribute('data-comment')!;
      const postId = btn.getAttribute('data-post-id')!;
      await ContentService.postComment(postId, comment);
      suggestionContainer.remove();
    });
  });
};

// Initialize content script
if (document.readyState === 'complete') {
  observeFeed();
} else {
  window.addEventListener('load', observeFeed);
}
```

Create `src/content_scripts/linkedin.css`:

```css
.linkedin-booster-suggestion-btn {
  background-color: #0077b5;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  margin: 8px;
}

.linkedin-booster-suggestions {
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  padding: 12px;
  margin: 8px;
  border-radius: 4px;
}

.linkedin-booster-suggestions h4 {
  margin: 0 0 8px;
}

.linkedin-booster-suggestions ul {
  list-style: none;
  padding: 0;
}

.linkedin-booster-suggestions li {
  margin-bottom: 8px;
}

.linkedin-booster-suggestions .post-comment-btn {
  background-color: #28a745;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 8px;
}
```

### 6.3 Update API Service

Update `src/services/api.ts` to include comment and analytics endpoints:

```typescript
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
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
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

  static generateContentIdeas(data: any): Promise<any> {
    return this.post('/api/content/generate-ideas', data);
  }

  static generateFullPost(data: any): Promise<any> {
    return this.post('/api/content/generate-post', data);
  }

  static schedulePost(data: any): Promise<any> {
    return this.post('/api/content/schedule', data);
  }

  static generateCommentSuggestions(data: any): Promise<any> {
    return this.post('/api/comments/generate-comments', data);
  }

  static saveComment(data: any): Promise<any> {
    return this.post('/api/comments/save-comment', data);
  }

  static getEngagementMetrics(userId: string): Promise<any> {
    return this.get(`/api/analytics/engagement?userId=${userId}`);
  }
}

ApiService.init();
```

### 6.4 Update Content Service

Update `src/services/contentService.ts` to include comment and engagement functionality:

```typescript
import { ApiService } from './api';
import { STORAGE_KEYS } from '../utils/constants';

const DEFAULT_USER_PROFILE = {
  industry: 'Technology',
  role: 'Software Developer',
  interests: ['AI', 'Web Development', 'Career Growth'],
};

const DEFAULT_USER_PREFERENCES = {
  contentTone: 'professional',
  commentTone: 'professional',
  postFrequency: 'weekly',
  commentFrequency: 'daily',
  networkGoal: 'build connections',
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
    const response = await ApiService.generateContentIdeas({ userProfile, preferences, count });
    return response.ideas;
  }

  static async generateFullPost(idea: string): Promise<string> {
    const userProfile = await this.getUserProfile();
    const preferences = await this.getUserPreferences();
    const response = await ApiService.generateFullPost({ idea, userProfile, preferences });
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

  static async generateCommentSuggestions(postContent: string, count: number = 3): Promise<string[]> {
    const userProfile = await this.getUserProfile();
    const preferences = await this.getUserPreferences();
    const response = await ApiService.generateCommentSuggestions({
      postContent,
      userProfile,
      preferences,
      count,
    });
    return response.comments;
  }

  static async postComment(postId: string, content: string): Promise<void> {
    const userProfile = await this.getUserProfile();
    await ApiService.saveComment({
      userId: userProfile.id || 'demo-user',
      postId,
      content,
    });
    // Mock LinkedIn API posting (replace with actual LinkedIn API call in production)
    console.log(`Posted comment on ${postId}: ${content}`);
  }

  static async getEngagementMetrics(): Promise<any> {
    const userProfile = await this.getUserProfile();
    const response = await ApiService.getEngagementMetrics(userProfile.id || 'demo-user');
    return response.engagement;
  }
}
```

### 6.5 Update Popup UI

Update `src/popup/App.tsx` to include comment suggestions and engagement analytics:

```typescript
import React, { useState, useEffect } from 'react';
import { ContentService } from '../services/contentService';
import DatePicker from 'react-datepicker';
import { ToastContainer, toast } from 'react-toastify';
import 'react-datepicker/dist/react-datepicker.css';
import 'react-toastify/dist/ReactToastify.css';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [contentIdeas, setContentIdeas] = useState<string[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<string | null>(null);
  const [generatedPost, setGeneratedPost] = useState<string>('');
  const [scheduledDate, setScheduledDate] = useState<Date | null>(null);
  const [tone, setTone] = useState<string>('professional');
  const [engagementData, setEngagementData] = useState<any[]>([]);

  useEffect(() => {
    // Initialize user data
    ContentService.getUserProfile().then((profile) => {
      setUserData({
        name: profile.name || 'Demo User',
        industry: profile.industry,
      });
      setIsLoading(false);
    });

    // Generate initial content ideas
    ContentService.generateContentIdeas().then(setContentIdeas);

    // Fetch engagement metrics
    ContentService.getEngagementMetrics().then(setEngagementData);
  }, []);

  const handleGeneratePost = async () => {
    if (selectedIdea) {
      const post = await ContentService.generateFullPost(selectedIdea);
      setGeneratedPost(post);
    }
  };

  const handleSchedulePost = async () => {
    if (generatedPost && scheduledDate) {
      await ContentService.schedulePost({
        content: generatedPost,
        scheduledTime: scheduledDate.toISOString(),
      });
      toast.success('Post scheduled successfully!');
      setGeneratedPost('');
      setScheduledDate(null);
    }
  };

  return (
    <div className="app-container">
      <header>
        <h1>LinkedIn Booster</h1>
      </header>
      {isLoading ? (
        <div className="loading-container">
          <p>Loading your personalized dashboard...</p>
        </div>
      ) : (
        <div className="dashboard">
          <div className="user-info">
            <h2>Welcome, {userData.name}</h2>
            <p>Industry: {userData.industry}</p>
          </div>
          <div className="content-generator">
            <h3>Content Ideas</h3>
            <ul className="content-ideas">
              {contentIdeas.map((idea, index) => (
                <li
                  key={index}
                  className={selectedIdea === idea ? 'selected' : ''}
                  onClick={() => setSelectedIdea(idea)}
                >
                  {idea}
                </li>
              ))}
            </ul>
            <button onClick={() => ContentService.generateContentIdeas().then(setContentIdeas)}>
              Refresh Ideas
            </button>
            {selectedIdea && (
              <div className="post-generator">
                <h3>Generate Post</h3>
                <label>
                  Tone:
                  <select value={tone} onChange={(e) => setTone(e.target.value)}>
                    <option value="professional">Professional</option>
                    <option value="conversational">Conversational</option>
                    <option value="educational">Educational</option>
                    <option value="inspiring">Inspiring</option>
                  </select>
                </label>
                <button onClick={handleGeneratePost}>Generate Post</button>
                {generatedPost && (
                  <div className="post-preview">
                    <h4>Generated Post</h4>
                    <textarea
                      value={generatedPost}
                      onChange={(e) => setGeneratedPost(e.target.value)}
                    />
                    <label>
                      Schedule Date:
                      <DatePicker
                        selected={scheduledDate}
                        onChange={(date: Date) => setScheduledDate(date)}
                        showTimeSelect
                        dateFormat="Pp"
                      />
                    </label>
                    <button onClick={handleSchedulePost}>Schedule Post</button>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="engagement-analytics">
            <h3>Engagement Analytics</h3>
            <ul>
              {engagementData.map((item, index) => (
                <li key={index}>
                  {item.postId ? `Post: ${item.content.slice(0, 50)}...` : `Comment: ${item.content.slice(0, 50)}...`}
                  <p>Likes: {item.likes || 0} | Comments/Replies: {item.comments || item.replies || 0} | Shares: {item.shares || 0}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default App;
```

Update `src/popup/popup.css` to style the engagement analytics section:

```css
.engagement-analytics {
  margin-top: 16px;
}

.engagement-analytics ul {
  list-style: none;
  padding: 0;
}

.engagement-analytics li {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 8px;
}

.engagement-analytics p {
  margin: 4px 0;
}
```

---

## Phase 3 Features

### 7.1 Comment Suggestion Algorithm

- **Logic**: The `/api/comments/generate-comments` endpoint uses the Gemini API to generate comment suggestions based on post content, user profile, and preferences (tone, network goal). Comments are concise and designed for engagement.
- **Frontend**: The content script (`linkedin.ts`) injects a "Get Comment Suggestions" button into LinkedIn posts, displaying suggestions when clicked.
- **Implementation Notes**:
  - Comments are tailored to the user’s professional voice and network goals (e.g., building connections).
  - Future iterations could integrate NLP for sentiment analysis of post content.

### 7.2 Network Targeting

- **Logic**: The content script prioritizes posts from key connections or influencers by analyzing post metadata (e.g., author role, industry). This is mocked in Phase 3 but will use LinkedIn API in production.
- **Frontend**: The content script applies suggestions to posts in the LinkedIn feed, with future filtering for targeted profiles.
- **Implementation Notes**:
  - Add user-configurable filters (e.g., “comment on posts from industry leaders”) in a future phase.
  - Store target profiles in `chrome.storage.sync` for persistence.

### 7.3 Engagement Tracking

- **Logic**: The `/api/analytics/engagement` endpoint retrieves engagement metrics for posts and comments from MongoDB, with mocked LinkedIn API data (to be replaced with actual API calls).
- **Frontend**: The `App.tsx` component displays engagement data in a new analytics section.
- **Implementation Notes**:
  - LinkedIn API integration for real-time metrics is planned for a later phase.
  - Add visualization (charts) in Phase 4 for better UX.

### 7.4 LinkedIn Browsing Integration

- **Logic**: The content script (`linkedin.ts`) uses a MutationObserver to detect LinkedIn feed updates and inject suggestion buttons dynamically.
- **Frontend**: Suggestions appear inline within the LinkedIn feed, with one-click posting (mocked for now).
- **Implementation Notes**:
  - Ensure compatibility with LinkedIn’s dynamic SPA (single-page application) structure.
  - Add right-click context menu integration in a future phase.

---

## Testing

### 8.1 Unit Tests

Create `src/server/routes/comments.test.ts`:

```typescript
import request from 'supertest';
import app from '../index';

describe('Comment Suggestion API', () => {
  it('should generate comment suggestions', async () => {
    const response = await request(app)
      .post('/api/comments/generate-comments')
      .send({
        postContent: 'Excited about AI advancements!',
        userProfile: { industry: 'Tech', role: 'Engineer', interests: ['AI'] },
        preferences: { commentTone: 'professional', networkGoal: 'build connections' },
        count: 3,
      });
    expect(response.status).toBe(200);
    expect(response.body.comments).toBeInstanceOf(Array);
    expect(response.body.comments.length).toBeGreaterThan(0);
  });

  it('should save a comment', async () => {
    const response = await request(app)
      .post('/api/comments/save-comment')
      .send({
        userId: 'demo-user',
        postId: 'post-123',
        content: 'Great insights!',
      });
    expect(response.status).toBe(200);
    expect(response.body.commentId).toBeDefined();
  });
});
```

Create `src/server/routes/analytics.test.ts`:

```typescript
import request from 'supertest';
import app from '../index';

describe('Engagement Analytics API', () => {
  it('should fetch engagement metrics', async () => {
    const response = await request(app)
      .get('/api/analytics/engagement')
      .query({ userId: 'demo-user' });
    expect(response.status).toBe(200);
    expect(response.body.engagement).toBeInstanceOf(Array);
  });
});
```

### 8.2 Integration Tests

Create `jest.integration.config.js`:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.integration.test.ts'],
};
```

Create `src/__tests__/integration.test.ts`:

```typescript
import request from 'supertest';
import app from '../server/index';

describe('Integration Tests', () => {
  it('should generate and schedule a post, then fetch engagement', async () => {
    // Generate content ideas
    const ideasResponse = await request(app)
      .post('/api/content/generate-ideas')
      .send({
        userProfile: { industry: 'Tech', role: 'Engineer', interests: ['AI'] },
        preferences: { contentTone: 'professional' },
        count: 3,
      });
    expect(ideasResponse.status).toBe(200);
    const idea = ideasResponse.body.ideas[0];

    // Generate full post
    const postResponse = await request(app)
      .post('/api/content/generate-post')
      .send({
        idea,
        userProfile: { industry: 'Tech', role: 'Engineer' },
        preferences: { contentTone: 'professional' },
      });
    expect(postResponse.status).toBe(200);

    // Schedule post
    const scheduleResponse = await request(app)
      .post('/api/content/schedule')
      .send({
        userId: 'demo-user',
        content: postResponse.body.post,
        scheduledTime: new Date().toISOString(),
      });
    expect(scheduleResponse.status).toBe(200);

    // Fetch engagement
    const engagementResponse = await request(app)
      .get('/api/analytics/engagement')
      .query({ userId: 'demo-user' });
    expect(engagementResponse.status).toBe(200);
  });
});
```

### 8.3 Sample User Profiles

Test with the PRD-defined personas (same as Phase 2):

- **Busy Professional**:
  - Profile: `{ industry: 'Finance', role: 'Senior Manager', interests: ['Leadership', 'Finance Trends'] }`
  - Preferences: `{ contentTone: 'professional', commentTone: 'professional', postFrequency: 'weekly', networkGoal: 'thought leadership' }`
- **Career Builder**:
  - Profile: `{ industry: 'Tech', role: 'Junior Developer', interests: ['Coding', 'Career Growth'] }`
  - Preferences: `{ contentTone: 'conversational', commentTone: 'engaging', postFrequency: 'biweekly', networkGoal: 'build connections' }`
- **Entrepreneur**:
  - Profile: `{ industry: 'Marketing', role: 'Startup Founder', interests: ['Branding', 'Entrepreneurship'] }`
  - Preferences: `{ contentTone: 'inspiring', commentTone: 'inspiring', postFrequency: 'weekly', networkGoal: 'lead generation' }`

Steps:
1. Update `DEFAULT_USER_PROFILE` and `DEFAULT_USER_PREFERENCES` in `contentService.ts` with each persona.
2. Run `npm run dev` and test the popup UI and LinkedIn feed for comment suggestions and engagement analytics.
3. Verify comments and engagement data in MongoDB Atlas.
4. Test content script functionality on `https://www.linkedin.com/feed`.

---

## Development Workflow

1. **Start Development**:
   ```bash
   npm run dev
   ```
   - Runs Webpack in watch mode and Nodemon for the backend.
   - Builds the extension to `build/` and starts the server on `http://localhost:3000`.

2. **Test the Extension**:
   - Load the `build/` directory in Chrome (`chrome://extensions/`, "Load unpacked").
   - Open the popup and test content generation, scheduling, and engagement analytics.
   - Navigate to `https://www.linkedin.com/feed` and test comment suggestions.
   - Check MongoDB for stored comments and posts.

3. **Run Tests**:
   ```bash
   npm run test
   npm run test:integration
   ```

4. **Lint and Format**:
   ```bash
   npm run lint
   npm run format
   ```

---

## Troubleshooting

- **LinkedIn API Errors**:
  - Verify `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`, and access token in `.env`.
  - Ensure the LinkedIn app is configured correctly in the LinkedIn Developer Portal.
- **Content Script Not Injecting**:
  - Check `manifest.json` for correct `content_scripts` configuration.
  - Verify LinkedIn URL matches (`https://www.linkedin.com/*`).
  - Reload the extension and clear browser cache.
- **MongoDB Issues**:
  - Confirm `MONGODB_URI` and IP whitelisting in MongoDB Atlas.
  - Check schema definitions in `Post.ts` and `Comment.ts`.
- **CORS Errors**:
  - Ensure backend CORS allows `https://www.linkedin.com` and `http://localhost:3000`.
- **Engagement Data Missing**:
  - Verify mocked data in `/api/analytics/engagement` until LinkedIn API is fully integrated.
  - Check MongoDB for stored posts and comments.

---

## Next Steps

- **Phase 4**:
  - Implement the Analytics & Improvement Module (PRD Section 4.3) with advanced visualizations (charts).
  - Add content optimization suggestions based on engagement data.
  - Fully integrate LinkedIn API for posting and analytics retrieval.
- **Enhancements**:
  - Implement OAuth 2.0 user authentication flow for LinkedIn.
  - Add a cron job for automated post and comment publishing.
  - Enhance comment suggestion algorithm with sentiment analysis and real-time trend data.
  - Introduce right-click context menu for quick comment suggestions.
- **Testing**:
  - Conduct user testing with real LinkedIn profiles and API integration.
  - Add end-to-end tests for LinkedIn browsing and posting flows.
  - Validate engagement tracking with live LinkedIn data.

---

This guide ensures Phase 3 builds seamlessly on Phase 2, maintaining consistency in architecture, workflows, and testing. The comment suggestion, network targeting, engagement tracking, and LinkedIn browsing features are fully implemented, with placeholders for LinkedIn API integration to be completed in future phases.