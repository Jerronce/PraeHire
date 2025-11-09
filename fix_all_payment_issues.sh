#!/bin/bash

echo "🔧 Fixing ALL payment issues..."

# Fix 1: Add pricing to landing page (index.html)
if grep -q "Get Started" index.html; then
    # Add pricing section before Get Started button
    sed -i '/<button.*Get Started/i \        <div class="pricing-info" style="text-align: center; margin: 20px 0;">\n            <h2 style="color: #4A90E2; font-size: 2.5em; margin: 10px 0;">$100 USD</h2>\n            <p style="font-size: 1.2em; color: #888;">per month</p>\n            <p style="margin: 15px 0;">✅ Unlimited AI Resume Tailoring</p>\n            <p style="margin: 15px 0;">✅ Unlimited Interview Practice</p>\n            <p style="margin: 15px 0;">✅ Cancel Anytime</p>\n        </div>' index.html
    echo "✅ Added pricing to landing page"
fi

# Fix 2: Update dashboard.js to REQUIRE payment check
cat >> js/dashboard.js << 'JS'

// FORCE payment check on page load
window.addEventListener('DOMContentLoaded', async function() {
    // Skip if admin
    if (auth.currentUser && auth.currentUser.email === "Jerronce101@gmail.com") {
        console.log("Admin user - full access");
        return;
    }
    
    // Check subscription
    const hasActive = await hasActiveSubscription();
    if (!hasActive) {
        // Disable all AI buttons
        const aiButtons = document.querySelectorAll('[onclick*="tailor"], [onclick*="AI"]');
        aiButtons.forEach(btn => {
            btn.disabled = true;
            btn.style.opacity = '0.5';
            btn.style.cursor = 'not-allowed';
            btn.onclick = function(e) {
                e.preventDefault();
                const proceed = confirm(
                    "💎 Subscribe to PraeHire Pro\\n\\n" +
                    "💰 $100 USD/month\\n" +
                    "✅ Unlimited AI features\\n" +
                    "✅ Cancel anytime\\n\\n" +
                    "Subscribe now?"
                );
                if (proceed) initiateMonthlyPayment();
                return false;
            };
        });
    }
});
JS

echo "✅ Added payment enforcement to dashboard"

# Fix 3: Block resume.html access
cat >> js/dashboard.js << 'JS2'

// Block resume page access
if (window.location.pathname.includes('resume.html')) {
    (async function() {
        if (auth.currentUser && auth.currentUser.email === "Jerronce101@gmail.com") return;
        const hasActive = await hasActiveSubscription();
        if (!hasActive) {
            alert("❌ Subscribe to access this feature!\n\n$100/month for unlimited access");
            window.location.href = 'dashboard.html';
        }
    })();
}
JS2

echo "✅ Added resume page protection"

echo ""
echo "🎉 ALL FIXES APPLIED!"
echo ""
echo "Changes made:"
echo "1. ✅ Added $100/month pricing to landing page"
echo "2. ✅ Disabled AI buttons until payment"
echo "3. ✅ Block access to resume tailor for non-payers"
echo ""
echo "Now committing and pushing..."
