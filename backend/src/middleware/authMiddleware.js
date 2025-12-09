// backend/src/middleware/authMiddleware.js

import jwt from 'jsonwebtoken';
// Note: We don't need 'dotenv' here because it's loaded in server.js

// The actual middleware function
const protect = (req, res, next) => {
    // 1. Check for the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Authorization denied. No token provided." });
    }

    // 2. Extract the token
    const token = authHeader.split(" ")[1];

    // 3. Verify the token
    try {
        // jwt.verify automatically throws an error if the token is invalid or expired
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 4. Attach the decoded user data (including ID, role, etc.) to the request object
        // This is crucial for role-based access control (RBAC) and identifying the user
        req.user = decoded; 
        
        // 5. Move to the next middleware or route handler
        next();
    } catch (err) {
        // If jwt.verify fails
        return res.status(401).json({ message: "Invalid token or token has expired." });
    }
};

// Export the function as a named export 'protect'
export { protect };