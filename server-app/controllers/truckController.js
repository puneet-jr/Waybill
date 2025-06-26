import { storage } from '../data/storage.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Register a new truck in the system
 * Creates truck record with driver information and capacity
 */
export const registerTruck = asyncHandler(async (req, res) => {
  const { truckNumber, driverName, driverPhone, capacity } = req.body;
  
  // Check if truck is already registered
  const existingTruck = storage.trucks.findOne({ truckNumber });
  if (existingTruck) {
    return res.status(400).json({ 
      success: false, 
      message: 'Truck already registered' 
    });
  }
  
  // Create new truck record with uppercase truck number for consistency
  const truck = storage.trucks.create({
    truckNumber: truckNumber.toUpperCase(),
    driverName,
    driverPhone,
    capacity,
    isActive: true
  });
  
  // Return success response with created truck data
  res.status(201).json({
    success: true,
    message: 'Truck registered successfully',
    truck
  });
});

/**
 * Get all active trucks
 * Returns list of all trucks that are currently active
 */
export const getTrucks = asyncHandler(async (req, res) => {
  // Fetch only active trucks from storage
  const trucks = storage.trucks.find({ isActive: true });
  
  res.json({
    success: true,
    trucks
  });
});

/**
 * Get specific truck by truck number
 * Returns truck details if found and active
 */
export const getTruckByNumber = asyncHandler(async (req, res) => {
  const { truckNumber } = req.params;
  
  // Search for truck with uppercase number (case-insensitive)
  const truck = storage.trucks.findOne({ 
    truckNumber: truckNumber.toUpperCase(), 
    isActive: true 
  });
  
  // Return 404 if truck not found
  if (!truck) {
    return res.status(404).json({ 
      success: false, 
      message: 'Truck not found' 
    });
  }
  
  // Return truck data
  res.json({
    success: true,
    truck
  });
});

