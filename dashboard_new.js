// This file handles the AI Logic
let resumeFileContent = null;

// ===== PDF READING LOGIC =====
const resumeFileInput = document.getElementById('resumeFile');
if (resumeFileInput) {
  resumeFileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const typedarray = new Uint8Array(event.target.result);
        // Using the pdfjsLib already loaded in your HTML head
        const pdf = await pdfjsLib.getDocument(typedarray).promise;
        let text = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map(s => s.str).join(" ") + "\n";
        }
        resumeFileContent = text;
        alert("Resume Loaded Successfully!");
      };
      reader.readAsArrayBuffer(file);
    }
  });
}

// ===== TAILOR RESUME LOGIC =====
async function tailorResume() {
  const jobDesc = document.getElementById('jobDescInput')?.value;
  const output = document.getElementById('optimizedResume');
  
  if (!resumeFileContent || !jobDesc) {
      return alert("Please upload a resume first and paste a job description.");
  }

  output.value = "AI is tailoring your resume... please wait.";

  try {
    const response = await fetch('https://us-central1-praehire.cloudfunctions.net/tailorResume', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeText: resumeFileContent, jobDescription: jobDesc })
    });
    const data = await response.json();
    output.value = data.tailoredResume || "AI response received, but format was unexpected.";
  } catch (err) {
    console.error(err);
    output.value = "Connection Error. Ensure your Cloud Functions are deployed and billing is active.";
  }
}

// Attach the listener to the button
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('tailorResumeBtn')?.addEventListener('click', tailorResume);
});