const mongoose = require('mongoose');

const otpVerificationSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true },
  otp: { type: String, required: true },
  signupData: { type: Object, required: true },
  expiresAt: { type: Date, required: true }
}, { timestamps: true });

otpVerificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('OtpVerification', otpVerificationSchema);
