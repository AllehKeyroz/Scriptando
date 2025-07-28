// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCPhWN_kGLBKLacTFjlIRQefv7Jo_bCOo4",
  authDomain: "ol-mundo-w586f.firebaseapp.com",
  projectId: "ol-mundo-w586f",
  storageBucket: "ol-mundo-w586f.appspot.com",
  messagingSenderId: "559031570198",
  appId: "1:559031570198:web:dda84c25fea3c289d88a37"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
