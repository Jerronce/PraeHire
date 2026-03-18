/**
 * PraeHire Core Brain v7.0 - Global Architect Edition
 * Features: Multi-Agent Optimization (Resume, Letter, Roadmap, Scoring)
 * Fully Restored Interviewer & Opportunity Finder Logic.
 */

console.log("🧠 PraeHire Logic: v7.0 Active.");

let resumeFileContent = null;
const GEMINI_API_KEY = typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : ''; 

function addLog(message) {
    const logBox = document.getElementById('systemLogs');
    if (logBox) {
        logBox.innerHTML += `<br> > ${message}`;
        logBox.scrollTop = logBox.scrollHeight;
    }
}

// --- 1. PDF HANDLER ---
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
        } catch (err) { addLog("❌ PDF Parse Failed."); }
    };
    reader.readAsArrayBuffer(file);
}

// --- 2. CAREER RE-ENGINEERING ---
window.tailorResume = async function() {
    const jobDesc = document.getElementById('jobDescInput')?.value;
    const resumeOut = document.getElementById('optimizedResume');
    const letterOut = document.getElementById('coverLetterText');
    const roadmapOut = document.getElementById('aiRoadmap');
    const scoreBar = document.getElementById('progressBar');
    const scoreText = document.getElementById('scoreText');
    const scoreSection = document.getElementById('scoreSection');

    let context = resumeFileContent;
    if (!context) {
        const name = document.getElementById('userName').value;
        const exp = document.getElementById('userExperience').value;
        if (!name || !exp) return alert("Upload a CV or fill the profile!");
        context = `Candidate: ${name}, Exp: ${exp}`;
    }

    if (!GEMINI_API_KEY) return alert("Waiting for Cloud Secrets...");
    if (!jobDesc) return alert("Job Description missing!");

    addLog("🚀 AI Engine: Re-engineering Career Package...");
    resumeOut.value = "⏳ Processing profile and roadmap...";
    
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `
                    ROLE: Top-Tier Global Career Coach.
                    INPUT: ${context}
                    TARGET: ${jobDesc}
                    TASK: Generate [SCORE], [ROADMAP], [RESUME], and [LETTER].` 
                }] }]
            })
        });

        const data = await response.json();
        if (data.candidates) {
            const raw = data.candidates[0].content.parts[0].text;
            
            const scoreMatch = raw.match(/\[SCORE\]\s*(\d+)/);
            const roadmapMatch = raw.match(/\[ROADMAP\]([\s\S]*?)\[RESUME\]/);
            const resumeMatch = raw.match(/\[RESUME\]([\s\S]*?)\[LETTER\]/);
            const letterMatch = raw.match(/\[LETTER\]([\s\S]*)/);

            if (scoreMatch) {
                const s = scoreMatch[1];
                scoreSection.style.display = 'block';
                scoreText.innerText = `${s}% Match`;
                scoreBar.style.width = `${s}%`;
                addLog(`🎯 Optimization Strength: ${s}%`);
            }
            if (roadmapMatch) roadmapOut.innerText = roadmapMatch[1].trim();
            if (resumeMatch) resumeOut.value = resumeMatch[1].trim();
            if (letterMatch) letterOut.value = letterMatch[1].trim();

            document.getElementById('actionButtons').style.display = 'flex';
            addLog("✅ Career Package Ready.");
        }
    } catch (err) { addLog("❌ Connection Error."); }
}

// --- 3. AI INTERVIEWER ---
window.sendInterviewAnswer = async function() {
    const input = document.getElementById('interviewInput');
    const chat = document.getElementById('interviewChat');
    const val = input.value;
    if (!val) return;

    chat.innerHTML += `<div class="user-bubble">${val}</div>`;
    input.value = "";
    chat.scrollTop = chat.scrollHeight;

    if (!GEMINI_API_KEY) return;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `Senior Recruiter Interview. Candidate Profile: ${resumeFileContent || "Manual Entry"}. User Answer: "${val}". Give brief feedback and ask next technical question.` }] }]
            })
        });

        const data = await response.json();
        const aiMsg = data.candidates[0].content.parts[0].text;
        chat.innerHTML += `<div class="ai-bubble"><strong>AI:</strong><br>${aiMsg}</div>`;
        chat.scrollTop = chat.scrollHeight;
    } catch (err) { addLog("❌ Interviewer failed."); }
}

// --- 4. OPPORTUNITY FINDER ---
window.searchJobs = function() {
    const query = document.getElementById('jobSearch').value;
    if(!query) return alert("Enter role and location.");
    addLog(`🔍 Searching Global Market for: ${query}...`);
    window.open(`https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(query)}`, "_blank");
}

window.init = function() {
    document.getElementById('resumeFile')?.addEventListener('change', window.handleFileUpload);
    addLog("✅ PraeHire Global v7.0 Online.");
}

window.init();