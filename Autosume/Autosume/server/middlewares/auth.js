const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || process.env.APP_SECRET || 'your-super-secret-jwt-key';

const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                message: 'Access token is required'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Find user - handle both userId (new format) and id (old format)
        const userId = decoded.userId || decoded.id;
        const user = await User.findById(userId);
        
        if (!user || !user.isActive) {
            return res.status(401).json({
                message: 'Invalid token or user not found'
            });
        }

        // Add user to request object
        req.user = user;
        next();

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                message: 'Token expired'
            });
        }
        
        return res.status(403).json({
            message: 'Invalid token'
        });
    }
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            message: 'Admin access required'
        });
    }
    next();
};

// Legacy middleware name for backwards compatibility
const validateToken = authenticateToken;

module.exports = {
    authenticateToken,
    validateToken,
    requireAdmin
};