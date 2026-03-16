// PraeHire Dashboard Logic
let resumeFileContent = null;

// 1. Handle PDF Upload
const resumeFileInput = document.getElementById('resumeFile');
if (resumeFileInput) {
  resumeFileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
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
          alert("✅ Resume Loaded! You can now click Tailor Resume.");
        } catch (err) {
          console.error("PDF Error:", err);
          alert("Error reading PDF.");
        }
      };
      reader.readAsArrayBuffer(file);
    }
  });
}

// 2. Handle AI Tailoring
async function tailorResume() {
  const jobDesc = document.getElementById('jobDescInput')?.value;
  const output = document.getElementById('optimizedResume');
  
  if (!resumeFileContent || !jobDesc) {
    return alert("Please upload a resume first and paste a job description.");
  }

  output.value = "⏳ AI is tailoring your resume... please wait.";

  try {
    const response = await fetch('https://us-central1-praehire.cloudfunctions.net/tailorResume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeText: resumeFileContent, jobDescription: jobDesc })
    });
    
    if (!response.ok) throw new Error("Cloud Function Error");
    
    const data = await response.json();
    output.value = data.tailoredResume || "AI finished but the response was empty.";
  } catch (err) {
    console.error(err);
    output.value = "❌ Connection Error. Ensure your Firebase billing is active and functions are deployed.";
  }
}

// 3. Attach the Listener to the Blue Button
document.getElementById('tailorResumeBtn')?.addEventListener('click', tailorResume);
console.log("🚀 AI Logic Attached to Button!");