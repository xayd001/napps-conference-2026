import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyDvfBHuK3rmKby1mdpG72KfD4OBYtb6BQ0",
  authDomain: "napps-conference-2026-22771.firebaseapp.com",
  projectId: "napps-conference-2026-22771",
  storageBucket: "napps-conference-2026-22771.firebasestorage.app",
  messagingSenderId: "641590693182",
  appId: "1:641590693182:web:68cd20aab1929f1a43306f"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const messaging = getMessaging(app);
export default app;