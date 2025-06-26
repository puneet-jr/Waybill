/**
 * Waybill Management System - Express Server
 * Handles truck registration, waybill creation, and verification processes
 */

import express from 'express';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import truckRoutes from './routes/truckRoutes.js';
import waybillRoutes from './routes/waybillRoutes.js';
import otpRoutes from './routes/otpRoutes.js';

// Load environment variables from .env file
dotenv.config();

// Initialize Express application
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware Configuration
app.use(express.json()); // Parse JSON request bodies

// API Routes Configuration
app.use('/api/auth', authRoutes);       // Authentication endpoints
app.use('/api/trucks', truckRoutes);    // Truck management endpoints
app.use('/api/waybills', waybillRoutes); // Waybill management endpoints
app.use('/api/otp', otpRoutes);         // OTP verification endpoints

// Health check endpoint for testing API availability
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Waybill API is running!',
    timestamp: new Date().toISOString()
  });
});

// Global error handling middleware (must be last)
app.use(errorHandler);

// Start server and display helpful information
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 Test the API at: http://localhost:${PORT}/api/test`);
  console.log('🔐 Sample login credentials:');
  console.log('   👤 Username: admin, Password: admin123');
  console.log('   👤 Username: operator1, Password: admin123');
  console.log('📋 Available endpoints:');
  console.log('   POST /api/auth/login - User authentication');
  console.log('   POST /api/trucks/register - Register new truck');
  console.log('   POST /api/waybills - Create new waybill');
  console.log('   GET  /api/waybills - List all waybills');
});
