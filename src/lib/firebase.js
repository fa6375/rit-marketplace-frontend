import { initializeApp } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDtzn2tyWXMkINxNGXN1neMoM7zfzWT4o8",
  authDomain: "rit-marketplace.firebaseapp.com",
  projectId: "rit-marketplace",
  storageBucket: "rit-marketplace.firebasestorage.app",
  messagingSenderId: "377407485793",
  appId: "1:377407485793:web:2319d6cb17ea9ff9147720",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
// Keep user signed in across refreshes
setPersistence(auth, browserLocalPersistence).catch(() => {});

export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
