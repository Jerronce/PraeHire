import { auth, db, storage } from './firebase-config.js';
import { signOut } from 'https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js';

const GEMINI_API_KEY = "AIzaSyATQe2BcLSrQqcDVVNEjjioPt3O1IbyLlo";

// Logout functionality
function logout() {
  signOut(auth)
    .then(() => {
      window.location.href = 'index.html';
    })
    .catch((error) => {
      alert('Logout failed: ' + error.message);
    });
}

async function tailorResume() {
  const resumeText = document.getElementById("resumeInput").value.trim();
  const jobDesc = document.getElementById("jobDescInput").value.trim();
  
  if (!resumeText || !jobDesc) return alert("Provide both resume and job description!");
  
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        { parts: [ { text: `You are a resume expert. Tailor this resume for the given job:\nResume: ${resumeText}\nJob Description: ${jobDesc}` } ]}
      ]
    })
  });
  
  const data = await response.json();
  document.getElementById("optimizedResume").value = data?.candidates?.[0]?.content?.parts?.[0]?.text || "AI error.";
}

async function autoApply() {
  const links = document.getElementById("jobLinks").value.split('\n').map(x=>x.trim()).filter(Boolean);
  
  if (!links.length) return alert("Paste job links!");
  
  const logDiv = document.getElementById("applyLog");
  
  for (const url of links) {
    logDiv.textContent += `Applied to: ${url} [simulated]\n`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("logoutBtn").onclick = logout;
  document.getElementById("tailorResumeBtn").onclick = tailorResume;
  document.getElementById("simulateApply").onclick = autoApply;
});
