/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/src/test/setupFile.ts'],
  roots: ['<rootDir>/src/test'],
  testMatch: ['**/*.test.ts']
}
