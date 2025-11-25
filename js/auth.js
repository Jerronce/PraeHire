// Firebase Auth Module
import { auth } from './firebase-config.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

const ADMIN_EMAIL = 'jerronce101@gmail.com';

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing auth...');
    
    // Get DOM elements
    const loginTab = document.getElementById('loginTab');
    const signupTab = document.getElementById('signupTab');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('SignupForm');
    const googleBtn = document.getElementById('googleSignIn');
    const forgotPasswordLink = document.querySelector('.forgot-link');
    
    // Debug: Check if elements exist
    console.log('Elements found:', {
        loginTab: !!loginTab,
        signupTab: !!signupTab, 
        loginForm: !!loginForm,
        signupForm: !!signupForm,
        googleBtn: !!googleBtn
    });
    
    // Tab Switching
    if (loginTab && signupTab && loginForm && signupForm) {
        loginTab.addEventListener('click', () => {
            console.log('Login tab clicked');
            loginTab.classList.add('active');
            signupTab.classList.remove('active');
            loginForm.style.display = 'block';
            signupForm.style.display = 'none';
        });
        
        signupTab.addEventListener('click', () => {
            console.log('Signup tab clicked');
            signupTab.classList.add('active');
            loginTab.classList.remove('active');
            signupForm.style.display = 'block';
            loginForm.style.display = 'none';
        });
    } else {
        console.error('Tab elements missing!');
    }
    
    // Email/Password Login
    const loginFormElement = document.querySelector('#loginForm form');
    if (loginFormElement) {
        loginFormElement.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            const errorEl = document.getElementById('loginError');
            
            try {
                // Check if admin email
                if (email.toLowerCase() !== ADMIN_EMAIL) {
                    errorEl.textContent = 'Only admin can login. Please use Google Sign-In for $100/month access.';
                    return;
                }
                
                await signInWithEmailAndPassword(auth, email, password);
                window.location.href = 'dashboard.html';
            } catch (error) {
                errorEl.textContent = error.message;
            }
        });
    }
    
    // Email/Password Signup  
    const signupFormElement = document.querySelector('#SignupForm form');
    if (signupFormElement) {
        signupFormElement.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('signupName').value;
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            const errorEl = document.getElementById('signupError');
            
            try {
                // Check if admin email
                if (email.toLowerCase() !== ADMIN_EMAIL) {
                    errorEl.textContent = 'Only admin can sign up. Please use Google Sign-In for $100/month access.';
                    return;
                }
                
                await createUserWithEmailAndPassword(auth, email, password);
                window.location.href = 'dashboard.html';
            } catch (error) {
                errorEl.textContent = error.message;
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
                
                // Check if admin
                if (user.email && user.email.toLowerCase() === ADMIN_EMAIL) {
                    window.location.href = 'dashboard.html';
                } else {
                    // Non-admin: redirect to payment gate
                    window.location.href = 'payment-gate.html';
                }
            } catch (error) {
                alert(error.message);
            }
        });
    }
    
    // Forgot Password
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            
            if (!email) {
                alert('Please enter your email address first.');
                return;
            }
            
            try {
                await sendPasswordResetEmail(auth, email);
                alert('Password reset email sent! Check your inbox.');
            } catch (error) {
                alert('Error: ' + error.message);
            }
        });
    }
});
