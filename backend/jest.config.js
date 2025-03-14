module.exports = {
  // Test environment for Node.js applications
  testEnvironment: 'node',
  
  // Test file patterns
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  
  // Directories to ignore during test discovery
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  
  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!**/node_modules/**',
    '!**/vendor/**'
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  
  // Setup files
  setupFiles: ['./tests/setup.js'],
  
  // Timeouts and limits
  testTimeout: 10000,
  maxConcurrency: 5,
  
  // Mock configurations
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  
  // Verbose output for more details
  verbose: true,
  
  // Display the individual test results with console.logs
  reporters: ['default', 'jest-junit']
};

/**
 * Jest configuration for backend testing
 */
module.exports = {
  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,
  
  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',
  
  // An array of glob patterns indicating a set of files for which coverage information should be collected
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!**/node_modules/**',
    '!**/vendor/**',
    '!**/dist/**',
  ],
  
  // The test environment that will be used for testing
  testEnvironment: 'node',
  
  // The glob patterns Jest uses to detect test files
  testMatch: [
    '**/tests/**/*.test.js',
    '**/?(*.)+(spec|test).js',
  ],
  
  // An array of regexp pattern strings that are matched against all test paths, matched tests are skipped
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
  ],
  
  // A list of paths to directories that Jest should use to search for files in
  roots: [
    '<rootDir>/src',
    '<rootDir>/tests',
  ],
  
  // The paths to modules that run some code to configure or set up the testing environment
  setupFiles: ['<rootDir>/tests/setup.js'],
  
  // Timeout configuration (in milliseconds)
  testTimeout: 30000,
  
  // Automatically clear mock calls and instances between every test
  clearMocks: true,
  
  // Indicates whether each individual test should be reported during the run
  verbose: true,
  
  // Mock configurations
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};

