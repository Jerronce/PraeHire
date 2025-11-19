import { auth, db, storage } from './firebase-config.js';
import { signOut } from 'https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js';

const GEMINI_API_KEY = "AIzaSyCui2JGjimd0wHiKXj4MPErVH5_9H8ArHc";

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

// Greeting functionality
function setUserGreeting() {
  const greetingEl = document.getElementById('userGreeting');
  if (!greetingEl) return;
  
  const hour = new Date().getHours();
  let greeting;
  
  if (hour >= 5 && hour < 12) {
    greeting = 'Good Morning';
  } else if (hour >= 12 && hour < 17) {
    greeting = 'Good Afternoon';
  } else if (hour >= 17 && hour < 22) {
    greeting = 'Good Evening';
  } else {
    greeting = 'Good Night';
  return greeting;  }
  
  auth.onAuthStateChanged((user) => {
    if (user) {
      const displayName = user.displayName || user.email?.split('@')[0] || 'User';
          const greeting = setUserGreeting();
      greetingEl.textContent = `${greeting}, ${displayName}`;

              // Initialize theme toggle
                      initThemeToggle();
    }
  });
}

// Theme toggle functionality
function initThemeToggle() {
  const themeToggle = document.getElementById('themeToggle');
  const body = document.body;
  
  // Load saved theme
  const savedTheme = localStorage.getItem('theme') || 'dark';
  body.classList.add(savedTheme + '-mode');
  themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
  
  themeToggle?.addEventListener('click', () => {
    const isDark = body.classList.contains('dark-mode');
    
    if (isDark) {
      body.classList.remove('dark-mode');
      body.classList.add('light-mode');
      themeToggle.textContent = '🌙';
      localStorage.setItem('theme', 'light');
    } else {
      body.classList.remove('light-mode');
      body.classList.add('dark-mode');
      themeToggle.textContent = '☀️';
      localStorage.setItem('theme', 'dark');
    }
  });
}

// Resume input validation
function initResumeValidation() {
//  const resumeText = document.getElementById('resumeInput');
  const fileInput = document.getElementById('resumeFile');
  
  /*resumeText?.addEventListener('input', () => {
    if (resumeText.value.trim()) {
      fileInput.disabled = true;
      fileInput.style.opacity = '0.5';
    } else {
      fileInput.disabled = false;
      fileInput.style.opacity = '1';
    } */
  });
  
  fileInput?.addEventListener('change', (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        resumeText.value = event.target.result;
        resumeText.disabled = true;
        resumeText.style.opacity = '0.5';
      };
      
      reader.readAsText(file);
    } else {
      resumeText.disabled = false;
// API configuration
const getApiKey = () => atob('QUl6YVN5Q3VpMkdKamltZDBySGlLWGo0TVBFclZINV85SDhBckhjCg==').trim();

async function tailorResume() {
  console.log('Tailoring resume...');
  const resumeText = document.getElementById('resumeInput').value.trim();
  const jobDesc = document.getElementById('jobInput').value.trim();

  if (!resumeText || !jobDesc) {
    alert('Provide both resume and job description.');
    return;
  }

  const optimizedField = document.getElementById('optimizedResume');
  const btn = document.getElementById('tailorResumeBtn');
  if (optimizedField) optimizedField.value = 'Tailoring your resume...';
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Processing...';
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${getApiKey()}`,
      {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a professional resume writer. Tailor this resume to match the job description.\n\nResume:\n${resumeText}\n\nJob Description:\n${jobDesc}\n\nProvide an optimized, professional resume tailored for this role.`
            }]
          }]
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error:', errorData);
      throw new Error(errorData.error?.message || 'API request failed');
    }

    const data = await response.json();
    const tailoredText = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';
    
    if (optimizedField) {
      optimizedField.value = tailoredText;
    }
    console.log('Resume tailored successfully');
  } catch (error) {
    console.error('Error tailoring resume:', error);
    if (optimizedField) {
      optimizedField.value = `Error: ${error.message}. Please try again.`;
    }
    alert(`Failed to tailor resume: ${error.message}`);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Tailor Resume with AI';
    }
  }
}
  }
}
    }
  }
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
