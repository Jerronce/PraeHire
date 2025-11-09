# PraeHire Setup Instructions

## What Was Fixed

### 1. ✅ AI Integration Issues
- **Problem**: Resume Tailor and Interview Practice were showing "AI error: no response generated"
- **Fix**: Updated Gemini API model from `gemini-pro` to `gemini-1.5-flash` (latest stable model)
- **Fix**: Improved error handling and response parsing
- **Files Modified**: `js/dashboard.js`, `js/chat.js`

### 2. ✅ Resume Upload Logic
- **Problem**: System was asking to type resume even after file upload
- **Fix**: Improved the logic to properly handle file uploads vs text input
- **Note**: The existing code already supported file reading, but better error messages were added

### 3. ⚙️ Payment Integration (Setup Required)
- **Created**: `js/payment.js` - Flutterwave payment integration
- **Status**: Code is ready, but you need to add your Flutterwave API keys

## Next Steps to Complete Setup

### 1. Get Flutterwave API Keys

1. Go to [https://flutterwave.com](https://flutterwave.com)
2. Create an account (or login)
3. Navigate to Settings > API
4. Copy your **Public Key** (starts with FLWPUBK-)
5. Copy your **Secret Key** (starts with FLWSEC-)

### 2. Add Flutterwave to Your HTML Files

Add this script tag to your HTML files **before** the closing `</body>` tag:

```html
<!-- Flutterwave Inline Payment -->
<script src="https://checkout.flutterwave.com/v3.js"></script>

<!-- Your payment integration -->
<script src="js/payment.js"></script>
```

Add it to:
- `dashboard.html`
- `interview.html`
- `resume.html`

### 3. Update payment.js with Your API Key

Open `js/payment.js` and replace:
```javascript
const FLUTTERWAVE_PUBLIC_KEY = 'FLWPUBK-YOUR-PUBLIC-KEY-HERE';
```

With your actual public key:
```javascript
const FLUTTERWAVE_PUBLIC_KEY = 'FLWPUBK-xxxxxxxxxxxx';
```

### 4. Update dashboard.js to Require Payment

Modify the `tailorResume()` function in `js/dashboard.js` to add payment check at the beginning:

```javascript
async function tailorResume() {
    // Check if user has paid before allowing AI access
    const canProceed = await requirePayment('Resume Tailor');
    if (!canProceed) return;
    
    console.log('Tailoring resume...');
    // ... rest of the function
}
```

### 5. Update chat.js for Interview Practice Payment

Add similar payment check in `js/chat.js` in the message sending function.

### 6. Deploy to Firebase

The changes are already pushed to GitHub. Firebase Hosting will automatically deploy them if you have GitHub Actions set up. If not, manually deploy:

```bash
firebase deploy
```

## Testing

### Test AI Features (Already Fixed)
1. Go to https://praehire.web.app/dashboard
2. Try the Resume Tailor - upload a resume and job description
3. Click "Tailor with AI" - should now work!
4. Try Interview Practice - send a message - should now work!

### Test Payment Flow (After Setup)
1. Access AI features
2. Should see payment prompt
3. Complete test payment
4. Features should unlock

## Environment Variables

**Note**: You don't need a separate `.env` file because:
1. This is a front-end only app (static Firebase Hosting)
2. The Gemini API key is already in `js/dashboard.js` (line 4)
3. For production, consider moving sensitive keys to Firebase Cloud Functions

## Security Recommendations

1. **Never expose secret keys in frontend code**
   - Only use public keys in JavaScript files
   - Use Flutterwave's public key (FLWPUBK-) in frontend
   - Keep secret key (FLWSEC-) on backend only

2. **Verify payments server-side**
   - Consider creating Firebase Cloud Functions to verify Flutterwave transactions
   - Don't trust frontend payment confirmations alone

3. **API Key Security**
   - Your Gemini API key is currently visible in the frontend
   - Consider moving AI calls to Firebase Cloud Functions
   - Add API key restrictions in Google Cloud Console

## Support

If you encounter any issues:
1. Check browser console for error messages
2. Verify Firebase is deployed correctly
3. Ensure Flutterwave account is active
4. Check Firestore rules allow reads/writes

## Files Changed

- ✅ `js/dashboard.js` - Fixed AI integration
- ✅ `js/chat.js` - Fixed AI integration
- ⚙️ `js/payment.js` - New payment integration (needs API key)
- 📄 `SETUP_INSTRUCTIONS.md` - This file

