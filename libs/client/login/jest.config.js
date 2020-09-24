module.exports = {
  name: 'client-login',
  preset: '../../../jest.config.js',
  coverageDirectory: '../../../coverage/libs/client/login',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js'
  ],
  coverageThreshold: {
    global: {
      functions: 50,
      branches: 70,
      lines: 70,
      statements: 70
    }
  }
};
