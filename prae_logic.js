/**
 * PraeHire Core Brain v6.0 - Global Architect Edition
 * Features: Visual Score Bar, Global Job Search, Secure API
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

// --- PDF HANDLER ---
async function handleFileUpload(e) {
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

// --- AI TAILORING & VISUAL SCORING ---
async function tailorResume() {
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

    if (!GEMINI_API_KEY) { addLog("⚠️ Waiting for Cloud Secret..."); return; }
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
    }
}

// --- GLOBAL JOB SEARCH ---
function searchJobs() {
    const query = document.getElementById('jobSearch').value;
    if(!query) return alert("Enter role and location (e.g. Developer in NYC)");
    addLog(`🔍 Searching Global Market: ${query}...`);
    window.open(`https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(query)}`, "_blank");
}

// --- INITIALIZATION ---
function init() {
    document.getElementById('resumeFile')?.addEventListener('change', handleFileUpload);
    document.getElementById('tailorResumeBtn')?.addEventListener('click', tailorResume);
    document.getElementById('downloadBtn')?.addEventListener('click', () => {
        const text = document.getElementById('optimizedResume').value;
        const blob = new Blob([text], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = "PraeHire_Resume.txt";
        link.click();
    });
    document.getElementById('searchJobsBtn')?.addEventListener('click', searchJobs);
    document.getElementById('shareBtn')?.addEventListener('click', () => window.open("https://linkedin.com", "_blank"));
}

init();