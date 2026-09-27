// 运行：node --test devtools/
const { test } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const registerMonacoStatic = require('./monaco-static');

async function withServer(run) {
  const app = express();
  registerMonacoStatic(app);
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  try {
    await run(`http://127.0.0.1:${server.address().port}`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

test('serves the Monaco AMD loader from node_modules', () =>
  withServer(async (base) => {
    const response = await fetch(`${base}/__learn/monaco/vs/loader.js`);
    assert.equal(response.status, 200);
    assert.match(response.headers.get('content-type'), /javascript/);
  }));

test('missing files are a 404 instead of falling through to the app', () =>
  withServer(async (base) => {
    const response = await fetch(`${base}/__learn/monaco/vs/does-not-exist.js`);
    assert.equal(response.status, 404);
  }));
