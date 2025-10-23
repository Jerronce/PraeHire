import { auth, db, storage } from './firebase-config.js';

const GEMINI_API_KEY = "AIzaSyATQe2BcLSrQqcDVVNEjjioPt3O1IbyLlo";

async function tailorResume() {
  const resumeText = document.getElementById("resume-input").value.trim();
  const jobDesc = document.getElementById("jobdesc-input").value.trim();
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
  document.getElementById("optimized-resume-output").value = data?.candidates?.[0]?.content?.parts?.[0]?.text || "AI error.";
}

async function autoApply() {
  const links = document.getElementById("job-links-input").value.split('\n').map(x=>x.trim()).filter(Boolean);
  if (!links.length) return alert("Paste job links!");
  for (const url of links) {
    document.getElementById("application-log").value += `Applied to: ${url} [simulated]\n`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("tailor-btn").onclick = tailorResume;
  document.getElementById("auto-apply-btn").onclick = autoApply;
});
