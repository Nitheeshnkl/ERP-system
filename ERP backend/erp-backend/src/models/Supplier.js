const mongoose = require('mongoose');

const normalizeEmail = (value) => {
  if (value === null || value === undefined) return undefined;
  const trimmed = String(value).trim().toLowerCase();
  return trimmed || undefined;
};

const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, trim: true, lowercase: true, set: normalizeEmail },
  phone: { type: String },
  address: { type: String },
  city: { type: String, default: '' },
  state: { type: String, default: '' },
  country: { type: String, default: '' },
  postalCode: { type: String, default: '' },
}, { timestamps: true });

supplierSchema.index({ name: 1 });
supplierSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { email: { $type: 'string' } } }
);

module.exports = mongoose.model('Supplier', supplierSchema);
