// firebase-config.js - Part 14

// Aapke Firebase Database ki asli Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBSI1SsED4ZxOWwHBDH-ugiAa7mrbKmts0",
  authDomain: "jojo-cafe-db.firebaseapp.com",
  projectId: "jojo-cafe-db",
  storageBucket: "jojo-cafe-db.firebasestorage.app",
  messagingSenderId: "111785215360",
  appId: "1:111785215360:web:7abc4af99462ac9f836d65"
};

// Initialize Firebase (Agar pehle se load nahi hua hai tabhi chalega)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Database (Firestore) aur Storage (Photo Gallery) ko chalu karna
const db = firebase.firestore();
const storage = firebase.storage();

console.log("🔥 Firebase Database Connected Successfully! 🚀");

