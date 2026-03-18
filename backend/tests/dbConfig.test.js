
describe('DB config', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('connects and syncs supplier indexes', async () => {
    jest.resetModules();

    const connectMock = jest.fn().mockResolvedValue({ connection: { host: 'localhost' } });
    jest.doMock('mongoose', () => ({
      connect: connectMock,
    }));

    jest.doMock('../src/models/User', () => ({
      findOne: jest.fn(),
      create: jest.fn(),
    }));

    jest.doMock('../src/models/DemoMetadata', () => ({
      findOne: jest.fn(),
      create: jest.fn(),
      updateOne: jest.fn(),
    }));

    const dropIndex = jest.fn();
    const syncIndexes = jest.fn();
    const indexes = jest.fn().mockResolvedValue([{ name: 'email_1' }]);

    jest.doMock('../src/models/Supplier', () => ({
      collection: { indexes, dropIndex },
      syncIndexes,
    }));

    const connectDB = require('../src/config/db');

    process.env.ENABLE_DEMO_SEEDING = 'false';
    process.env.MONGODB_URI = 'mongodb://test';

    const conn = await connectDB();
    expect(connectMock).toHaveBeenCalled();
    expect(indexes).toHaveBeenCalled();
    expect(dropIndex).toHaveBeenCalledWith('email_1');
    expect(syncIndexes).toHaveBeenCalled();
    expect(conn.connection.host).toBe('localhost');
  });

  it('seeds demo data when enabled', async () => {
    jest.resetModules();

    const connectMock = jest.fn().mockResolvedValue({ connection: { host: 'localhost' } });
    jest.doMock('mongoose', () => ({
      connect: connectMock,
    }));

    const userMock = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ _id: '1' }),
    };
    const demoMock = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ _id: '1' }),
      updateOne: jest.fn().mockResolvedValue({}),
    };
    const supplierMock = {
      collection: { indexes: jest.fn().mockResolvedValue([]), dropIndex: jest.fn() },
      syncIndexes: jest.fn().mockResolvedValue(),
    };

    jest.doMock('../src/models/User', () => userMock);
    jest.doMock('../src/models/DemoMetadata', () => demoMock);
    jest.doMock('../src/models/Supplier', () => supplierMock);

    process.env.ENABLE_DEMO_SEEDING = 'true';
    process.env.DEMO_ADMIN_EMAIL = 'demo@test.com';
    process.env.DEMO_ADMIN_PASSWORD = 'Demo123';
    process.env.MONGODB_URI = 'mongodb://test';

    const connectDB = require('../src/config/db');
    await connectDB();

    expect(connectMock).toHaveBeenCalled();
    expect(userMock.create).toHaveBeenCalled();
    expect(demoMock.create).toHaveBeenCalled();
    expect(supplierMock.syncIndexes).toHaveBeenCalled();
  });

  it('handles missing demo creds and skips metadata seed', async () => {
    jest.resetModules();

    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    const connectMock = jest.fn().mockResolvedValue({ connection: { host: 'localhost' } });
    jest.doMock('mongoose', () => ({
      connect: connectMock,
    }));

    const userMock = {
      findOne: jest.fn(),
      create: jest.fn(),
    };
    const demoMock = {
      findOne: jest.fn(),
      create: jest.fn(),
      updateOne: jest.fn(),
    };
    const supplierMock = {
      collection: { indexes: jest.fn().mockResolvedValue([]), dropIndex: jest.fn() },
      syncIndexes: jest.fn().mockResolvedValue(),
    };

    jest.doMock('../src/models/User', () => userMock);
    jest.doMock('../src/models/DemoMetadata', () => demoMock);
    jest.doMock('../src/models/Supplier', () => supplierMock);

    process.env.ENABLE_DEMO_SEEDING = 'true';
    delete process.env.DEMO_ADMIN_EMAIL;
    delete process.env.DEMO_ADMIN_PASSWORD;
    process.env.MONGODB_URI = 'mongodb://test';

    const connectDB = require('../src/config/db');
    await connectDB();

    expect(warnSpy).toHaveBeenCalled();
    expect(userMock.findOne).not.toHaveBeenCalled();
    expect(demoMock.findOne).not.toHaveBeenCalled();
    expect(supplierMock.syncIndexes).toHaveBeenCalled();
  });

  it('updates existing demo admin and metadata, logs index sync warnings', async () => {
    jest.resetModules();

    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const connectMock = jest.fn().mockResolvedValue({ connection: { host: 'localhost' } });
    jest.doMock('mongoose', () => ({
      connect: connectMock,
    }));

    const existingUser = {
      name: 'Old',
      role: 'Employee',
      email: 'old@test.com',
      password: 'Old123',
      save: jest.fn().mockResolvedValue({}),
    };

    const userMock = {
      findOne: jest.fn().mockResolvedValue(existingUser),
      create: jest.fn(),
    };
    const demoMock = {
      findOne: jest.fn().mockResolvedValue({ _id: 'meta' }),
      create: jest.fn(),
      updateOne: jest.fn().mockResolvedValue({}),
    };
    const supplierMock = {
      collection: { indexes: jest.fn().mockRejectedValue(new Error('index fail')), dropIndex: jest.fn() },
      syncIndexes: jest.fn(),
    };

    jest.doMock('../src/models/User', () => userMock);
    jest.doMock('../src/models/DemoMetadata', () => demoMock);
    jest.doMock('../src/models/Supplier', () => supplierMock);

    process.env.ENABLE_DEMO_SEEDING = 'true';
    process.env.DEMO_ADMIN_EMAIL = 'demo@test.com';
    process.env.DEMO_ADMIN_PASSWORD = 'Demo123';
    process.env.MONGODB_URI = 'mongodb://test';

    const connectDB = require('../src/config/db');
    await connectDB();

    expect(userMock.findOne).toHaveBeenCalled();
    expect(existingUser.save).toHaveBeenCalled();
    expect(demoMock.updateOne).toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledWith('Supplier index sync warning:', 'index fail');
  });

  it('bubbles connect errors', async () => {
    jest.resetModules();

    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const connectMock = jest.fn().mockRejectedValue(new Error('boom'));
    jest.doMock('mongoose', () => ({
      connect: connectMock,
    }));

    jest.doMock('../src/models/User', () => ({
      findOne: jest.fn(),
      create: jest.fn(),
    }));
    jest.doMock('../src/models/DemoMetadata', () => ({
      findOne: jest.fn(),
      create: jest.fn(),
      updateOne: jest.fn(),
    }));
    jest.doMock('../src/models/Supplier', () => ({
      collection: { indexes: jest.fn(), dropIndex: jest.fn() },
      syncIndexes: jest.fn(),
    }));

    process.env.MONGODB_URI = 'mongodb://test';
    const connectDB = require('../src/config/db');

    await expect(connectDB()).rejects.toThrow('boom');
    expect(errorSpy).toHaveBeenCalledWith('MongoDB connection error: boom');
  });
});
