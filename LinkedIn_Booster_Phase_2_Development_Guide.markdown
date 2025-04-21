# LinkedIn Booster - Phase 2 Development Guide

This guide extends the **Phase 1 Dependency Installation Guide** to implement the content generation features for the LinkedIn Booster Chrome extension, as outlined in the Product Requirements Document (PRD) for Phase 2 (Weeks 5-8). It focuses on the content suggestion algorithm, post creation/customization, content scheduling, and testing with sample user profiles. The guide assumes the Phase 1 setup is complete, including the project structure, dependencies, and initial Chrome extension boilerplate.

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Project Structure Updates](#project-structure-updates)
4. [Dependency Updates](#dependency-updates)
5. [Backend Development](#backend-development)
6. [Frontend Development](#frontend-development)
7. [Content Generation Features (Phase 2)](#content-generation-features-phase-2)
8. [Testing](#testing)
9. [Development Workflow](#development-workflow)
10. [Troubleshooting](#troubleshooting)
11. [Next Steps](#next-steps)

---

## Overview

Phase 2 focuses on implementing the **Content Generation Module** as specified in the PRD:

- **Content Suggestion Algorithm**: Generate 3-5 post ideas based on user profile, industry, and trends.
- **Post Creation and Customization**: Allow users to generate and edit full LinkedIn posts.
- **Content Scheduling**: Enable scheduling posts for optimal engagement times.
- **Testing with Sample User Profiles**: Validate functionality with predefined personas.

This guide ensures compatibility with the Phase 1 setup, including the Chrome extension boilerplate, React frontend, TypeScript, Webpack, and Gemini API integration. It also introduces backend components (Express and MongoDB) to support content storage and scheduling, aligning with the PRD's technical architecture.

---

## Prerequisites

Ensure the following are set up from Phase 1:

- **Node.js** (v16.x or later) and **npm** (v8.x or later).
- **Git** repository initialized in the `linkedin-booster` directory.
- **Chrome Browser** for testing the extension.
- **Code Editor** (e.g., VS Code).
- **Phase 1 Dependencies** installed (React, TypeScript, Webpack, Gemini API client, etc.).
- **Gemini API Key** stored in `src/utils/constants.ts` or `.env`.
- **Placeholder Icons** in `src/assets/` (icon-16.png, icon-48.png, icon-128.png).
- **MongoDB Atlas Account** for database storage.
- **LinkedIn Developer Account** for API access (to be used in later phases).

Verify the Phase 1 setup by running:

```bash
npm run build
npm run dev
```

Load the `build/` directory as an unpacked extension in Chrome (`chrome://extensions/`) and confirm the popup displays the "LinkedIn Booster" dashboard.

---

## Project Structure Updates

The Phase 1 guide established a frontend-focused structure. For Phase 2, we need to add backend components and extend the frontend for content generation. Update the project structure as follows:

```plaintext
linkedin-booster/
├── build/                      # Compiled extension files
├── src/
│   ├── assets/                # Icons and static assets
│   ├── background/            # Background scripts
│   ├── components/            # Reusable React components
│   ├── content_scripts/       # Content scripts for LinkedIn
│   ├── pages/                 # Page components (e.g., Dashboard, Content Generator)
│   ├── popup/                 # Popup UI (React app)
│   ├── services/              # API and Gemini services
│   ├── utils/                 # Constants and helpers
│   ├── server/                # Backend (new)
│   │   ├── routes/            # API routes
│   │   ├── models/            # MongoDB schemas
│   │   └── middleware/        # Authentication and validation
│   └── manifest.json          # Chrome extension manifest
├── .babelrc                   # Babel configuration
├── .eslintrc.js               # ESLint configuration
├── .gitignore                 # Git ignore file
├── package.json               # Project dependencies and scripts
├── tsconfig.json              # TypeScript configuration
├── webpack.config.js          # Webpack configuration
└── .env                       # Environment variables (new)
```

Create the `server/` directory and `.env` file:

```bash
mkdir -p src/server/routes src/server/models src/server/middleware
touch .env
```

Add environment variables to `.env`:

```env
GEMINI_API_KEY=your_gemini_api_key
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
API_BASE_URL=http://localhost:3000
PORT=3000
```

---

## Dependency Updates

Phase 1 installed frontend dependencies (React, TypeScript, Webpack, etc.) and the Gemini API client. For Phase 2, we need additional dependencies for the backend and enhanced frontend functionality.

Install the following:

```bash
# Backend dependencies
npm install express mongoose dotenv cors express-rate-limit helmet

# Additional frontend dependencies
npm install axios date-fns react-datepicker

# Development dependencies
npm install --save-dev @types/express @types/cors @types/jest ts-node nodemon concurrently
```

Update `package.json` scripts to include backend and concurrent development:

```json
{
  "scripts": {
    "build": "webpack --config webpack.config.js",
    "dev": "concurrently \"webpack --watch --config webpack.config.js\" \"nodemon src/server/index.ts\"",
    "start:server": "nodemon src/server/index.ts",
    "test": "jest",
    "lint": "eslint --ext .js,.jsx,.ts,.tsx src/",
    "format": "prettier --write \"src/**/*.{js,jsx,ts,tsx,json,css}\""
  }
}
```

---

## Backend Development

Phase 1 focused on the Chrome extension frontend. Phase 2 introduces a backend to handle content storage, scheduling, and Gemini API integration. The backend will use Express.js and MongoDB, as specified in the PRD.

### 5.1 Server Setup

Create `src/server/index.ts`:

```typescript
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import contentRoutes from './routes/content';

dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.API_BASE_URL }));
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI!, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/content', contentRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

### 5 responsabilités du développeur back-end

1. **Configurer le serveur Express** : Mettre en place un serveur robuste avec Express.js, intégrant des middlewares pour la sécurité (helmet), la gestion des CORS, et le parsing JSON.
2. **Gérer la connexion MongoDB** : Établir une connexion fiable avec MongoDB Atlas pour stocker les posts programmés et les préférences utilisateur.
3. **Développer les routes API** : Créer des endpoints pour la génération de contenu, la personnalisation et la programmation des posts, en respectant les spécifications du PRD.
4. **Intégrer l'API Gemini** : Implémenter la logique de génération de contenu via l'API Gemini, en s'assurant que les prompts sont optimisés pour les profils utilisateurs.
5. **Assurer la sécurité des données** : Mettre en œuvre des pratiques de sécurité (par exemple, chiffrement des données sensibles, validation des entrées) pour protéger les informations des utilisateurs.

### 5.2 Content Generation API

Create `src/server/routes/content.ts`:

```typescript
import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Post from '../models/Post';

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

// Generate content ideas
router.post('/generate-ideas', async (req, res) => {
  const { userProfile, preferences, count = 3 } = req.body;

  const prompt = `
    Generate ${count} LinkedIn post ideas for a professional with:
    - Industry: ${userProfile.industry}
    - Role: ${userProfile.role}
    - Interests: ${userProfile.interests.join(', ')}
    - Tone: ${preferences.contentTone}
    Ideas should align with current industry trends and promote thought leadership.
    Format each idea as a concise title (1-2 sentences).
  `;

  try {
    const result = await model.generateContent(prompt);
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

// Generate full post
router.post('/generate-post', async (req, res) => {
  const { idea, userProfile, preferences } = req.body;

  const prompt = `
    Generate a LinkedIn post based on: "${idea}"
    Professional background:
    - Industry: ${userProfile.industry}
    - Role: ${userProfile.role}
    Requirements:
    - Tone: ${preferences.contentTone}
    - Length: 150-300 words
    - Include relevant hashtags
    - Start with a hook
    - End with a question or CTA
    - Format for LinkedIn (line breaks)
  `;

  try {
    const result = await model.generateContent(prompt);
    res.json({ post: result.response.text() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate post' });
  }
});

// Schedule post
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

export default router;
```

### 5.3 MongoDB Schema

Create `src/server/models/Post.ts`:

```typescript
import mongoose, { Schema } from 'mongoose';

const PostSchema = new Schema({
  userId: { type: String, required: true },
  content: { type: String, required: true },
  scheduledTime: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'posted'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Post', PostSchema);
```

---

## Frontend Development

Phase 1 set up a basic React-based popup. Phase 2 extends the frontend to include content generation, customization, and scheduling features, integrating with the backend API.

### 6.1 Update API Service

Modify `src/services/api.ts` to include backend endpoints:

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

  // Add content-specific methods
  static generateContentIdeas(data: any): Promise<any> {
    return this.post('/api/content/generate-ideas', data);
  }

  static generateFullPost(data: any): Promise<any> {
    return this.post('/api/content/generate-post', data);
  }

  static schedulePost(data: any): Promise<any> {
    return this.post('/api/content/schedule', data);
  }
}

ApiService.init();
```

### 6.2 Update Content Service

Update `src/services/contentService.ts` to use the backend API instead of direct Gemini calls:

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
}
```

### 6.3 Update Popup UI

Replace `src/popup/App.tsx` with a content generation interface:

```typescript
import React, { useState, useEffect } from 'react';
import { ContentService } from '../services/contentService';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [contentIdeas, setContentIdeas] = useState<string[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<string | null>(null);
  const [generatedPost, setGeneratedPost] = useState<string>('');
  const [scheduledDate, setScheduledDate] = useState<Date | null>(null);
  const [tone, setTone] = useState<string>('professional');

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
      alert('Post scheduled successfully!');
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
        </div>
      )}
    </div>
  );
};

export default App;
```

Update `src/popup/popup.css` to style the new UI:

```css
body {
  font-family: 'Segoe UI', 'Helvetica Neue', sans-serif;
  width: 400px;
  min-height: 500px;
  margin: 0;
  padding: 0;
  color: #333;
}

.app-container {
  display: flex;
  flex-direction: column;
}

header {
  background-color: #0077b5;
  color: white;
  padding: 12px 16px;
}

header h1 {
  margin: 0;
  font-size: 18px;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
}

.dashboard {
  padding: 16px;
}

.user-info {
  margin-bottom: 16px;
}

.user-info h2 {
  font-size: 16px;
  margin: 0 0 8px 0;
}

.content-generator {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.content-ideas {
  list-style: none;
  padding: 0;
  max-height: 200px;
  overflow-y: auto;
}

.content-ideas li {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 8px;
  cursor: pointer;
}

.content-ideas li.selected {
  background-color: #e6f3ff;
  border-color: #0077b5;
}

.post-generator {
  margin-top: 16px;
}

.post-preview textarea {
  width: 100%;
  height: 150px;
  margin: 8px 0;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  background-color: #0077b5;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}

button:hover {
  background-color: #005582;
}

label {
  display: block;
  margin: 8px 0;
}

select {
  margin-left: 8px;
  padding: 4px;
}
```

---

## Content Generation Features (Phase 2)

### 7.1 Content Suggestion Algorithm

- **Logic**: The backend `/api/content/generate-ideas` endpoint uses the Gemini API to generate post ideas based on user profile (role, industry, interests) and preferences (tone). The prompt is tailored to align with industry trends and thought leadership.
- **Frontend**: The `App.tsx` component displays ideas and allows refreshing the list.
- **Implementation Notes**:
  - The algorithm relies on Gemini's natural language capabilities. Future iterations could integrate web scraping for real-time industry trends.
  - Store generated ideas in `chrome.storage.sync` for offline access.

### 7.2 Post Creation and Customization

- **Logic**: The `/api/content/generate-post` endpoint generates a full post from a selected idea, with customizable tone. Users can edit the post in a textarea.
- **Frontend**: The `App.tsx` component includes a tone selector and editable textarea for customization.
- **Implementation Notes**:
  - The PRD specifies 150-300 word posts with hashtags and a CTA, which is enforced in the prompt.
  - Add character count validation (LinkedIn's 3,000-character limit) in a future iteration.

### 7.3 Content Scheduling

- **Logic**: The `/api/content/schedule` endpoint stores posts in MongoDB with a scheduled time. The frontend uses `react-datepicker` for selecting dates.
- **Frontend**: Users select a date/time and confirm scheduling.
- **Implementation Notes**:
  - Posts are stored in MongoDB and cached in `chrome.storage.sync`.
  - Actual posting to LinkedIn (via API) will be implemented in a later phase.
  - Add a cron job or background task for automatic posting in Phase 3.

---

## Testing

### 8.1 Unit Tests

Create `src/server/routes/content.test.ts`:

```typescript
import request from 'supertest';
import app from '../index';

describe('Content Generation API', () => {
  it('should generate content ideas', async () => {
    const response = await request(app)
      .post('/api/content/generate-ideas')
      .send({
        userProfile: { industry: 'Tech', role: 'Engineer', interests: ['AI'] },
        preferences: { contentTone: 'professional' },
        count: 3,
      });
    expect(response.status).toBe(200);
    expect(response.body.ideas).toBeInstanceOf(Array);
    expect(response.body.ideas.length).toBeGreaterThan(0);
  });

  it('should generate a full post', async () => {
    const response = await request(app)
      .post('/api/content/generate-post')
      .send({
        idea: 'Share insights on AI trends',
        userProfile: { industry: 'Tech', role: 'Engineer' },
        preferences: { contentTone: 'professional' },
      });
    expect(response.status).toBe(200);
    expect(response.body.post).toBeDefined();
  });

  it('should schedule a post', async () => {
    const response = await request(app)
      .post('/api/content/schedule')
      .send({
        userId: 'demo-user',
        content: 'Test post',
        scheduledTime: new Date().toISOString(),
      });
    expect(response.status).toBe(200);
    expect(response.body.postId).toBeDefined();
  });
});
```

### 8.2 Sample User Profiles

Test with the PRD-defined personas:

- **Busy Professional**:
  - Profile: `{ industry: 'Finance', role: 'Senior Manager', interests: ['Leadership', 'Finance Trends'] }`
  - Preferences: `{ contentTone: 'professional', postFrequency: 'weekly' }`
- **Career Builder**:
  - Profile: `{ industry: 'Tech', role: 'Junior Developer', interests: ['Coding', 'Career Growth'] }`
  - Preferences: `{ contentTone: 'conversational', postFrequency: 'biweekly' }`
- **Entrepreneur**:
  - Profile: `{ industry: 'Marketing', role: 'Startup Founder', interests: ['Branding', 'Entrepreneurship'] }`
  - Preferences: `{ contentTone: 'inspiring', postFrequency: 'weekly' }`

Steps:
1. Update `DEFAULT_USER_PROFILE` in `contentService.ts` with each persona.
2. Run `npm run dev` and test the popup UI for idea generation, post creation, and scheduling.
3. Verify scheduled posts in MongoDB Atlas.

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
   - Open the popup and test content generation/scheduling.
   - Check MongoDB for stored posts.

3. **Run Tests**:
   ```bash
   npm run test
   ```

4. **Lint and Format**:
   ```bash
   npm run lint
   npm run format
   ```

---

## Troubleshooting

- **Gemini API Errors**:
  - Verify the API key in `.env`.
  - Check rate limits and ensure the `gemini-pro` model is accessible.
- **MongoDB Connection Issues**:
  - Confirm the `MONGODB_URI` in `.env`.
  - Ensure your IP is whitelisted in MongoDB Atlas.
- **Extension Not Loading**:
  - Check `build/` for compiled files.
  - Verify `manifest.json` permissions and paths.
  - Run `npm run build` and reload the extension.
- **CORS Errors**:
  - Ensure the backend CORS configuration allows `http://localhost:3000`.
- **React Datepicker Styling**:
  - If styles are broken, verify `react-datepicker.css` is imported correctly.

---

## Next Steps

- **Phase 3**:
  - Implement the Comment Suggestion Module (PRD Section 4.2).
  - Add the Analytics & Improvement Module (PRD Section 4.3).
  - Integrate LinkedIn API for posting and analytics retrieval.
- **Enhancements**:
  - Add user authentication (OAuth 2.0 with LinkedIn).
  - Implement a cron job for scheduled posting.
  - Enhance content suggestion algorithm with real-time trend data.
- **Testing**:
  - Conduct user testing with real LinkedIn profiles.
  - Add integration tests for frontend-backend communication.

---

This guide ensures Phase 2 builds seamlessly on Phase 1, maintaining consistency in project structure, dependencies, and development workflow. The content generation features are fully implemented, and the groundwork is laid for future phases.