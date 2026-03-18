const customerService = require('../src/services/customerService');
const supplierService = require('../src/services/supplierService');
const productService = require('../src/services/productService');
const Customer = require('../src/models/Customer');
const Supplier = require('../src/models/Supplier');
const Product = require('../src/models/Product');

describe('Service layer', () => {
  it('lists customers with search and pagination', async () => {
    await Customer.create({ name: 'Alpha', email: 'alpha@x.com' });
    await Customer.create({ name: 'Beta', email: 'beta@x.com' });

    const { items, meta } = await customerService.listCustomers({ page: 1, limit: 1, search: 'Alpha' });
    expect(items.length).toBe(1);
    expect(meta.total).toBeGreaterThan(0);
  });

  it('creates and updates suppliers', async () => {
    const supplier = await supplierService.createSupplier({ name: 'Sup', email: 'sup@x.com' });
    expect(supplier.name).toBe('Sup');

    const updated = await supplierService.updateSupplier(supplier._id, { phone: '123' });
    expect(updated.phone).toBe('123');
  });

  it('creates and deletes products', async () => {
    const product = await productService.createProduct({ name: 'Prod', sku: 'P1', price: 10, stockQuantity: 2 });
    expect(product.sku).toBe('P1');

    const deleted = await productService.deleteProduct(product._id);
    expect(deleted._id.toString()).toBe(product._id.toString());
  });
});
