
describe('Scripts', () => {
  afterEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('createSuperAdmin creates admin if not exists', async () => {
    jest.doMock('../src/models/User', () => ({
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ _id: '1' }),
    }));

    const createSuperAdmin = require('../utils/createSuperAdmin');
    process.env.ADMIN_EMAIL = 'admin@test.com';
    process.env.ADMIN_PASSWORD = 'Pass123!';
    process.env.ADMIN_NAME = 'Admin';

    await createSuperAdmin();
    const User = require('../src/models/User');
    expect(User.create).toHaveBeenCalled();
  });

  it('seedDatabase runs expected model operations', async () => {
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});
    const connectMock = jest.fn().mockResolvedValue();
    const disconnectMock = jest.fn().mockResolvedValue();

    jest.doMock('mongoose', () => ({
      connect: connectMock,
      disconnect: disconnectMock,
    }));

    const makeModelMock = () => ({
      deleteMany: jest.fn().mockResolvedValue(),
      insertMany: jest.fn().mockImplementation(async (docs = []) =>
        docs.map((doc, index) => ({ ...doc, _id: doc._id || `id${index}` }))
      ),
    });

    const userMock = makeModelMock();
    const productMock = makeModelMock();
    const customerMock = makeModelMock();
    const supplierMock = makeModelMock();
    const salesOrderMock = makeModelMock();
    const purchaseOrderMock = makeModelMock();
    const grnMock = makeModelMock();
    const invoiceMock = makeModelMock();

    jest.doMock('../src/models/User', () => userMock);
    jest.doMock('../src/models/Product', () => productMock);
    jest.doMock('../src/models/Customer', () => customerMock);
    jest.doMock('../src/models/Supplier', () => supplierMock);
    jest.doMock('../src/models/SalesOrder', () => salesOrderMock);
    jest.doMock('../src/models/PurchaseOrder', () => purchaseOrderMock);
    jest.doMock('../src/models/GRN', () => grnMock);
    jest.doMock('../src/models/Invoice', () => invoiceMock);

    process.env.MONGO_URI = 'mongodb://test';

    jest.isolateModules(() => {
      require('../scripts/seedDatabase');
    });
    await new Promise((resolve) => setImmediate(resolve));

    expect(connectMock).toHaveBeenCalled();
    expect(userMock.deleteMany).toHaveBeenCalled();
    expect(userMock.insertMany).toHaveBeenCalled();
    expect(productMock.insertMany).toHaveBeenCalled();
    expect(customerMock.insertMany).toHaveBeenCalled();
    expect(supplierMock.insertMany).toHaveBeenCalled();
    expect(salesOrderMock.insertMany).toHaveBeenCalled();
    expect(purchaseOrderMock.insertMany).toHaveBeenCalled();
    expect(grnMock.insertMany).toHaveBeenCalled();
    expect(invoiceMock.insertMany).toHaveBeenCalled();

    exitSpy.mockRestore();
  });
});
