/**/**
 * PraeHire Core Brain v7.0 - Global Architect Edition
 * Features: Multi-Agent Optimization (Resume, Letter, Roadmap, Scoring)
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

    addLog("🚀 AI Engine: Architecting Career Package...");
    resumeOut.value = "⏳ Re-engineering profile and generating roadmap...";
    
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `
                    ROLE: Senior Global Recruiter & Career Strategist.
                    INPUT: ${context}
                    TARGET: ${jobDesc}
                    
                    TASK:
                    1. [SCORE]: A number (0-100) representing job match.
                    2. [ROADMAP]: A 4-week learning plan for missing skills.
                    3. [RESUME]: A full, ATS-optimized version of the resume.
                    4. [LETTER]: A high-impact cover letter.
                    
                    FORMAT: Surround each section with the tags [SCORE], [ROADMAP], [RESUME], and [LETTER].` 
                }] }]
            })
        });

        const data = await response.json();
        if (data.candidates) {
            const raw = data.candidates[0].content.parts[0].text;
            
            // --- PARSING LOGIC ---
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
            addLog("✅ Career Package v7.0 Ready.");
        }
    } catch (err) { addLog("❌ Connection Error."); }
}

window.init = function() {
    document.getElementById('resumeFile')?.addEventListener('change', window.handleFileUpload);
    document.getElementById('tailorResumeBtn').onclick = window.tailorResume;
    // ... other buttons init same as before ...
}

window.init();