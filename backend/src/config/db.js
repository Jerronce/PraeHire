// backend/src/config/db.js

import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        // Use standard options for Mongoose connection
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        // SUCCESS message, including host for verification
        console.log(`MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        // FAILURE handling
        console.error(`MongoDB connection error: ${error.message}`);
        // Exit process with failure
        process.exit(1); 
    }
};

// FIX: Export the function using default export for ES Module compatibility
export default connectDB;