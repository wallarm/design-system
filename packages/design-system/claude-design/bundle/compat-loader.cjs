const { require: tsxRequire } = require('tsx/cjs/api');
const { resolve } = require('node:path');
const { transformCanvasSource } = tsxRequire('./transform-source.ts', __filename);

module.exports = function canvasCompatLoader(source) {
  for (const dependency of ['transform-source.ts', 'ref-components.ts', '../previews/global-imports.ts'])
    this.addDependency(resolve(__dirname, dependency));
  const done = this.async();
  transformCanvasSource(source, this.resourcePath, this.getOptions()).then(
    result => done(null, result),
    error => done(error),
  );
};
