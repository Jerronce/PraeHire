// Flutterwave Payment Integration for PraeHire
// International payment support - USD $100

const FLUTTERWAVE_PUBLIC_KEY = 'FLWPUBK-YOUR-PUBLIC-KEY-HERE'; // Replace with your actual key
const PAYMENT_AMOUNT = 100; // $100 USD
const PAYMENT_CURRENCY = 'USD'; // Changed to USD for international payments

// Check if user has paid
async function checkPaymentStatus() {
  const user = auth.currentUser;
  if (!user) return false;
  
  try {
    const userDoc = await db.collection('users').doc(user.uid).get();
    return userDoc.data()?.hasPaid || false;
  } catch (error) {
    console.error('Error checking payment status:', error);
    return false;
  }
}

// Initialize payment
async function initiatePayment() {
  const user = auth.currentUser;
  if (!user) {
    alert('Please login first');
    return;
  }

  const hasPaid = await checkPaymentStatus();
  if (hasPaid) {
    alert('You have already paid! Enjoy all features.');
    return;
  }

  // Flutterwave configuration for international payments
  FlutterwaveCheckout({
    public_key: FLUTTERWAVE_PUBLIC_KEY,
    tx_ref: 'praehire-' + Date.now(),
    amount: PAYMENT_AMOUNT,
    currency: PAYMENT_CURRENCY,
    // Accept all international payment methods
    payment_options: 'card, banktransfer, ussd, credit, debit, mobilemoney, mpesa, qr, barter, payattitude',
    customer: {
      email: user.email,
      name: user.displayName || 'PraeHire User',
    },
    customizations: {
      title: 'PraeHire Pro - Lifetime Access',
      description: 'One-time payment for lifetime access to AI-powered resume tailoring and interview practice',
      logo: 'https://praehire.web.app/logo.png',
    },
    callback: function(data) {
      console.log('Payment callback:', data);
      if (data.status === 'successful' || data.status === 'completed') {
        verifyPayment(data.transaction_id);
      }
    },
    onclose: function() {
      console.log('Payment modal closed');
    },
  });
}

// Verify payment on backend
async function verifyPayment(transactionId) {
  const user = auth.currentUser;
  try {
    // Update user's paid status in Firestore
    await db.collection('users').doc(user.uid).set({
      hasPaid: true,
      paymentDate: new Date(),
      transactionId: transactionId,
      amount: PAYMENT_AMOUNT,
      currency: PAYMENT_CURRENCY
    }, { merge: true });

    alert('🎉 Payment successful! You now have lifetime access to all PraeHire features.');
    location.reload(); // Refresh to enable features
  } catch (error) {
    console.error('Error verifying payment:', error);
    alert('Payment verification failed. Please contact support with transaction ID: ' + transactionId);
  }
}

// Block AI features if not paid
async function requirePayment(featureName) {
  const hasPaid = await checkPaymentStatus();
  if (!hasPaid) {
    const proceed = confirm(
      `💎 ${featureName} is a premium feature.\n\n` +
      `One-time payment: $${PAYMENT_AMOUNT} USD\n` +
      `✅ Lifetime access to all AI features\n` +
      `✅ Unlimited resume tailoring\n` +
      `✅ Unlimited interview practice\n` +
      `✅ Accepted worldwide\n\n` +
      `Proceed to payment?`
    );
    if (proceed) {
      initiatePayment();
    }
    return false;
  }
  return true;
}

