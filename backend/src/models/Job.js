// backend/src/models/Job.js
import mongoose from 'mongoose';

const JobSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    requirements: { type: [String], required: true }, // Array of strings for skills/requirements
    salary: { type: String, default: 'Competitive' },
    location: { type: String, required: true },
    
    // Link the job to the Recruiter who created it
    postedBy: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // References the User model
        required: true 
    },
    
    // Status to indicate if the job is active
    status: { type: String, enum: ['active', 'closed', 'draft'], default: 'active' },
}, { 
    timestamps: true // Adds createdAt and updatedAt fields automatically
});

const Job = mongoose.model('Job', JobSchema);
export default Job;