const Invoice = require('../models/Invoice');
const path = require('path');
const fs = require('fs');

exports.getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find().populate('salesOrderId');
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getInvoicePDF = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
    
    const filePath = path.resolve(invoice.pdfPath);
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({ message: 'PDF file not found on server' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};