// PraeHire Main JavaScript - Navigation & Routing
console.log('PraeHire main.js loaded');

// Admin email - full access to everything
const ADMIN_EMAIL = 'Jeronce101@gmail.com';

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing PraeHire navigation...');
    
    // Handle all navigation link clicks
    setupNavigation();
    
    // Load the correct page based on URL
    loadPageFromURL();
    
    // Listen for browser back/forward
    window.addEventListener('popstate', loadPageFromURL);
});

function setupNavigation() {
    // Get all navigation links
    const navLinks = document.querySelectorAll('a[href]');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        
        // Handle internal navigation (not external links)
        if (href && !href.startsWith('http') && !href.startsWith('#')) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Extract page name from href
                let pageName = href.replace('.html', '').replace('/', '');
                
                // Navigate to the page
                navigateToPage(pageName);
            });
        }
    });
    
    console.log('Navigation setup complete');
}

function navigateToPage(pageName) {
    console.log('Navigating to:', pageName);
    
    // Update URL without page reload
    history.pushState({page: pageName}, '', '/' + pageName);
    
    // Load the page content
    loadPage(pageName);
}

function loadPageFromURL() {
    // Get current path
    const path = window.location.pathname.replace('/', '');
    const pageName = path || 'index';
    
    console.log('Loading page from URL:', pageName);
    loadPage(pageName);
}

function loadPage(pageName) {
    console.log('Loading page:', pageName);
    
    // Show loading state
    document.body.style.opacity = '0.7';
    
    // Determine which page to load
    switch(pageName) {
        case 'login':
        case 'signin':
            window.location.href = '/login';
            break;
            
        case 'signup':
        case 'register':
        case 'get-started':
            window.location.href = '/signup';
            break;
            
        case 'dashboard':
            window.location.href = '/dashboard';
            break;
            
        case 'index':
        case '':
        default:
            // Stay on landing page
            document.body.style.opacity = '1';
            break;
    }
}

// Expose navigation function globally
window.navigateToPage = navigateToPage;