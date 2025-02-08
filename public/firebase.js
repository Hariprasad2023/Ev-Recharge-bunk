
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-storage.js";

// web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDje6FhlWbiJZpgvmqTz5IcFuwt8sguhXk",
    authDomain: "ev-bunk-e9835.firebaseapp.com",
    projectId: "ev-bunk-e9835",
    storageBucket: "ev-bunk-e9835.firebasestorage.app",
    messagingSenderId: "120191929915",
    appId: "1:120191929915:web:2fbabe6b69f4564c4d161e",
    measurementId: "G-D6NLDVTYJ8"
  };
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const storage = getStorage(app);
  
  // Export Firebase services
  export { auth, db, storage };
  