const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  address: { type: String }
}, { timestamps: true });

customerSchema.index({ name: 1 });

module.exports = mongoose.model('Customer', customerSchema);
