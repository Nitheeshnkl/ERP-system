const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  salesOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'SalesOrder', required: true, unique: true },
  amount: { type: Number, required: true },
  pdfPath: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);