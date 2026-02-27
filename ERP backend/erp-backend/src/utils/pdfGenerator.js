const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

exports.generateInvoicePDF = (order) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const dir = path.join(__dirname, '../../uploads/invoices');
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      
      const filePath = path.join(dir, `invoice_${order._id}.pdf`);
      const stream = fs.createWriteStream(filePath);
      
      doc.pipe(stream);
      
      doc.fontSize(25).text('INVOICE', { align: 'center' });
      doc.moveDown();
      doc.fontSize(14).text(`Order ID: ${order._id}`);
      doc.text(`Total Amount: $${order.totalAmount}`);
      doc.text(`Status: ${order.status}`);
      doc.text(`Date: ${new Date().toLocaleDateString()}`);
      
      doc.end();
      
      stream.on('finish', () => resolve(filePath));
      stream.on('error', reject);
    } catch (error) {
      reject(error);
    }
  });
};