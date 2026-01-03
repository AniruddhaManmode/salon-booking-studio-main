import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// TODO: Replace with your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCYiMxzYjQ1JlLDsd1nrGidVC9Vu25e1W8",
  authDomain: "salon12321312.firebaseapp.com",
  projectId: "salon12321312",
  storageBucket: "salon12321312.firebasestorage.app",
  messagingSenderId: "292829213320",
  appId: "1:292829213320:web:dd3dc413f2e0086c78653d",
  measurementId: "G-FSDNFN5HYH"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Note: Auth is not initialized as it's not used in this application
// If you need authentication later, enable it in Firebase Console and uncomment below:
// import { getAuth } from 'firebase/auth';
// export const auth = getAuth(app);
