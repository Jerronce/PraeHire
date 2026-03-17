/**
 * PraeHire Core Brain v6.1 - Global Architect Edition
 * Features: Visual Score Bar, Global Job Search, Fixed Button Binding
 * Security: Uses GitHub Secrets
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

    if (!GEMINI_API_KEY) { 
        addLog("⚠️ Key missing. Deploying via GitHub Actions..."); 
        return alert("Environment starting. Try again in 60 seconds."); 
    }
    if (!jobDesc) return alert("Paste a Job Description!");

    addLog("🚀 AI Engine: Generating World-Class Resume...");
    output.value = "⏳ Re-engineering career data for global standard...";
    output.classList.add('loading-pulse');

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `
                    SYSTEM: Professional Global Recruiter.
                    CONTEXT: ${inputContext}
                    TARGET: ${jobDesc}
                    
                    RULES:
                    1. Re-write the profile for 100% ATS compatibility.
                    2. START with: [SCORE] NUMBER/100
                    3. FOLLOW with: [ANALYSIS] One-sentence career gap analysis.
                    4. THEN provide the full resume in clean Markdown.` 
                }] }]
            })
        });

        const data = await response.json();
        output.classList.remove('loading-pulse');

        if (data.candidates) {
            const raw = data.candidates[0].content.parts[0].text;
            output.value = raw;

            // --- VISUAL SCORE UPDATER ---
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
    } catch (err) {
        addLog("❌ Connection Error.");
        output.classList.remove('loading-pulse');
    }
}

// --- 3. GLOBAL JOB SEARCH (Global) ---
window.searchJobs = function() {
    const query = document.getElementById('jobSearch').value;
    if(!query) return alert("Enter role and location (e.g. Developer in NYC)");
    addLog(`🔍 Searching Global Market: ${query}...`);
    window.open(`https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(query)}`, "_blank");
}

// --- 4. INITIALIZATION ---
window.init = function() {
    console.log("🤝 Establishing UI/Logic Handshake...");
    
    // Binding listeners manually to ensure they work in Module scope
    document.getElementById('resumeFile')?.addEventListener('change', window.handleFileUpload);
    
    const tailorBtn = document.getElementById('tailorResumeBtn');
    if (tailorBtn) tailorBtn.onclick = window.tailorResume;

    const searchBtn = document.getElementById('searchJobsBtn');
    if (searchBtn) searchBtn.onclick = window.searchJobs;

    document.getElementById('downloadBtn')?.addEventListener('click', () => {
        const text = document.getElementById('optimizedResume').value;
        const blob = new Blob([text], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = "PraeHire_Resume.txt";
        link.click();
    });

    document.getElementById('shareBtn')?.addEventListener('click', () => window.open("https://linkedin.com", "_blank"));
    
    addLog("✅ System Handshake Complete. Buttons Active.");
}

// Trigger init
window.init();