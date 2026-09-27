const fs = require('fs');
const path = require('path');

const DEFAULT_TARGET = path.join(
  __dirname,
  '..',
  'node_modules',
  'react-scripts',
  'config',
  'webpackDevServer.config.js'
);

function patchWebpackDevServer(filePath = DEFAULT_TARGET) {
  if (!fs.existsSync(filePath)) {
    console.warn(`[patch-dev-overlay] 文件不存在: ${filePath}，跳过。`);
    return { success: false, reason: 'FILE_NOT_FOUND' };
  }

  const content = fs.readFileSync(filePath, 'utf8');

  // Check if runtimeErrors is already configured
  if (/overlay:\s*\{[^}]*runtimeErrors:\s*false/.test(content)) {
    console.log('[patch-dev-overlay] client.overlay 已配置 runtimeErrors: false，无需重复修改。');
    return { success: true, reason: 'ALREADY_PATCHED' };
  }

  // Target pattern: overlay: { errors: true, warnings: false } with arbitrary whitespace
  const overlayPattern = /(overlay:\s*\{[\s\S]*?errors:\s*true,[\s\S]*?warnings:\s*false,?)(\s*\})/;

  if (!overlayPattern.test(content)) {
    console.warn(`[patch-dev-overlay] 在 ${filePath} 中未找到可替换的 client.overlay 配置，跳过。`);
    return { success: false, reason: 'TARGET_NOT_FOUND' };
  }

  const updatedContent = content.replace(overlayPattern, (match, p1, p2) => {
    const indentMatch = p1.match(/\n(\s*)warnings:/);
    const indent = indentMatch ? indentMatch[1] : '        ';
    return `${p1}\n${indent}runtimeErrors: false,${p2}`;
  });

  fs.writeFileSync(filePath, updatedContent, 'utf8');
  console.log(`[patch-dev-overlay] 成功更新 ${filePath}：client.overlay 已禁用 runtimeErrors。`);
  return { success: true, reason: 'PATCHED' };
}

if (require.main === module) {
  patchWebpackDevServer();
}

module.exports = {
  patchWebpackDevServer,
  DEFAULT_TARGET,
};
