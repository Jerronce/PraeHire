// Firebase Auth Module - Complete Working Version
import { auth } from './firebase-config.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

const ADMIN_EMAIL = 'jerronce101@gmail.com';

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 PraeHire Auth Initialized');
        
    // Get all DOM elements
    const loginTab = document.getElementById('loginTab');
    const signupTab = document.getElementById('signupTab');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
        console.log('🔍 DEBUG: Checking elements...');
    console.log('loginTab:', loginTab);
    console.log('signupTab:', signupTab);
    console.log('loginForm:', loginForm);
    console.log('signupForm:', signupForm);
    

    const googleBtn = document.getElementById('googleSignIn');
    const forgotPasswordLink = document.querySelector('.forgot-link');
    
    // Get login form elements
    const loginEmail = document.getElementById('loginEmail');
    const loginPassword = document.getElementById('loginPassword');
    const loginError = document.getElementById('loginError');
    const loginButton = document.querySelector('#loginForm button[type="button"]');
    
    // Get signup form elements  
    const signupName = document.getElementById('signupName');
    const signupEmail = document.getElementById('signupEmail');
    const signupPassword = document.getElementById('signupPassword');
    const signupError = document.getElementById('signupError');
    const signupButton = document.querySelector('#signupForm button[type="button"]');
    
    console.log('✅ Elements loaded:', {
        loginTab: !!loginTab,
        signupTab: !!signupTab,
        loginForm: !!loginForm,
        signupForm: !!signupForm,
        googleBtn: !!googleBtn,
        loginButton: !!loginButton,
        signupButton: !!signupButton
    });
    
    // Tab Switching - THIS IS THE FIX!
    if (loginTab && signupTab && loginForm && signupForm) {
        loginTab.addEventListener('click', () => {
            console.log('🔵 Login tab clicked');
            loginTab.classList.add('active');
            signupTab.classList.remove('active');
            loginForm.style.display = 'block';
            signupForm.style.display = 'none';
        });
        
        signupTab.addEventListener('click', () => {
            console.log('🟢 Signup tab clicked');
            signupTab.classList.add('active');
            loginTab.classList.remove('active');
            signupForm.style.display = 'block';
            loginForm.style.display = 'none';
        });
        console.log('✅ Tab switching enabled');
    } else {
        console.error('❌ Tab elements missing!');
    }
    
    // Login Button Handler
    if (loginButton) {
        loginButton.addEventListener('click', async () => {
            console.log('🔐 Login button clicked');
            if (loginError) loginError.textContent = '';
            
            const email = loginEmail.value.trim();
            const password = loginPassword.value;
            
            if (!email || !password) {
                if (loginError) loginError.textContent = 'Please enter email and password';
                return;
            }
            
            try {
                // Check if admin email
                if (email.toLowerCase() !== ADMIN_EMAIL) {
                    if (loginError) loginError.textContent = 'Only admin can login. Use Google Sign-In for $100/month access.';
                    return;
                }
                
                console.log('Logging in...');
                await signInWithEmailAndPassword(auth, email, password);
                console.log('✅ Login successful!');
                window.location.href = 'dashboard.html';
            } catch (error) {
                console.error('❌ Login error:', error);
                if (loginError) loginError.textContent = error.message;
            }
        });
        console.log('✅ Login button handler attached');
    }
    
    // Signup Button Handler
    if (signupButton) {
        signupButton.addEventListener('click', async () => {
            console.log('📝 Signup button clicked');
            if (signupError) signupError.textContent = '';
            
            const name = signupName.value.trim();
            const email = signupEmail.value.trim();
            const password = signupPassword.value;
            
            if (!name || !email || !password) {
                if (signupError) signupError.textContent = 'Please fill all fields';
                return;
            }
            
            try {
                // Check if admin email
                if (email.toLowerCase() !== ADMIN_EMAIL) {
                    if (signupError) signupError.textContent = 'Only admin can sign up. Use Google Sign-In for $100/month access.';
                    return;
                }
                
                console.log('Signing up...');
                await createUserWithEmailAndPassword(auth, email, password);
                console.log('✅ Signup successful!');
                window.location.href = 'dashboard.html';
            } catch (error) {
                console.error('❌ Signup error:', error);
                if (signupError) signupError.textContent = error.message;
            }
        });
        console.log('✅ Signup button handler attached');
    }
    
    // Google Sign-In
    if (googleBtn) {
        googleBtn.addEventListener('click', async () => {
            console.log('🔴 Google Sign-In clicked');
            try {
                const provider = new GoogleAuthProvider();
                const result = await signInWithPopup(auth, provider);
                const user = result.user;
                
                console.log('User signed in:', user.email);
                
                // Check if admin
                if (user.email && user.email.toLowerCase() === ADMIN_EMAIL) {
                    console.log('✅ Admin user - redirecting to dashboard');
                    window.location.href = 'dashboard.html';
                } else {
                    console.log('💰 Non-admin user - redirecting to payment gate');
                    window.location.href = 'payment-gate.html';
                }
            } catch (error) {
                console.error('❌ Google Sign-In error:', error);
                alert(error.message);
            }
        });
        console.log('✅ Google Sign-In enabled');
    }
    
    // Forgot Password
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', async (e) => {
            e.preventDefault();
            console.log('🔑 Forgot password clicked');
            
            const email = loginEmail.value.trim();
            
            if (!email) {
                alert('Please enter your email address first.');
                return;
            }
            
            try {
                await sendPasswordResetEmail(auth, email);
                alert('✅ Password reset email sent! Check your inbox.');
                console.log('✅ Password reset email sent');
            } catch (error) {
                console.error('❌ Password reset error:', error);
                alert('Error: ' + error.message);
            }
        });
        console.log('✅ Forgot password enabled');
    }
    
    console.log('🎉 All auth features initialized successfully!');
});
