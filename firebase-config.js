// Firebase Config - Jojo Cafe SaaS
const firebaseConfig = {
  apiKey: "AIzaSyBSI1SsED4ZxOWwHBDH-ugiAa7mrbKmts0",
  authDomain: "jojo-cafe-db.firebaseapp.com",
  projectId: "jojo-cafe-db",
  storageBucket: "jojo-cafe-db.firebasestorage.app",
  messagingSenderId: "111785215360",
  appId: "1:111785215360:web:7abc4af99462ac9f836d65"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
