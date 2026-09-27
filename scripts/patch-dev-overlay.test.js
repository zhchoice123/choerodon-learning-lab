const { test, describe, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { patchWebpackDevServer } = require('./patch-dev-overlay');

describe('patch-dev-overlay', () => {
  let tmpDir;
  let tmpFile;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'patch-overlay-test-'));
    tmpFile = path.join(tmpDir, 'webpackDevServer.config.js');
  });

  afterEach(() => {
    if (tmpDir && fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });

  test('在临时文件上验证替换正确', () => {
    const originalContent = `
      overlay: {
        errors: true,
        warnings: false,
      },
    `;
    fs.writeFileSync(tmpFile, originalContent, 'utf8');

    const result = patchWebpackDevServer(tmpFile);
    assert.strictEqual(result.success, true);
    assert.strictEqual(result.reason, 'PATCHED');

    const updated = fs.readFileSync(tmpFile, 'utf8');
    assert.match(updated, /runtimeErrors:\s*false/);
    assert.match(updated, /errors:\s*true/);
    assert.match(updated, /warnings:\s*false/);
  });

  test('重复执行结果一致（幂等性）', () => {
    const originalContent = `
      overlay: {
        errors: true,
        warnings: false,
      },
    `;
    fs.writeFileSync(tmpFile, originalContent, 'utf8');

    const result1 = patchWebpackDevServer(tmpFile);
    assert.strictEqual(result1.success, true);
    assert.strictEqual(result1.reason, 'PATCHED');
    const contentAfterFirst = fs.readFileSync(tmpFile, 'utf8');

    const result2 = patchWebpackDevServer(tmpFile);
    assert.strictEqual(result2.success, true);
    assert.strictEqual(result2.reason, 'ALREADY_PATCHED');
    const contentAfterSecond = fs.readFileSync(tmpFile, 'utf8');

    assert.strictEqual(contentAfterFirst, contentAfterSecond);
  });

  test('找不到目标时不崩溃（内容不匹配）', () => {
    const unrelatedContent = `
      module.exports = {
        otherConfig: 123,
      };
    `;
    fs.writeFileSync(tmpFile, unrelatedContent, 'utf8');

    const result = patchWebpackDevServer(tmpFile);
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.reason, 'TARGET_NOT_FOUND');
    assert.strictEqual(fs.readFileSync(tmpFile, 'utf8'), unrelatedContent);
  });

  test('文件不存在时不崩溃', () => {
    const nonExistentFile = path.join(tmpDir, 'not-exists.js');
    const result = patchWebpackDevServer(nonExistentFile);
    assert.strictEqual(result.success, false);
    assert.strictEqual(result.reason, 'FILE_NOT_FOUND');
  });
});
