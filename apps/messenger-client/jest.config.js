module.exports = {
  name: 'messenger-client',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/apps/messenger-client',
  snapshotSerializers: [
    'jest-preset-angular/build/AngularNoNgAttributesSnapshotSerializer.js',
    'jest-preset-angular/build/AngularSnapshotSerializer.js',
    'jest-preset-angular/build/HTMLCommentSerializer.js'
  ]
};
