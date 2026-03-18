const fs = require('fs');
const path = require('path');
const { success, error } = require('../src/utils/response');
const { normalizeRole, canonicalizeRole, hasRole } = require('../src/utils/roles');
const { getPaginationOptions, buildSearchFilter, buildMeta } = require('../src/utils/pagination');
const { resolveCustomerById, resolveSupplier, resolveProduct } = require('../src/utils/orderResolvers');
const { generateInvoicePDF } = require('../src/utils/pdfGenerator');
const Customer = require('../src/models/Customer');
const Supplier = require('../src/models/Supplier');
const Product = require('../src/models/Product');

describe('Utils', () => {
  it('response utils shape payload', () => {
    const res = { status: jest.fn().mockReturnValue({ json: jest.fn() }) };
    const jsonSpy = res.status().json;
    success(res, { ok: true }, 'done', 201, { page: 1 });
    expect(res.status).toHaveBeenCalledWith(201);

    error(res, 'fail', 400);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(jsonSpy).toHaveBeenCalled();
  });

  it('roles utility normalizes and checks', () => {
    expect(normalizeRole(' Admin ')).toBe('admin');
    expect(canonicalizeRole('sales')).toBe('Sales');
    expect(hasRole('Admin', ['Sales', 'Admin'])).toBe(true);
  });

  it('pagination utilities build metadata and filters', () => {
    const { page, limit, skip, search } = getPaginationOptions({ page: '2', limit: '5', search: 'X' });
    expect(page).toBe(2);
    expect(limit).toBe(5);
    expect(skip).toBe(5);
    expect(search).toBe('X');

    const filter = buildSearchFilter('foo', ['name']);
    expect(filter.$or.length).toBe(1);

    const meta = buildMeta(22, 2, 5);
    expect(meta.totalPages).toBe(5);
  });

  it('order resolvers resolve entities and throw on invalid', async () => {
    const customer = await Customer.create({ name: 'C1', email: 'c1@test.com' });
    const supplier = await Supplier.create({ name: 'S1', email: 's1@test.com' });
    const product = await Product.create({ name: 'P1', sku: 'SKU1', price: 10, stockQuantity: 1 });

    const resolvedCustomer = await resolveCustomerById(customer._id.toString());
    expect(resolvedCustomer.email).toBe('c1@test.com');

    const resolvedSupplier = await resolveSupplier('s1@test.com');
    expect(resolvedSupplier.name).toBe('S1');

    const resolvedProduct = await resolveProduct('SKU1');
    expect(resolvedProduct.name).toBe('P1');

    await expect(resolveCustomerById('bad')).rejects.toThrow('Invalid Customer ID');
  });

  it('pdf generator writes a file', async () => {
    const order = { _id: 'order1', totalAmount: 50, status: 'Completed' };
    const filePath = await generateInvoicePDF(order);
    expect(fs.existsSync(filePath)).toBe(true);
    fs.unlinkSync(filePath);
    // Cleanup directory if empty
    const dir = path.dirname(filePath);
    if (fs.existsSync(dir) && fs.readdirSync(dir).length === 0) {
      fs.rmdirSync(dir, { recursive: true });
    }
  });
});
