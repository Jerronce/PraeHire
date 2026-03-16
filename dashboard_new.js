// PraeHire Dashboard Logic - Optimized for Jerry Adedurin
console.log("🛠️ dashboard_new.js: Script started loading...");

let resumeFileContent = null;

/**
 * 1. Handle PDF Upload & Text Extraction
 */
const initFileHandler = () => {
    const resumeFileInput = document.getElementById('resumeFile');
    if (resumeFileInput) {
        resumeFileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            console.log("📄 File selected:", file.name);
            const reader = new FileReader();

            reader.onload = async (event) => {
                try {
                    const typedarray = new Uint8Array(event.target.result);
                    // Use the pdfjsLib loaded via CDN in dashboard.html
                    const pdf = await pdfjsLib.getDocument(typedarray).promise;
                    let text = "";
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const content = await page.getTextContent();
                        text += content.items.map(s => s.str).join(" ") + "\n";
                    }
                    resumeFileContent = text;
                    console.log("✅ PDF text extraction successful.");
                    alert("✅ Resume Loaded! You can now click Tailor Resume.");
                } catch (err) {
                    console.error("❌ PDF extraction error:", err);
                    alert("Error reading PDF. Is it a valid PDF?");
                }
            };
            reader.readAsArrayBuffer(file);
        });
    } else {
        console.error("❌ HTML Error: Could not find 'resumeFile' input.");
    }
};

/**
 * 2. AI Tailoring Function
 */
async function tailorResume() {
    console.log("🖱️ Tailor Resume button clicked.");
    const jobDesc = document.getElementById('jobDescInput')?.value;
    const output = document.getElementById('optimizedResume');

    if (!resumeFileContent) {
        console.warn("⚠️ Attempted to tailor without resume content.");
        return alert("Please upload a resume first!");
    }
    if (!jobDesc || jobDesc.trim() === "") {
        console.warn("⚠️ Attempted to tailor without job description.");
        return alert("Please paste a job description!");
    }

    output.value = "⏳ AI is tailoring your resume... please wait.";

    try {
        const response = await fetch('https://us-central1-praehire.cloudfunctions.net/tailorResume', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                resumeText: resumeFileContent,
                jobDescription: jobDesc
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Cloud Function Error");
        }

        const data = await response.json();
        console.log("✅ AI tailoring complete.");
        output.value = data.tailoredResume || "AI finished, but returned no text.";
    } catch (err) {
        console.error("❌ Fetch Error:", err);
        output.value = "❌ Connection Error. Ensure Firebase billing is active (Blaze plan) and functions are deployed.";
    }
}

/**
 * 3. Initialization - Wait for DOM
 */
const init = () => {
    console.log("🚀 Initializing button listeners...");
    initFileHandler();

    const tailorBtn = document.getElementById('tailorResumeBtn');
    if (tailorBtn) {
        tailorBtn.addEventListener('click', tailorResume);
        console.log("✅ AI Logic attached to 'tailorResumeBtn'.");
    } else {
        console.error("❌ HTML Error: Could not find 'tailorResumeBtn'.");
    }
};

// Start the engine
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}