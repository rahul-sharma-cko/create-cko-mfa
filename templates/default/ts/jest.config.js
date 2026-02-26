module.exports = {
  testEnvironment: 'jsdom',
  modulePathIgnorePatterns: ['<rootDir>/dist'],
  globalSetup: './jestGlobalSetup.js',
  setupFilesAfterEnv: ['./setupTests.ts'],
  moduleDirectories: ['<rootDir>/src', 'node_modules'],
  moduleNameMapper: {
    '\\.(jpg|ico|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/__mocks__/fileMock.js',
    '\\.(css|less)$': '<rootDir>/__mocks__/fileMock.js',
  },
  transformIgnorePatterns: ['/node_modules/(?!.*@cko)'],
  testTimeout: 5000,
  automock: false,
  resetMocks: false,
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/index.ts',
    '!src/config.ts',
    '!src/constants/**/*.{js,jsx,ts,tsx}',
    '!src/types/**/*.ts',
    '!<rootDir>/node_modules/',
    '!<rootDir>/coverage/**/*',
  ],
  watchPathIgnorePatterns: ['coverage'],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
};
