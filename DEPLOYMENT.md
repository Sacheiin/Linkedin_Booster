# Firebase Deployment Guide

## Environment Setup
1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```
2. Configure project settings:
```bash
firebase use --add
```

## API Key Configuration
Set Gemini API key securely:
```bash
firebase functions:config:set gemini.key="YOUR_API_KEY"
```

## Deployment Commands
```bash
# Deploy Cloud Functions
firebase deploy --only functions

# Deploy all components
firebase deploy
```

## Scheduled Tasks Setup
Add to firebase.json:
```json
"schedules": {
  "content-generation": {
    "schedule": "every 24 hours",
    "timeZone": "America/New_York"
  }
}
```