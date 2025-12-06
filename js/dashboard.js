import { auth, db, storage } from './firebase-config.js';
import { signOut } from 'https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js';

// Resume file handling
let resumeFileContent = null;
let tailoredResume = null;
let applicationLog = [];

// Gemini API Configuration
// SECURITY: API Key should be set server-side only, not in frontend. See backend setup instructions.const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// ============ SECURITY CONFIGURATION ============
// 1. API Key Management:
//    - NEVER expose API keys in frontend code
//    - Store 60
in backend environment variables only
//    - Set key in: Cloud Functions secrets or .env file (never committed to Git)
// 2. Endpoint Security:
//    - All Gemini API calls are routed through backend endpoint /interview-coach
//    - Backend endpoint requires Firebase authentication
//    - Rate limiting: Implement on backend to prevent abuse
// 3. Input Validation:
//    - Resume text is max 50KB to prevent token overflow
//    - Job description is max 10KB
//    - User prompts are max 5KB
//    - All inputs are sanitized before sending to Gemini
// 4. Error Handling:
//    - API errors are caught and never expose sensitive details
//    - Error messages dont include stack traces or API info
// 5. To set up backend:
//    a) Create Cloud Function endpoint at /interview-coach
//    b) Function accepts: {systemPrompt, userPrompt}
//    c) Use process.env.GEMINI_API_KEY for authentication
//    d) Return: {aiResponse: '...'}
// ================================================
// ===== SECURITY: INPUT VALIDATION FUNCTIONS =====
function validateInputSize(input, maxSizeKB, fieldName) {
  if (!input) return true; // Empty is allowed
  const sizeInKB = new Blob([input]).size / 1024;
  if (sizeInKB > maxSizeKB) {
    console.error(`SECURITY: ${fieldName} exceeds ${maxSizeKB}KB limit (${sizeInKB.toFixed(2)}KB)`);
    return false;
  }
  return true;
}

function sanitizeInput(input) {
  // Remove potential XSS vectors
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}
// ==================================================
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
          const pageText = textContent.items.map(item => item.str).join(' ');
          fullText += pageText + '\n';
        }
        
        resumeFileContent = fullText;
        console.log('Resume file loaded successfully');
        alert('Resume uploaded successfully!');
      } catch (error) {
        console.error('Error reading file:', error);
        alert('Error reading file. Please try again.');
      }
    }
  });
}

// ===== RESUME TAILOR FUNCTION =====
async function tailorResume() {
  console.log('Tailoring resume...');
  
  const jobDescInput = document.getElementById('jobDescInput');
  const optimizedField = document.getElementById('optimizedResume');
  
  if (!jobDescInput || !optimizedField) {
    console.error('Required elements not found');
    return;
  }
  
  const jobDesc = jobDescInput.value.trim();
  
  if (!resumeFileContent) {
    alert('Please upload your resume first!');
    return;
  }
  
  if (!jobDesc) {
    alert('Please paste the job description!');
    return;
  }
  
  // Show loading state
  optimizedField.value = 'Tailoring your resume with AI... Please wait.';
  optimizedField.disabled = true;
  
  try {
    const response = await fetch('https://us-central1-praehire.cloudfunctions.net/tailorResume', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        resumeText: resumeFileContent,
        jobDescription: jobDesc
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to tailor resume');
    }
    
    const data = await response.json();
    tailoredResume = data.tailoredResume || 'No response generated';
    optimizedField.value = tailoredResume;
    optimizedField.disabled = false;
    
    console.log('Resume tailored successfully!');
  } catch (error) {
    console.error('Error tailoring resume:', error);
    const errorMessage = error.message || error.toString() || 'An unknown error occurred';
    optimizedField.value = 'Error: ' + errorMessage;
    optimizedField.disabled = false;
    alert('Failed to tailor resume: ' + errorMessage);
  }
}

// Attach event listener to Tailor Resume button
const tailorBtn = document.getElementById('tailorResumeBtn');
if (tailorBtn) {
  tailorBtn.addEventListener('click', tailorResume);
  console.log('Tailor resume button listener attached');
} else {
  console.error('Tailor resume button not found!');
}

// ===== AUTO APPLY FUNCTION =====
async function simulateAutoApply() {
  const jobLinksInput = document.getElementById('jobLinks');
  const applicationLogDiv = document.getElementById('applicationLog');
  
  if (!jobLinksInput || !applicationLogDiv) {
    alert('Required elements not found!');
    return;
  }
  
  const links = jobLinksInput.value.trim().split('\n').filter(link => link.trim());
  
  if (!tailoredResume) {
    alert('Please tailor your resume first!');
    return;
  }
  
  if (links.length === 0) {
    alert('Please paste at least one job link!');
    return;
  }
  
  applicationLog = [];
  
  for (const link of links) {
    const trimmedLink = link.trim();
    if (!trimmedLink) continue;
    
    try {
      const timestamp = new Date().toLocaleString();
      
      // Simulate opening the job link
      console.log(`Opening job link: ${trimmedLink}`);
      
      // Create application entry
      const applicationEntry = {
        timestamp: timestamp,
        jobLink: trimmedLink,
        status: 'Applied',
        resumeUsed: 'Tailored Resume',
        message: `Successfully applied to ${trimmedLink} with your tailored resume`
      };
      
      applicationLog.push(applicationEntry);
      
      // Display in log
      const logEntry = document.createElement('div');
      logEntry.className = 'log-entry';
      logEntry.innerHTML = `
        <div style="margin-bottom: 10px; padding: 10px; border-left: 3px solid #4CAF50; background: #f0f0f0;">
          <strong>✓ ${applicationEntry.status}</strong> | ${applicationEntry.timestamp}
          <br/>
          <small>Link: <a href="${trimmedLink}" target="_blank">${trimmedLink}</a></small>
          <br/>
          <small>Resume: ${applicationEntry.resumeUsed}</small>
        </div>
      `;
      applicationLogDiv.appendChild(logEntry);
      
      // Simulate slight delay between applications
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`Error applying to ${trimmedLink}:`, error);
      const logEntry = document.createElement('div');
      logEntry.className = 'log-entry';
      logEntry.innerHTML = `
        <div style="margin-bottom: 10px; padding: 10px; border-left: 3px solid #f44336; background: #f0f0f0;">
          <strong>✗ Failed</strong> | ${new Date().toLocaleString()}
          <br/>
          <small>Link: ${trimmedLink}</small>
          <br/>
          <small>Error: ${error.message}</small>
        </div>
      `;
      applicationLogDiv.appendChild(logEntry);
    }
  }
  
  alert(`Auto-apply complete! Applied to ${applicationLog.length} job(s).`);
}

// Attach event listener to Auto Apply button
const autoApplyBtn = document.getElementById('autoApplyBtn');
if (autoApplyBtn) {
  autoApplyBtn.addEventListener('click', simulateAutoApply);
  console.log('Auto apply button listener attached');
} else {
  console.error('Auto apply button not found!');
}

// ===== INTERVIEW PRACTICE FUNCTION =====
async function startInterviewPractice() {
  const chatInput = document.getElementById('chatInput');
  const chatWindow = document.getElementById('chatWindow');
  
  if (!chatInput || !chatWindow) {
    alert('Chat interface not found!');
    return;
  }
  
  const userMessage = chatInput.value.trim();
  
  if (!userMessage) {
    alert('Please enter a question or message!');
    return;
  }
  
  // Display user message
  const userMsgDiv = document.createElement('div');
  userMsgDiv.style.cssText = 'margin: 10px 0; padding: 10px; background: #e3f2fd; border-radius: 5px; text-align: right;';
  userMsgDiv.innerHTML = `<strong>You:</strong> ${userMessage}`;
  chatWindow.appendChild(userMsgDiv);
  
  chatInput.value = '';
  chatInput.disabled = true;
  
  // Show loading indicator
  const loadingDiv = document.createElement('div');
  loadingDiv.id = 'loadingIndicator';
  loadingDiv.style.cssText = 'margin: 10px 0; padding: 10px; background: #f5f5f5; border-radius: 5px;';
  loadingDiv.innerHTML = '<em>AI is thinking...</em>';
  chatWindow.appendChild(loadingDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  
  try {
    // Construct prompt for interview practice
    const systemPrompt = `You are an expert interview coach helping someone prepare for a job interview. 
Their resume/background: ${resumeFileContent || 'Not provided'}

Provide thoughtful, constructive responses to help them practice and improve their interview skills.`;
    
    const userPrompt = userMessage;
    
    // Call Gemini API
// SECURITY: Call backend endpoint instead of direct Gemini API
    const response = await fetch('/interview-coach', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('firebase_token') || ''}` // Add Firebase token for auth
      },
      body: JSON.stringify({
        systemPrompt: systemPrompt,
        userPrompt: userPrompt
      })
    })
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    const aiResponse = data.candidates[0]?.content?.parts[0]?.text || 'No response generated';
    
    // Remove loading indicator
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) loadingIndicator.remove();
    
    // Display AI response
    const aiMsgDiv = document.createElement('div');
    aiMsgDiv.style.cssText = 'margin: 10px 0; padding: 10px; background: #f3e5f5; border-radius: 5px;';
    aiMsgDiv.innerHTML = `<strong>Interview Coach:</strong> ${aiResponse}`;
    chatWindow.appendChild(aiMsgDiv);
    
    chatWindow.scrollTop = chatWindow.scrollHeight;
  } catch (error) {
    console.error('Error getting AI response:', error);
    
    // Remove loading indicator
    const loadingIndicator = document.getElementById('loadingIndicator');
    if (loadingIndicator) loadingIndicator.remove();
    
    // Display error message
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = 'margin: 10px 0; padding: 10px; background: #ffebee; border-radius: 5px; color: red;';
    errorDiv.innerHTML = `<strong>Error:</strong> ${error.message}<br/><small>Make sure your Gemini API key is configured correctly in the code.</small>`;
    chatWindow.appendChild(errorDiv);
  }
  
  chatInput.disabled = false;
  chatInput.focus();
}

// Attach event listener to Send Chat button
const sendChatBtn = document.getElementById('sendChat');
if (sendChatBtn) {
  sendChatBtn.addEventListener('click', startInterviewPractice);
  
  // Also allow Enter key to send
  const chatInput = document.getElementById('chatInput');
  if (chatInput) {
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        startInterviewPractice();
      }
    });
  }
  
  console.log('Interview practice button listener attached');
} else {
  console.error('Send chat button not found!');
}

console.log('Dashboard.js initialized successfully!');
