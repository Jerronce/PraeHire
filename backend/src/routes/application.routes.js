// backend/src/routes/application.routes.js
import express from 'express';
import Application from '../models/Application.js';
import { protect } from '../middleware/authMiddleware.js';
import roleMiddleware from '../middleware/roleMiddleware.js';

const router = express.Router();

// =========================================================
// ROUTE 1: Candidate Applies to a Job
// @route POST /api/applications/:jobId
// @access Private (Candidate Only)
// =========================================================
router.post('/:jobId', protect, roleMiddleware(['candidate']), async (req, res) => {
    try {
        const jobId = req.params.jobId;
        const candidateId = req.user.id; // From JWT middleware
        const { resumePath } = req.body; // In a real app, this comes from a file upload service

        // Check if candidate has already applied to this job (handled by schema index, but good to check)
        const existingApplication = await Application.findOne({ job: jobId, candidate: candidateId });
        if (existingApplication) {
            return res.status(400).json({ message: 'You have already applied for this job.' });
        }

        const newApplication = new Application({
            job: jobId,
            candidate: candidateId,
            resumePath: resumePath || 'placeholder/path/for/resume.pdf',
            status: 'pending'
        });

        await newApplication.save();
        res.status(201).json({ message: 'Application submitted successfully!', application: newApplication });

    } catch (error) {
        // Code 11000 is the MongoDB unique index violation (already applied)
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Duplicate application: You have already applied for this job.' });
        }
        console.error(error);
        res.status(500).json({ message: 'Server Error during application submission.' });
    }
});


// =========================================================
// ROUTE 2: Get Applications (Recruiter/Admin or Candidate's own)
// @route GET /api/applications
// @access Private (All authenticated users, filtered by role)
// =========================================================
router.get('/', protect, async (req, res) => {
    try {
        if (req.user.role === 'candidate') {
            // Candidates can only see their own applications
            const applications = await Application.find({ candidate: req.user.id })
                .populate('job', 'title location') // Show job title/location
                .populate('candidate', 'email'); // Show candidate email
            return res.status(200).json(applications);

        } else if (req.user.role === 'recruiter' || req.user.role === 'admin') {
            // Recruiters/Admins see all applications (or filter by jobs they posted)
            const applications = await Application.find()
                .populate('job', 'title postedBy') // Show job title and who posted it
                .populate('candidate', 'email'); // Show candidate details
            return res.status(200).json(applications);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error fetching applications.' });
    }
});


// =========================================================
// ROUTE 3: Update Application Status
// @route PUT /api/applications/:id/status
// @access Private (Recruiter/Admin Only)
// =========================================================
router.put('/:id/status', protect, roleMiddleware(['recruiter', 'admin']), async (req, res) => {
    try {
        const { status, notes } = req.body;
        
        const application = await Application.findById(req.params.id);
        if (!application) {
            return res.status(404).json({ message: 'Application not found.' });
        }

        // Only update fields provided in the body
        if (status) application.status = status;
        if (notes) application.notes = notes;

        await application.save();
        res.status(200).json({ message: 'Application status updated.', application });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error updating application status.' });
    }
});


export default router;