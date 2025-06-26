/**
 * Global error handling middleware
 * Catches and processes all errors thrown in the application
 * Provides consistent error response format
 */
export const errorHandler = (err, req, res, next) => {
  // Log error details for debugging
  console.error(err.stack);
  
  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ 
      success: false, 
      message: 'Validation Error', 
      errors 
    });
  }
  
  // Handle MongoDB duplicate key errors (unique constraint violations)
  if (err.code === 11000) {
    return res.status(400).json({ 
      success: false, 
      message: 'Duplicate field value entered' 
    });
  }
  
  // Default server error response
  res.status(500).json({ 
    success: false, 
    message: 'Server Error' 
  });
};
