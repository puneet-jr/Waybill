import { storage } from '../data/storage.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Generate 6-digit random OTP
 * @returns {string} 6-digit OTP string
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send OTP to phone number
 * Generates and stores OTP for phone verification
 */
export const sendOTP = asyncHandler(async (req, res) => {
  const { phoneNumber } = req.body;
  
  // Clean up any existing OTPs for this phone number
  storage.otps.deleteMany({ phoneNumber });
  
  // Generate new 6-digit OTP
  const otp = generateOTP();
  
  // Set expiration time (10 minutes from now)
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  
  // Store OTP in database
  const otpDoc = storage.otps.create({ 
    phoneNumber, 
    otp, 
    expiresAt,
    verified: false
  });
  
  // Log OTP for development (in production, integrate with SMS service)
  console.log(`OTP for ${phoneNumber}: ${otp}`);
  
  // Return success response (include OTP only in development)
  res.json({
    success: true,
    message: 'OTP sent successfully',
    // Remove this in production - only for development testing
    otp: process.env.NODE_ENV === 'development' ? otp : undefined
  });
});

/**
 * Verify OTP for phone number
 * Validates OTP and marks as verified if correct
 */
export const verifyOTP = asyncHandler(async (req, res) => {
  const { phoneNumber, otp } = req.body;
  
  // Find matching OTP that is not verified and not expired
  const otpDoc = storage.otps.findOne({ 
    phoneNumber, 
    otp, 
    verified: false,
    expiresAt: { $gt: new Date() } // Check expiration
  });
  
  // Return error if OTP not found or invalid
  if (!otpDoc) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid or expired OTP' 
    });
  }
  
  // Mark OTP as verified
  storage.otps.update(otpDoc._id, { verified: true });
  
  // Return success response
  res.json({
    success: true,
    message: 'OTP verified successfully'
  });
});
