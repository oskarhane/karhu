const base = require('../../jest.config.base.js');

module.exports = {
  ...base,
  setupFilesAfterEnv: ['../../setup-tests.js'],
  name: 'karhu',
  displayName: 'karhu',
};
