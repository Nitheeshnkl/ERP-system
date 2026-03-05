const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true, min: 0 },
  stockQuantity: { type: Number, default: 0, min: 0 }
}, { timestamps: true });

productSchema.index({ name: 1 });

module.exports = mongoose.model('Product', productSchema);
