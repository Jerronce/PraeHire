// Auth page interactions
document.addEventListener('DOMContentLoaded', () => {
import { auth } from './firebase-config.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

const loginTab = document.getElementById('loginTab');
const signupTab = document.getElementById('signupTab');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('SignupForm');

if (loginTab && signupTab) {
  loginTab.addEventListener('click', () => {
    loginTab.classList.add('active');
    signupTab.classList.remove('active');
    loginForm.style.display = '';
    signupForm.style.display = 'none';
  });

  signupTab.addEventListener('click', () => {
    signupTab.classList.add('active');
    loginTab.classList.remove('active');
    signupForm.style.display = '';
    loginForm.style.display = 'none';
  });
}

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const errorEl = document.getElementById('loginError');
    errorEl.textContent = '';

    try {
      await signInWithEmailAndPassword(auth, email, password);
      
      // ADMIN LOCKDOWN: Only Jerronce101@gmail.com is allowed
      const ADMIN_EMAIL = 'jerronce101@gmail.com';
      const currentUser = auth.currentUser;
      
      if (currentUser && currentUser.email && currentUser.email.toLowerCase() !== ADMIN_EMAIL) {
        // Unauthorized email - sign them out immediately
        await auth.signOut();
        errorEl.textContent = 'Access Denied: Only the admin account is authorized to access PraeHire.';
        return;
      }
      window.location.href = 'dashboard.html';
    } catch (err) {
      errorEl.textContent = err.message;
    }
  });
}

if (signupForm) {
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirm = document.getElementById('signupConfirmPassword').value;
    const errorEl = document.getElementById('signupError');
    errorEl.textContent = '';

    if (password !== confirm) {
      errorEl.textContent = 'Passwords do not match';
      return;
    }
    
    // ADMIN LOCKDOWN: Only Jerronce101@gmail.com can create an account
    const ADMIN_EMAIL = 'jerronce101@gmail.com';
    if (email.toLowerCase() !== ADMIN_EMAIL) {
      errorEl.textContent = 'Access Denied: Only the admin email is authorized to create an account.';
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      window.location.href = 'dashboard.html';
    } catch (err) {
      errorEl.textContent = err.message;
    }
  });
}

const googleBtn = document.getElementById('googleSignIn');
if (googleBtn) {
  googleBtn.addEventListener('click', async () => {
    try {
      const provider = new GoogleAuthProvider();
       const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // ADMIN LOCKDOWN: Only Jerronce101@gmail.com is allowed
      const ADMIN_EMAIL = 'jerronce101@gmail.com';
      
      if (user.email && user.email.toLowerCase() !== ADMIN_EMAIL) {
        // Non-admin user - redirect to payment page
        window.location.href = 'payment-gate.html';
        return;
      }
      // Admin user - proceed to dashboard
      window.location.href = 'dashboard.html';      }
    } catch (err) {
      alert(err.message);
    }
  });

});}
