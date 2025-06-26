import mongoose from 'mongoose';

const truckSchema = new mongoose.Schema({
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
    match: /^[0-9]{10}$/
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Truck', truckSchema);
