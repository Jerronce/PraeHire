import { auth, db, storage } from './js/firebase-config.js';

let resumeFileContent = null;
let tailoredResume = null;

// Use the Cloud Function URLs we deployed earlier
const TAILOR_URL = 'https://us-central1-praehire.cloudfunctions.net/tailorResume';
const COACH_URL = 'https://us-central1-praehire.cloudfunctions.net/interviewCoach';

// ===== RESUME FILE HANDLING =====
const resumeFileInput = document.getElementById('resumeFile');
if (resumeFileInput) {
  resumeFileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const fileReader = new FileReader();
        const fileData = await new Promise((resolve, reject) => {
          fileReader.onload = (e) => resolve(new Uint8Array(e.target.result));
          fileReader.onerror = reject;
          fileReader.readAsArrayBuffer(file);
        });
        
        // Ensure pdfjsLib is loaded from the HTML CDN
        const pdf = await pdfjsLib.getDocument({data: fileData}).promise;
        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          fullText += textContent.items.map(item => item.str).join(' ') + '\n';
        }
        resumeFileContent = fullText;
        alert('Resume uploaded successfully!');
      } catch (error) {
        console.error('File Error:', error);
        alert('Error reading PDF. Make sure it is not password protected.');
      }
    }
  });
}

// ===== RESUME TAILOR FUNCTION =====
async function tailorResume() {
  const jobDescInput = document.getElementById('jobDescInput');
  const optimizedField = document.getElementById('optimizedResume');
  const jobDesc = jobDescInput?.value.trim();

  if (!resumeFileContent || !jobDesc) return alert('Upload resume and paste Job Description!');

  optimizedField.value = 'AI is tailoring your resume...';
  
  try {
    const response = await fetch(TAILOR_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeText: resumeFileContent, jobDescription: jobDesc })
    });
    const data = await response.json();
    optimizedField.value = data.tailoredResume || "Error: No response from AI.";
  } catch (error) {
    optimizedField.value = 'Error: Make sure Cloud Functions are deployed.';
    console.error(error);
  }
}

// ===== INTERVIEW PRACTICE FUNCTION =====
async function startInterviewPractice() {
  const chatInput = document.getElementById('chatInput');
  const chatWindow = document.getElementById('chatWindow');
  const userMessage = chatInput?.value.trim();

  if (!userMessage) return;

  const userMsgDiv = document.createElement('div');
  userMsgDiv.style.margin = "10px 0";
  userMsgDiv.innerHTML = `<strong>You:</strong> ${userMessage}`;
  chatWindow.appendChild(userMsgDiv);
  chatInput.value = '';

  try {
    const response = await fetch(COACH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemPrompt: `Coach this user. Resume: ${resumeFileContent || 'None'}`,
        userPrompt: userMessage
      })
    });
    const data = await response.json();
    const aiMsgDiv = document.createElement('div');
    aiMsgDiv.style.margin = "10px 0";
    aiMsgDiv.innerHTML = `<strong>Coach:</strong> ${data.aiResponse}`;
    chatWindow.appendChild(aiMsgDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  } catch (error) {
    console.error('Coach Error:', error);
  }
}

// Listeners
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('tailorResumeBtn')?.addEventListener('click', tailorResume);
    document.getElementById('sendChat')?.addEventListener('click', startInterviewPractice);
    console.log("PraeHire Dashboard Logic Ready!");
});