import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC-WJs2ZDjYOZJJAPyJNtsJKDFNakV75Cg",
  authDomain: "empowered-hoops-term-tra-341d5.firebaseapp.com",
  projectId: "empowered-hoops-term-tra-341d5",
  storageBucket: "empowered-hoops-term-tra-341d5.firebasestorage.app",
  messagingSenderId: "188854971437",
  appId: "1:188854971437:web:5a2a12376b9e36f33b5ca4",
  measurementId: "G-C9PL9YJKRG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);