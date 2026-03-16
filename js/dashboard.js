import { auth, db, storage } from './firebase-config.js';
import { signOut } from 'https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js';

let resumeFileContent = null;
let tailoredResume = null;

// Updated to stable v1 endpoint
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent';

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
        
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
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
      }
    }
  });
}

// ===== RESUME TAILOR FUNCTION =====
async function tailorResume() {
  const jobDescInput = document.getElementById('jobDescInput');
  const optimizedField = document.getElementById('optimizedResume');
  const jobDesc = jobDescInput.value.trim();

  if (!resumeFileContent || !jobDesc) return alert('Upload resume and paste Job Description!');

  optimizedField.value = 'AI is tailoring your resume...';
  
  try {
    // Calling your Firebase Cloud Function
    const response = await fetch('https://us-central1-praehire.cloudfunctions.net/tailorResume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeText: resumeFileContent, jobDescription: jobDesc })
    });
    const data = await response.json();
    tailoredResume = data.tailoredResume;
    optimizedField.value = tailoredResume;
  } catch (error) {
    optimizedField.value = 'Error tailoring resume.';
  }
}

// ===== INTERVIEW PRACTICE FUNCTION =====
async function startInterviewPractice() {
  const chatInput = document.getElementById('chatInput');
  const chatWindow = document.getElementById('chatWindow');
  const userMessage = chatInput.value.trim();

  if (!userMessage) return;

  const userMsgDiv = document.createElement('div');
  userMsgDiv.innerHTML = `<strong>You:</strong> ${userMessage}`;
  chatWindow.appendChild(userMsgDiv);
  chatInput.value = '';

  try {
    // FIXED: Pointing to your Cloud Function instead of a local path
    const response = await fetch('https://us-central1-praehire.cloudfunctions.net/interviewCoach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemPrompt: `Coach this user. Resume: ${resumeFileContent || 'None'}`,
        userPrompt: userMessage
      })
    });
    const data = await response.json();
    const aiMsgDiv = document.createElement('div');
    aiMsgDiv.innerHTML = `<strong>Coach:</strong> ${data.aiResponse}`;
    chatWindow.appendChild(aiMsgDiv);
  } catch (error) {
    console.error('Coach Error:', error);
  }
}

// Listeners
document.getElementById('tailorResumeBtn')?.addEventListener('click', tailorResume);
document.getElementById('sendChat')?.addEventListener('click', startInterviewPractice);
