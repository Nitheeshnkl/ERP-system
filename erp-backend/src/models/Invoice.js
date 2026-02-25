const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  salesOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'SalesOrder', required: true, unique: true },
  legacy_salesOrderId: { type: String, default: null },
  amount: { type: Number, required: true },
  pdfPath: { type: String, required: true },
  paymentStatus: {
    type: String,
    enum: ['Paid', 'Pending', 'Cancelled'],
    default: 'Pending',
    required: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
