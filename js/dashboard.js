import { auth, db, storage } from './firebase-config.js';
import { signOut } from 'https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js';

const GEMINI_API_KEY = "AIzaSyATQe2BcLSrQqcDVVNEjjioPt3O1IbyLlo";

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
    console.error('Error tailoring resume:', error);
    if (optimizedField) {
      optimizedField.value = "Error: " + error.message;
    }
    alert('Failed to tailor resume: ' + error.message);
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
