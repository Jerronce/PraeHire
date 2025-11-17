// ADMIN ONLY LOCKDOWN - Only Jerronce101@gmail.com can login
const ADMIN_EMAIL = 'Jerronce101@gmail.com';

// Disable all input fields for non-paying users on page load
window.addEventListener('DOMContentLoaded', () => {
    // Check if user is on login page
    if (window.location.pathname.includes('login')) {
        disableInputsForNonAdmin();
    }
});

function disableInputsForNonAdmin() {
    // Get all form inputs
    const loginEmail = document.getElementById('loginEmail');
    const loginPassword = document.getElementById('loginPassword');
    const signupInputs = document.querySelectorAll('#signupForm input');
    
    // Add placeholder text to inform users
    if (loginEmail) {
        loginEmail.placeholder = '🔒 Only admin can login - See pricing to get access';
    }
    if (loginPassword) {
        loginPassword.placeholder = '🔒 Admin access only';
    }
    
    // Disable signup inputs and add helpful text
    signupInputs.forEach(input => {
        if (input.type !== 'checkbox') {
            input.disabled = true;
            input.placeholder = '🔒 Payment required - Click "Back to home" to see pricing';
            input.style.cursor = 'not-allowed';
            input.style.opacity = '0.6';
        }
    });
}

// Override Firebase signInWithEmailAndPassword
if (typeof window !== 'undefined' && window.firebaseAuth) {
    const originalSignIn = window.firebaseAuth.signIn;
    
    window.firebaseAuth.signIn = async function(auth, email, password) {
        // Only allow admin email
        if (email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
            alert('⚠️ Access Denied!\n\nThis application is currently restricted.\n\nOnly the administrator (Jerronce101@gmail.com) can login.\n\nTo gain access:\n1. Click "← Back to home" below\n2. View our pricing at $100/month\n3. Complete payment to create your account\n\nVisit: https://praehire.web.app/#pricing');
            throw new Error('Access denied: Admin-only mode');
        }
        
        // Allow admin to proceed
        return originalSignIn(auth, email, password);
    };
}

// Block signup for non-admin users
if (typeof window !== 'undefined' && window.firebaseAuth && window.firebaseAuth.signUp) {
    const originalSignUp = window.firebaseAuth.signUp;
    
    window.firebaseAuth.signUp = async function(auth, email, password) {
        // Block all signups - redirect to pricing
        alert('⚠️ New Signups Require Payment!\n\nTo create an account, you must complete payment first.\n\nPayment Required: $100/month (₦165,000)\n\nPlease:\n1. Click "← Back to home" below\n2. Go to Pricing section\n3. Complete payment via Flutterwave\n\nOr visit: https://praehire.web.app/#pricing');
        
        // Redirect to home page after 2 seconds
        setTimeout(() => {
            window.location.href = '/index.html#pricing';
        }, 2000);
        
        throw new Error('Signup blocked: Payment required');
    };
}

console.log('🔒 Admin-only mode active - Only', ADMIN_EMAIL, 'can login');
console.log('💳 All other users must pay $100/month to access');
