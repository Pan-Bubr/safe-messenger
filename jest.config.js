const projectName = process.argv[3];
const outputName = `${projectName}.xml`;

module.exports = {
  testMatch: ['**/+(*.)+(spec|test).+(ts|js)?(x)'],
  transform: {
    '^.+\\.(ts|js|html)$': 'ts-jest'
  },
  resolver: '@nrwl/jest/plugins/resolver',
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageReporters: ['html'],
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputName,
        suiteName: projectName,
        outputDirectory: './junit'
      }
    ]
  ],
  collectCoverage: true,
  coverageThreshold: {
    global: {
      functions: 70,
      branches: 70,
      lines: 70,
      statements: 70
    }
  },
  coveragePathIgnorePatterns: ['module.ts', 'entity.ts']
};
