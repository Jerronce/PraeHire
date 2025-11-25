// Firebase Auth Module - Complete Working Version

import { auth } from './firebase-config.js';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Only your admin email is allowed full access immediately
const ADMIN_EMAIL = "jerronce101@gmail.com";

// Mock payment check function (replace with your backend/database logic)
async function checkIfPaidUser(email) {
  // For now, always false; connect to your real payment/database here!
  return false;
}

// Wait for DOM content to be loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 PraeHire Auth Initialized');

  // Get DOM elements
  const loginTab = document.getElementById('loginTab');
  const signupTab = document.getElementById('signupTab');
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const googleBtn = document.getElementById('googleSignIn');
  const forgotPasswordLink = document.querySelector('.forgot-link');
  const loginEmail = document.getElementById('loginEmail');
  const loginPassword = document.getElementById('loginPassword');
  const loginError = document.getElementById('loginError');
  const loginButton = document.querySelector('#loginForm button[type="button"]');
  const signupName = document.getElementById('signupName');
  const signupEmail = document.getElementById('signupEmail');
  const signupPassword = document.getElementById('signupPassword');
  const signupError = document.getElementById('signupError');
  const signupButton = document.querySelector('#signupForm button[type="button"]');

  // Tab Switching
  if (loginTab && signupTab && loginForm && signupForm) {
    loginTab.addEventListener('click', () => {
      loginTab.classList.add('active');
      signupTab.classList.remove('active');
      loginForm.style.display = 'block';
      signupForm.style.display = 'none';
    });

    signupTab.addEventListener('click', () => {
      signupTab.classList.add('active');
      loginTab.classList.remove('active');
      signupForm.style.display = 'block';
      loginForm.style.display = 'none';
    });
  } else {
    console.error('❌ Tab elements missing!');
  }

  // Login Button Handler
  if (loginButton) {
    loginButton.addEventListener('click', async () => {
      if (loginError) loginError.textContent = '';
      const email = loginEmail.value.trim();
      const password = loginPassword.value;
      if (!email || !password) {
        if (loginError) loginError.textContent = 'Please enter email and password';
        return;
      }
      try {
        if (email.toLowerCase() !== ADMIN_EMAIL) {
          if (loginError) loginError.textContent = 'Only admin can login. Use Google Sign-In for $100/month access.';
          return;
        }
        await signInWithEmailAndPassword(auth, email, password);
        window.location.href = 'dashboard.html';
      } catch (error) {
        if (loginError) loginError.textContent = error.message;
      }
    });
  }

  // Signup Button Handler
  if (signupButton) {
    signupButton.addEventListener('click', async () => {
      if (signupError) signupError.textContent = '';
      const name = signupName.value.trim();
      const email = signupEmail.value.trim();
      const password = signupPassword.value;
      if (!name || !email || !password) {
        if (signupError) signupError.textContent = 'Please fill all fields';
        return;
      }
      try {
        if (email.toLowerCase() !== ADMIN_EMAIL) {
          if (signupError) signupError.textContent = 'Only admin can sign up. Use Google Sign-In for $100/month access.';
          return;
        }
        await createUserWithEmailAndPassword(auth, email, password);
        window.location.href = 'dashboard.html';
      } catch (error) {
        if (signupError) signupError.textContent = error.message;
      }
    });
  }

  // Google Sign-In
  if (googleBtn) {
    googleBtn.addEventListener('click', async () => {
      try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        if (user.email && user.email.toLowerCase() === ADMIN_EMAIL) {
          window.location.href = 'dashboard.html';
        } else {
          // Only paid users should be allowed, implement check
          const isPaid = await checkIfPaidUser(user.email);
          if (isPaid) {
            window.location.href = 'dashboard.html';
          } else {
            window.location.href = 'payment-gate.html';
          }
        }
      } catch (error) {
        alert('Sign in failed: ' + error.message);
      }
    });
  }

  // Forgot Password Handler
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', async (e) => {
      e.preventDefault();
      const email = loginEmail.value.trim();
      if (!email) {
        alert('Please enter your email address first.');
        return;
      }
      try {
        await sendPasswordResetEmail(auth, email);
        alert('✅ Password reset email sent! Check your inbox.');
      } catch (error) {
        alert('Error: ' + error.message);
      }
    });
  }

  console.log('🎉 All auth features initialized successfully!');
});
