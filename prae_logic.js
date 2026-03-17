/**
 * PraeHire Core Brain v5.5 - CTO Jeremiah Adedurin Edition
 * Features: AI Resume Builder (Manual Entry), Tailoring, Match Scoring, Pulse UI
 * Security: Uses GitHub Secrets (process.env.GEMINI_API_KEY)
 */

console.log("🧠 PraeHire Brain: System Online.");

let resumeFileContent = null;

// --- SECURE KEY RETRIEVAL ---
const GEMINI_API_KEY = typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : ''; 

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
    document.getElementById('fileName').innerText = `📄 ${file.name}`;
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
            alert("✅ Resume PDF Loaded!");
        } catch (err) {
            addLog("❌ PDF Engine Error.");
        }
    };
    reader.readAsArrayBuffer(file);
}

// --- 3. AI TAILORING & BUILDER ---
async function tailorResume() {
    const jobDesc = document.getElementById('jobDescInput')?.value;
    const output = document.getElementById('optimizedResume');
    const actions = document.getElementById('actionButtons');
    
    // Manual Builder Logic
    let inputContext = resumeFileContent;
    if (!inputContext) {
        const name = document.getElementById('userName').value;
        const title = document.getElementById('userTitle').value;
        const exp = document.getElementById('userExperience').value;
        
        if (!name || !exp) return alert("Please upload a PDF or enter your Name & Experience to build a resume!");
        inputContext = `Candidate Name: ${name}, Target Title: ${title}, Background: ${exp}`;
        addLog("📝 No PDF detected. Using Manual Entry to build resume...");
    }

    if (!GEMINI_API_KEY) {
        addLog("⚠️ Security: API Key missing from GitHub Secrets.");
        return alert("CTO Note: App is in Secure Mode. Deployment pending.");
    }
    if (!jobDesc || jobDesc.length < 50) return alert("Please paste a full Job Description!");

    addLog("🚀 Requesting Gemini 1.5 Flash Re-engineering...");
    output.value = "⏳ Gemini is re-engineering your profile... please wait.";
    output.classList.add('loading-pulse');

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `
                    TASK: You are a Master Technical Recruiter.
                    SOURCE DATA: ${inputContext}
                    TARGET JOB: ${jobDesc}
                    
                    INSTRUCTION:
                    1. If source is raw info, write a full professional resume.
                    2. If source is a resume, optimize it for the target job.
                    3. Start the response with [SCORE] XX/100 and a 1-sentence [ANALYSIS].
                    4. Return the full resume text in professional Markdown format.` 
                }] }]
            })
        });

        const data = await response.json();
        output.classList.remove('loading-pulse');

        if (data.candidates && data.candidates[0].content) {
            const result = data.candidates[0].content.parts[0].text;
            output.value = result;
            
            // Extract Score for Logs
            const scoreMatch = result.match(/\[SCORE\]\s*(\d+)\/100/);
            const score = scoreMatch ? scoreMatch[1] : "??";
            
            actions.style.display = 'flex';
            addLog(`📊 RESUME MATCH SCORE: ${score}%`);
            addLog("✅ Success! Resume re-engineered.");
        } else {
            addLog(`❌ API Error: ${data.error?.message || "Check Console"}`);
        }
    } catch (err) {
        output.classList.remove('loading-pulse');
        addLog("❌ Connection Blocked.");
    }
}

// --- 4. AI INTERVIEWER ---
async function sendInterviewAnswer() {
    const input = document.getElementById('interviewInput');
    const chat = document.getElementById('interviewChat');
    const val = input.value;
    if (!val) return;

    chat.innerHTML += `<p><strong>You:</strong> ${val}</p>`;
    input.value = "";
    addLog("💬 Sent answer to AI Interviewer...");

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `Technical Recruiter Interview. Resume Data: ${resumeFileContent || "Manual Entry Used"}. User Answer: "${val}". Give feedback and ask next question.` }] }]
            })
        });

        const data = await response.json();
        const aiMsg = data.candidates[0].content.parts[0].text;
        chat.innerHTML += `<p style="color:blue;"><strong>AI:</strong> ${aiMsg}</p>`;
        chat.scrollTop = chat.scrollHeight;
        addLog("🤖 Interviewer responded.");
    } catch (err) {
        addLog("❌ Interviewer connection failed.");
    }
}

// --- 5. ACTIONS ---
function downloadAsPDF() {
    const text = document.getElementById('optimizedResume').value;
    const blob = new Blob([text], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = "PraeHire_Tailored_Resume.txt";
    link.click();
    addLog("💾 Downloaded tailored resume.");
}

function shareToLinkedIn() {
    window.open("https://www.linkedin.com/feed/", "_blank");
    addLog("🌐 LinkedIn feed opened.");
}

function searchJobs() {
    const query = document.getElementById('jobSearch').value;
    if(!query) return alert("Enter a role first!");
    addLog(`🔍 Searching Lagos for ${query} roles...`);
    setTimeout(() => {
        addLog("✅ Results ready on LinkedIn.");
        window.open(`https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(query)}&location=Lagos%2C%20Nigeria`, "_blank");
    }, 1000);
}

// --- 6. INITIALIZATION ---
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

init();