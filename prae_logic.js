/**
 * PraeHire Core Brain v4.0.2 - CTO Jeremiah Adedurin Edition
 * Features: AI Tailoring (Stable v1), Mock Interviewer, & Auto-Apply Helper
 */

console.log("🧠 PraeHire Brain: System Online.");

let resumeFileContent = null;
const GEMINI_API_KEY = 'AIzaSyBNsc8VmB9PYXQ-vvSofkX9VcJBip_ecCc'; 

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

// --- 2. AI TAILORING (v1 Stable Endpoint) ---
async function tailorResume() {
    console.log("🚀 Tailor Button Triggered (v1 Stable).");
    const jobDesc = document.getElementById('jobDescInput')?.value;
    const output = document.getElementById('optimizedResume');
    
    if (!resumeFileContent) return alert("Please upload a resume first!");
    if (!jobDesc || jobDesc.length < 50) {
        return alert("The Job Description is too short! Please paste the full section.");
    }

    output.value = "⏳ Gemini 1.5 Flash is re-engineering your resume... please wait.";

    try {
        // FIXED: Using v1 stable endpoint which is more reliable for Flash
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `You are a professional resume re-engineer. 
                        RE-ENGINEER this resume: ${resumeFileContent} 
                        TO MATCH this job: ${jobDesc}. 
                        Keep the output professional and ready to send.`
                    }]
                }]
            })
        });

        const data = await response.json();
        console.log("🤖 AI Data Received:", data);

        if (data.candidates && data.candidates[0].content) {
            output.value = data.candidates[0].content.parts[0].text;
        } else if (data.error) {
            output.value = `❌ API Error: ${data.error.message}`;
        } else {
            output.value = "❌ AI returned an empty response. Check the console.";
        }
    } catch (err) {
        console.error("❌ Catch Block Error:", err);
        output.value = "❌ Connection failed. Check your internet or API key.";
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
        // FIXED: Updated Interviewer to v1 stable as well
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `You are a tough technical recruiter. Based on this resume: ${resumeFileContent || "No resume uploaded yet"}, the user says: "${answer}". Give feedback on their answer and ask the next follow-up interview question.` }] }]
            })
        });
        const data = await response.json();
        
        if (data.candidates && data.candidates[0].content) {
            const aiMsg = data.candidates[0].content.parts[0].text;
            chatBox.innerHTML += `<p style="color:blue;"><strong>AI:</strong> ${aiMsg}</p>`;
        } else {
            chatBox.innerHTML += `<p style="color:red;">❌ AI could not generate a response.</p>`;
        }
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

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}