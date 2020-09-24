module.exports = {
  name: 'client-crypto',
  preset: '../../../jest.config.js',
  coverageDirectory: '../../../coverage/libs/client/crypto',
  coverageThreshold: {
    global: {
      functions: 0,
      branches: 0,
      lines: 0,
      statements: 0
    }
  },
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js'
  ]
};
