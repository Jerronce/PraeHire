import json

# Your admin email - CHANGE THIS!
ADMIN_EMAIL = "YOUR_GMAIL@gmail.com"  # Replace with your actual Gmail

print("🔧 Creating Monthly Subscription Payment System...")
print(f"Admin account: {ADMIN_EMAIL}")
print()

# Create the complete payment.js with monthly subscriptions
payment_js = f'''// Flutterwave Payment Integration - $100/MONTH Subscription
// LIVE MODE - Real payments only!

const FLUTTERWAVE_PUBLIC_KEY = 'FLWPUBK-YOUR-LIVE-KEY-HERE'; // Your LIVE public key
const MONTHLY_SUBSCRIPTION_PRICE = 100; // $100 per month
const PAYMENT_CURRENCY = 'USD';
const ADMIN_EMAIL = "{ADMIN_EMAIL}"; // Admin account - no payment needed

// Check if user is admin
function isAdmin() {{
  const user = auth.currentUser;
  return user && user.email === ADMIN_EMAIL;
}}

// Check if user has active subscription
async function hasActiveSubscription() {{
  const user = auth.currentUser;
  if (!user) return false;
  
  // Admin always has access
  if (isAdmin()) return true;
  
  try {{
    const userDoc = await db.collection('subscriptions').doc(user.uid).get();
    if (!userDoc.exists) return false;
    
    const data = userDoc.data();
    const subscriptionEnd = data.subscriptionEnd?.toDate();
    const now = new Date();
    
    return subscriptionEnd && subscriptionEnd > now;
  }} catch (error) {{
    console.error('Error checking subscription:', error);
    return false;
  }}
}}

// Initialize monthly subscription payment
async function initiateMonthlyPayment() {{
  const user = auth.currentUser;
  if (!user) {{
    alert('Please login first');
    return;
  }}

  if (isAdmin()) {{
    alert('You are the admin - no payment needed!');
    return;
  }}

  const hasActive = await hasActiveSubscription();
  if (hasActive) {{
    alert('You already have an active subscription!');
    return;
  }}

  // Flutterwave checkout for monthly subscription
  FlutterwaveCheckout({{
    public_key: FLUTTERWAVE_PUBLIC_KEY,
    tx_ref: 'praehire-monthly-' + Date.now(),
    amount: MONTHLY_SUBSCRIPTION_PRICE,
    currency: PAYMENT_CURRENCY,
    payment_options: 'card, banktransfer, ussd, mobilemoney',
    customer: {{
      email: user.email,
      name: user.displayName || 'PraeHire User',
    }},
    customizations: {{
      title: 'PraeHire Monthly Subscription',
      description: '$100/month - Access all AI-powered features',
      logo: 'https://praehire.web.app/logo.png',
    }},
    callback: function(data) {{
      console.log('Payment callback:', data);
      if (data.status === 'successful' || data.status === 'completed') {{
        activateSubscription(data.transaction_id);
      }}
    }},
    onclose: function() {{
      console.log('Payment modal closed');
    }},
  }});
}}

// Activate subscription after payment
async function activateSubscription(transactionId) {{
  const user = auth.currentUser;
  try {{
    const now = new Date();
    const subscriptionEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await db.collection('subscriptions').doc(user.uid).set({{
      userId: user.uid,
      email: user.email,
      subscriptionStart: now,
      subscriptionEnd: subscriptionEnd,
      amount: MONTHLY_SUBSCRIPTION_PRICE,
      currency: PAYMENT_CURRENCY,
      transactionId: transactionId,
      status: 'active',
      lastPayment: now
    }});

    alert('🎉 Subscription activated! You have 30 days of access to all features.');
    location.reload();
  }} catch (error) {{
    console.error('Error activating subscription:', error);
    alert('Payment verification failed. Transaction ID: ' + transactionId);
  }}
}}

// Block features if no active subscription
async function requireActiveSubscription(featureName) {{
  // Admin bypass
  if (isAdmin()) return true;
  
  const hasActive = await hasActiveSubscription();
  if (!hasActive) {{
    const proceed = confirm(
      `💎 ${{featureName}} requires a monthly subscription.\\n\\n` +
      `💰 Price: $${{MONTHLY_SUBSCRIPTION_PRICE}} USD/month\\n` +
      `✅ Unlimited AI resume tailoring\\n` +
      `✅ Unlimited interview practice\\n` +
      `✅ Access all premium features\\n` +
      `✅ Cancel anytime\\n\\n` +
      `Subscribe now?`
    );
    if (proceed) {{
      initiateMonthlyPayment();
    }}
    return false;
  }}
  return true;
}}
'''

with open('js/payment.js', 'w') as f:
    f.write(payment_js)

print("✅ Created js/payment.js with monthly subscription")

# Create payment-first signup page
signup_gate_html = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Subscribe to PraeHire</title>
    <link rel="stylesheet" href="css/styles.css">
</head>
<body>
    <div class="payment-gate">
        <h1>🚀 Welcome to PraeHire</h1>
        <p>Subscribe now to access AI-powered resume tailoring and interview practice</p>
        
        <div class="pricing-box">
            <h2>$100 USD / Month</h2>
            <ul>
                <li>✅ AI Resume Tailoring</li>
                <li>✅ Interview Practice with AI</li>
                <li>✅ Unlimited Usage</li>
                <li>✅ Cancel Anytime</li>
            </ul>
            <button onclick="initiatePaymentThenSignup()" class="subscribe-btn">
                Subscribe & Create Account
            </button>
        </div>
        
        <p><a href="login.html">Already have an account? Login</a></p>
    </div>

    <script src="https://checkout.flutterwave.com/v3.js"></script>
    <script src="js/firebase-config.js"></script>
    <script>
        const FLUTTERWAVE_PUBLIC_KEY = 'FLWPUBK-YOUR-LIVE-KEY-HERE';
        const MONTHLY_PRICE = 100;
        
        function initiatePaymentThenSignup() {
            const email = prompt('Enter your email address:');
            if (!email) return;
            
            FlutterwaveCheckout({
                public_key: FLUTTERWAVE_PUBLIC_KEY,
                tx_ref: 'praehire-signup-' + Date.now(),
                amount: MONTHLY_PRICE,
                currency: 'USD',
                payment_options: 'card, banktransfer, ussd, mobilemoney',
                customer: {
                    email: email,
                    name: 'New User',
                },
                customizations: {
                    title: 'PraeHire Monthly Subscription',
                    description: 'Subscribe to access all features',
                },
                callback: function(data) {
                    if (data.status === 'successful') {
                        // Store payment info and redirect to complete signup
                        localStorage.setItem('pendingPayment', JSON.stringify({
                            email: email,
                            txId: data.transaction_id,
                            amount: MONTHLY_PRICE
                        }));
                        window.location.href = 'complete-signup.html';
                    }
                },
            });
        }
    </script>
</body>
</html>
'''

with open('payment-gate.html', 'w') as f:
    f.write(signup_gate_html)

print("✅ Created payment-gate.html for pay-first signup")

print("\n🎉 All files created!")
print("\nNext steps:")
print("1. Update ADMIN_EMAIL in payment.js to your actual Gmail")
print("2. Add your LIVE Flutterwave public key (not test key!)")
print("3. Run: git add . && git commit -m 'Add monthly subscription' && git push")
print("4. Deploy to Firebase")
print("\n⚠️  IMPORTANT: Use your LIVE Flutterwave key, not test!")
