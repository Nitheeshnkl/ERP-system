const request = require('supertest');
const fs = require('fs');
const path = require('path');
const app = require('../app');
const Customer = require('../src/models/Customer');
const SalesOrder = require('../src/models/SalesOrder');
const Invoice = require('../src/models/Invoice');
const { createUser, loginAndGetToken } = require('./helpers');

describe('Invoices API', () => {
  it('lists invoices and updates status', async () => {
    const customer = await Customer.create({ name: 'CustInv', email: 'c@inv.com' });
    const order = await SalesOrder.create({
      customerId: customer._id,
      customerName: customer.name,
      items: [],
      totalAmount: 100,
      status: 'Pending',
    });

    const pdfDir = path.join(__dirname, 'tmp');
    fs.mkdirSync(pdfDir, { recursive: true });
    const pdfPath = path.join(pdfDir, 'invoice.pdf');
    fs.writeFileSync(pdfPath, 'pdf');

    const invoice = await Invoice.create({
      salesOrderId: order._id,
      amount: 100,
      pdfPath,
      paymentStatus: 'Pending',
    });

    const user = await createUser({ email: 'inv@test.com', role: 'Sales' });
    const token = await loginAndGetToken(app, { email: user.email, password: 'Pass123!' });

    const list = await request(app)
      .get('/api/invoices')
      .set('Authorization', `Bearer ${token}`);
    expect(list.statusCode).toBe(200);

    const update = await request(app)
      .patch(`/api/invoices/${invoice._id}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'Paid' });
    expect(update.statusCode).toBe(200);
    expect(update.body.data.paymentStatus).toBe('Paid');

    const pdf = await request(app)
      .get(`/api/invoices/${invoice._id}/pdf`)
      .set('Authorization', `Bearer ${token}`);
    expect(pdf.statusCode).toBe(200);
    expect(pdf.headers['content-type']).toMatch(/pdf/);
  });

  it('generates PDF when file missing', async () => {
    const customer = await Customer.create({ name: 'CustPdf', email: 'pdf@inv.com' });
    const product = await (require('../src/models/Product')).create({ name: 'PdfItem', sku: 'PDF-1', price: 10, stockQuantity: 5 });
    const order = await SalesOrder.create({
      customerId: customer._id,
      customerName: customer.name,
      items: [{ productId: product._id, productName: product.name, quantity: 1, unitPrice: 10 }],
      totalAmount: 10,
      status: 'Pending',
    });

    const invoice = await Invoice.create({
      salesOrderId: order._id,
      amount: 10,
      pdfPath: '/tmp/does-not-exist.pdf',
      paymentStatus: 'Pending',
    });

    const user = await createUser({ email: 'inv2@test.com', role: 'Sales' });
    const token = await loginAndGetToken(app, { email: user.email, password: 'Pass123!' });

    const pdf = await request(app)
      .get(`/api/invoices/${invoice._id}/pdf`)
      .set('Authorization', `Bearer ${token}`);
    expect(pdf.statusCode).toBe(200);
    expect(pdf.headers['content-type']).toMatch(/pdf/);
  });
});
