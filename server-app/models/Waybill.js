import mongoose from 'mongoose';

const waybillSchema = new mongoose.Schema({
  waybillNumber: {
    type: String,
    required: true,
    unique: true
  },
  truckNumber: {
    type: String,
    required: true,
    ref: 'Truck'
  },
  sandAmount: {
    type: Number,
    required: true,
    min: 0.1
  },
  unit: {
    type: String,
    enum: ['tons', 'cubic_meters'],
    default: 'tons'
  },
  attempts: {
    type: Number,
    default: 4,
    min: 0,
    max: 4
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'completed', 'expired'],
    default: 'pending'
  },
  verifications: [{
    timestamp: Date,
    operator: String,
    action: String,
    notes: String
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

waybillSchema.methods.decrementAttempt = function() {
  if (this.attempts > 0) {
    this.attempts -= 1;
    if (this.attempts === 0) {
      this.status = 'expired';
    }
  }
  return this.save();
};

export default mongoose.model('Waybill', waybillSchema);
