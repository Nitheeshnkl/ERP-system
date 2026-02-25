const mongoose = require('mongoose');

const salesOrderSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  legacy_customerId: { type: String, default: null },
  customerName: { type: String },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    legacy_productId: { type: String, default: null },
    productName: { type: String },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 }
  }],
  totalAmount: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['Pending', 'Processing', 'Completed', 'Cancelled'], default: 'Pending' }
}, { timestamps: true });

salesOrderSchema.index({ customerName: 1 });
salesOrderSchema.index({ status: 1 });

module.exports = mongoose.model('SalesOrder', salesOrderSchema);
