const Invoice = require('../models/Invoice');
const SalesOrder = require('../models/SalesOrder');
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const { success, error } = require('../utils/response');
const { getPaginationOptions, buildSearchFilter, buildMeta } = require('../utils/pagination');

exports.getInvoices = async (req, res) => {
  try {
    const { page, limit, skip, search } = getPaginationOptions(req.query);
    const filter = buildSearchFilter(search, ['paymentStatus']);
    const total = await Invoice.countDocuments(filter);
    const invoices = await Invoice.find(filter)
      .populate({ path: 'salesOrderId', select: 'customerId customerName totalAmount status createdAt' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    return success(res, invoices, 'Invoices fetched successfully', 200, { ...buildMeta(total, page, limit), search });
  } catch (requestError) {
    return error(res, requestError.message, 500);
  }
};

exports.getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate({ path: 'salesOrderId', select: 'customerId customerName totalAmount status createdAt' });
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
    ).populate({ path: 'salesOrderId', select: 'customerId customerName totalAmount status createdAt' });

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
    const invoice = await Invoice.findById(req.params.id).populate({ path: 'salesOrderId', select: 'customerName items totalAmount status createdAt' });
    if (!invoice) {
      return error(res, 'Invoice not found', 404);
    }

    const filePath = invoice.pdfPath ? path.resolve(invoice.pdfPath) : '';
    if (filePath && fs.existsSync(filePath)) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoice._id}.pdf"`);
      return res.sendFile(filePath);
    }

    const salesOrder = invoice.salesOrderId && invoice.salesOrderId._id
      ? invoice.salesOrderId
      : await SalesOrder.findById(invoice.salesOrderId).select('customerName items totalAmount status createdAt');

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoice._id}.pdf"`);
    doc.pipe(res);

    doc.fontSize(20).text('Invoice', { align: 'center' });
    doc.moveDown();
    doc.fontSize(11).text(`Invoice ID: ${invoice._id}`);
    doc.text(`Date: ${invoice.createdAt ? new Date(invoice.createdAt).toISOString().split('T')[0] : '-'}`);
    doc.text(`Customer: ${salesOrder?.customerName || 'N/A'}`);
    doc.text(`Order ID: ${salesOrder?._id || invoice.salesOrderId || 'N/A'}`);
    doc.text(`Payment Status: ${invoice.paymentStatus || 'Pending'}`);
    doc.moveDown();

    doc.fontSize(12).text('Items', { underline: true });
    doc.moveDown(0.5);
    const items = Array.isArray(salesOrder?.items) ? salesOrder.items : [];
    if (items.length === 0) {
      doc.fontSize(10).text('No line items available');
    } else {
      items.forEach((item, index) => {
        const lineAmount = Number(item.quantity || 0) * Number(item.unitPrice || 0);
        doc
          .fontSize(10)
          .text(
            `${index + 1}. ${item.productName || 'Product'} | Qty: ${Number(item.quantity || 0)} | Unit: ${Number(item.unitPrice || 0)} | Amount: ${lineAmount}`
          );
      });
    }

    doc.moveDown();
    doc.fontSize(12).text(`Total Amount: ${Number(invoice.amount || salesOrder?.totalAmount || 0)}`, { align: 'right' });
    doc.end();
    return;
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
