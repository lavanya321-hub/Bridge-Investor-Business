// Check if Firebase is loaded
if (typeof firebase === 'undefined') {
    throw new Error("Firebase SDK not loaded");
  }
  
  // Initialize Firebase
  const firebaseConfig = {
    apiKey: "AIzaSyCpq9JF-Y5t7XR6nivu6hrxj51iR7IzgVk",
  authDomain: "bridge-investor-business-d7698.firebaseapp.com",
  projectId: "bridge-investor-business-d7698",
  storageBucket: "bridge-investor-business-d7698.firebasestorage.app",
  messagingSenderId: "718037308595",
  appId: "1:718037308595:web:e494da56e24fddd7678cc6",
  measurementId: "G-DGD00EV4WK"
  };
  
  try {
    firebase.initializeApp(firebaseConfig);
    console.log("Firebase initialized successfully");
    
    // Initialize services
    const auth = firebase.auth();
    const db = firebase.firestore();
    
    // Make available globally
    window.auth = auth;
    window.db = db;
    
  } catch (error) {
    console.error("Firebase initialization failed", error);
    throw error;
  }