import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

export let mongoServer: MongoMemoryServer;

export const connectDB = async (): Promise<void> => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
};

export const disconnectDB = async (): Promise<void> => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
};