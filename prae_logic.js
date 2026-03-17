/**
 * PraeHire Core Brain v4.0 - CTO Jeremiah Adedurin Edition
 * Features: AI Tailoring, Mock Interviewer, & Auto-Apply Helper
 */

console.log("🧠 PraeHire Brain: System Online.");

let resumeFileContent = null;
const GEMINI_API_KEY = 'YAIzaSyDPvTmydPBF8HwI6f6ftkB6G8haw11hT-Y'; // ⚠️ CTO: Paste your key from AI Studio here

// --- 1. PDF PROCESSING ENGINE ---
async function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (event) => {
        try {
            const typedarray = new Uint8Array(event.target.result);
            const pdf = await pdfjsLib.getDocument(typedarray).promise;
            let text = "";
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                text += content.items.map(s => s.str).join(" ") + "\n";
            }
            resumeFileContent = text;
            alert("✅ Resume Loaded! Ready for AI Tailoring and Interviews.");
        } catch (err) {
            console.error("❌ PDF Engine Error:", err);
            alert("Error reading PDF.");
        }
    };
    reader.readAsArrayBuffer(file);
}

// --- 2. AI TAILORING (Frontend Bypass Mode) ---
async function tailorResume() {
    const jobDesc = document.getElementById('jobDescInput')?.value;
    const output = document.getElementById('optimizedResume');
    
    if (!resumeFileContent) return alert("Upload Resume first!");
    if (!jobDesc) return alert("Paste Job Description!");

    output.value = "⏳ Gemini 1.5 Flash is re-engineering your resume...";

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `Tailor this resume for this job description. Keep it professional. 
                RESUME: ${resumeFileContent} 
                JOB: ${jobDesc}` }] }]
            })
        });
        const data = await response.json();
        output.value = data.candidates[0].content.parts[0].text;
    } catch (err) {
        output.value = "❌ AI Error. Check your API Key.";
    }
}

// --- 3. AI MOCK INTERVIEWER ---
async function sendInterviewAnswer() {
    const userInput = document.getElementById('interviewInput');
    const chatBox = document.getElementById('interviewChat');
    const answer = userInput.value;

    if (!answer) return;

    // Append User Message
    chatBox.innerHTML += `<p><strong>You:</strong> ${answer}</p>`;
    userInput.value = "";

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `You are a tough technical recruiter. 
                Based on this resume: ${resumeFileContent}, 
                the user said: "${answer}". 
                Give feedback and ask the next follow-up interview question.` }] }]
            })
        });
        const data = await response.json();
        const aiMsg = data.candidates[0].content.parts[0].text;
        chatBox.innerHTML += `<p style="color:blue;"><strong>AI:</strong> ${aiMsg}</p>`;
        chatBox.scrollTop = chatBox.scrollHeight;
    } catch (err) {
        chatBox.innerHTML += `<p style="color:red;">❌ Interviewer offline. Check API Key.</p>`;
    }
}

// --- 4. AUTO-APPLY HELPER ---
function searchJobs() {
    const query = document.getElementById('jobSearch').value;
    alert(`Searching for "${query}" on LinkedIn and Indeed... (API integration in progress)`);
    // In v4.1 we will link this to the LinkedIn Job Search API
}

// --- 5. INITIALIZATION ---
function init() {
    document.getElementById('resumeFile')?.addEventListener('change', handleFileUpload);
    document.getElementById('tailorResumeBtn')?.addEventListener('click', tailorResume);
    document.getElementById('sendInterviewBtn')?.addEventListener('click', sendInterviewAnswer);
}

document.addEventListener('DOMContentLoaded', init);