// PAYMENT ENFORCEMENT - LIVE MODE ONLY
// Admin account gets free access forever
const ADMIN_EMAIL = 'Jerronce101@gmail.com';
const MONTHLY_PRICE = 100;

// Check if user is admin
function isAdmin(email) {
    return email && email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

// Check subscription status
async function checkSubscriptionStatus() {
    const user = auth.currentUser;
    if (!user) {
        window.location.href = '/login.html?payment_required=true';
        return false;
    }
    
    // Admin bypass
    if (isAdmin(user.email)) {
        return true;
    }
    
    try {
        const userDoc = await db.collection('users').doc(user.uid).get();
        const userData = userDoc.data();
        
        if (!userData || !userData.subscriptionActive) {
            return false;
        }
        
        // Check if subscription expired
        const expiryDate = userData.subscriptionExpiry?.toDate();
        if (!expiryDate || expiryDate < new Date()) {
            await db.collection('users').doc(user.uid).update({
                subscriptionActive: false
            });
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('Error checking subscription:', error);
        return false;
    }
}

// Block AI features
function blockAIFeatures() {
    // Disable all AI-related buttons
    const aiButtons = document.querySelectorAll(
        '.ai-feature-btn, button[onclick*="tailor"], button[onclick*="interview"], ' +
        'button[onclick*="cover"], #tailorBtn, #interviewBtn, #coverLetterBtn'
    );
    
    aiButtons.forEach(btn => {
        btn.disabled = true;
        btn.style.opacity = '0.5';
        btn.style.cursor = 'not-allowed';
        btn.title = 'Subscribe to use this feature';
        
        // Override click handlers
        btn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            showPaymentModal();
            return false;
        };
    });
}

// Show payment modal
function showPaymentModal() {
    const modal = document.createElement('div');
    modal.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); z-index: 10000; display: flex; align-items: center; justify-content: center;">
            <div style="background: white; padding: 2rem; border-radius: 15px; max-width: 500px; text-align: center;">
                <h2 style="color: #667eea; margin-bottom: 1rem;">Subscription Required</h2>
                <p style="margin-bottom: 1.5rem; color: #333;">Access all AI features for $${MONTHLY_PRICE}/month</p>
                <button onclick="initiatePay ment()" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 1rem 2rem; border: none; border-radius: 8px; font-size: 1.1rem; cursor: pointer; margin-right: 1rem;">Subscribe Now</button>
                <button onclick="this.closest('div').parentElement.remove()" style="background: #ccc; color: #333; padding: 1rem 2rem; border: none; border-radius: 8px; font-size: 1.1rem; cursor: pointer;">Cancel</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Initialize payment with Flutterwave
function initiatePayment() {
    const user = auth.currentUser;
    if (!user) {
        alert('Please log in first');
        window.location.href = '/login.html';
        return;
    }
    
    FlutterwaveCheckout({
        public_key: "FLWPUBK-434a0db20b1c6eea1e22068ea72db4f4-X",
        tx_ref: 'subscription_' + Date.now() + '_' + user.uid,
        amount: MONTHLY_PRICE,
        currency: "USD",
        payment_options: "card, banktransfer, ussd",
        customer: {
            email: user.email,
            name: user.displayName || user.email
        },
        customizations: {
            title: "PraeHire Monthly Subscription",
            description: "$" + MONTHLY_PRICE + "/month - Full AI Access",
            logo: "https://praehire.web.app/img/logo.png"
        },
        callback: async function(data) {
            if (data.status === "successful") {
                await activateSubscription(user.uid, data.transaction_id);
                alert('Subscription activated! You now have full access.');
                window.location.reload();
            } else {
                alert('Payment failed. Please try again.');
            }
        },
        onclose: function() {
            console.log('Payment modal closed');
        }
    });
}

// Activate subscription after payment
async function activateSubscription(userId, transactionId) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30); // 30 days from now
    
    await db.collection('users').doc(userId).set({
        subscriptionActive: true,
        subscriptionExpiry: expiryDate,
        lastPaymentDate: new Date(),
        lastTransactionId: transactionId
    }, { merge: true });
}

// Export for use in other files
window.checkSubscriptionStatus = checkSubscriptionStatus;
window.initiatePayment = initiatePayment;
window.blockAIFeatures = blockAIFeatures;
window.isAdmin = isAdmin;
