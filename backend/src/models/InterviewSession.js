// backend/src/models/InterviewSession.js

import mongoose from 'mongoose';

const interviewSessionSchema = new mongoose.Schema(
    {
        // Link to the user who performed the interview
        userId: { 
            type: mongoose.Schema.Types.ObjectId, 
            required: true, 
            ref: 'User' 
        },
        question: { 
            type: String, 
            required: true 
        },
        userAnswer: { 
            type: String, 
            required: true 
        },
        feedback: { 
            type: String 
        },
        role: { 
            type: String, 
            default: 'Software Engineer' 
        },
    },
    { 
        // Using timestamps: true automatically adds createdAt and updatedAt fields
        timestamps: true 
    }
);

const InterviewSession = mongoose.model('InterviewSession', interviewSessionSchema);

// FIX: Export the model using default export for ES Module compatibility
export default InterviewSession;