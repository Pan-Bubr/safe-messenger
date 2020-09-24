module.exports = {
  name: 'client-chat',
  preset: '../../../jest.config.js',
  coverageDirectory: '../../../coverage/libs/client/chat',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js'
  ],
  coverageThreshold: {
    global: {
      functions: 60,
      branches: 70,
      lines: 70,
      statements: 70
    }
  },
};
