// backend/src/models/Application.js
import mongoose from 'mongoose';

const ApplicationSchema = new mongoose.Schema({
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job', 
        required: true
    },
    candidate: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true
    },
    status: { 
        type: String, 
        enum: ['pending', 'reviewed', 'interview', 'rejected', 'hired'], 
        default: 'pending' 
    },
    resumePath: { 
        type: String, 
        required: true,
        default: 'placeholder/path/for/resume.pdf' 
    }, 
    notes: { 
        type: String, 
        default: '' 
    },
}, { 
    timestamps: true 
});

ApplicationSchema.index({ job: 1, candidate: 1 }, { unique: true });

const Application = mongoose.model('Application', ApplicationSchema);
export default Application;