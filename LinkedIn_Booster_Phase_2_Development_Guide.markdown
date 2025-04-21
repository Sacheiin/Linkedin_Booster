# LinkedIn Booster Development Guide

This guide provides a step-by-step process for setting up the development environment and building the LinkedIn Booster Chrome extension, focusing on the Phase 2 Content Generation Features (Content suggestion algorithm, post creation/customization, and content scheduling). The guide assumes familiarity with JavaScript, React, Node.js, and Chrome extension development.

---

## Step 1: Prerequisites

Ensure the following tools and accounts are set up before starting development:

- **Node.js** (v18 or later): For backend and frontend development.
- **npm** (v9 or later): For package management.
- **Git**: For version control.
- **Chrome Browser**: For testing the extension.
- **Gemini API Key**: Sign up at Gemini API to obtain an API key for content generation.
- **LinkedIn Developer Account**: Register at LinkedIn Developers to access the LinkedIn API for posting and analytics.
- **MongoDB Atlas Account**: For cloud-based database storage.
- **Code Editor**: VS Code or similar.

---

## Step 2: Dependency Installation

### 2.1 Project Setup

1. **Create a new project directory**:

   ```bash
   mkdir linkedin-booster
   cd linkedin-booster
   ```

2. **Initialize a Node.js project**:

   ```bash
   npm init -y
   ```

3. **Install core dependencies** for the Chrome extension and backend:

   ```bash
   npm install react react-dom axios typescript @types/chrome @types/node express mongoose dotenv concurrently
   ```

4. **Install development dependencies**:

   ```bash
   npm install --save-dev webpack webpack-cli ts-loader nodemon jest @types/jest
   ```

5. **Install Gemini API client** (assuming a Node.js-compatible client):

   ```bash
   npm install @gemini/api-client
   ```

6. **Install LinkedIn API client** (use a lightweight OAuth client for LinkedIn):

   ```bash
   npm install passport passport-linkedin-oauth2
   ```

7. **Install Tailwind CSS** for styling the React-based UI:

   ```bash
   npm install tailwindcss postcss autoprefixer
   npx tailwindcss init
   ```

---

## Step 3: Project Structure

Organize the project as follows:

```plaintext
linkedin-booster/
├── client/                     # Chrome extension frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── content/           # Content generation logic
│   │   ├── manifest.json      # Chrome extension manifest
│   │   └── index.tsx          # Entry point for React app
│   ├── public/                # Static assets
│   └── webpack.config.js      # Webpack configuration
├── server/                     # Backend API
│   ├── src/
│   │   ├── routes/            # API routes
│   │   ├── models/            # MongoDB schemas
│   │   └── middleware/        # Authentication and validation
│   └── index.ts               # Server entry point
├── .env                        # Environment variables
├── package.json
└── tsconfig.json              # TypeScript configuration
```

---

## Step 4: Environment Setup

1. **Create a** `.env` **file** in the root directory:

   ```env
   GEMINI_API_KEY=your_gemini_api_key
   LINKEDIN_CLIENT_ID=your_linkedin_client_id
   LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
   MONGODB_URI=your_mongodb_atlas_uri
   JWT_SECRET=your_jwt_secret
   PORT=3000
   ```

2. **Configure TypeScript** (`tsconfig.json`):

   ```json
   {
     "compilerOptions": {
       "target": "es6",
       "module": "commonjs",
       "jsx": "react",
       "strict": true,
       "esModuleInterop": true,
       "outDir": "./dist"
     },
     "include": ["client/src/**/*", "server/src/**/*"]
   }
   ```

3. **Configure Webpack** (`client/webpack.config.js`):

   ```javascript
   const path = require('path');
   
   module.exports = {
     entry: './src/index.tsx',
     output: {
       path: path.resolve(__dirname, 'dist'),
       filename: 'bundle.js',
     },
     module: {
       rules: [
         {
           test: /\.tsx?$/,
           use: 'ts-loader',
           exclude: /node_modules/,
         },
       ],
     },
     resolve: {
       extensions: ['.tsx', '.ts', '.js'],
     },
   };
   ```

4. **Update** `package.json` **scripts**:

   ```json
   {
     "scripts": {
       "build:client": "webpack --config client/webpack.config.js",
       "start:server": "nodemon server/src/index.ts",
       "dev": "concurrently \"npm run build:client\" \"npm run start:server\"",
       "test": "jest"
     }
   }
   ```

---

## Step 5: Backend Development

### 5.1 Server Setup

Create `server/src/index.ts` to set up the Express server:

```typescript
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import passport from 'passport';
import LinkedInStrategy from 'passport-linkedin-oauth2';

dotenv.config();

const app = express();
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI!, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'));

// LinkedIn OAuth
passport.use(new LinkedInStrategy({
  clientID: process.env.LINKEDIN_CLIENT_ID!,
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET!,
  callbackURL: 'http://localhost:3000/auth/linkedin/callback',
  scope: ['r_liteprofile', 'w_member_social'],
}, (accessToken, refreshToken, profile, done) => {
  return done(null, { accessToken, profile });
}));

app.use(passport.initialize());

// Routes (to be implemented)
app.get('/auth/linkedin', passport.authenticate('linkedin'));
app.get('/auth/linkedin/callback', passport.authenticate('linkedin', {
  successRedirect: '/',
  failureRedirect: '/login',
}));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

### 5.2 Content Generation API

Create `server/src/routes/content.ts` for content generation:

```typescript
import express from 'express';
import { GeminiClient } from '@gemini/api-client';

const router = express.Router();
const gemini = new GeminiClient(process.env.GEMINI_API_KEY!);

router.post('/generate', async (req, res) => {
  const { userProfile, industry, tone } = req.body;

  try {
    const prompt = `Generate 3 LinkedIn post ideas for a ${userProfile.role} in the ${industry} industry with a ${tone} tone.`;
    const response = await gemini.generateContent(prompt);
    res.json({ posts: response.data });
  } catch (error) {
    res.status(500).json({ error: 'Content generation failed' });
  }
});

router.post('/schedule', async (req, res) => {
  const { postContent, scheduleTime } = req.body;
  // Store in MongoDB (implement schema in models/)
  res.json({ message: 'Post scheduled' });
});

export default router;
```

### 5.3 MongoDB Schema

Create `server/src/models/Post.ts` for storing scheduled posts:

```typescript
import mongoose, { Schema } from 'mongoose';

const PostSchema = new Schema({
  userId: { type: String, required: true },
  content: { type: String, required: true },
  scheduledTime: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'posted'], default: 'pending' },
});

export default mongoose.model('Post', PostSchema);
```

---

## Step 6: Chrome Extension Development

### 6.1 Manifest File

Create `client/src/manifest.json`:

```json
{
  "manifest_version": 3,
  "name": "LinkedIn Booster",
  "version": "1.0",
  "description": "AI-powered LinkedIn content creation and engagement",
  "permissions": ["storage", "activeTab", "identity"],
  "action": {
    "default_popup": "index.html"
  },
  "content_scripts": [
    {
      "matches": ["https://www.linkedin.com/*"],
      "js": ["bundle.js"]
    }
  ]
}
```

### 6.2 React Frontend

Create `client/src/index.tsx`:

```typescript
import React from 'react';
import { render } from 'react-dom';
import App from './components/App';

render(<App />, document.getElementById('root'));
```

Create `client/src/components/App.tsx`:

```typescript
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const App: React.FC = () => {
  const [postIdeas, setPostIdeas] = useState<string[]>([]);

  useEffect(() => {
    // Fetch post ideas from backend
    axios.post('http://localhost:3000/content/generate', {
      userProfile: { role: 'Software Engineer' },
      industry: 'Tech',
      tone: 'Professional',
    }).then(response => {
      setPostIdeas(response.data.posts);
    });
  }, []);

  const schedulePost = async (content: string) => {
    await axios.post('http://localhost:3000/content/schedule', {
      postContent: content,
      scheduleTime: new Date(),
    });
    alert('Post scheduled!');
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold">LinkedIn Booster</h1>
      <div>
        <h2>Post Ideas</h2>
        <ul>
          {postIdeas.map((idea, index) => (
            <li key={index}>
              {idea}
              <button
                className="ml-2 bg-blue-500 text-white px-2 py-1 rounded"
                onClick={() => schedulePost(idea)}
              >
                Schedule
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default App;
```

Create `client/public/index.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>LinkedIn Booster</title>
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
</head>
<body>
  <div id="root"></div>
  <script src="bundle.js"></script>
</body>
</html>
```

---

## Step 7: Content Generation Features (Phase 2)

### 7.1 Content Suggestion Algorithm

- **Logic**: Use Gemini API to generate post ideas based on user profile (role, industry) and trending topics.
- **Implementation**: Extend `server/src/routes/content.ts` to include trending topic scraping or predefined prompts for industry trends.
- **Example Prompt**: "Generate LinkedIn post ideas for a \[role\] in \[industry\] based on current trends in \[industry\]."

### 7.2 Post Creation and Customization

- **Frontend**: Add a form in `App.tsx` for users to edit tone, length, and style of generated posts.
- **Backend**: Update `/generate` endpoint to accept customization parameters (e.g., `tone`, `length`).
- **Example**:

  ```typescript
  router.post('/customize', async (req, res) => {
    const { postId, tone, length } = req.body;
    const prompt = `Customize this LinkedIn post to have a ${tone} tone and ${length} length: ${postContent}`;
    const response = await gemini.generateContent(prompt);
    res.json({ customizedPost: response.data });
  });
  ```

### 7.3 Content Scheduling

- **Backend**: Store scheduled posts in MongoDB using the `Post` model.
- **Frontend**: Add a calendar picker in `App.tsx` for selecting schedule times.
- **Logic**: Use a cron job or scheduled task to post content via LinkedIn API at the specified time.

---

## Step 8: Testing

### 8.1 Unit Tests

Create `server/src/routes/content.test.ts` for testing content generation:

```typescript
import request from 'supertest';
import app from '../index';

describe('Content Generation API', () => {
  it('should generate post ideas', async () => {
    const response = await request(app)
      .post('/content/generate')
      .send({ userProfile: { role: 'Engineer' }, industry: 'Tech', tone: 'Professional' });
    expect(response.status).toBe(200);
    expect(response.body.posts).toBeDefined();
  });
});
```

### 8.2 Sample User Profiles

Test with the following profiles:

- **Busy Professional**: Role: Senior Manager, Industry: Finance, Tone: Formal
- **Career Builder**: Role: Junior Developer, Industry: Tech, Tone: Friendly
- **Entrepreneur**: Role: Startup Founder, Industry: Marketing, Tone: Inspirational

---

## Step 9: Deployment

1. **Build the extension**:

   ```bash
   npm run build:client
   ```

2. **Load extension in Chrome**:

   - Go to `chrome://extensions/`.
   - Enable "Developer mode".
   - Click "Load unpacked" and select the `client/dist` folder.

3. **Deploy backend**:

   - Use a platform like Heroku or AWS.
   - Set environment variables in the hosting platform.
   - Run `npm run start:server`.

---

## Step 10: Next Steps

- Implement comment suggestion module (Phase 3).
- Add analytics dashboard for engagement tracking.
- Enhance security with JWT authentication for API endpoints.
- Conduct user testing with real LinkedIn profiles.
