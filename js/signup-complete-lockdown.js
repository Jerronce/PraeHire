// COMPLETE SIGNUP LOCKDOWN - Does NOT block tab navigation
const MONTHLY_PRICE_NGN = 165000;
const ADMIN_EMAIL = 'Jerronce101@gmail.com';
const FLUTTERWAVE_KEY = 'FLWPUBK-434a0db20b1c6eea1e22068ea72db4f4-X';

let lockdownActive = false;

// Wait for page to fully load
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(initLockdown, 500);
});

function initLockdown() {
    // Check if we're on signup tab
    const signupTab = document.getElementById('signupTab');
    if (!signupTab) return;
    
    // Watch for signup tab activation
    signupTab.addEventListener('click', () => {
        setTimeout(() => {
            if (!lockdownActive) {
                activateLockdown();
            }
        }, 100);
    });
    
    // If signup tab is already active, lock it down
    if (signupTab.classList.contains('active')) {
        setTimeout(activateLockdown, 200);
    }
}

function activateLockdown() {
    const form = document.querySelector('form');
    if (!form || lockdownActive) return;
    
    lockdownActive = true;
    
    // Show payment gate
    showPaymentGate();
    
    // Disable form
    form.style.opacity = '0.3';
    form.style.pointerEvents = 'none';
    form.style.userSelect = 'none';
    
    form.querySelectorAll('input, button, select, textarea').forEach(el => {
        el.disabled = true;
        el.readOnly = true;
    });
    
    // Create overlay ONLY over form
    const formParent = form.parentElement;
    if (formParent && !document.getElementById('signup-blocker-overlay')) {
        const overlay = document.createElement('div');
        overlay.id = 'signup-blocker-overlay';
        overlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 50;
            background: transparent;
            cursor: not-allowed;
        `;
        
        overlay.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            alert('🔒 Payment required! Click "Pay ₦165,000 & Sign Up" above.');
        }, true);
        
        formParent.style.position = 'relative';
        formParent.appendChild(overlay);
    }
}

function showPaymentGate() {
    const form = document.querySelector('form');
    if (!form || document.getElementById('payment-gate-box')) return;
    
    const gate = document.createElement('div');
    gate.id = 'payment-gate-box';
    gate.style.cssText = 'position: relative; z-index: 60; margin-bottom: 2rem;';
    gate.innerHTML = `
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 3rem; border-radius: 20px; margin-bottom: 2rem; text-align: center; box-shadow: 0 15px 50px rgba(102, 126, 234, 0.5);">
            <div style="font-size: 4rem; margin-bottom: 1rem;">💳</div>
            <h2 style="margin: 0 0 1rem 0; font-size: 2.2rem; font-weight: bold;">Payment Required to Sign Up</h2>
            <p style="font-size: 1.4rem; margin: 0 0 0.5rem 0; font-weight: bold;">$100 USD / Month</p>
            <p style="font-size: 1.1rem; margin: 0 0 2rem 0; opacity: 0.95;">(₦165,000 Nigerian Naira)</p>
            <button id="pay-signup-btn" style="background: white; color: #667eea; border: none; padding: 1.5rem 4rem; border-radius: 12px; font-size: 1.4rem; font-weight: bold; cursor: pointer; box-shadow: 0 8px 25px rgba(0,0,0,0.3); transition: all 0.3s;" onmouseover="this.style.transform='scale(1.08)';" onmouseout="this.style.transform='scale(1)';">
                🚀 Pay ₦165,000 & Sign Up
            </button>
            <p style="margin: 1.5rem 0 0 0; font-size: 0.95rem; opacity: 0.9;">🔒 Secure payment via Flutterwave | Works worldwide</p>
        </div>
        <div style="background: #fff3cd; border: 3px solid #ffc107; color: #856404; padding: 1.2rem; border-radius: 10px; margin-bottom: 1.5rem; text-align: center; font-weight: bold; font-size: 1.1rem;">
            ⚠️ SIGNUP BLOCKED: You MUST pay before creating an account
        </div>
    `;
    
    form.parentNode.insertBefore(gate, form);
    document.getElementById('pay-signup-btn').addEventListener('click', startPayment);
}

function startPayment() {
    const email = prompt('📮 Enter your email to proceed with payment:');
    if (!email || !email.includes('@')) {
        alert('❌ Invalid email. Try again.');
        return;
    }
    
    if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        alert('✅ Admin Account!\n\nFREE access.\n\nProceed with signup: ' + email);
        unlockForm(email);
        return;
    }
    
    FlutterwaveCheckout({
        public_key: FLUTTERWAVE_KEY,
        tx_ref: 'signup_' + Date.now() + '_' + Math.random().toString(36).substring(7),
        amount: MONTHLY_PRICE_NGN,
        currency: "NGN",
        payment_options: "card,banktransfer,ussd,account,mobilemoney,barter",
        customer: {
            email: email,
            name: email.split('@')[0]
        },
        customizations: {
            title: "PraeHire Monthly Subscription",
            description: "₦" + MONTHLY_PRICE_NGN.toLocaleString() + " - Monthly AI Access",
            logo: "https://praehire.web.app/img/logo.png"
        },
        callback: function(data) {
            if (data.status === "successful" || data.status === "completed") {
                localStorage.setItem('praehire_paid_email', email);
                localStorage.setItem('praehire_tx_id', data.transaction_id);
                localStorage.setItem('praehire_paid_date', new Date().toISOString());
                alert('✅ PAYMENT SUCCESS!\n\nTransaction: ' + data.transaction_id + '\n\nCreate account now.');
                unlockForm(email);
            } else {
                alert('❌ Payment not completed.');
            }
        },
        onclose: function() {
            console.log('Payment closed');
        }
    });
}

function unlockForm(email) {
    lockdownActive = false;
    
    const overlay = document.getElementById('signup-blocker-overlay');
    if (overlay) overlay.remove();
    
    const gate = document.getElementById('payment-gate-box');
    if (gate) gate.remove();
    
    const form = document.querySelector('form');
    if (form) {
        form.style.opacity = '1';
        form.style.pointerEvents = 'auto';
        form.style.userSelect = 'auto';
        
        form.querySelectorAll('input, button, select, textarea').forEach(el => {
            el.disabled = false;
            el.readOnly = false;
        });
        
        const emailInput = form.querySelector('input[type="email"]');
        if (emailInput) emailInput.value = email;
    }
    
    const success = document.createElement('div');
    success.innerHTML = `
        <div style="background: #d4edda; border: 3px solid #28a745; color: #155724; padding: 1.5rem; border-radius: 10px; margin-bottom: 1.5rem; text-align: center; font-weight: bold; font-size: 1.2rem;">
            ✅ PAYMENT VERIFIED! Create your account below.
        </div>
    `;
    form.parentNode.insertBefore(success, form);
}
