// Flutterwave Payment Integration - $100/MONTH Subscription
// LIVE MODE - Real payments only!

const FLUTTERWAVE_PUBLIC_KEY = 'FLWPUBK-16a72bd54f4eb876e6a705d899b049d8-X'; // Your LIVE public key
const MONTHLY_SUBSCRIPTION_PRICE = 100; // $100 per month
const PAYMENT_CURRENCY = 'USD';
const ADMIN_EMAIL = "Jerronce101@gmail.com"; // Admin account - no payment needed

// Check if user is admin
function isAdmin() {
  const user = auth.currentUser;
  return user && user.email === ADMIN_EMAIL;
}git add . && git commit -m 'Update Flutterwave LIVE public key' && git push
git status
git add js/payment.js && git commit -m 'Add LIVE Flutterwave key' && git push

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
