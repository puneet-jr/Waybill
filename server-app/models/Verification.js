import { Schema, model } from 'mongoose';

const verificationSchema = new Schema({
  truckNumber: {
    type: String,
    required: true,
    uppercase: true
  },
  driverPhone: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['verified', 'failed', 'blocked', 'no_trips'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  attemptNumber: {
    type: Number,
    default: 0
  },
  verifiedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

export default model('Verification', verificationSchema);
