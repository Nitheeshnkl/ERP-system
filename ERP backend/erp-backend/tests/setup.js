const mongoose = require('mongoose');
const { MongoMemoryReplSet } = require('mongodb-memory-server');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';

let mongoReplicaSet;

beforeAll(async () => {
  mongoReplicaSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  process.env.MONGODB_URI = mongoReplicaSet.getUri();
  await mongoose.connect(process.env.MONGODB_URI);
});

afterEach(async () => {
  const collections = await mongoose.connection.db.collections();
  for (const collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.close();
  if (mongoReplicaSet) {
    await mongoReplicaSet.stop();
  }
});
