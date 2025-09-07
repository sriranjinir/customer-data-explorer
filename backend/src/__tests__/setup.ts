// Jest setup file for backend tests
// This file runs before each test file

// Mock console methods to avoid noise in test output (optional)
// Uncomment the lines below if you want to suppress console output during tests
/*
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};
*/

// Global test setup can go here
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
});
