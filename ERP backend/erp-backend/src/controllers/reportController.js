const ExcelJS = require('exceljs');
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

const streamXlsx = async (res, fileName, worksheetName, headers, cursor, mapDocumentToRow) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(worksheetName);
  worksheet.addRow(headers);

  for await (const doc of cursor) {
    worksheet.addRow(mapDocumentToRow(doc));
  }

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  await workbook.xlsx.write(res);
  res.end();
};

exports.exportSalesCsv = async (req, res) => {
  try {
    const format = (req.query.format || 'csv').toLowerCase();
    if (!['csv', 'xlsx'].includes(format)) {
      return error(res, 'Only csv or xlsx format is supported', 400);
    }

    const cursor = SalesOrder.find()
      .select('_id customerId customerName totalAmount status createdAt updatedAt')
      .sort({ createdAt: -1 })
      .lean()
      .cursor();

    const headers = ['orderId', 'customerId', 'customerName', 'status', 'totalAmount', 'createdAt', 'updatedAt'];
    const mapper = (order) => [
      String(order._id || ''),
      String(order.customerId || ''),
      String(order.customerName || ''),
      String(order.status || ''),
      Number(order.totalAmount || 0),
      order.createdAt ? new Date(order.createdAt).toISOString() : '',
      order.updatedAt ? new Date(order.updatedAt).toISOString() : ''
    ];

    if (format === 'xlsx') {
      return streamXlsx(res, 'sales-report.xlsx', 'Sales', headers, cursor, mapper);
    }

    return streamCsv(res, 'sales-report.csv', headers, cursor, mapper);
  } catch (requestError) {
    if (!res.headersSent) {
      return error(res, requestError.message, 500);
    }
    return res.end();
  }
};

exports.exportInvoicesCsv = async (req, res) => {
  try {
    const format = (req.query.format || 'csv').toLowerCase();
    if (!['csv', 'xlsx'].includes(format)) {
      return error(res, 'Only csv or xlsx format is supported', 400);
    }

    const cursor = Invoice.find()
      .select('_id salesOrderId amount paymentStatus createdAt updatedAt')
      .sort({ createdAt: -1 })
      .lean()
      .cursor();

    const headers = ['invoiceId', 'salesOrderId', 'amount', 'paymentStatus', 'createdAt', 'updatedAt'];
    const mapper = (invoice) => [
      String(invoice._id || ''),
      String(invoice.salesOrderId || ''),
      Number(invoice.amount || 0),
      String(invoice.paymentStatus || 'Pending'),
      invoice.createdAt ? new Date(invoice.createdAt).toISOString() : '',
      invoice.updatedAt ? new Date(invoice.updatedAt).toISOString() : ''
    ];

    if (format === 'xlsx') {
      return streamXlsx(res, 'invoices-report.xlsx', 'Invoices', headers, cursor, mapper);
    }

    return streamCsv(res, 'invoices-report.csv', headers, cursor, mapper);
  } catch (requestError) {
    if (!res.headersSent) {
      return error(res, requestError.message, 500);
    }
    return res.end();
  }
};
