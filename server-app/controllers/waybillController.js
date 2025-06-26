import { storage } from '../data/storage.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Create a new waybill for sand transportation
 * Links truck to sand amount and creates tracking document
 */
export const createWaybill = asyncHandler(async (req, res) => {
  const { truckNumber, sandAmount, unit } = req.body;
  
  // Verify truck exists and is registered
  const truck = storage.trucks.findOne({ truckNumber: truckNumber.toUpperCase() });
  if (!truck) {
    return res.status(404).json({ 
      success: false, 
      message: 'Truck not found' 
    });
  }
  
  // Generate unique waybill number using timestamp
  const waybillNumber = `WB${Date.now()}`;
  
  // Create new waybill with default values
  const waybill = storage.waybills.create({
    waybillNumber,
    truckNumber: truckNumber.toUpperCase(),
    sandAmount,
    unit: unit || 'tons', // Default to tons if not specified
    attempts: 4, // Maximum verification attempts
    status: 'pending', // Initial status
    createdBy: req.user.userId // Track who created the waybill
  });
  
  // Return success response with created waybill
  res.status(201).json({
    success: true,
    message: 'Waybill created successfully',
    waybill
  });
});

/**
 * Verify waybill with operator action
 * Records verification attempt and updates waybill status
 */
export const verifyWaybill = asyncHandler(async (req, res) => {
  const { waybillId } = req.params;
  const { action, notes } = req.body;
  
  // Find waybill by ID
  const waybill = storage.waybills.findById(waybillId);
  if (!waybill) {
    return res.status(404).json({ 
      success: false, 
      message: 'Waybill not found' 
    });
  }
  
  // Check if attempts are exhausted
  if (waybill.attempts <= 0) {
    return res.status(400).json({ 
      success: false, 
      message: 'No attempts remaining. Waybill expired.' 
    });
  }
  
  // Record verification action with timestamp and operator details
  waybill.verifications.push({
    timestamp: new Date(),
    operator: req.user.username,
    action,
    notes
  });
  
  // Decrement remaining attempts
  waybill.attempts -= 1;
  
  // Update status based on attempts or action
  if (waybill.attempts === 0) {
    waybill.status = 'expired';
  }
  
  if (action === 'approve') {
    waybill.status = 'verified';
  }
  
  // Save updated waybill to storage
  const updatedWaybill = storage.waybills.update(waybillId, waybill);
  
  // Return verification result
  res.json({
    success: true,
    message: 'Waybill verification completed',
    waybill: updatedWaybill,
    remainingAttempts: waybill.attempts
  });
});

/**
 * Get waybills with optional filtering
 * Supports filtering by truck number and status
 */
export const getWaybills = asyncHandler(async (req, res) => {
  const { truckNumber, status } = req.query;
  const filter = {};
  
  // Build filter object based on query parameters
  if (truckNumber) filter.truckNumber = truckNumber.toUpperCase();
  if (status) filter.status = status;
  
  // Fetch waybills with applied filters (sorted by creation date, newest first)
  const waybills = storage.waybills.find(filter);
  
  // Populate creator information for each waybill
  const populatedWaybills = waybills.map(waybill => ({
    ...waybill,
    createdBy: {
      _id: waybill.createdBy,
      username: storage.users.findById(waybill.createdBy)?.username || 'Unknown'
    }
  }));
  
  // Return waybills list
  res.json({
    success: true,
    waybills: populatedWaybills
  });
});

/**
 * Scan waybill with OTP verification
 * Tracks scan attempts and shows waybill details after successful OTP verification
 */
export const scanWaybill = asyncHandler(async (req, res) => {
  const { waybillNumber, phoneNumber, otp, notes } = req.body;
  
  // Validate required fields
  if (!waybillNumber || !phoneNumber || !otp) {
    return res.status(400).json({ 
      success: false, 
      message: 'Waybill number, phone number and OTP are required' 
    });
  }
  
  // Find waybill by number
  const waybill = storage.waybills.findOne({ waybillNumber });
  if (!waybill) {
    return res.status(404).json({ 
      success: false, 
      message: 'Waybill not found' 
    });
  }
  
  // Check if waybill is already rejected or expired
  if (waybill.status === 'rejected' || waybill.status === 'expired') {
    return res.status(400).json({ 
      success: false, 
      message: `Waybill is ${waybill.status}` 
    });
  }
  
  // Verify OTP
  const otpDoc = storage.otps.findOne({ 
    phoneNumber, 
    otp, 
    verified: false,
    expiresAt: { $gt: new Date() }
  });
  
  if (!otpDoc) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid or expired OTP' 
    });
  }
  
  // Check scan limit
  if (waybill.scanCount >= 4) {
    waybill.status = 'rejected';
    storage.waybills.update(waybill._id, waybill);
    
    return res.status(400).json({ 
      success: false, 
      message: 'Maximum scan limit reached. Waybill rejected.' 
    });
  }
  
  // Mark OTP as verified
  storage.otps.update(otpDoc._id, { verified: true });
  
  // Increment scan count and add scan record
  waybill.scanCount += 1;
  waybill.scans.push({
    timestamp: new Date(),
    operator: phoneNumber,
    notes: notes || 'Scanned via mobile'
  });
  
  // Update status if scan limit reached
  if (waybill.scanCount >= 4) {
    waybill.status = 'rejected';
  }
  
  // Save updated waybill
  const updatedWaybill = storage.waybills.update(waybill._id, waybill);
  
  // Get truck details
  const truck = storage.trucks.findOne({ truckNumber: waybill.truckNumber });
  
  // Return waybill details
  res.json({
    success: true,
    message: 'Waybill scanned successfully',
    waybill: {
      waybillNumber: updatedWaybill.waybillNumber,
      truckNumber: updatedWaybill.truckNumber,
      driverName: truck?.driverName || 'Unknown',
      sandAmount: updatedWaybill.sandAmount,
      unit: updatedWaybill.unit,
      scanCount: updatedWaybill.scanCount,
      maxScans: 4,
      status: updatedWaybill.status,
      createdAt: updatedWaybill.createdAt
    }
  });
});

/**
 * Get waybill details by waybill number
 * Public endpoint to view waybill information
 */
export const getWaybillDetails = asyncHandler(async (req, res) => {
  const { waybillNumber } = req.params;
  
  // Find waybill by number
  const waybill = storage.waybills.findOne({ waybillNumber });
  if (!waybill) {
    return res.status(404).json({ 
      success: false, 
      message: 'Waybill not found' 
    });
  }
  
  // Get truck details
  const truck = storage.trucks.findOne({ truckNumber: waybill.truckNumber });
  
  // Return waybill details
  res.json({
    success: true,
    waybill: {
      waybillNumber: waybill.waybillNumber,
      truckNumber: waybill.truckNumber,
      driverName: truck?.driverName || 'Unknown',
      driverPhone: truck?.driverPhone || 'Unknown',
      sandAmount: waybill.sandAmount,
      unit: waybill.unit,
      scanCount: waybill.scanCount,
      maxScans: 4,
      status: waybill.status,
      scans: waybill.scans,
      createdAt: waybill.createdAt
    }
  });
});
