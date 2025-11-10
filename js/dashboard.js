import { auth, db, storage } from './firebase-config.js';
import { signOut } from 'https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js';

const GEMINI_API_KEY = "AIzaSyDDuAMHmLQG7ST8cuCw6H_AE8nYg_N-Ums";

// Logout functionality
function logout() {
  console.log('Logout button clicked');
  signOut(auth)
    .then(() => {
      console.log('Sign out successful, redirecting to login page');
      window.location.href = 'login.html';
    })
    .catch((error) => {
      console.error('Logout error:', error);
      alert('Logout failed: ' + error.message);
    });
}

async function tailorResume() {
  console.log('Tailoring resume...');
  const resumeText = document.getElementById("resumeInput")?.value?.trim();
  const jobDesc = document.getElementById("jobDescInput")?.value?.trim();
  
  if (!resumeText || !jobDesc) {
    alert("Provide both resume and job description!");
    return;
  }

  // Show loading state
  const optimizedField = document.getElementById("optimizedResume");
  if (optimizedField) {
    optimizedField.value = "Tailoring your resume... Please wait.";
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { parts: [{ text: `You are a resume expert. Tailor this resume for the given job:\n\nResume: ${resumeText}\n\nJob Description: ${jobDesc}` }]}
        ]
      })
    });

    const data = await response.json();
    console.log('API response:', data);
    
    const tailoredText = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';
        
        console.log('Tailored text:', tailoredText);
    
    if (optimizedField) {
      optimizedField.value = tailoredText;
      console.log('Resume tailored successfully');
    }
} catch (error) {
    console.error('Full error details:', error);
    console.error('Error message:', error.message);
    alert('AI Error: ' + error.message + '. Check console for details.');
    optimizedField.value = "Error: " + error.message;
}

}

async function autoApply() {
  console.log('Auto-apply started');
  const jobsList = document.getElementById("jobsList");
  
  if (!jobsList) {
    console.error('jobsList element not found');
    alert('Jobs list element not found!');
    return;
  }

  jobsList.innerHTML = "<p>Simulating job applications...</p>";
  
  // Simulate finding and applying to jobs
  const simulatedJobs = [
    { title: "Software Engineer", company: "Tech Corp", status: "Applied" },
    { title: "Frontend Developer", company: "WebSolutions Inc", status: "Applied" },
    { title: "Full Stack Developer", company: "StartUp XYZ", status: "Applied" },
    { title: "Backend Engineer", company: "CloudTech Ltd", status: "Applied" },
    { title: "DevOps Engineer", company: "InfraSystems", status: "Applied" }
  ];

  jobsList.innerHTML = "";
  
  for (let i = 0; i < simulatedJobs.length; i++) {
    // Simulate delay for each application
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const job = simulatedJobs[i];
    const jobElement = document.createElement("div");
    jobElement.className = "job-item";
    jobElement.innerHTML = `
      <h3>${job.title}</h3>
      <p><strong>Company:</strong> ${job.company}</p>
      <p><strong>Status:</strong> <span class="status-applied">${job.status}</span></p>
    `;
    jobsList.appendChild(jobElement);
    console.log(`Applied to ${job.title} at ${job.company}`);
  }
  
  console.log('Auto-apply completed');
  alert(`Successfully applied to ${simulatedJobs.length} jobs!`);
}

// Attach event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('Dashboard loaded');
  
  // Logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', logout);
    console.log('Logout button listener attached');
  } else {
    console.error('Logout button not found!');
  }

  // Tailor Resume button
  const tailorBtn = document.getElementById('tailorResumeBtn');
  if (tailorBtn) {
    tailorBtn.addEventListener('click', tailorResume);
    console.log('Tailor resume button listener attached');
  } else {
    console.error('Tailor resume button not found!');
  }

  // Auto Apply button
  const autoApplyBtn = document.getElementById('autoApplyBtn');
  if (autoApplyBtn) {
    autoApplyBtn.addEventListener('click', autoApply);
    console.log('Auto apply button listener attached');
  } else {
    console.error('Auto apply button not found!');
  }
});

console.log('dashboard.js loaded successfully');

// Add payment check to tailorResume function
const originalTailorResume = tailorResume;
tailorResume = async function() {
    const canProceed = await requireActiveSubscription('Resume Tailor');
    if (!canProceed) return;
    return originalTailorResume.apply(this, arguments);
};

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

// PAYMENT PROTECTION - Check on page load
auth.onAuthStateChanged(async (user) => {
    if (user) {
        // Check subscription status
        const hasSubscription = await checkSubscriptionStatus();
        
        if (!hasSubscription) {
            // Block AI features for non-subscribers
            blockAIFeatures();
            
            // Show warning banner
            const banner = document.createElement('div');
            banner.innerHTML = `
                <div style="background: #ff6b6b; color: white; padding: 1rem; text-align: center; position: fixed; top: 0; left: 0; right: 0; z-index: 9999;">
                    <strong>Subscription Required:</strong> Subscribe for $100/month to use AI features. 
                    <button onclick="initiatePayment()" style="background: white; color: #ff6b6b; border: none; padding: 0.5rem 1rem; border-radius: 5px; margin-left: 1rem; cursor: pointer; font-weight: bold;">Subscribe Now</button>
                </div>
            `;
            document.body.prepend(banner.firstElementChild);
        }
    }
});
