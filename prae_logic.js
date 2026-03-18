/**
 * PraeHire Core Brain v6.2 - Global Architect Edition
 * Features: Visual Score Bar, Global Job Search, Secure API, Chat Bubbles
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
            addLog("✅ CV Data Decoded.");
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
        if (!name || !exp) return alert("Upload a CV or fill out the Manual Profile!");
        inputContext = `Candidate: ${name}, Info: ${exp}`;
        addLog("📝 Building from Career Profile...");
    }

    if (!GEMINI_API_KEY) { addLog("⚠️ Waiting for Secure Key..."); return; }
    if (!jobDesc) return alert("Paste a Job Description!");

    addLog("🚀 AI Engine: Re-engineering for Global Standard...");
    output.value = "⏳ Optimizing career profile...";
    output.classList.add('loading-pulse');

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `
                    SYSTEM: Global Professional Recruiter.
                    CONTEXT: ${inputContext}
                    TARGET: ${jobDesc}
                    START with [SCORE] NUMBER/100 and [ANALYSIS] one sentence. THEN resume.` 
                }] }]
            })
        });

        const data = await response.json();
        output.classList.remove('loading-pulse');

        if (data.candidates) {
            const raw = data.candidates[0].content.parts[0].text;
            output.value = raw;

            const scoreMatch = raw.match(/\[SCORE\]\s*(\d+)/);
            const analysisMatch = raw.match(/\[ANALYSIS\](.*)/);
            
            if (scoreMatch) {
                const score = scoreMatch[1];
                scoreSection.style.display = 'block';
                scoreText.innerText = `${score}% Match`;
                scoreBar.style.width = `${score}%`;
                analysisText.innerText = analysisMatch ? analysisMatch[1].trim() : "";
                addLog(`🎯 Optimization Level: ${score}%`);
            }
            document.getElementById('actionButtons').style.display = 'flex';
        }
    } catch (err) { addLog("❌ Connection Error."); }
}

// --- 3. AI INTERVIEWER (Global) ---
window.sendInterviewAnswer = async function() {
    const input = document.getElementById('interviewInput');
    const chat = document.getElementById('interviewChat');
    const val = input.value;
    if (!val) return;

    chat.innerHTML += `<div class="user-bubble">${val}</div>`;
    input.value = "";
    chat.scrollTop = chat.scrollHeight;

    if (!GEMINI_API_KEY) return addLog("⚠️ Key missing.");

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `Recruiter Interview. CV: ${resumeFileContent || "None"}. User: "${val}". Give brief feedback and ask next question.` }] }]
            })
        });

        const data = await response.json();
        const aiMsg = data.candidates[0].content.parts[0].text;
        chat.innerHTML += `<div class="ai-bubble"><strong>AI:</strong><br>${aiMsg}</div>`;
        chat.scrollTop = chat.scrollHeight;
    } catch (err) { addLog("❌ Interviewer failed."); }
}

// --- 4. GLOBAL JOB SEARCH (Global) ---
window.searchJobs = function() {
    const query = document.getElementById('jobSearch').value;
    if(!query) return alert("Enter role and location.");
    addLog(`🔍 Searching Global Market: ${query}...`);
    window.open(`https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(query)}`, "_blank");
}

// --- 5. INITIALIZATION ---
window.init = function() {
    document.getElementById('resumeFile')?.addEventListener('change', window.handleFileUpload);
    
    const tailorBtn = document.getElementById('tailorResumeBtn');
    if (tailorBtn) tailorBtn.onclick = window.tailorResume;

    const searchBtn = document.getElementById('searchJobsBtn');
    if (searchBtn) searchBtn.onclick = window.searchJobs;

    const interviewBtn = document.getElementById('sendInterviewBtn');
    if (interviewBtn) interviewBtn.onclick = window.sendInterviewAnswer;

    document.getElementById('downloadBtn')?.addEventListener('click', () => {
        const text = document.getElementById('optimizedResume').value;
        const blob = new Blob([text], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = "PraeHire_Resume.txt";
        link.click();
    });
}

window.init();