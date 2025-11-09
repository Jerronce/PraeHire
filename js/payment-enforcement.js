// PAYMENT ENFORCEMENT - Clear messaging and Flutterwave integration
const ADMIN_EMAIL = 'Jerronce101@gmail.com';
const MONTHLY_PRICE = 100;

function isAdmin(email) {
    return email && email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

async function checkSubscriptionStatus() {
    const user = auth.currentUser;
    if (!user) return false;
    
    if (isAdmin(user.email)) return true;
    
    try {
        const userDoc = await db.collection('users').doc(user.uid).get();
        const userData = userDoc.data();
        
        if (!userData || !userData.subscriptionActive) return false;
        
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

function blockAIFeatures() {
    const aiButtons = document.querySelectorAll(
        '.ai-feature-btn, button[onclick*="tailor"], button[onclick*="interview"], ' +
        'button[onclick*="cover"], #tailorBtn, #interviewBtn, #coverLetterBtn'
    );
    
    aiButtons.forEach(btn => {
        btn.style.opacity = '0.6';
        btn.style.cursor = 'pointer';
        btn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            showPaymentModal();
            return false;
        };
    });
}

function showPaymentModal() {
    // Remove existing modal if any
    const existing = document.getElementById('praehire-payment-modal');
    if (existing) existing.remove();
    
    const modal = document.createElement('div');
    modal.id = 'praehire-payment-modal';
    modal.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.85); z-index: 10000; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.3s;">
            <div style="background: white; padding: 3rem; border-radius: 20px; max-width: 550px; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
                <div style="font-size: 4rem; margin-bottom: 1rem;">🔒</div>
                <h2 style="color: #667eea; margin-bottom: 1rem; font-size: 2rem;">Subscribe to Continue</h2>
                <p style="margin-bottom: 1rem; color: #666; font-size: 1.1rem; line-height: 1.6;">
                    This AI feature requires an active subscription.
                </p>
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 1.5rem; border-radius: 15px; margin-bottom: 2rem;">
                    <div style="font-size: 2.5rem; font-weight: bold; margin-bottom: 0.5rem;">$${MONTHLY_PRICE}<span style="font-size: 1.2rem; font-weight: normal;">/month</span></div>
                    <div style="font-size: 1rem; opacity: 0.95;">✔️ AI Resume Tailoring</div>
                    <div style="font-size: 1rem; opacity: 0.95;">✔️ Interview Practice</div>
                    <div style="font-size: 1rem; opacity: 0.95;">✔️ Cover Letter Generation</div>
                    <div style="font-size: 1rem; opacity: 0.95;">✔️ Unlimited AI Access</div>
                </div>
                <button onclick="initiatePayment()" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 1.2rem 3rem; border: none; border-radius: 10px; font-size: 1.2rem; font-weight: bold; cursor: pointer; width: 100%; margin-bottom: 1rem; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                    💳 Pay $${MONTHLY_PRICE} & Subscribe Now
                </button>
                <button onclick="document.getElementById('praehire-payment-modal').remove()" style="background: transparent; color: #999; border: none; padding: 0.8rem; font-size: 1rem; cursor: pointer; text-decoration: underline;">
                    Maybe Later
                </button>
                <p style="margin-top: 1.5rem; font-size: 0.85rem; color: #999;">🔒 Secure payment via Flutterwave</p>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

function initiatePayment() {
    const user = auth.currentUser;
    if (!user) {
        alert('⚠️ Please log in first to subscribe.');
        window.location.href = '/login.html';
        return;
    }
    
    // Close modal
    const modal = document.getElementById('praehire-payment-modal');
    if (modal) modal.remove();
    
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
                alert('✅ Subscription activated! You now have full access to all AI features.');
                window.location.reload();
            } else {
                alert('❌ Payment failed. Please try again.');
            }
        },
        onclose: function() {
            console.log('Payment modal closed');
        }
    });
}

async function activateSubscription(userId, transactionId) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    
    await db.collection('users').doc(userId).set({
        subscriptionActive: true,
        subscriptionExpiry: expiryDate,
        lastPaymentDate: new Date(),
        lastTransactionId: transactionId
    }, { merge: true });
}

window.checkSubscriptionStatus = checkSubscriptionStatus;
window.initiatePayment = initiatePayment;
window.blockAIFeatures = blockAIFeatures;
window.isAdmin = isAdmin;
