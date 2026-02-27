const mongoose = require('mongoose');

const grnSchema = new mongoose.Schema({
  purchaseOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseOrder', required: true },
  legacy_purchaseOrderId: { type: String, default: null },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    legacy_productId: { type: String, default: null },
    receivedQuantity: { type: Number, required: true, min: 1 }
  }]
}, { timestamps: true });

module.exports = mongoose.model('GRN', grnSchema);
