// backend/src/config/db.js

import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        // FIX: Remove deprecated options (useNewUrlParser, useUnifiedTopology)
        const conn = await mongoose.connect(process.env.MONGO_URI);

        // SUCCESS message, including host for verification
        console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        // FAILURE handling
        console.error(`MongoDB connection error: ${error.message}`);
        // Exit process with failure
        process.exit(1); 
    }
};

export default connectDB;