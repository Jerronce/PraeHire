// backend/src/models/Resume.js

import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema(
    {
        // Link to the user who owns this resume
        userId: { 
            type: mongoose.Schema.Types.ObjectId, 
            required: true, 
            ref: 'User' 
        },
        originalText: { 
            type: String, 
            required: true 
        },
        tailoredText: { 
            type: String 
        },
        jobDescription: { 
            type: String 
        }
    },
    { 
        // Using timestamps: true automatically adds createdAt and updatedAt fields
        timestamps: true 
    }
);

const Resume = mongoose.model('Resume', resumeSchema);

// FIX: Export the model using default export for ES Module compatibility
export default Resume;