import { auth, db, storage } from './firebase-config.js';
import { signOut } from 'https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js';


// Resume file handling
let resumeFileContent = null;

// Handle resume file upload
const resumeFileInput = document.getElementById('resumeFile');
if (resumeFileInput) {
    resumeFileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
try {
                // Use PDF.js to extract text from PDF files
                const fileReader = new FileReader();
                const fileData = await new Promise((resolve, reject) => {
                    fileReader.onload = (e) => resolve(new Uint8Array(e.target.result));
                    fileReader.onerror = reject;
                    fileReader.readAsArrayBuffer(file);
                });
                
                // Set worker source for PDF.js
                pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                
                // Load the PDF document
                const pdf = await pdfjsLib.getDocument({data: fileData}).promise;
                let fullText = '';
                
                // Extract text from all pages
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items.map(item => item.str).join(' ');
                    fullText += pageText + '\n';
                }
                
                resumeFileContent = fullText;
                console.log('Resume file loaded successfully');
            } catch (error) {
                console.error('Error reading file:', error);
                alert('Error reading file. Please try again.');
            }        }
    });
}

// Tailor Resume function using Firebase Function
async function tailorResume() {
    console.log('Tailoring resume...');
    
    const jobDescInput = document.getElementById('jobDescInput');
    const optimizedField = document.getElementById('optimizedResume');
    
    if (!jobDescInput || !optimizedField) {
        console.error('Required elements not found');
        return;
    }
    
    const jobDesc = jobDescInput.value.trim();
    
    if (!resumeFileContent) {
        alert('Please upload your resume first!');
        return;
    }
    
    if (!jobDesc) {
        alert('Please paste the job description!');
        return;
    }
    
    // Show loading state
    optimizedField.value = 'Tailoring your resume with AI... Please wait.';
    optimizedField.disabled = true;
    
    try {
        // Call the Firebase Function
        const response = await fetch('https://us-central1-praehire.cloudfunctions.net/tailorResume', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                resumeText: resumeFileContent,
                jobDescription: jobDesc
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to tailor resume');
        }
        
        const data = await response.json();
        optimizedField.value = data.tailoredResume || 'No response generated';
        optimizedField.disabled = false;
        
        console.log('Resume tailored successfully!');
    } catch (error) {
        console.error('Error tailoring resume:', error);
        const errorMessage = error.message || error.toString() || 'An unknown error occurred';
        optimizedField.value = 'Error: ' + errorMessage;        optimizedField.disabled = false;
        alert('Failed to tailor resume: ' + errorMessage);    }
}

// Attach event listener to Tailor Resume button
const tailorBtn = document.getElementById('tailorResumeBtn');
if (tailorBtn) {
    tailorBtn.addEventListener('click', tailorResume);
    console.log('Tailor resume button listener attached');
} else {
    console.error('Tailor resume button not found!');
}
