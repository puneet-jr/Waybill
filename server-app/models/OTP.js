import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
    match: /^[0-9]{10}$/
  },
  otp: {
    type: String,
    required: true,
    length: 6
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
  },
  verified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('OTP', otpSchema);
