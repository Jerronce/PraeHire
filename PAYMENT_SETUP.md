# Flutterwave Payment Setup - $100 USD Worldwide

## ✅ Payment Configuration Updated

Your PraeHire app is now configured to accept **$100 USD** payments from **anywhere in the world**!

### Payment Details:
- **Amount**: $100 USD (one-time payment)
- **Currency**: USD (accepts international cards)
- **Payment Methods**: Credit/Debit cards, Bank transfers, Mobile money, and more
- **Access**: Lifetime access to all AI features

## 🚀 Final Setup Steps

### 1. Add Your Flutterwave Public Key

Open `js/payment.js` and replace line 5:

```javascript
const FLUTTERWAVE_PUBLIC_KEY = 'FLWPUBK-YOUR-PUBLIC-KEY-HERE';
```

With your actual Flutterwave public key from your dashboard.

### 2. Add Flutterwave Scripts to HTML Files

Add these two lines **before the closing `</body>` tag** in these files:
- `dashboard.html`
- `interview.html`
- `resume.html`

```html
<!-- Flutterwave Inline Payment -->
<script src="https://checkout.flutterwave.com/v3.js"></script>

<!-- Payment Integration -->
<script src="js/payment.js"></script>
```

### 3. Update dashboard.js to Require Payment

Add payment check to the `tailorResume()` function in `js/dashboard.js`:

```javascript
async function tailorResume() {
    // Check if user has paid
    const canProceed = await requirePayment('Resume Tailor');
    if (!canProceed) return;
    
    // Rest of your existing code...
    console.log('Tailoring resume...');
    // ... 
}
```

### 4. Update chat.js for Interview Practice

Add similar payment check in your message sending function in `js/chat.js`.

### 5. Deploy

```bash
git add .
git commit -m "Add international payment support - $100 USD"
git push
firebase deploy
```

## What Happens Now?

### For Users:
1. User tries to use AI feature (Resume Tailor or Interview Practice)
2. Sees a prompt: "💎 [Feature] is a premium feature. One-time payment: $100 USD"
3. Shows benefits:
   - ✅ Lifetime access
   - ✅ Unlimited resume tailoring
   - ✅ Unlimited interview practice
   - ✅ Accepted worldwide
4. Clicks "Proceed to payment"
5. Flutterwave checkout opens (accepts cards from anywhere)
6. After successful payment, user gets lifetime access
7. Payment status saved in Firestore

### International Support:
- ✅ **USD Currency**: Works worldwide
- ✅ **International Cards**: Visa, Mastercard, Amex, etc.
- ✅ **Multiple Payment Methods**: Cards, bank transfers, mobile money
- ✅ **Currency Conversion**: Flutterwave handles it automatically
- ✅ **Secure**: PCI-DSS compliant

## Testing

### Test Mode:
Flutterwave provides test cards for testing:
- Card: 4187427415564246
- CVV: 828
- Expiry: 09/32
- PIN: 3310
- OTP: 12345

### FLWPUBK-16a72bd54f4eb876e6a705d899b049d8-X Mode:
Once tested, switch to your FLWPUBK-16a72bd54f4eb876e6a705d899b049d8-X public key for real payments.

## Support

If users have payment issues:
1. They'll see the transaction ID in the error message
2. Check Flutterwave dashboard for transaction details
3. Contact Flutterwave support if needed

## Security Notes

✅ **Public key in frontend is safe** - This is the intended use
❌ **Never put secret key in frontend** - Keep it server-side only
✅ **Payment verification** - Currently done in frontend, consider Firebase Functions for production

