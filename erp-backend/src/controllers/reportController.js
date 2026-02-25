const SalesOrder = require('../models/SalesOrder');
const Invoice = require('../models/Invoice');
const { error } = require('../utils/response');

const escapeCsv = (value) => {
  if (value === null || value === undefined) return '';
  const stringValue = String(value);
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

const streamCsv = async (res, fileName, headers, cursor, mapDocumentToRow) => {
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  res.write(`${headers.join(',')}\n`);

  for await (const doc of cursor) {
    const row = mapDocumentToRow(doc).map(escapeCsv).join(',');
    res.write(`${row}\n`);
  }

  res.end();
};

exports.exportSalesCsv = async (req, res) => {
  try {
    if ((req.query.format || '').toLowerCase() !== 'csv') {
      return error(res, 'Only csv format is supported', 400);
    }

    const cursor = SalesOrder.find()
      .select('_id customerId customerName totalAmount status createdAt updatedAt')
      .sort({ createdAt: -1 })
      .lean()
      .cursor();

    await streamCsv(
      res,
      'sales-report.csv',
      ['orderId', 'customerId', 'customerName', 'status', 'totalAmount', 'createdAt', 'updatedAt'],
      cursor,
      (order) => [
        order._id,
        order.customerId || '',
        order.customerName || '',
        order.status || '',
        order.totalAmount || 0,
        order.createdAt ? new Date(order.createdAt).toISOString() : '',
        order.updatedAt ? new Date(order.updatedAt).toISOString() : ''
      ]
    );
  } catch (requestError) {
    if (!res.headersSent) {
      return error(res, requestError.message, 500);
    }
    return res.end();
  }
};

exports.exportInvoicesCsv = async (req, res) => {
  try {
    if ((req.query.format || '').toLowerCase() !== 'csv') {
      return error(res, 'Only csv format is supported', 400);
    }

    const cursor = Invoice.find()
      .select('_id salesOrderId amount paymentStatus createdAt updatedAt')
      .sort({ createdAt: -1 })
      .lean()
      .cursor();

    await streamCsv(
      res,
      'invoices-report.csv',
      ['invoiceId', 'salesOrderId', 'amount', 'paymentStatus', 'createdAt', 'updatedAt'],
      cursor,
      (invoice) => [
        invoice._id,
        invoice.salesOrderId || '',
        invoice.amount || 0,
        invoice.paymentStatus || 'Pending',
        invoice.createdAt ? new Date(invoice.createdAt).toISOString() : '',
        invoice.updatedAt ? new Date(invoice.updatedAt).toISOString() : ''
      ]
    );
  } catch (requestError) {
    if (!res.headersSent) {
      return error(res, requestError.message, 500);
    }
    return res.end();
  }
};
