/**
 * PraeHire Core Logic v2.0
 * CTO: Jeremiah Adedurin
 */

console.log("🧠 PraeHire Logic: System Booting...");

// Global state for uploaded content
let state = {
    resumeText: null,
    isProcessing: false
};

/**
 * 1. PDF EXTRACTION ENGINE
 */
async function handleResumeUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    console.log(`📄 Analyzing: ${file.name}`);
    const reader = new FileReader();

    reader.onload = async (event) => {
        try {
            const typedarray = new Uint8Array(event.target.result);
            const pdf = await pdfjsLib.getDocument(typedarray).promise;
            let extractedText = "";

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                extractedText += content.items.map(s => s.str).join(" ") + "\n";
            }

            state.resumeText = extractedText;
            console.log("✅ Extraction Complete. Ready for AI.");
            alert("✅ Resume Loaded Successfully!");
        } catch (err) {
            console.error("❌ PDF Engine Error:", err);
            alert("Could not read PDF. Please ensure it's a standard document.");
        }
    };
    reader.readAsArrayBuffer(file);
}

/**
 * 2. AI TAILORING INTERFACE
 */
async function triggerTailoring() {
    const jobDesc = document.getElementById('jobDescInput')?.value;
    const outputField = document.getElementById('optimizedResume');

    if (!state.resumeText) return alert("Please upload your resume first!");
    if (!jobDesc || jobDesc.trim().length < 10) return alert("Please provide a detailed job description.");
    if (state.isProcessing) return;

    state.isProcessing = true;
    outputField.value = "⏳ Gemini is re-engineering your resume... please wait.";

    try {
        const response = await fetch('https://us-central1-praehire.cloudfunctions.net/tailorResume', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                resumeText: state.resumeText,
                jobDescription: jobDesc
            })
        });

        if (!response.ok) throw new Error(`Server Error: ${response.status}`);

        const data = await response.json();
        outputField.value = data.tailoredResume || "AI completed but returned no text.";
        console.log("🤖 AI Optimization Successful.");
    } catch (err) {
        console.error("❌ API Error:", err);
        outputField.value = "❌ Connection failed. Verify Firebase Cloud Functions are live.";
    } finally {
        state.isProcessing = false;
    }
}

/**
 * 3. SYSTEM INITIALIZATION (The Handshake)
 */
function initializePraeHire() {
    console.log("🤝 Initializing UI Handshake...");

    const elements = {
        fileInput: document.getElementById('resumeFile'),
        tailorBtn: document.getElementById('tailorResumeBtn')
    };

    if (elements.fileInput) {
        elements.fileInput.onchange = handleResumeUpload;
        console.log("✅ Resume Listener: Active");
    }

    if (elements.tailorBtn) {
        elements.tailorBtn.onclick = triggerTailoring;
        console.log("✅ Tailor Listener: Active");
    } else {
        console.warn("⚠️ Tailor button not found in current view.");
    }
}

// Global Boot
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePraeHire);
} else {
    initializePraeHire();
}