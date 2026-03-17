/**
 * PraeHire Core Brain v4.0 - CTO Jeremiah Adedurin Edition
 * Features: AI Tailoring, Mock Interviewer, & Auto-Apply Helper
 */

console.log("🧠 PraeHire Brain: System Online.");

let resumeFileContent = null;
// --- CTO SECURITY NOTE: Ensure this key is restricted in Google Cloud Console ---
const GEMINI_API_KEY = 'AIzaSyCXjg6wSMhK6OhIQevJZuSK9YEv0lcjPiI'; 

// --- 1. PDF PROCESSING ENGINE ---
async function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    console.log("📄 Processing File:", file.name);
    const reader = new FileReader();
    
    reader.onload = async (event) => {
        try {
            const typedarray = new Uint8Array(event.target.result);
            if (typeof pdfjsLib === 'undefined') {
                throw new Error("PDF Library not loaded.");
            }
            const pdf = await pdfjsLib.getDocument(typedarray).promise;
            let text = "";
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                text += content.items.map(s => s.str).join(" ") + "\n";
            }
            resumeFileContent = text;
            console.log("✅ Resume text extracted.");
            alert("✅ Resume Loaded! Ready for AI Tailoring and Interviews.");
        } catch (err) {
            console.error("❌ PDF Engine Error:", err);
            alert("Error reading PDF. Please try again.");
        }
    };
    reader.readAsArrayBuffer(file);
}

// --- 2. AI TAILORING (Direct API Bypass Mode) ---
async function tailorResume() {
    console.log("🖱️ Tailor Button Triggered.");
    const jobDesc = document.getElementById('jobDescInput')?.value;
    const output = document.getElementById('optimizedResume');
    
    if (!resumeFileContent) return alert("Please upload a resume (PDF) first!");
    if (!jobDesc || jobDesc.trim().length < 20) return alert("Please paste a more detailed job description.");

    output.value = "⏳ Gemini 1.5 Flash is re-engineering your resume... please wait.";

    try {
        // BYPASSING FIREBASE CLOUD FUNCTIONS TO AVOID BLAZE PLAN ERRORS
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `You are an expert career coach. Tailor this resume to match the job description perfectly. 
                RESUME: ${resumeFileContent} 
                JOB DESCRIPTION: ${jobDesc}` }] }]
            })
        });

        const data = await response.json();
        
        if (data.candidates && data.candidates[0].content.parts[0].text) {
            output.value = data.candidates[0].content.parts[0].text;
            console.log("🤖 AI Response Received.");
        } else {
            throw new Error("Invalid API response format");
        }
    } catch (err) {
        console.error("❌ AI Connection Error:", err);
        output.value = "❌ Connection Error. Ensure your Gemini API Key is active and restricted to this domain.";
    }
}

// --- 3. AI MOCK INTERVIEWER ---
async function sendInterviewAnswer() {
    const userInput = document.getElementById('interviewInput');
    const chatBox = document.getElementById('interviewChat');
    const answer = userInput.value;

    if (!answer) return;

    chatBox.innerHTML += `<p><strong>You:</strong> ${answer}</p>`;
    userInput.value = "";
    chatBox.scrollTop = chatBox.scrollHeight;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `You are a tough technical recruiter. Based on this resume: ${resumeFileContent || "No resume uploaded yet"}, the user says: "${answer}". Give feedback on their answer and ask the next follow-up interview question.` }] }]
            })
        });
        const data = await response.json();
        const aiMsg = data.candidates[0].content.parts[0].text;
        chatBox.innerHTML += `<p style="color:blue;"><strong>AI:</strong> ${aiMsg}</p>`;
        chatBox.scrollTop = chatBox.scrollHeight;
    } catch (err) {
        console.error("❌ Interviewer Error:", err);
        chatBox.innerHTML += `<p style="color:red;">❌ AI Interviewer is currently offline.</p>`;
    }
}

// --- 4. INITIALIZATION ---
function init() {
    console.log("🤝 Establishing UI/Logic Handshake...");
    document.getElementById('resumeFile')?.addEventListener('change', handleFileUpload);
    document.getElementById('tailorResumeBtn')?.addEventListener('click', tailorResume);
    document.getElementById('sendInterviewBtn')?.addEventListener('click', sendInterviewAnswer);
}

// Global Execution
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}