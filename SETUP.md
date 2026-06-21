# ShortsForge Mobile — Setup Guide

## How it works

```
ShortsForge Desktop  →  Firebase (real-time sync)  →  ShortsForge Mobile (iOS)
```

Both apps share the same Firebase project. When ShortsForge on your desktop starts
a render, the bridge module pushes that update to Firebase instantly. Your iPhone
sees it in real time.

---

## Step 1 — Create a Firebase project (free)

1. Go to https://console.firebase.google.com
2. Click **Add project** → name it `shortsforge` → Continue
3. Enable **Google Analytics** (optional) → Create project

### Enable Authentication
- Left sidebar → **Build → Authentication → Get started**
- Click **Email/Password** → Enable → Save

### Enable Firestore
- Left sidebar → **Build → Firestore Database → Create database**
- Choose **Start in test mode** → select a region → Done

### Enable Realtime Database
- Left sidebar → **Build → Realtime Database → Create database**
- Choose **Start in test mode** → select a region → Done

### Get your config
- Click the gear icon → **Project settings**
- Scroll to **Your apps** → click **</>** (Web)
- Register app → copy the `firebaseConfig` object

---

## Step 2 — Configure both apps

Paste your Firebase config in **two places**:

1. `ShortsForge-Mobile/src/services/firebase.ts`
   - Replace everything in `firebaseConfig = { ... }`

2. `ShortsForge-Bridge/shortsforge-bridge.js`
   - Replace everything in `FIREBASE_CONFIG = { ... }`

---

## Step 3 — Add the bridge to ShortsForge desktop

1. Copy `ShortsForge-Bridge/shortsforge-bridge.js` into your ShortsForge project
2. In your ShortsForge app, install Firebase:
   ```
   npm install firebase
   ```
3. Import and use the bridge:

```js
const bridge = require('./shortsforge-bridge');

// On app startup (use same email/password as your mobile app account)
await bridge.connect('your@email.com', 'yourpassword');

// Whenever a short starts processing:
await bridge.updateShort({
  id: 'unique-short-id',          // e.g. the filename or a UUID
  title: 'My YouTube Short',
  platform: 'youtube',            // 'youtube' | 'tiktok' | 'instagram' | 'all'
  status: 'rendering',            // 'processing' | 'rendering' | 'exporting'
  progress: 45,                   // 0–100
  duration: 30,                   // seconds
});

// When it's done:
await bridge.updateShort({
  id: 'unique-short-id',
  title: 'My YouTube Short',
  platform: 'youtube',
  status: 'done',
  progress: 100,
  duration: 30,
  outputUrl: '/path/to/output.mp4',
});

// On app close:
await bridge.disconnect();
```

---

## Step 4 — Run the mobile app

```bash
cd ShortsForge-Mobile
npm install
npx expo start --ios
```

- Sign in with the **same email/password** you pass to `bridge.connect()`
- Your shorts will appear in real time

---

## Step 5 — Build for your iPhone (optional)

To install the app on your actual iPhone:

```bash
npm install -g eas-cli
eas login
eas build --platform ios --profile preview
```

This creates an `.ipa` you can install via TestFlight or direct install.

---

## Firestore Security Rules (before going to production)

Replace test mode rules with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```
