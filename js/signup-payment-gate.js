// SIGNUP PAYMENT GATE - Users must pay BEFORE creating account
const MONTHLY_PRICE = 100;
const ADMIN_EMAIL = 'Jerronce101@gmail.com';

// Show payment requirement on signup page
window.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('login.html') || window.location.pathname.includes('signup')) {
        showSignupPaymentGate();
    }
});

function showSignupPaymentGate() {
    // Add prominent payment message
    const signupForm = document.querySelector('form');
    if (!signupForm) return;
    
    const paymentNotice = document.createElement('div');
    paymentNotice.innerHTML = `
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem; border-radius: 10px; margin-bottom: 2rem; text-align: center;">
            <h2 style="margin: 0 0 1rem 0; font-size: 1.8rem;">💳 Payment Required</h2>
            <p style="font-size: 1.2rem; margin: 0 0 1.5rem 0;">Subscribe for <strong>$${MONTHLY_PRICE}/month</strong> to access all AI features</p>
            <button onclick="initiateSignupPayment()" style="background: white; color: #667eea; border: none; padding: 1rem 2.5rem; border-radius: 8px; font-size: 1.1rem; font-weight: bold; cursor: pointer; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                Pay $${MONTHLY_PRICE} & Sign Up
            </button>
            <p style="margin: 1rem 0 0 0; font-size: 0.9rem; opacity: 0.9;">Secure payment via Flutterwave</p>
        </div>
    `;
    
    signupForm.parentNode.insertBefore(paymentNotice, signupForm);
    
    // Disable signup form until payment
    signupForm.style.opacity = '0.5';
    signupForm.style.pointerEvents = 'none';
    
    const inputs = signupForm.querySelectorAll('input, button');
    inputs.forEach(input => input.disabled = true);
}

function initiateSignupPayment() {
    const tempEmail = prompt('Enter your email to proceed with payment:');
    if (!tempEmail) return;
    
    // Check if admin
    if (tempEmail.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        alert('Admin account detected! You have free access. Please proceed with signup.');
        enableSignupForm();
        return;
    }
    
    FlutterwaveCheckout({
        public_key: "FLWPUBK-434a0db20b1c6eea1e22068ea72db4f4-X",
        tx_ref: 'signup_' + Date.now() + '_' + tempEmail.replace('@', '_'),
        amount: MONTHLY_PRICE,
        currency: "USD",
        payment_options: "card, banktransfer, ussd",
        customer: {
            email: tempEmail,
            name: tempEmail
        },
        customizations: {
            title: "PraeHire Monthly Subscription",
            description: "$" + MONTHLY_PRICE + "/month - Full AI Access",
            logo: "https://praehire.web.app/img/logo.png"
        },
        callback: function(data) {
            if (data.status === "successful") {
                // Store payment confirmation
                localStorage.setItem('praehire_paid_email', tempEmail);
                localStorage.setItem('praehire_transaction_id', data.transaction_id);
                localStorage.setItem('praehire_payment_date', new Date().toISOString());
                
                alert('Payment successful! You can now create your account.');
                enableSignupForm();
            } else {
                alert('Payment failed. Please try again.');
            }
        },
        onclose: function() {
            console.log('Payment modal closed');
        }
    });
}

function enableSignupForm() {
    const signupForm = document.querySelector('form');
    if (!signupForm) return;
    
    signupForm.style.opacity = '1';
    signupForm.style.pointerEvents = 'auto';
    
    const inputs = signupForm.querySelectorAll('input, button');
    inputs.forEach(input => input.disabled = false);
    
    // Auto-fill email if available
    const paidEmail = localStorage.getItem('praehire_paid_email');
    if (paidEmail) {
        const emailInput = signupForm.querySelector('input[type="email"]');
        if (emailInput) {
            emailInput.value = paidEmail;
            emailInput.readOnly = true;
        }
    }
}

window.initiateSignupPayment = initiateSignupPayment;
