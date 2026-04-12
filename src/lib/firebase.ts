import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCCJb4b-M59rxx2uo0Sxs3ynUVQorr50EI",
  authDomain: "anti-phishing-security.firebaseapp.com",
  projectId: "anti-phishing-security",
  storageBucket: "anti-phishing-security.firebasestorage.app",
  messagingSenderId: "148078331123",
  appId: "1:148078331123:web:bfbdca4f0746735f6a6386",
  measurementId: "G-BX0RD0DNX0"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
