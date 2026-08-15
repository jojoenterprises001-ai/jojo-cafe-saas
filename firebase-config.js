// Firebase SDK ko CDN se import kar rahe hain
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Tumhara Asli Jojo Cafe Config
const firebaseConfig = {
  apiKey: "AIzaSyBSI1SsED4ZxOWwHBDH-ugiAa7mrbKmts0",
  authDomain: "jojo-cafe-db.firebaseapp.com",
  projectId: "jojo-cafe-db",
  storageBucket: "jojo-cafe-db.firebasestorage.app",
  messagingSenderId: "111785215360",
  appId: "1:111785215360:web:7abc4af99462ac9f836d65"
};

// Firebase Initialize kar rahe hain
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

console.log("🔥 Firebase successfully connected to Jojo Cafe Database!");

// In variables ko baaki files ke liye export kar rahe hain
export { app, db, auth };
