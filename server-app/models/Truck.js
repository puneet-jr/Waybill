import { Schema, model } from 'mongoose';

const truckSchema = new Schema({
  truckNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  driverName: {
    type: String,
    required: true,
    trim: true
  },
  driverPhone: {
    type: String,
    required: true,
    trim: true
  },
  maxTrips: {
    type: Number,
    default: 4
  },
  remainingTrips: {
    type: Number,
    default: 4
  },
  attempts: {
    type: Number,
    default: 0
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  lastVerification: {
    type: Date
  }
}, {
  timestamps: true
});

export default model('Truck', truckSchema);
