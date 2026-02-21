const mongoose = require('mongoose');

const grnSchema = new mongoose.Schema({
  purchaseOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseOrder', required: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    receivedQuantity: { type: Number, required: true, min: 1 }
  }]
}, { timestamps: true });

module.exports = mongoose.model('GRN', grnSchema);