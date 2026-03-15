const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { canonicalizeRole } = require('../utils/roles');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'Sales', 'Purchase', 'Inventory'], default: 'Inventory' },
  tokenVersion: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  emailVerified: { type: Boolean, default: false }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (this.isModified('role')) {
    this.role = canonicalizeRole(this.role) || this.role;
  }
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, Number(process.env.BCRYPT_ROUNDS) || 10);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
