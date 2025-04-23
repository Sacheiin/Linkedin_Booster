import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

describe('MongoDB Connection', () => {
  let mongoServer: MongoMemoryServer;

  const connectWithRetry = async (uri: string, attempts = 3, delay = 1000) => {
    for (let i = 0; i < attempts; i++) {
      try {
        await mongoose.connect(uri, {
          serverSelectionTimeoutMS: 5000,
          heartbeatFrequencyMS: 30000
        });
        console.log('MongoDB connected successfully');
        return;
      } catch (err) {
        console.error(`Connection attempt ${i + 1} failed:`, err);
        if (i < attempts - 1) await new Promise(res => setTimeout(res, delay));
      }
    }
    throw new Error(`Failed to connect after ${attempts} attempts`);
  };

  beforeAll(async () => {
    jest.setTimeout(45000);
    mongoServer = await MongoMemoryServer.create();
    await connectWithRetry(mongoServer.getUri());
  });

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  test('should establish successful connection', () => {
    expect(mongoose.connection.readyState).toBe(1);
  });
});