import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import contentRoutes from './routes/content';

dotenv.config();

export const app = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.API_BASE_URL }));
app.use(express.json());

// Set strictQuery to false to prepare for Mongoose 7
mongoose.set('strictQuery', false);

// MongoDB connection
const connectDB = async () => {
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 2000;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (process.env.NODE_ENV === 'test' && process.env.MOCK_DB === 'true') {
        console.log('Using mock database for testing');
        return;
      }

      if (!process.env.MONGODB_URI) {
        throw new Error('MongoDB URI missing in environment variables');
      }

      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
        heartbeatFrequencyMS: 10000,
        retryWrites: true,
        appName: 'LinkedInBooster'
      });
      
      mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err);
      });

      mongoose.connection.on('disconnected', () => {
        console.log('MongoDB disconnected');
      });

      console.log('MongoDB connected successfully');
      return;
    } catch (err) {
      console.error(`Connection attempt ${attempt} failed:`, err);
      if (attempt === MAX_RETRIES) {
        console.error('Maximum connection attempts reached');
        if (process.env.NODE_ENV !== 'test') process.exit(1);
        throw err;
      }
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    }
  }
};

// Initialize database connection
connectDB();

// Routes
app.use('/api/content', contentRoutes);

const PORT = process.env.PORT || 3000;
export default app;

export const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));