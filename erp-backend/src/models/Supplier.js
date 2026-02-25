const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  address: { type: String }
}, { timestamps: true });

supplierSchema.index({ name: 1 });

module.exports = mongoose.model('Supplier', supplierSchema);
