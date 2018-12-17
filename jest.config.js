module.exports = {
  setupTestFrameworkScriptFile: './setup-tests.js',
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
  roots: ['<rootDir>packages'],
  testMatch: ['**/__tests__/*.+(ts|tsx|js)'],
  collectCoverageFrom: ['**/src/**/*.js', '**/src/**/*.ts', '**/src/**/*.tsx'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
};
