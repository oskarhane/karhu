module.exports = {
  setupFilesAfterEnv: ['./setup-tests.js'],
  clearMocks: true,
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
  globals: {
    'ts-jest': {
      extends: './babel.config.js',
    },
  },
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  notify: false,
  notifyMode: 'always',
  testMatch: ['**/__tests__/*.+(ts|tsx|js)'],
  collectCoverageFrom: ['**/src/**/*.js', '**/src/**/*.ts', '**/src/**/*.tsx', '!**/playground/**/*.*'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
};
