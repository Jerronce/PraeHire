// ENABLE PAYMENT BUTTONS - Make them clickable!
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Payment buttons enabler loaded!');
    
    // Find all payment-related buttons
    const payButtons = document.querySelectorAll('[id*="pay"], [id*="Pay"], button[onclick*="payment"]');
    
    payButtons.forEach(btn => {
        btn.disabled = false;
        btn.style.opacity = '1';
        btn.style.cursor = 'pointer';
        btn.style.pointerEvents = 'all';
        console.log('✅ Enabled button:', btn.id || btn.textContent);
    });
    
    // Enable all input fields
    document.querySelectorAll('input[disabled]').forEach(input => {
        input.disabled = false;
        input.style.opacity = '1';
    });
});

// Make initiateMonthlyPayment available globally
if (typeof initiateMonthlyPayment === 'undefined') {
    window.initiateMonthlyPayment = function() {
        console.log('🚀 Initiating payment...');
        if (typeof window.firebaseAuth !== 'undefined') {
            window.location.href = '/payment-gate.html';
        } else {
            alert('Please wait, payment system is loading...');
            setTimeout(() => window.location.reload(), 1000);
        }
    };
}
