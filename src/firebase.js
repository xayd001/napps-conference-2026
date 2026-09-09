import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Replace with your Firebase Project Configuration keys
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "napps-conference-2026.firebaseapp.com",
  projectId: "napps-conference-2026",
  storageBucket: "napps-conference-2026.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);