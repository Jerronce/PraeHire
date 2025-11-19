// ========================================
// PraeHire Admin Lockdown Script [NOV17]
// Only Jerronce101@gmail.com can login
// All others BLOCKED until $100/month payment
// ========================================

const ADMIN_EMAIL = 'jerronce101@gmail.com';
console.log('🔒 PraeHire lockdown [NOV17] script running');

// Hardcore lockdown function
function lockdownInputs() {
    // Disable login email
    const loginEmail = document.getElementById('loginEmail');
    if (loginEmail) {
        loginEmail.disabled = true;
        loginEmail.value = '';
        loginEmail.placeholder = '🔒 Only admin can login ($100/mo required)';
        loginEmail.style.cursor = 'not-allowed';
        loginEmail.style.opacity = '0.7';
        loginEmail.style.backgroundColor = '#f0f0f0';
    }
    
    // Disable login password
    const loginPassword = document.getElementById('loginPassword');
    if (loginPassword) {
        loginPassword.disabled = true;
        loginPassword.value = '';
        loginPassword.placeholder = '🔒 Admins only';
        loginPassword.style.cursor = 'not-allowed';
        loginPassword.style.opacity = '0.7';
        loginPassword.style.backgroundColor = '#f0f0f0';
    }
    
    // Disable sign in button
    const signInBtn = document.querySelector('button[type="submit"]');
    if (signInBtn) {
        signInBtn.disabled = true;
        signInBtn.style.cursor = 'not-allowed';
        signInBtn.style.opacity = '0.6';
        signInBtn.innerText = '🔒 Pay to unlock';
    }
    
    // Disable ALL signup inputs
    const signupInputs = document.querySelectorAll('#signupForm input, #signupForm button');
    signupInputs.forEach(input => {
        if (input.type !== 'checkbox' && input.type !== 'submit') {
            input.disabled = true;
            input.value = '';
            input.placeholder = '🔒 Payment required ($100/month)';
            input.style.cursor = 'not-allowed';
            input.style.opacity = '0.6';
            input.style.backgroundColor = '#f0f0f0';
        }
    });
}

// MutationObserver to keep fields locked even if other scripts try to unlock them
const observer = new MutationObserver(lockdownInputs);
if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });
}

// Run lockdown immediately and repeatedly
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', lockdownInputs);
} else {
    lockdownInputs();
}
setInterval(lockdownInputs, 300);

// Intercept ALL form submissions
document.addEventListener('submit', function(evt) {
    const formId = evt.target.id;
    
    // Block login form for non-admin
    if (formId === 'loginForm') {
        evt.preventDefault();
        evt.stopPropagation();
        
        const email = document.getElementById('loginEmail')?.value?.toLowerCase().trim() || '';
        
        if (email !== ADMIN_EMAIL) {
            alert('⚠️ ACCESS DENIED\n\nOnly the administrator can login.\n\n💳 To get access:\n1. Click "← Back to home"\n2. Visit Pricing section\n3. Pay $100/month (₦165,000)\n4. Get your account activated\n\nAdmin: Jerronce101@gmail.com');
            lockdownInputs();
            return false;
        }
        
        // If admin, temporarily re-enable for submission
        console.log('✅ Admin login detected');
        document.getElementById('loginEmail').disabled = false;
        document.getElementById('loginPassword').disabled = false;
        // Let auth.js handle the actual submission
    }
    
    // Block ALL signups
    if (formId === 'signupForm') {
        evt.preventDefault();
        evt.stopPropagation();
        
        alert('⚠️ PAYMENT REQUIRED\n\nNew signups require payment first.\n\n💰 Price: $100/month (₦165,000)\n\nSteps:\n1. Click "← Back to home"\n2. Go to Pricing section\n3. Complete payment\n4. Get account access\n\nOr visit: https://praehire.web.app/#pricing');
        
        setTimeout(() => {
            window.location.href = '/index.html#pricing';
        }, 2000);
        
        return false;
    }
}, true); // Use capture phase to intercept before other handlers

console.log('🔒 ADMIN-ONLY MODE: Only', ADMIN_EMAIL, 'can access');
console.log('💳 All others must pay $100/month subscription');
