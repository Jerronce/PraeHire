// Firebase Configuration and Initialization
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Firebase configuration - Replace with your actual config
const firebaseConfig = {
  apiKey: "AIzaSyATQe2BcLSrQqcDVVNEjjioPt3O1IbyLlo",
  authDomain: "praehire.firebaseapp.com",
  projectId: "praehire",
  storageBucket: "praehire.firebasestorage.app",
  messagingSenderId: "327322116075",
  appId: "1:327322116075:web:2bf7d0cf00630ee83603ae",
  measurementId: "G-3QE36JHXMZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Auth state observer
export function initAuthStateObserver(callback) {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      callback(user);
    } else {
      callback(null);
    }
  });
}

// Check if user is authenticated
export function checkAuth() {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

console.log('Firebase initialized successfully');
