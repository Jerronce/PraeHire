/**
 * PraeHire Core Brain v3.0
 * Authorized by: CTO Jeremiah Adedurin
 */

console.log("🧠 PraeHire Brain: System Online.");

let resumeFileContent = null;

// --- 1. PDF PROCESSING ENGINE ---
async function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    console.log("📄 Processing File:", file.name);
    const reader = new FileReader();
    
    reader.onload = async (event) => {
        try {
            const typedarray = new Uint8Array(event.target.result);
            // Verify pdfjsLib is loaded from CDN
            if (typeof pdfjsLib === 'undefined') {
                throw new Error("PDF Library not loaded. Check dashboard.html head.");
            }
            const pdf = await pdfjsLib.getDocument(typedarray).promise;
            let text = "";
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                text += content.items.map(s => s.str).join(" ") + "\n";
            }
            resumeFileContent = text;
            console.log("✅ Resume text extracted successfully.");
            alert("✅ Resume Loaded! Ready for AI Tailoring.");
        } catch (err) {
            console.error("❌ PDF Engine Error:", err);
            alert("Error reading PDF. Please try a different version.");
        }
    };
    reader.readAsArrayBuffer(file);
}

// --- 2. AI TAILORING INTERFACE ---
async function tailorResume() {
    console.log("🖱️ Tailor Button Triggered.");
    const jobDesc = document.getElementById('jobDescInput')?.value;
    const output = document.getElementById('optimizedResume');
    
    if (!resumeFileContent) {
        return alert("Please upload a resume (PDF) first!");
    }
    if (!jobDesc || jobDesc.trim().length < 20) {
        return alert("Please paste a more detailed job description.");
    }

    output.value = "⏳ Gemini 1.5 Flash is re-engineering your resume... please wait.";

    try {
        const response = await fetch('https://us-central1-praehire.cloudfunctions.net/tailorResume', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                resumeText: resumeFileContent, 
                jobDescription: jobDesc 
            })
        });
        
        if (!response.ok) throw new Error(`Server responded with ${response.status}`);
        
        const data = await response.json();
        console.log("🤖 AI Response Received.");
        output.value = data.tailoredResume || "AI finished, but response body was empty.";
    } catch (err) {
        console.error("❌ AI Connection Error:", err);
        output.value = "❌ Connection Error. Check your Firebase Cloud Functions log or your Blaze Plan status.";
    }
}

// --- 3. SYSTEM INITIALIZATION ---
function init() {
    console.log("🤝 Establishing UI/Logic Handshake...");
    const fileInput = document.getElementById('resumeFile');
    const tailorBtn = document.getElementById('tailorResumeBtn');

    if (fileInput) {
        fileInput.onchange = handleFileUpload;
        console.log("✅ File Upload Listener: Active.");
    }

    if (tailorBtn) {
        tailorBtn.onclick = tailorResume;
        console.log("✅ Tailor Button Listener: Active.");
    } else {
        console.error("⚠️ CRITICAL: Could not find 'tailorResumeBtn' in HTML.");
    }
}

// Global Execution
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}