// ADMIN ONLY LOCKDOWN - Only Jeronce101@gmail.com can login
const ADMIN_EMAIL = 'Jeronce101@gmail.com';

// Override Firebase signInWithEmailAndPassword
if (typeof window !== 'undefined' && window.firebaseAuth) {
    const originalSignIn = window.firebaseAuth.signIn;
    
    window.firebaseAuth.signIn = async function(auth, email, password) {
        // Only allow admin email
        if (email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
            alert('⚠️ Access Denied!\n\nThis application is currently restricted.\nOnly the administrator can login.\n\nTo gain access, please complete payment at:\nhttps://praehire.web.app/#pricing');
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
        // Block all signups - redirect to payment
        alert('⚠️ New Signups Require Payment!\n\nTo create an account, you must complete payment first.\n\nPayment Required: $100/month\n\nPlease visit:\nhttps://praehire.web.app/#pricing');
        throw new Error('Signup blocked: Payment required');
    };
}

console.log('🔒 Admin-only mode active - Only', ADMIN_EMAIL, 'can login');
