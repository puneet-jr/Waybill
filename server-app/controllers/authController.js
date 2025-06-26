import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { storage } from '../data/storage.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Generate JWT token for user authentication
 * @param {string} userId - User ID to encode in token
 * @returns {string} JWT token with 24h expiration
 */
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '24h'
  });
};

/**
 * Register a new user
 * Creates user account with hashed password and returns JWT token
 */
export const register = asyncHandler(async (req, res) => {
  const { username, email, password, role } = req.body;
  
  // Check if user already exists with same email or username
  const existingUser = storage.users.findOne({
    $or: [{ email }, { username }]
  });
  
  if (existingUser) {
    return res.status(400).json({ 
      success: false, 
      message: 'User already exists' 
    });
  }

  // Hash password for secure storage
  const hashedPassword = await bcrypt.hash(password, 12);
  
  // Create new user in storage
  const user = storage.users.create({ 
    username, 
    email, 
    password: hashedPassword, 
    role 
  });

  // Generate authentication token
  const token = generateToken(user._id);
  
  // Return success response with token and user data (excluding password)
  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    }
  });
});

/**
 * Authenticate user login
 * Validates credentials and returns JWT token on success
 */
export const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  
  // Find user by username
  const user = storage.users.findOne({ username });
  
  // Validate user exists and password is correct
  if (!user || !await bcrypt.compare(password, user.password)) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid credentials' 
    });
  }

  // Generate authentication token
  const token = generateToken(user._id);
  
  // Return success response with token and user data
  res.json({
    success: true,
    message: 'Login successful',
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    }
  });
});
