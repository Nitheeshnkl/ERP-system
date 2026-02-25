const Invoice = require('../models/Invoice');
const path = require('path');
const fs = require('fs');
const { success, error } = require('../utils/response');

exports.getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find().populate('salesOrderId');
    return success(res, invoices, 'Invoices fetched successfully');
  } catch (requestError) {
    return error(res, requestError.message, 500);
  }
};

exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('salesOrderId');
    if (!invoice) {
      return error(res, 'Invoice not found', 404);
    }

    return success(res, invoice, 'Invoice fetched successfully');
  } catch (requestError) {
    return error(res, requestError.message, 500);
  }
};

exports.updateInvoiceStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['Paid', 'Pending', 'Cancelled'];

    if (!status || typeof status !== 'string') {
      return error(res, 'Status is required', 400);
    }

    const normalizedStatus = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    if (!allowedStatuses.includes(normalizedStatus)) {
      return error(res, 'Invalid status. Allowed values: Paid, Pending, Cancelled', 400);
    }

    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      { paymentStatus: normalizedStatus },
      { new: true }
    ).populate('salesOrderId');

    if (!invoice) {
      return error(res, 'Invoice not found', 404);
    }

    return success(res, invoice, 'Invoice status updated successfully');
  } catch (requestError) {
    return error(res, requestError.message, 500);
  }
};

exports.getInvoicePDF = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return error(res, 'Invoice not found', 404);
    }

    const filePath = path.resolve(invoice.pdfPath);
    if (fs.existsSync(filePath)) {
      return res.sendFile(filePath);
    }

    return error(res, 'PDF file not found on server', 404);
  } catch (requestError) {
    return error(res, requestError.message, 500);
  }
};

exports.deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);
    if (!invoice) {
      return error(res, 'Invoice not found', 404);
    }
    return success(res, null, 'Invoice deleted successfully');
  } catch (requestError) {
    return error(res, requestError.message, 500);
  }
};
