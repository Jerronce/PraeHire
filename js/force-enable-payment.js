// FORCE ENABLE PAYMENT BUTTON - OVERRIDE ALL LOCKDOWNS!
(function() {
    'use strict';
    
    console.log('🔓 FORCE ENABLING PAYMENT BUTTONS...');
    
    // Wait for DOM and run multiple times to override other scripts
    function forceEnableButtons() {
        // Enable the pay button
        const payBtn = document.querySelector('[id*="pay"], button[type="submit"]');
        if (payBtn) {
            payBtn.disabled = false;
            payBtn.style.opacity = '1';
            payBtn.style.cursor = 'pointer';
            payBtn.style.pointerEvents = 'all';
            payBtn.removeAttribute('disabled');
            
            // Add click handler for payment
            payBtn.onclick = function(e) {
                e.preventDefault();
                window.location.href = '/payment-gate.html';
                return false;
            };
            console.log('✅ Payment button ENABLED and CLICKABLE!');
        }
        
        // Enable all inputs
        document.querySelectorAll('input').forEach(inp => {
            inp.disabled = false;
            inp.style.opacity = '0.7';
        });
    }
    
    // Run immediately
    forceEnableButtons();
    
    // Run after DOM loads
    document.addEventListener('DOMContentLoaded', forceEnableButtons);
    
    // Run after a delay to override other scripts
    setTimeout(forceEnableButtons, 100);
    setTimeout(forceEnableButtons, 500);
    setTimeout(forceEnableButtons, 1000);
    
    // Watch for changes and re-enable
    setInterval(forceEnableButtons, 2000);
})();
