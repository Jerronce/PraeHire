// js/auth.js - Restricted Admin Access v7.5
import { auth } from './firebase-config.js';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// RESTRICTION: Only this email can enter the dashboard
const ADMIN_EMAIL = "jerronce101@gmail.com".toLowerCase();

// --- GOOGLE SIGN-IN ---
window.handleGoogleSignIn = async function handleGoogleSignIn() {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const email = (result.user.email || '').toLowerCase();

    if (email === ADMIN_EMAIL) {
      localStorage.setItem('userEmail', email);
      window.location.href = 'dashboard.html';
    } else {
      // Reject anyone else and send to payment (where they will eventually be blocked too)
      alert("Access Restricted: PraeHire is currently in Private Beta.");
      window.location.href = 'payment-gate.html';
    }
  } catch (error) {
    alert('Sign in failed: ' + error.message);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 PraeHire Auth: Admin-Only Mode Active');

  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const loginError = document.getElementById('loginError');
  const signupError = document.getElementById('signupError');

  // --- EMAIL/PASSWORD LOGIN ---
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value.trim().toLowerCase();
      const password = document.getElementById('loginPassword').value;

      if (email !== ADMIN_EMAIL) {
        loginError.textContent = "Unauthorized: Only the CTO can login during maintenance.";
        return;
      }

      try {
        await signInWithEmailAndPassword(auth, email, password);
        localStorage.setItem('userEmail', email);
        window.location.href = 'dashboard.html';
      } catch (error) {
        loginError.textContent = "Invalid credentials.";
      }
    });
  }

  // --- EMAIL/PASSWORD SIGNUP ---
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('signupEmail').value.trim().toLowerCase();
      const password = document.getElementById('signupPassword').value;

      if (email !== ADMIN_EMAIL) {
        signupError.textContent = "Private Beta: Registration is currently closed.";
        return;
      }

      try {
        await createUserWithEmailAndPassword(auth, email, password);
        localStorage.setItem('userEmail', email);
        window.location.href = 'dashboard.html'; // Admin bypasses payment
      } catch (error) {
        signupError.textContent = error.message;
      }
    });
  }

  // --- FORGOT PASSWORD ---
  const forgotLink = document.querySelector('.forgot-link');
  if (forgotLink) {
    forgotLink.addEventListener('click', async (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value.trim();
      if (!email) return alert("Enter your email first.");
      await sendPasswordResetEmail(auth, email);
      alert("Reset link sent!");
    });
  }
});