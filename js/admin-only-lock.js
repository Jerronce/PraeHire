// ADMIN ONLY LOCKDOWN - Only Jerronce101@gmail.com can login
const ADMIN_EMAIL = 'jerronce101@gmail.com'; // lowercase for comparison

// ===== CRITICAL: Disable ALL inputs immediately on page load =====
function disableAllLoginInputs() {
    const loginEmail = document.getElementById('loginEmail');
    const loginPassword = document.getElementById('loginPassword');
    const signupInputs = document.querySelectorAll('#signupForm input');
    
    // Disable login email field
    if (loginEmail) {
        loginEmail.disabled = true;
        loginEmail.value = '';
        loginEmail.placeholder = '🔒 Admin-only access. Visit Pricing to subscribe.';
        loginEmail.style.cursor = 'not-allowed';
        loginEmail.style.opacity = '0.7';
        loginEmail.style.backgroundColor = '#f0f0f0';
    }
    
    // Disable login password field
    if (loginPassword) {
        loginPassword.disabled = true;
        loginPassword.value = '';
        loginPassword.placeholder = '🔒 Admin access only';
        loginPassword.style.cursor = 'not-allowed';
        loginPassword.style.opacity = '0.7';
        loginPassword.style.backgroundColor = '#f0f0f0';
    }
    
    // Disable all signup inputs
    signupInputs.forEach(input => {
        if (input.type !== 'checkbox' && input.type !== 'submit') {
            input.disabled = true;
            input.value = '';
            input.placeholder = '🔒 Payment required ($100/month) - See Pricing';
            input.style.cursor = 'not-allowed';
            input.style.opacity = '0.6';
            input.style.backgroundColor = '#f0f0f0';
        }
    });
    
    // Disable the sign-in button for non-admins
    const signInBtn = document.querySelector('button[type="submit"]');
    if (signInBtn) {
        signInBtn.disabled = true;
        signInBtn.style.cursor = 'not-allowed';
        signInBtn.style.opacity = '0.6';
    }
    
    console.log('🔒 All login inputs disabled - Admin-only mode active');
}

// Run IMMEDIATELY when script loads (don't wait for DOMContentLoaded)
if (document.readyState === 'loading') {
    // DOM is still loading, wait for it
    document.addEventListener('DOMContentLoaded', disableAllLoginInputs);
} else {
    // DOM is already loaded, run immediately
    disableAllLoginInputs();
}

// Also run again after a short delay to catch dynamically loaded elements
setTimeout(disableAllLoginInputs, 500);

// ===== Intercept form submissions =====
window.addEventListener('DOMContentLoaded', () => {
    // Intercept login form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const email = document.getElementById('loginEmail')?.value || '';
            
            // Check if email is admin
            if (email.toLowerCase().trim() !== ADMIN_EMAIL) {
                alert('⚠️ ACCESS DENIED\n\nOnly the administrator can login.\n\n💳 To get access:\n1. Click "← Back to home"\n2. Visit Pricing section\n3. Pay $100/month (₦165,000)\n4. Get your account activated\n\nAdmin: Jerronce101@gmail.com');
                return false;
            }
            
            // If admin, allow the form to actually submit
            // Re-enable inputs temporarily
            document.getElementById('loginEmail').disabled = false;
            document.getElementById('loginPassword').disabled = false;
            
            // Submit will be handled by auth.js
            return false;
        }, true); // Use capture phase
    }
    
    // Intercept signup form submission
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            alert('⚠️ PAYMENT REQUIRED\n\nNew signups require payment first.\n\n💰 Price: $100/month (₦165,000)\n\nSteps:\n1. Click "← Back to home"\n2. Go to Pricing section\n3. Complete payment\n4. Get account access\n\nOr visit: https://praehire.web.app/#pricing');
            
            setTimeout(() => {
                window.location.href = '/index.html#pricing';
            }, 2000);
            
            return false;
        }, true);
    }
});

console.log('🔒 ADMIN-ONLY MODE: Only', ADMIN_EMAIL, 'can access');
console.log('💳 All others must pay $100/month subscription');
