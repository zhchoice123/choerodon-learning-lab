const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { createCloudApp, compile } = require('../deployment/cloud-server');

test('免登录身份、作业/备份/mock 隔离、拒绝伪造及跨站写入、重启保留', async (t) => {
  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'choero-cloud-'));
  const options = { dataDir, secret: 'test-secret-'.repeat(8), origin: 'https://learn.test' };
  let server;
  let base;
  const start = async () => {
    server = createCloudApp(options).listen(0, '127.0.0.1');
    await new Promise((resolve) => server.once('listening', resolve));
    base = `http://127.0.0.1:${server.address().port}`;
  };
  const close = () => new Promise((resolve) => server.close(resolve));
  await start();
  t.after(async () => { await close(); fs.rmSync(dataDir, { recursive: true, force: true }); });
  const call = async (route, cookie, method = 'GET', body, origin = options.origin) => {
    const response = await fetch(`${base}${route}`, { method, headers: {
      ...(cookie ? { Cookie: cookie } : {}), Origin: origin, 'Content-Type': 'application/json',
    }, body: body === undefined ? undefined : JSON.stringify(body) });
    return { response, data: await response.json() };
  };
  const a = await call('/__learn/api/units');
  const b = await call('/__learn/api/units');
  const cookieA = a.response.headers.get('set-cookie').split(';')[0];
  const cookieB = b.response.headers.get('set-cookie').split(';')[0];
  assert.notEqual(cookieA, cookieB);
  assert.match(a.response.headers.get('set-cookie'), /HttpOnly; Secure; SameSite=Lax/);
  assert.equal(a.data.units.length, 9);
  const route = '/__learn/api/units/02/exercise';
  const original = (await call(route, cookieA)).data.code;
  assert.equal(original, fs.readFileSync(path.resolve(__dirname, '../src/units/02-query-conditions/templates/Exercise.normal.js'), 'utf8'));
  const code = `${original}\n// 访客 A 的独立作业\n`;
  assert.equal((await call(route, cookieA, 'PUT', { code })).response.status, 200);
  assert.equal((await call(route, cookieA)).data.code, code);
  assert.equal((await call(route, cookieB)).data.code, original);
  const reset = await call('/__learn/api/units/02/reset', cookieA, 'POST', { difficulty: 'hard' });
  assert.equal(reset.response.status, 200);
  const visitorA = cookieA.split('=')[1].split('.')[0];
  assert.equal(fs.readFileSync(path.join(dataDir, visitorA, reset.data.backupPath), 'utf8'), code);
  assert.equal((await call(route, cookieB)).data.code, original);
  assert.equal((await call(route, cookieA, 'PUT', { code: 'export default <' })).response.status, 422);
  assert.equal((await call(route, cookieA)).data.code, reset.data.code);
  assert.equal((await call(route, cookieA, 'PUT', { code }, 'https://evil.test')).response.status, 403);
  assert.equal((await call(route, null, 'PUT', { code })).response.status, 403);
  const forged = `${cookieA.slice(0, -1)}${cookieA.endsWith('0') ? '1' : '0'}`;
  assert.equal((await call(route, forged, 'PUT', { code })).response.status, 403);
  assert.equal((await call('/__learn/api/units/99/exercise', cookieA)).response.status, 404);
  assert.equal((await call('/__learn/api/compile', cookieA, 'POST', { code: 'import fs from "fs"; export default fs;' })).response.status, 422);
  const row = [{ name: 'Cloud visitor A', code: 'cloud-a-test', level: 'project', memberCount: 0, enabled: true }];
  assert.equal((await call('/mock/unit-05/roles/create', cookieA, 'POST', row)).response.status, 200);
  const rowsA = (await call('/mock/unit-05/roles?page=1&pagesize=100', cookieA)).data.content;
  const rowsB = (await call('/mock/unit-05/roles?page=1&pagesize=100', cookieB)).data.content;
  assert.equal(rowsA.length, rowsB.length + 1);
  assert.equal(rowsB.some((item) => item.code === 'cloud-a-test'), false);
  assert.equal((await call('/mock/unit-05/roles/create', cookieA, 'POST', [{ ...row[0], name: 'FAIL' }])).response.status, 400);
  await close(); await start();
  assert.equal((await call(route, cookieA)).data.code, reset.data.code);
  assert.equal((await call(route, cookieB)).data.code, original);
  assert.equal(fs.readFileSync(path.resolve(__dirname, '../src/units/02-query-conditions/templates/Exercise.normal.js'), 'utf8'), original);
});

test('固定 Babel 编译不执行输入，不读取任意模块', () => {
  delete global.__choeroCompileProbe;
  const result = compile('global.__choeroCompileProbe = true; export default function X() { return <div>probe</div>; }');
  assert.match(result, /React.createElement/);
  assert.equal(global.__choeroCompileProbe, undefined);
  assert.throws(() => compile('export { default } from "../../secrets";'), /不支持导入/);
  assert.throws(() => compile('x'.repeat(205000)), /200 KB/);
});

test('全部 27 份 TODO 模板都能在固定编译器转换，练习原文不变', () => {
  const unitsRoot = path.resolve(__dirname, '../src/units');
  let count = 0;
  for (const entry of fs.readdirSync(unitsRoot, { withFileTypes: true })) {
    if (!entry.isDirectory() || !/^\d+-/.test(entry.name)) continue;
    for (const difficulty of ['easy', 'normal', 'hard']) {
      const file = path.join(unitsRoot, entry.name, 'templates', `Exercise.${difficulty}.js`);
      const before = fs.readFileSync(file, 'utf8');
      assert.match(compile(before), /exports/);
      assert.equal(fs.readFileSync(file, 'utf8'), before);
      count += 1;
    }
  }
  assert.equal(count, 27);
});
