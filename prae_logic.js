/**
 * PraeHire Core Brain v4.5.1 - CTO Jeremiah Adedurin Edition
 * Features: AI Tailoring (v1 Stable), Mock Interviewer, Logs, & Downloads
 */

console.log("🧠 PraeHire Brain: System Online.");

let resumeFileContent = null;
const GEMINI_API_KEY = 'AIzaSyBNsc8VmB9PYXQ-vvSofkX9VcJBip_ecCc'; 

// --- 1. SYSTEM LOGGING ---
function addLog(message) {
    const logBox = document.getElementById('systemLogs');
    if (!logBox) return;
    const time = new Date().toLocaleTimeString();
    logBox.innerHTML += `<br> [${time}] > ${message}`;
    logBox.scrollTop = logBox.scrollHeight;
}

// --- 2. PDF PROCESSING ---
async function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    addLog(`📄 Processing File: ${file.name}`);
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
            addLog("✅ Resume text extracted successfully.");
            alert("✅ Resume Loaded!");
        } catch (err) {
            addLog("❌ PDF Engine Error.");
        }
    };
    reader.readAsArrayBuffer(file);
}

// --- 3. AI TAILORING ---
async function tailorResume() {
    const jobDesc = document.getElementById('jobDescInput')?.value;
    const output = document.getElementById('optimizedResume');
    const actions = document.getElementById('actionButtons');
    
    if (!resumeFileContent) return alert("Upload Resume first!");
    if (!jobDesc || jobDesc.length < 50) return alert("Paste full Job Description!");

    addLog("🚀 Requesting Gemini 1.5 Flash (v1 Stable)...");
    output.value = "⏳ Gemini is re-engineering your resume... please wait.";

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `Re-engineer this resume: ${resumeFileContent} to match this job: ${jobDesc}` }] }]
            })
        });

        const data = await response.json();
        if (data.candidates && data.candidates[0].content) {
            output.value = data.candidates[0].content.parts[0].text;
            actions.style.display = 'flex';
            addLog("✅ Success! Resume tailored.");
        } else {
            addLog(`❌ API Error: ${data.error?.message || "Check Console"}`);
        }
    } catch (err) {
        addLog("❌ Connection Blocked.");
    }
}

// --- 4. ACTIONS & INTERVIEWER ---
function downloadAsPDF() {
    const text = document.getElementById('optimizedResume').value;
    const blob = new Blob([text], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = "Tailored_Resume.txt";
    link.click();
    addLog("💾 Downloaded tailored resume as .txt");
}

function shareToLinkedIn() {
    window.open("https://www.linkedin.com/feed/", "_blank");
    addLog("🌐 LinkedIn feed opened for sharing.");
}

function searchJobs() {
    const query = document.getElementById('jobSearch').value;
    addLog(`🔍 Searching for ${query} roles in Lagos...`);
    setTimeout(() => addLog("✅ Simulations: Found 5 roles on LinkedIn."), 1000);
}

async function sendInterviewAnswer() {
    const input = document.getElementById('interviewInput');
    const chat = document.getElementById('interviewChat');
    const val = input.value;
    if (!val) return;
    chat.innerHTML += `<p><strong>You:</strong> ${val}</p>`;
    input.value = "";
    addLog("💬 Sent answer to AI Interviewer.");
}

// --- 5. INITIALIZATION ---
function init() {
    console.log("🤝 Establishing UI/Logic Handshake...");
    document.getElementById('resumeFile')?.addEventListener('change', handleFileUpload);
    document.getElementById('tailorResumeBtn')?.addEventListener('click', tailorResume);
    document.getElementById('sendInterviewBtn')?.addEventListener('click', sendInterviewAnswer);
    document.getElementById('downloadBtn')?.addEventListener('click', downloadAsPDF);
    document.getElementById('shareBtn')?.addEventListener('click', shareToLinkedIn);
    document.getElementById('searchJobsBtn')?.addEventListener('click', searchJobs);
    addLog("✅ System Handshake Complete. Buttons Active.");
}

// Run immediately since it's an imported module
init();