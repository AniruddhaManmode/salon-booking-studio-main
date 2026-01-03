# Firebase Setup for Salon Booking

## Step 1: Create Firebase Project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click "Add project"
3. Project name: "salon-booking-system"
4. Enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Set up Firestore Database

1. In Firebase console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for now)
4. Select a location (choose closest to you)
5. Click "Create database"

## Step 3: Get Firebase Config

1. Go to Project Settings (gear icon)
2. Under "Your apps", click "Web app"
3. Copy the Firebase config object
4. It will look like:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyCYiMxzYjQ1JlLDsd1nrGidVC9Vu25e1W8",
  authDomain: "salon12321312.firebaseapp.com",
  projectId: "salon12321312",
  storageBucket: "salon12321312.firebasestorage.app",
  messagingSenderId: "292829213320",
  appId: "1:292829213320:web:dd3dc413f2e0086c78653d",
  measurementId: "G-FSDNFN5HYH"
};
```

## Step 4: Install Firebase Dependencies

Run these commands in your project:

```bash
npm install firebase
npm install @types/firebase
```

## Step 5: Create Firebase Config File

Create `src/firebase.ts` with your config:

```typescript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  // PASTE YOUR CONFIG HERE
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
```

## Step 6: Firestore Rules

In Firebase console → Firestore → Rules, replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /bookings/{bookingId} {
      allow create: if true;
      allow read, write: if request.auth != null;
    }
  }
}
```

## Step 7: Test

After setup, test the booking form - data should appear in Firestore instantly!
