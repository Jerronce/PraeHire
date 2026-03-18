/**
 * PraeHire Core Brain v6.5 - Global Architect Edition
 * Features: Visual Score Bar, Global Job Search, Chat Bubbles, Manual Builder
 * Security: Uses GitHub Secrets (process.env.GEMINI_API_KEY)
 */

console.log("🧠 PraeHire Logic: Global Online.");

let resumeFileContent = null;
const GEMINI_API_KEY = typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : ''; 

function addLog(message) {
    const logBox = document.getElementById('systemLogs');
    if (!logBox) return;
    logBox.innerHTML += `<br> > ${message}`;
    logBox.scrollTop = logBox.scrollHeight;
}

// --- 1. PDF HANDLER (Global) ---
window.handleFileUpload = async function(e) {
    const file = e.target.files[0];
    if (!file) return;
    document.getElementById('fileName').innerText = `📄 ${file.name}`;
    addLog(`Scanning CV: ${file.name}`);
    
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
            addLog("✅ CV Data Decoded Successfully.");
        } catch (err) {
            addLog("❌ PDF Parse Failed.");
        }
    };
    reader.readAsArrayBuffer(file);
}

// --- 2. AI TAILORING & VISUAL SCORING (Global) ---
window.tailorResume = async function() {
    const jobDesc = document.getElementById('jobDescInput')?.value;
    const output = document.getElementById('optimizedResume');
    const scoreBar = document.getElementById('progressBar');
    const scoreText = document.getElementById('scoreText');
    const scoreSection = document.getElementById('scoreSection');
    const analysisText = document.getElementById('aiAnalysis');

    let inputContext = resumeFileContent;
    if (!inputContext) {
        const name = document.getElementById('userName').value;
        const exp = document.getElementById('userExperience').value;
        if (!name || !exp) return alert("Upload a CV or fill out the Manual Career Profile!");
        inputContext = `Candidate Name: ${name}, Career Background: ${exp}`;
        addLog("📝 Building tailored resume from Career Profile...");
    }

    if (!GEMINI_API_KEY) { 
        addLog("⚠️ Environment starting. Try again in 60 seconds."); 
        return; 
    }
    if (!jobDesc) return alert("Please paste the Job Description!");

    addLog("🚀 AI Engine: Re-engineering for Global Standard...");
    output.value = "⏳ Optimizing career profile... please wait.";
    output.classList.add('loading-pulse');

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `
                    SYSTEM: Professional Global Technical Recruiter.
                    CONTEXT: ${inputContext}
                    TARGET: ${jobDesc}
                    
                    TASK:
                    1. If context is raw info, write a full professional resume.
                    2. If context is a resume, re-engineer it for the target.
                    3. START the response with: [SCORE] NUMBER/100
                    4. FOLLOW with: [ANALYSIS] A one-sentence professional match analysis.
                    5. THEN return the full optimized resume.` 
                }] }]
            })
        });

        const data = await response.json();
        output.classList.remove('loading-pulse');

        if (data.candidates && data.candidates[0].content) {
            const rawResult = data.candidates[0].content.parts[0].text;
            output.value = rawResult;

            // Visual Score Update
            const scoreMatch = rawResult.match(/\[SCORE\]\s*(\d+)/);
            const analysisMatch = rawResult.match(/\[ANALYSIS\](.*)/);
            
            if (scoreMatch) {
                const score = scoreMatch[1];
                scoreSection.style.display = 'block';
                scoreText.innerText = `${score}% Match`;
                scoreBar.style.width = `${score}%`;
                analysisText.innerText = analysisMatch ? analysisMatch[1].trim() : "";
                addLog(`🎯 Resume Match Strength: ${score}%`);
            }
            document.getElementById('actionButtons').style.display = 'flex';
        }
    } catch (err) {
        addLog("❌ Connection Blocked.");
        output.classList.remove('loading-pulse');
    }
}

// --- 3. AI INTERVIEWER (Global) ---
window.sendInterviewAnswer = async function() {
    const input = document.getElementById('interviewInput');
    const chat = document.getElementById('interviewChat');
    const val = input.value;
    if (!val) return;

    // Show User Bubble
    chat.innerHTML += `<div class="user-bubble">${val}</div>`;
    input.value = "";
    chat.scrollTop = chat.scrollHeight;
    addLog("💬 User answer sent to AI Recruiter...");

    if (!GEMINI_API_KEY) return;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `Recruiter Interview Session. CV Profile: ${resumeFileContent || "Manual Data Used"}. Candidate Answer: "${val}". Give brief professional feedback and ask the next technical question.` }] }]
            })
        });

        const data = await response.json();
        const aiMsg = data.candidates[0].content.parts[0].text;

        // Show AI Bubble
        chat.innerHTML += `<div class="ai-bubble"><strong>AI:</strong><br>${aiMsg}</div>`;
        chat.scrollTop = chat.scrollHeight;
        addLog("🤖 AI Recruiter responded.");
    } catch (err) { addLog("❌ Interviewer connection failed."); }
}

// --- 4. GLOBAL JOB SEARCH ---
window.searchJobs = function() {
    const query = document.getElementById('jobSearch').value;
    if(!query) return alert("Enter role and location (e.g. AI Developer in Canada)");
    addLog(`🔍 Searching Global Market for: ${query}...`);
    window.open(`https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(query)}`, "_blank");
}

// --- 5. INITIALIZATION ---
window.init = function() {
    console.log("🤝 Establishing UI/Logic Handshake...");
    document.getElementById('resumeFile')?.addEventListener('change', window.handleFileUpload);
    
    // Binding listeners for direct global access
    const tailorBtn = document.getElementById('tailorResumeBtn');
    if (tailorBtn) tailorBtn.onclick = window.tailorResume;

    const searchBtn = document.getElementById('searchJobsBtn');
    if (searchBtn) searchBtn.onclick = window.searchJobs;

    const sendBtn = document.getElementById('sendInterviewBtn');
    if (sendBtn) sendBtn.onclick = window.sendInterviewAnswer;

    document.getElementById('downloadBtn')?.addEventListener('click', () => {
        const text = document.getElementById('optimizedResume').value;
        const blob = new Blob([text], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = "PraeHire_Optimized_Resume.txt";
        link.click();
    });

    document.getElementById('shareBtn')?.addEventListener('click', () => window.open("https://linkedin.com", "_blank"));
    
    addLog("✅ System Handshake Complete. PraeHire Global v6.5 is Active.");
}

window.init();