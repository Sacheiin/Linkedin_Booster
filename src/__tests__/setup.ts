// Jest setup file
// This file is run before each test file
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Set default environment variables for testing if not provided
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/test';
process.env.PORT = process.env.PORT || '3000';
process.env.API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

// Increase Jest timeout for all tests
jest.setTimeout(15000);

// Chrome API mocking handled by jest-webextension-mock

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});