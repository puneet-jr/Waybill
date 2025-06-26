/**
 * In-Memory Data Storage
 * Simulates database operations for development/testing
 * In production, replace with actual database (MongoDB, PostgreSQL, etc.)
 */

// Sample users with pre-hashed passwords for testing
let users = [
  {
    _id: '1',
    username: 'admin',
    email: 'admin@example.com',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj9OGV0/0z7.', // password: admin123
    role: 'admin'
  },
  {
    _id: '2',
    username: 'operator1',
    email: 'operator1@example.com',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj9OGV0/0z7.', // password: admin123
    role: 'operator'
  }
];

// Sample trucks for testing
let trucks = [
  {
    _id: '1',
    truckNumber: 'TN01AB1234',
    driverName: 'John Doe',
    driverPhone: '9876543210',
    capacity: 10,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: '2',
    truckNumber: 'TN02CD5678',
    driverName: 'Jane Smith',
    driverPhone: '9876543211',
    capacity: 15,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Initialize empty collections for runtime data
let waybills = [];
let otps = [];

// ID generator for new records
let nextId = 3;
const generateId = () => (nextId++).toString();

/**
 * Storage interface that mimics database operations
 * Provides CRUD operations for all data entities
 */
export const storage = {
  // User operations
  users: {
    /**
     * Find users with optional query filter
     * Supports complex queries with $or operator
     */
    find: (query = {}) => {
      if (Object.keys(query).length === 0) return users;
      return users.filter(user => {
        if (query.$or) {
          return query.$or.some(condition => 
            Object.keys(condition).every(key => user[key] === condition[key])
          );
        }
        return Object.keys(query).every(key => user[key] === query[key]);
      });
    },
    
    /**
     * Find single user matching query
     */
    findOne: (query) => {
      const results = storage.users.find(query);
      return results.length > 0 ? results[0] : null;
    },
    
    /**
     * Find user by ID
     */
    findById: (id) => users.find(user => user._id === id),
    
    /**
     * Create new user record
     */
    create: (userData) => {
      const user = { ...userData, _id: generateId(), createdAt: new Date(), updatedAt: new Date() };
      users.push(user);
      return user;
    }
  },
  
  // Truck operations
  trucks: {
    /**
     * Find trucks with query filter
     */
    find: (query = {}) => {
      return trucks.filter(truck => 
        Object.keys(query).every(key => truck[key] === query[key])
      );
    },
    
    /**
     * Find single truck matching query
     */
    findOne: (query) => {
      const results = storage.trucks.find(query);
      return results.length > 0 ? results[0] : null;
    },
    
    /**
     * Create new truck record
     */
    create: (truckData) => {
      const truck = { ...truckData, _id: generateId(), createdAt: new Date(), updatedAt: new Date() };
      trucks.push(truck);
      return truck;
    }
  },
  
  // Waybill operations
  waybills: {
    /**
     * Find waybills with query filter
     * Results sorted by creation date (newest first)
     */
    find: (query = {}) => {
      let results = waybills.filter(waybill => 
        Object.keys(query).every(key => waybill[key] === query[key])
      );
      return results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
    
    /**
     * Find waybill by ID
     */
    findById: (id) => waybills.find(waybill => waybill._id === id),
    
    /**
     * Create new waybill record
     */
    create: (waybillData) => {
      const waybill = { 
        ...waybillData, 
        _id: generateId(), 
        createdAt: new Date(), 
        updatedAt: new Date(),
        verifications: [] // Initialize empty verifications array
      };
      waybills.push(waybill);
      return waybill;
    },
    
    /**
     * Update existing waybill
     */
    update: (id, updateData) => {
      const index = waybills.findIndex(w => w._id === id);
      if (index !== -1) {
        waybills[index] = { ...waybills[index], ...updateData, updatedAt: new Date() };
        return waybills[index];
      }
      return null;
    }
  },
  
  // OTP operations
  otps: {
    /**
     * Find OTPs with query filter
     * Supports date comparison for expiration checks
     */
    find: (query = {}) => {
      return otps.filter(otp => {
        let match = Object.keys(query).every(key => {
          if (key === 'expiresAt' && query[key].$gt) {
            return new Date(otp[key]) > query[key].$gt;
          }
          return otp[key] === query[key];
        });
        return match;
      });
    },
    
    /**
     * Find single OTP matching query
     */
    findOne: (query) => {
      const results = storage.otps.find(query);
      return results.length > 0 ? results[0] : null;
    },
    
    /**
     * Create new OTP record
     */
    create: (otpData) => {
      const otp = { ...otpData, _id: generateId(), createdAt: new Date(), updatedAt: new Date() };
      otps.push(otp);
      return otp;
    },
    
    /**
     * Delete multiple OTPs matching query
     */
    deleteMany: (query) => {
      otps = otps.filter(otp => 
        !Object.keys(query).every(key => otp[key] === query[key])
      );
    },
    
    /**
     * Update existing OTP
     */
    update: (id, updateData) => {
      const index = otps.findIndex(o => o._id === id);
      if (index !== -1) {
        otps[index] = { ...otps[index], ...updateData, updatedAt: new Date() };
        return otps[index];
      }
      return null;
    }
  }
};
