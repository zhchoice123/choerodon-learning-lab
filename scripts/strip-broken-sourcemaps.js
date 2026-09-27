// mutationobserver-shim (a choerodon-ui dependency) ships a source map that
// references a MutationObserver.js it doesn't publish, which makes CRA's
// source-map-loader warn on every build. Strip the dangling reference.
const fs = require('fs');
const path = require('path');

const files = ['mutationobserver-shim/dist/mutationobserver.min.js'];

for (const file of files) {
  const fullPath = path.join(__dirname, '..', 'node_modules', file);
  if (!fs.existsSync(fullPath)) continue;
  const source = fs.readFileSync(fullPath, 'utf8');
  const stripped = source.replace(/\n?\/\/# sourceMappingURL=.*\s*$/, '\n');
  if (stripped !== source) fs.writeFileSync(fullPath, stripped);
}
