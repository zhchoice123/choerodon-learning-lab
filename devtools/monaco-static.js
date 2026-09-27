// 从本地 node_modules 提供 Monaco 编辑器的 AMD 资源，编辑器不依赖 CDN，离线也能用。
// 契约：docs/workspace/CONTRACT.md 第 6 节。只在 yarn start 时由 src/setupProxy.js 加载。
const path = require('path');
const express = require('express');

const MONACO_PREFIX = '/__learn/monaco/vs';

module.exports = function registerMonacoStatic(app) {
  const vsDirectory = path.join(path.dirname(require.resolve('monaco-editor/package.json')), 'min/vs');
  // fallthrough: false —— 文件不存在时直接 404，不落到 CRA 的 index.html
  app.use(MONACO_PREFIX, express.static(vsDirectory, { fallthrough: false, maxAge: '1d' }));
};

module.exports.MONACO_PREFIX = MONACO_PREFIX;
