// backend/src/routes/job.routes.js
import express from 'express';
import Job from '../models/Job.js';
import { protect } from '../middleware/authMiddleware.js'; // Assuming your JWT middleware is named 'protect'
import roleMiddleware from '../middleware/roleMiddleware.js';

const router = express.Router();

// @route POST /api/jobs
// @desc Create a new job listing (Recruiter/Admin only)
// @access Private
router.post('/', protect, roleMiddleware(['recruiter', 'admin']), async (req, res) => {
    try {
        const { title, description, requirements, location, salary } = req.body;

        // req.user is attached by the JWT middleware and contains the user's ID
        const job = new Job({
            title,
            description,
            requirements,
            location,
            salary,
            postedBy: req.user.id, // Link the job to the authenticated user ID (Recruiter)
        });

        const createdJob = await job.save();
        res.status(201).json(createdJob);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route GET /api/jobs
// @desc Get all active job listings (All authenticated users)
// @access Private
router.get('/', protect, async (req, res) => {
    try {
        // Find all active jobs and populate the 'postedBy' field with selected user details
        const jobs = await Job.find({ status: 'active' }).populate('postedBy', 'email role');
        res.status(200).json(jobs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

export default router;