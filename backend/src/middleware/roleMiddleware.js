// backend/src/middleware/roleMiddleware.js
// This runs AFTER authMiddleware and checks the role attached to req.user

const roleMiddleware = (requiredRoles) => (req, res, next) => {
    // Check if user and role exist (authMiddleware should ensure this)
    if (!req.user || !req.user.role) {
        return res.status(401).json({ message: 'Authorization denied. User role not found.' });
    }

    const userRole = req.user.role;

    // Check if the user's role is included in the list of allowed roles
    if (!requiredRoles.includes(userRole)) {
        // 403 Forbidden: User is logged in but lacks permission
        return res.status(403).json({ message: `Access denied. Role "${userRole}" cannot perform this action.` });
    }

    // Role is correct, proceed to the route handler
    next();
};

export default roleMiddleware;