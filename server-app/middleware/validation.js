/**
 * Validate authentication request data
 * Ensures username and password are provided and meet requirements
 */
export const validateAuth = (req, res, next) => {
  const { username, password } = req.body;
  
  // Check required fields
  if (!username || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Username and password are required' 
    });
  }
  
  // Validate password length
  if (password.length < 6) {
    return res.status(400).json({ 
      success: false, 
      message: 'Password must be at least 6 characters long' 
    });
  }
  
  next();
};

/**
 * Validate truck registration data
 * Ensures all truck fields are provided and phone number format is correct
 */
export const validateTruck = (req, res, next) => {
  const { truckNumber, driverName, driverPhone, capacity } = req.body;
  
  // Check all required fields are provided
  if (!truckNumber || !driverName || !driverPhone || !capacity) {
    return res.status(400).json({ 
      success: false, 
      message: 'All truck fields are required' 
    });
  }
  
  // Validate phone number format (10 digits)
  if (!/^[0-9]{10}$/.test(driverPhone)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid phone number format' 
    });
  }
  
  next();
};

/**
 * Validate waybill creation data
 * Ensures truck number and sand amount are provided and valid
 */
export const validateWaybill = (req, res, next) => {
  const { truckNumber, sandAmount } = req.body;
  
  // Check required fields
  if (!truckNumber || !sandAmount) {
    return res.status(400).json({ 
      success: false, 
      message: 'Truck number and sand amount are required' 
    });
  }
  
  // Validate sand amount is positive
  if (sandAmount <= 0) {
    return res.status(400).json({ 
      success: false, 
      message: 'Sand amount must be greater than 0' 
    });
  }
  
  next();
};

/**
 * Validate OTP request data
 * Ensures phone number is provided and in correct format
 */
export const validateOTP = (req, res, next) => {
  const { phoneNumber } = req.body;
  
  // Check if phone number is provided
  if (!phoneNumber) {
    return res.status(400).json({ 
      success: false, 
      message: 'Phone number is required' 
    });
  }
  
  // Validate phone number format (10 digits)
  if (!/^[0-9]{10}$/.test(phoneNumber)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid phone number format' 
    });
  }
  
  next();
};

/**
 * Validate waybill scan data
 * Ensures waybill number, phone number and OTP are provided
 */
export const validateWaybillScan = (req, res, next) => {
  const { waybillNumber, phoneNumber, otp } = req.body;
  
  // Check required fields
  if (!waybillNumber || !phoneNumber || !otp) {
    return res.status(400).json({ 
      success: false, 
      message: 'Waybill number, phone number and OTP are required' 
    });
  }
  
  // Validate phone number format (10 digits)
  if (!/^[0-9]{10}$/.test(phoneNumber)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid phone number format' 
    });
  }
  
  // Validate OTP format (6 digits)
  if (!/^[0-9]{6}$/.test(otp)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid OTP format' 
    });
  }
  
  next();
};
