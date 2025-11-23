// Flutterwave Payment Integration - $100/MONTH Subscription
// FLWPUBK-16a72bd54f4eb876e6a705d899b049d8-X MODE - Real payments only!

const FLUTTERWAVE_PUBLIC_KEY = 'FLWPUBK-16a72bd54f4eb876e6a705d899b049d8-X'; // Your LIVE public keyconst MONTHLY_SUBSCRIPTION_PRICE = 100; // $100 per month
const PAYMENT_CURRENCY = 'USD';
const ADMIN_EMAIL = "Jerronce101@gmail.com"; // Admin account - no payment needed

// Check if user is admin
function isAdmin() {
  const user = auth.currentUser;
  return user && user.email === ADMIN_EMAIL;
}git add . && git commit -m 'Update Flutterwave FLWPUBK-16a72bd54f4eb876e6a705d899b049d8-X public key' && git push
git status
git add js/payment.js && git commit -m 'Add FLWPUBK-16a72bd54f4eb876e6a705d899b049d8-X Flutterwave key' && git push
cat > js/payment-enforcement.js << 'PAYEOF'
// PAYMENT ENFORCEMENT - NGN currency for Flutterwave
const ADMIN_EMAIL = 'Jerronce101@gmail.com';
const MONTHLY_PRICE = 100;
const MONTHLY_PRICE_NGN = 165000; // $100 USD = ~165,000 NGN
const FLUTTERWAVE_PUBLIC_KEY = 'FLWPUBK-434a0db20b1c6eea1e22068ea72db4f4-X';

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
    const existing = document.getElementById('praehire-payment-modal');
    if (existing) existing.remove();
    
    const modal = document.createElement('div');
    modal.id = 'praehire-payment-modal';
    modal.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.9); z-index: 10000; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.3s;">
            <div style="background: white; padding: 3rem; border-radius: 20px; max-width: 550px; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,0.5);">
                <div style="font-size: 4rem; margin-bottom: 1rem;">🔒</div>
                <h2 style="color: #667eea; margin-bottom: 1rem; font-size: 2.2rem; font-weight: bold;">Subscribe to Continue</h2>
                <p style="margin-bottom: 1.5rem; color: #666; font-size: 1.1rem; line-height: 1.6;">
                    You need an active subscription to use this AI feature.
                </p>
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem; border-radius: 15px; margin-bottom: 2rem;">
                    <div style="font-size: 3rem; font-weight: bold; margin-bottom: 0.5rem;">$${MONTHLY_PRICE}<span style="font-size: 1.3rem; font-weight: normal;">/month</span></div>
                    <div style="font-size: 0.9rem; opacity: 0.9; margin-bottom: 1rem;">(₦${MONTHLY_PRICE_NGN.toLocaleString()} NGN)</div>
                    <div style="font-size: 1rem; opacity: 0.95; margin-top: 1rem;">✔️ AI Resume Tailoring</div>
                    <div style="font-size: 1rem; opacity: 0.95;">✔️ Interview Practice</div>
                    <div style="font-size: 1rem; opacity: 0.95;">✔️ Cover Letter Generation</div>
                    <div style="font-size: 1rem; opacity: 0.95;">✔️ Unlimited AI Access</div>
                </div>
                <button onclick="initiatePayment()" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 1.3rem 3rem; border: none; border-radius: 12px; font-size: 1.3rem; font-weight: bold; cursor: pointer; width: 100%; margin-bottom: 1rem; box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5); transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                    🚀 Pay & Subscribe Now
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
    
    const modal = document.getElementById('praehire-payment-modal');
    if (modal) modal.remove();
    
    FlutterwaveCheckout({
        public_key: FLUTTERWAVE_PUBLIC_KEY,
        tx_ref: 'subscription_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        amount: MONTHLY_PRICE_NGN,
        currency: "NGN",
        payment_options: "card,banktransfer,ussd,account,mobilemoney",
        customer: {
            email: user.email,
            name: user.displayName || user.email.split('@')[0]
        },
        customizations: {
            title: "PraeHire Monthly Subscription",
            description: "$" + MONTHLY_PRICE + " USD / ₦" + MONTHLY_PRICE_NGN.toLocaleString() + " - Full AI Access",
            logo: "https://praehire.web.app/img/logo.png"
        },
        callback: async function(data) {
            if (data.status === "successful" || data.status === "completed") {
                await activateSubscription(user.uid, data.transaction_id, data.amount);
                alert('✅ Subscription activated!\n\nYou now have full access to all AI features for 30 days.\n\nTransaction ID: ' + data.transaction_id);
                window.location.reload();
            } else {
                alert('❌ Payment was not completed. Please try again.');
            }
        },
        onclose: function() {
            console.log('Payment window closed');
        }
    });
}

async function activateSubscription(userId, transactionId, amount) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    
    await db.collection('users').doc(userId).set({
        subscriptionActive: true,
        subscriptionExpiry: expiryDate,
        lastPaymentDate: new Date(),
        lastTransactionId: transactionId,
        lastPaymentAmount: amount
    }, { merge: true });
}

window.checkSubscriptionStatus = checkSubscriptionStatus;
window.initiatePayment = initiatePayment;
window.blockAIFeatures = blockAIFeatures;
window.isAdmin = isAdmin;
PAYEOF
git add -A && git commit -m "FIX: Complete signup lockdown + Switch to NGN currency for Flutterwave - Users cannot type/click signup form until payment - Changed to NGN 165,000 (~$100 USD) for better Flutterwave compatibility" && git push origin main

// Check if user has active subscription
async function hasActiveSubscription() {
  const user = auth.currentUser;
  if (!user) return false;
  
  // Admin always has access
  if (isAdmin()) return true;
  
  try {
    const userDoc = await db.collection('subscriptions').doc(user.uid).get();
    if (!userDoc.exists) return false;
    
    const data = userDoc.data();
    const subscriptionEnd = data.subscriptionEnd?.toDate();
    const now = new Date();
    
    return subscriptionEnd && subscriptionEnd > now;
  } catch (error) {
    console.error('Error checking subscription:', error);
    return false;
  }
}

// Initialize monthly subscription payment
async function initiateMonthlyPayment() {
  const user = auth.currentUser;
  if (!user) {
    alert('Please login first');
    return;
  }

  if (isAdmin()) {
    alert('You are the admin - no payment needed!');
    return;
  }

  const hasActive = await hasActiveSubscription();
  if (hasActive) {
    alert('You already have an active subscription!');
    return;
  }

  // Flutterwave checkout for monthly subscription
  FlutterwaveCheckout({
    public_key: FLUTTERWAVE_PUBLIC_KEY,
    tx_ref: 'praehire-monthly-' + Date.now(),
    amount: MONTHLY_SUBSCRIPTION_PRICE,
    currency: PAYMENT_CURRENCY,
    payment_options: 'card, banktransfer, ussd, mobilemoney',
    customer: {
      email: user.email,
      name: user.displayName || 'PraeHire User',
    },
    customizations: {
      title: 'PraeHire Monthly Subscription',
      description: '$100/month - Access all AI-powered features',
      logo: 'https://praehire.web.app/logo.png',
    },
    callback: function(data) {
      console.log('Payment callback:', data);
      if (data.status === 'successful' || data.status === 'completed') {
        activateSubscription(data.transaction_id);
      }
    },
    onclose: function() {
      console.log('Payment modal closed');
    },
  });
}

// Activate subscription after payment
async function activateSubscription(transactionId) {
  const user = auth.currentUser;
  try {
    const now = new Date();
    const subscriptionEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await db.collection('subscriptions').doc(user.uid).set({
      userId: user.uid,
      email: user.email,
      subscriptionStart: now,
      subscriptionEnd: subscriptionEnd,
      amount: MONTHLY_SUBSCRIPTION_PRICE,
      currency: PAYMENT_CURRENCY,
      transactionId: transactionId,
      status: 'active',
      lastPayment: now
    });

    alert('🎉 Subscription activated! You have 30 days of access to all features.');
    location.reload();
  } catch (error) {
    console.error('Error activating subscription:', error);
    alert('Payment verification failed. Transaction ID: ' + transactionId);
  }
}

// Block features if no active subscription
async function requireActiveSubscription(featureName) {
  // Admin bypass
  if (isAdmin()) return true;
  
  const hasActive = await hasActiveSubscription();
  if (!hasActive) {
    const proceed = confirm(
      `💎 ${featureName} requires a monthly subscription.\n\n` +
      `💰 Price: $${MONTHLY_SUBSCRIPTION_PRICE} USD/month\n` +
      `✅ Unlimited AI resume tailoring\n` +
      `✅ Unlimited interview practice\n` +
      `✅ Access all premium features\n` +
      `✅ Cancel anytime\n\n` +
      `Subscribe now?`
    );
    if (proceed) {
      initiateMonthlyPayment();
    }
    return false;
  }
  return true;
}
