import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true, 
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/controllers/**/*.ts',
    'src/middlewares/**/*.ts'
  ],
};

export default config;