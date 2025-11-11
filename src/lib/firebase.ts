
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDSUEC2AnSN7uV_kZQWyiaIOmYm43zuPO8",
  authDomain: "studio-3278073408-a9920.firebaseapp.com",
  projectId: "studio-3278073408-a9920",
  storageBucket: "studio-3278073408-a9920.appspot.com",
  messagingSenderId: "118205814011",
  appId: "1:118205814011:web:c27caead6a2d8def25cc5e"
};

// Initialize Firebase for server-side rendering
const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

export { app, auth, db, firebaseConfig };
