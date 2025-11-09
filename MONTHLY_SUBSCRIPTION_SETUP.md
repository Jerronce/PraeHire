# 💰 PraeHire - Monthly Subscription Setup

## What Changed:

### ✅ 1. Monthly Subscription ($100/month)
- **NOT lifetime** - Users pay $100 USD every month
- **Recurring billing** - Must renew after 30 days
- **Real payments only** - LIVE mode, no testing

### ✅ 2. Payment BEFORE Signup
- New users must pay FIRST
- Then they can create account
- No free trials

### ✅ 3. Existing Users Must Pay
- All current users blocked until they subscribe
- $100/month for everyone

### ✅ 4. Admin Account (YOU)
- Your Google account = FREE access
- No payment needed ever
- Full admin privileges

---

## Files Created:

1. **`js/payment.js`** - Monthly subscription system
2. **`payment-gate.html`** - Pay-first signup page

---

## ⚠️ CRITICAL: Update These 2 Things:

### 1. Your Admin Email
Open `js/payment.js` and change line 7:
```javascript
const ADMIN_EMAIL = "your.email@gmail.com"; // Your actual Gmail
```

### 2. Your LIVE Flutterwave Key
Open `js/payment.js` and change line 5:
```javascript
const FLUTTERWAVE_PUBLIC_KEY = 'FLWPUBK-xxxxxxxxxxxxx'; // Your LIVE key
```

**IMPORTANT**: Use your **LIVE** key, NOT test key!

---

## How It Works:

### For New Users:
1. Visit praehire.web.app
2. Click "Get Started"
3. **PAYMENT SCREEN** shows: "$100/month"
4. User pays via Flutterwave
5. After payment, they create account
6. Get 30 days access
7. After 30 days, must pay again

### For Existing Users:
1. Login to account
2. Try to use AI feature
3. **PAYMENT PROMPT**: "Subscribe for $100/month"
4. Pay to continue
5. Get 30 days access

### For You (Admin):
1. Login with your Gmail
2. Use everything FREE
3. No payment ever needed

---

## Subscription Details:

- **Price**: $100 USD
- **Frequency**: Monthly (every 30 days)
- **Auto-renew**: NO (manual payment each month)
- **Currency**: USD (international)
- **Access**: All AI features

---

## User Experience:

### First Month:
- Pay $100
- Get 30 days access
- Use all features unlimited

### After 30 Days:
- Access blocked
- Prompt to renew: "Your subscription expired"
- Pay $100 again
- Get another 30 days

---

## Revenue Model:

- $100 per user per month
- If you get 10 paying users = $1,000/month
- If you get 100 paying users = $10,000/month
- If you get 1,000 paying users = $100,000/month

---

## Testing (AFTER deployment):

### Test Your Admin Account:
1. Login with your Gmail
2. Try Resume Tailor - should work FREE
3. No payment prompt

### Test Regular User:
1. Create new account (not your Gmail)
2. Try Resume Tailor
3. Should see: "Subscribe for $100/month"
4. Use LIVE card to test real payment

---

## Flutterwave Dashboard:

Check your Flutterwave dashboard to see:
- All payments
- Transaction IDs
- Customer emails
- Revenue totals

---

## What Happens Next:

1. I update your admin email
2. Verify Flutterwave LIVE key is added
3. Commit all changes
4. Push to GitHub
5. Deploy to Firebase
6. Your site goes LIVE with monthly subscriptions!

