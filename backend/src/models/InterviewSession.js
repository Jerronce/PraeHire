const mongoose = require('mongoose');

const interviewSessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    question: { type: String, required: true },
    userAnswer: { type: String, required: true },
    feedback: { type: String },
    role: { type: String, default: 'Software Engineer' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model('InterviewSession', interviewSessionSchema);