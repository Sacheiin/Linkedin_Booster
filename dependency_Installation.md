# LinkedIn Booster - Dependency Installation Guide

This guide provides step-by-step instructions for setting up the development environment for Phase 1 of the LinkedIn Booster Chrome extension project. Follow these steps to prepare your environment for development, install all necessary dependencies, and configure the initial project structure.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Setup](#project-setup)
3. [Chrome Extension Boilerplate](#chrome-extension-boilerplate)
4. [Frontend Dependencies](#frontend-dependencies)
5. [Backend Setup](#backend-setup)
6. [Gemini API Integration](#gemini-api-integration)
7. [Development Workflow](#development-workflow)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

Before beginning the installation process, ensure you have the following tools installed on your development machine:

- **Node.js** (v16.x or later)
- **npm** (v8.x or later)
- **Git** (v2.30.0 or later)
- **Google Chrome** (latest version)
- **Code editor** (VS Code recommended)

You can verify your installations with these commands:

```bash
node --version
npm --version
git --version
```

## Project Setup

### 1. Create Project Directory

```bash
# Create the project directory
mkdir linkedin-booster
cd linkedin-booster

# Initialize Git repository
git init

# Create initial README and .gitignore
touch README.md
```

### 2. Configure .gitignore

Create a comprehensive `.gitignore` file:

```bash
# Create .gitignore file
cat > .gitignore << EOL
# Dependencies
/node_modules
/.pnp
.pnp.js

# Testing
/coverage

# Production
/build
/dist

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE files
.idea/
.vscode/*
!.vscode/extensions.json
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Chrome Extension specific
*.pem
*.crx

# macOS specific
.DS_Store

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache
EOL
```

### 3. Initialize npm Project

```bash
# Initialize npm project with default settings
npm init -y

# Update package.json with project details
cat > package.json << EOL
{
  "name": "linkedin-booster",
  "version": "0.1.0",
  "description": "AI-powered Chrome extension to help professionals build their personal brand on LinkedIn",
  "private": true,
  "scripts": {
    "build": "webpack --config webpack.config.js",
    "dev": "webpack --watch --config webpack.config.js",
    "test": "jest",
    "lint": "eslint --ext .js,.jsx,.ts,.tsx src/",
    "format": "prettier --write \"src/**/*.{js,jsx,ts,tsx,json,css}\""
  },
  "keywords": [
    "linkedin",
    "chrome-extension",
    "ai-content",
    "personal-branding",
    "networking"
  ],
  "author": "Your Name",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/yourusername/linkedin-booster.git"
  }
}
EOL
```

## Chrome Extension Boilerplate

### 1. Create Basic Directory Structure

```bash
# Create main directories
mkdir -p src/assets src/components src/pages src/utils src/services src/background src/content_scripts src/popup

# Create build directory
mkdir build
```

### 2. Create manifest.json (Manifest V3)

```bash
# Create manifest.json file in the src directory
cat > src/manifest.json << EOL
{
  "manifest_version": 3,
  "name": "LinkedIn Booster",
  "version": "0.1.0",
  "description": "AI-powered LinkedIn content creation and engagement assistant",
  "permissions": [
    "storage",
    "activeTab",
    "scripting",
    "contextMenus",
    "alarms"
  ],
  "host_permissions": [
    "https://*.linkedin.com/*"
  ],
  "background": {
    "service_worker": "background/background.js"
  },
  "action": {
    "default_popup": "popup/popup.html",
    "default_icon": {
      "16": "assets/icon-16.png",
      "48": "assets/icon-48.png",
      "128": "assets/icon-128.png"
    }
  },
  "content_scripts": [
    {
      "matches": ["https://*.linkedin.com/*"],
      "js": ["content_scripts/content.js"]
    }
  ],
  "icons": {
    "16": "assets/icon-16.png",
    "48": "assets/icon-48.png",
    "128": "assets/icon-128.png"
  }
}
EOL
```

### 3. Create Basic Chrome Extension Files

```bash
# Create empty background.js file
cat > src/background/background.js << EOL
// Background script for LinkedIn Booster extension
console.log('LinkedIn Booster Background Script Initialized');

// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('LinkedIn Booster extension installed');
  
  // Create context menu items
  chrome.contextMenus.create({
    id: 'linkedin-booster-menu',
    title: 'LinkedIn Booster',
    contexts: ['page']
  });
  
  // Initialize default settings
  chrome.storage.sync.set({
    userPreferences: {
      contentTone: 'professional',
      postFrequency: 'weekly',
      commentFrequency: 'daily',
      aiGenerationEnabled: true
    }
  });
});
EOL

# Create empty content script
cat > src/content_scripts/content.js << EOL
// Content script for LinkedIn Booster extension
console.log('LinkedIn Booster Content Script Loaded');

// Check if we're on LinkedIn
if (window.location.hostname.includes('linkedin.com')) {
  // Initialize content script functionality
  console.log('LinkedIn detected, initializing extension features');
}
EOL

# Create popup HTML
mkdir -p src/popup
cat > src/popup/popup.html << EOL
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LinkedIn Booster</title>
  <link rel="stylesheet" href="popup.css">
</head>
<body>
  <div id="app">
    <h1>LinkedIn Booster</h1>
    <div id="loading">Loading...</div>
  </div>
  <script src="popup.js"></script>
</body>
</html>
EOL

# Create popup CSS
cat > src/popup/popup.css << EOL
body {
  font-family: 'Segoe UI', 'Helvetica Neue', sans-serif;
  width: 320px;
  min-height: 300px;
  margin: 0;
  padding: 16px;
  color: #333;
}

h1 {
  color: #0077b5;
  font-size: 18px;
  margin-bottom: 16px;
}

#app {
  display: flex;
  flex-direction: column;
}

button {
  background-color: #0077b5;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 8px;
}

button:hover {
  background-color: #005582;
}
EOL

# Create popup JavaScript
cat > src/popup/popup.js << EOL
// Popup script for LinkedIn Booster
document.addEventListener('DOMContentLoaded', () => {
  console.log('LinkedIn Booster Popup Loaded');
  
  // Initialize popup UI
  document.getElementById('loading').textContent = 'LinkedIn Booster Ready';
});
EOL

# Add placeholder icons
mkdir -p src/assets
# Note: You'll need to actually create or download these icons
echo "Create placeholder icons in src/assets/ (icon-16.png, icon-48.png, icon-128.png)"
```

## Frontend Dependencies

### 1. Install Development Dependencies

```bash
# Install webpack and related tools
npm install --save-dev webpack webpack-cli webpack-dev-server 

# Install babel for transpiling
npm install --save-dev @babel/core @babel/preset-env @babel/preset-react babel-loader

# Install TypeScript
npm install --save-dev typescript ts-loader @types/chrome @types/react @types/react-dom

# Install ESLint and Prettier for code quality
npm install --save-dev eslint eslint-plugin-react eslint-config-prettier prettier

# Install testing tools
npm install --save-dev jest @testing-library/react @testing-library/jest-dom

# Install other webpack plugins and loaders
npm install --save-dev css-loader style-loader html-webpack-plugin copy-webpack-plugin
```

### 2. Install React and UI Dependencies

```bash
# Install React and related packages
npm install react react-dom react-router-dom

# Install UI component libraries
npm install @mui/material @emotion/react @emotion/styled

# Install icons
npm install @mui/icons-material

# Install charts for analytics
npm install recharts

# Install state management
npm install zustand
```

### 3. Configure TypeScript

```bash
# Create tsconfig.json
cat > tsconfig.json << EOL
{
  "compilerOptions": {
    "target": "es6",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": false,
    "jsx": "react-jsx",
    "outDir": "./build"
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "src/**/*.js", "src/**/*.jsx"],
  "exclude": ["node_modules", "build", "dist"]
}
EOL
```

### 4. Configure Webpack

```bash
# Create webpack.config.js
cat > webpack.config.js << EOL
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  mode: 'development',
  devtool: 'cheap-module-source-map',
  entry: {
    popup: './src/popup/index.tsx',
    background: './src/background/background.js',
    content: './src/content_scripts/content.js'
  },
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: '[name]/[name].js',
    clean: true
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx']
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        type: 'asset/resource'
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/popup/popup.html',
      filename: 'popup/popup.html',
      chunks: ['popup']
    }),
    new CopyWebpackPlugin({
      patterns: [
        { from: 'src/manifest.json', to: 'manifest.json' },
        { from: 'src/assets', to: 'assets' }
      ]
    })
  ]
};
EOL
```

### 5. Configure Babel

```bash
# Create .babelrc
cat > .babelrc << EOL
{
  "presets": ["@babel/preset-env", "@babel/preset-react"]
}
EOL
```

### 6. Configure ESLint

```bash
# Create .eslintrc.js
cat > .eslintrc.js << EOL
module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 12,
    sourceType: 'module'
  },
  plugins: ['react', '@typescript-eslint'],
  rules: {
    'react/react-in-jsx-scope': 'off'
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
};
EOL
```

### 7. Setup React in Popup

```bash
# Create popup/index.tsx file
mkdir -p src/popup
cat > src/popup/index.tsx << EOL
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './popup.css';

const root = ReactDOM.createRoot(
  document.getElementById('app') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
EOL

# Create App component
cat > src/popup/App.tsx << EOL
import React, { useState, useEffect } from 'react';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    // Simulate loading user data
    setTimeout(() => {
      setUserData({
        name: 'Demo User',
        industry: 'Technology',
        contentIdeas: 3,
        commentsAvailable: 5
      });
      setIsLoading(false);
    }, 1000);
  }, []);

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
          
          <div className="action-cards">
            <div className="card">
              <h3>Content Ideas</h3>
              <p>{userData.contentIdeas} new ideas available</p>
              <button>Generate Content</button>
            </div>
            
            <div className="card">
              <h3>Comment Suggestions</h3>
              <p>{userData.commentsAvailable} opportunities to engage</p>
              <button>View Suggestions</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
EOL

# Update popup CSS for React components
cat > src/popup/popup.css << EOL
body {
  font-family: 'Segoe UI', 'Helvetica Neue', sans-serif;
  width: 350px;
  min-height: 400px;
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

.action-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card {
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.card h3 {
  font-size: 14px;
  margin: 0 0 8px 0;
  color: #0077b5;
}

.card p {
  margin: 0 0 12px 0;
  font-size: 13px;
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
EOL
```

## Backend Setup

### 1. Create API Service Files

```bash
# Create API service utility
mkdir -p src/services
cat > src/services/api.ts << EOL
import { API_BASE_URL } from '../utils/constants';

// API service for making requests to backend
export class ApiService {
  private static token: string | null = null;
  
  // Initialize API with token if available
  static init(): void {
    chrome.storage.sync.get(['authToken'], (result) => {
      if (result.authToken) {
        this.token = result.authToken;
      }
    });
  }
  
  // Set auth token
  static setToken(token: string): void {
    this.token = token;
    chrome.storage.sync.set({ authToken: token });
  }
  
  // Clear auth token
  static clearToken(): void {
    this.token = null;
    chrome.storage.sync.remove('authToken');
  }
  
  // Generic request method
  static async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = \`\${API_BASE_URL}\${endpoint}\`;
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };
    
    if (this.token) {
      headers['Authorization'] = \`Bearer \${this.token}\`;
    }
    
    const config = {
      ...options,
      headers
    };
    
    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(\`API error: \${response.status}\`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }
  
  // GET request
  static get(endpoint: string): Promise<any> {
    return this.request(endpoint, { method: 'GET' });
  }
  
  // POST request
  static post(endpoint: string, data: any): Promise<any> {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
  
  // PUT request
  static put(endpoint: string, data: any): Promise<any> {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }
  
  // DELETE request
  static delete(endpoint: string): Promise<any> {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

// Initialize API service when extension loads
ApiService.init();
EOL

# Create constants file
mkdir -p src/utils
cat > src/utils/constants.ts << EOL
// Base URLs
export const API_BASE_URL = 'https://api.example.com/v1';  // Update with your actual API URL

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  USER_PREFERENCES: 'userPreferences',
  CONTENT_CACHE: 'contentCache',
  USER_PROFILE: 'userProfile'
};

// Content types
export const CONTENT_TYPES = {
  TEXT_POST: 'text',
  POLL: 'poll',
  IMAGE_POST: 'image',
  VIDEO_POST: 'video',
  DOCUMENT_POST: 'document'
};

// Content tones
export const CONTENT_TONES = {
  PROFESSIONAL: 'professional',
  CONVERSATIONAL: 'conversational',
  EDUCATIONAL: 'educational',
  INSPIRING: 'inspiring',
  THOUGHTFUL: 'thoughtful'
};

// Post frequencies
export const POST_FREQUENCIES = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  BIWEEKLY: 'biweekly',
  MONTHLY: 'monthly',
  CUSTOM: 'custom'
};
EOL
```

## Gemini API Integration

### 1. Install Gemini API Client

```bash
# Install Gemini API client
npm install @google/generative-ai
```

### 2. Create Gemini Service

```bash
# Create Gemini AI service
mkdir -p src/services
cat > src/services/geminiService.ts << EOL
import { GoogleGenerativeAI } from '@google/generative-ai';

// Service for interacting with Gemini API
export class GeminiService {
  private static apiKey: string | null = null;
  private static geminiModel: any = null;
  private static generativeAI: GoogleGenerativeAI | null = null;
  
  // Initialize the Gemini API service
  static async init(): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['geminiApiKey'], (result) => {
        if (result.geminiApiKey) {
          this.apiKey = result.geminiApiKey;
          this.generativeAI = new GoogleGenerativeAI(this.apiKey);
          this.geminiModel = this.generativeAI.getGenerativeModel({ model: 'gemini-pro' });
        }
        resolve();
      });
    });
  }
  
  // Set API key
  static setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
    chrome.storage.sync.set({ geminiApiKey: apiKey });
    this.generativeAI = new GoogleGenerativeAI(apiKey);
    this.geminiModel = this.generativeAI.getGenerativeModel({ model: 'gemini-pro' });
  }
  
  // Check if API key is set
  static isConfigured(): boolean {
    return !!this.apiKey && !!this.geminiModel;
  }
  
  // Generate content ideas based on user's profile and preferences
  static async generateContentIdeas(
    userProfile: any,
    preferences: any,
    count: number = 3
  ): Promise<string[]> {
    if (!this.isConfigured()) {
      throw new Error('Gemini API not configured');
    }
    
    const prompt = \`
      Generate \${count} LinkedIn post ideas for a professional with the following background:
      - Industry: \${userProfile.industry}
      - Role: \${userProfile.role}
      - Interests: \${userProfile.interests.join(', ')}
      - Tone preference: \${preferences.contentTone}
      
      The ideas should be relevant to current industry trends and help establish thought leadership.
      Format each idea as a brief title (1-2 sentences).
    \`;
    
    try {
      const result = await this.geminiModel.generateContent(prompt);
      const text = result.response.text();
      
      // Parse ideas from text (basic parsing - can be improved)
      return text
        .split(/\\d+\\./)
        .slice(1)
        .map(idea => idea.trim())
        .filter(idea => idea.length > 0);
    } catch (error) {
      console.error('Failed to generate content ideas:', error);
      throw error;
    }
  }
  
  // Generate a full post based on an idea
  static async generateFullPost(
    idea: string,
    userProfile: any,
    preferences: any
  ): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('Gemini API not configured');
    }
    
    const prompt = \`
      Generate a LinkedIn post based on this idea: "\${idea}"
      
      Professional background:
      - Industry: \${userProfile.industry}
      - Role: \${userProfile.role}
      
      The post should:
      - Be in a \${preferences.contentTone} tone
      - Be between 150-300 words
      - Include relevant hashtags
      - Have a clear hook in the first line
      - End with a question or call to action
      - Be formatted for LinkedIn (with appropriate line breaks)
    \`;
    
    try {
      const result = await this.geminiModel.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('Failed to generate full post:', error);
      throw error;
    }
  }
  
  // Generate comment suggestions for a post
  static async generateCommentSuggestions(
    postContent: string,
    userProfile: any,
    count: number = 3
  ): Promise<string[]> {
    if (!this.isConfigured()) {
      throw new Error('Gemini API not configured');
    }
    
    const prompt = \`
      Generate \${count} thoughtful comment suggestions for a LinkedIn post. 
      
      The post content is: "\${postContent.substring(0, 500)}..."
      
      My professional background:
      - Industry: \${userProfile.industry}
      - Role: \${userProfile.role}
      
      The comments should:
      - Be professional and add value to the conversation
      - Be between 1-3 sentences
      - Potentially include a question to prompt further discussion
      - Avoid generic phrases like "Great post!"
      - Help me establish a connection with the post author
      
      Format each comment separately.
    \`;
    
    try {
      const result = await this.geminiModel.generateContent(prompt);
      const text = result.response.text();
      
      // Parse comments from text (basic parsing - can be improved)
      return text
        .split(/\\d+\\./)
        .slice(1)
        .map(comment => comment.trim())
        .filter(comment => comment.length > 0);
    } catch (error) {
      console.error('Failed to generate comment suggestions:', error);
      throw error;
    }
  }
}

// Initialize service when extension loads
GeminiService.init();
EOL
```

### 3. Create Content Generation Service

```bash
# Create content service
cat > src/services/contentService.ts << EOL
import { GeminiService } from './geminiService';
import { ApiService } from './api';
import { STORAGE_KEYS } from '../utils/constants';

// Mock user profile - would be fetched from backend in production
const DEFAULT_USER_PROFILE = {
  industry: 'Technology',
  role: 'Software Developer',
  interests: ['AI', 'Web Development', 'Career Growth']
};

// Mock user preferences - would be fetched from storage in production
const DEFAULT_USER_PREFERENCES = {
  contentTone: 'professional',
  postFrequency: 'weekly',
  commentFrequency: 'daily'
};

// Service for content generation and management
export class ContentService {
  // Get user profile from storage or fallback to default
  static async getUserProfile(): Promise<any> {
    return new Promise((resolve) => {
      chrome.storage.sync.get([STORAGE_KEYS.USER_PROFILE], (result) => {
        resolve(result[STORAGE_KEYS.USER_PROFILE] || DEFAULT_USER_PROFILE);
      });
    });
  }
  
  // Get user preferences from storage or fallback to default
  static async getUserPreferences(): Promise<any> {
    return new Promise((resolve) => {
      chrome.storage.sync.get([STORAGE_KEYS.USER_PREFERENCES], (result) => {
        resolve(result[STORAGE_KEYS.USER_PREFERENCES] || DEFAULT_USER_PREFERENCES);
      });
    });
  }
  
  // Generate content ideas
  static async generateContentIdeas(count: number = 3): Promise<string[]> {
    const userProfile = await this.getUserProfile();
    const preferences = await this.getUserPreferences();
    
    return GeminiService.generateContentIdeas(userProfile, preferences, count);
  }
  
  // Generate full post from idea
  static async generateFullPost(idea: string): Promise<string> {
    const userProfile = await this.getUserProfile();
    const preferences = await this.getUserPreferences();
    
    return GeminiService.generateFullPost(idea, userProfile, preferences);
  }
  
  // Generate comment suggestions for a post
  static async generateCommentSuggestions(postContent: string, count: number = 3): Promise<string[]> {
    const userProfile = await this.getUserProfile();
    
    return GeminiService.generateCommentSuggestions(postContent, userProfile, count);
  }
  
  // Save a post to scheduled posts
  static async schedulePost(post: any): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.sync.get([STORAGE_KEYS.CONTENT_CACHE], (result) => {
        const scheduledPosts = result[STORAGE_KEYS.CONTENT_CACHE]?.scheduledPosts || [];
        scheduledPosts.push({
          ...post,
          id: Date.now().toString(),
          created: new Date().toISOString()
        });
        
        chrome.storage.sync.set({
          [STORAGE_KEYS.CONTENT_CACHE]: {
            ...result[STORAGE_KEYS.CONTENT_CACHE],
            scheduledPosts
          }
        }, () => resolve());
      });
    });
  }
  
  // Get all scheduled posts
  static async getScheduledPosts(): Promise<any[]> {
    return new Promise((resolve) => {
      chrome.storage.sync.get([STORAGE_KEYS.CONTENT_CACHE], (result) => {
        resolve(result[STORAGE_KEYS.CONTENT_CACHE]?.scheduledPosts || []);
      });
    });
  }
}
EOL
```

## Development Workflow

### 1. Create NPM Scripts

Update your package.json with the following scripts:

```bash
# Update scripts section in package.json
cat > scripts_temp.json << EOL
{
  "scripts": {
    "build": "webpack --config webpack.config.js",
    "dev": "webpack --watch --config webpack.config.js",
    "test": "jest",
    "lint": "eslint --ext .js,.jsx,.ts,.tsx src/",
    "format": "prettier --write \"src/**/*.{js,jsx,ts,tsx,json,
