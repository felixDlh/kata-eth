/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testTimeout: 300000000,
  transform: {
    '\\.bin$': 'jest-raw-loader',
    '\\.abi$': 'jest-raw-loader'
  },
};