import jwt from 'jsonwebtoken';
import { storage } from '../data/storage.js';

/**
 * Authentication middleware
 * Validates JWT token and attaches user info to request
 */
export const auth = async (req, res, next) => {
  try {
    // Extract token from Authorization header (Bearer token format)
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    // Check if token is provided
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }
    
    // Verify and decode JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    // Find user by decoded userId
    const user = storage.users.findById(decoded.userId);
    
    // Check if user still exists
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token.' 
      });
    }
    
    // Attach user info to request object for use in route handlers
    req.user = { 
      userId: user._id, 
      username: user.username, 
      role: user.role 
    };
    
    // Continue to next middleware/route handler
    next();
  } catch (error) {
    // Handle invalid token errors
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token.' 
    });
  }
};
