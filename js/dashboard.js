import { auth, db, storage } from './firebase-config.js';
import { signOut } from 'https://www.gstatic.com/firebasejs/9.17.2/firebase-auth.js';

const GEMINI_API_KEY = "AIzaSyCui2JGjimd0wHiKXj4MPErVH5_9H8ArHc";
const OPENWEATHER_API_KEY = "ba065545e26fb7893c9dba89f5a8a8a6";

// Resume file handling
let resumeFileContent = null;

// Handle resume file upload
const resumeFileInput = document.getElementById('resumeFile');
if (resumeFileInput) {
    resumeFileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                resumeFileContent = await file.text();
                console.log('Resume file loaded successfully');
            } catch (error) {
                console.error('Error reading file:', error);
                alert('Error reading file. Please try again.');
            }
        }
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
        optimizedField.value = 'Error: ' + error.message;
        optimizedField.disabled = false;
        alert('Failed to tailor resume: ' + error.message);
    }
}

// Attach event listener to Tailor Resume button
const tailorBtn = document.getElementById('tailorResumeBtn');
if (tailorBtn) {
    tailorBtn.addEventListener('click', tailorResume);
    console.log('Tailor resume button listener attached');
} else {
    console.error('Tailor resume button not found!');
}
