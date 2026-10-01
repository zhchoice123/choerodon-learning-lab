// 真实 src/units 仅作为只读种子复制；所有 HTTP 写入和备份均在临时项目中执行。
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const http = require('node:http');
const express = require('express');
const registerLearnApi = require('./learn-api');

async function fixture(t) {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'learn-api-')));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.cpSync(path.resolve(__dirname, '../src/units'), path.join(root, 'src/units'), { recursive: true });
  const directory = path.join(root, 'src/units/01-dataset-basics');
  const exercise = path.join(directory, 'Exercise.js');
  const template = (difficulty) => fs.readFileSync(path.join(directory, 'templates', `Exercise.${difficulty}.js`), 'utf8');
  fs.writeFileSync(exercise, template('normal'));
  fs.writeFileSync(path.join(root, 'src/units/02-query-conditions/Exercise.js'), '// 临时项目里的已改动作业\n');
  fs.rmSync(path.join(root, 'src/units/09-global-config'), { recursive: true, force: true });
  const indexPath = path.join(root, 'src/units/index.js');
  const indexContent = fs.readFileSync(indexPath, 'utf8')
    .replace(/import unit09 from '[^']+';\n?/, '')
    .replace(/\bunit09,/, `{\n    key: 'unit-09',\n    title: '09 全局配置与国际化',\n    points: ['configure 全局配置', 'localeContext 语言包', '全局 lookup / transport 适配后端'],\n  },`);
  fs.writeFileSync(indexPath, indexContent);
  const app = express();
  registerLearnApi(app, { rootDir: root });
  // 本地接口中间件不能截获其他路径，也不能预先解析其他路由的 JSON。
  app.post('/other', express.json(), (req, res) => res.json(req.body));
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}/__learn/api`;
  async function request(route, method = 'GET', body) {
    const response = await fetch(`${base}${route}`, {
      method,
      headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    assert.match(response.headers.get('content-type'), /application\/json/);
    return { status: response.status, data: await response.json() };
  }
  return { root, directory, exercise, template, base, request };
}

function state(state, matched) {
  return { state, matched };
}

test('列表有九个注册单元，准确区分三种状态和可用难度', async (t) => {
  const { request } = await fixture(t);
  const { status, data } = await request('/units');
  assert.equal(status, 200);
  // 列表按学习顺序混排小节和章节；这里只核对 9 个章节
  const chapters = data.units.filter((unit) => unit.kind === 'chapter');
  assert.equal(chapters.length, 9);
  assert.deepEqual(chapters[0], {
    number: '01', key: 'unit-01', chapter: '01', kind: 'chapter', title: '01 DataSet 基础与 Table 绑定', open: true,
    difficulties: ['easy', 'normal', 'hard'], ...state('not-started', 'normal'),
  });
  assert.equal(chapters[1].state, 'in-progress');
  assert.equal(chapters[1].matched, null);
  assert.deepEqual(chapters[8], {
    number: '09', key: 'unit-09', chapter: '09', kind: 'chapter', title: '09 全局配置与国际化', open: false,
    difficulties: [], ...state('locked', null),
  });
});

test('小节：按学习顺序列出，可以读取、保存、重置并备份到小节自己的目录', async (t) => {
  const { root, directory, request } = await fixture(t);
  // 临时项目里造一个与真实内容无关的小节，只验证框架行为
  const section = path.join(directory, 'sections/1-demo');
  fs.rmSync(path.join(directory, 'sections'), { recursive: true, force: true });
  fs.mkdirSync(path.join(section, 'templates'), { recursive: true });
  fs.writeFileSync(path.join(section, 'index.js'), "const lesson = { key: 'unit-01-1', title: '01-1 演示小节' };\nexport default lesson;\n");
  fs.writeFileSync(path.join(section, 'Example.js'), '// 样例\n');
  fs.writeFileSync(path.join(section, 'README.md'), '# 演示\n');
  fs.writeFileSync(path.join(section, 'templates/Exercise.normal.js'), '// 模板\n');
  fs.writeFileSync(path.join(section, 'Exercise.js'), '// 模板\n');

  const { data } = await request('/units');
  const keys = data.units.map((unit) => unit.key);
  assert.ok(keys.indexOf('unit-01-1') >= 0 && keys.indexOf('unit-01-1') < keys.indexOf('unit-01'), '小节排在所属章节之前');
  assert.deepEqual(data.units.find((unit) => unit.key === 'unit-01-1'), {
    number: '01-1', key: 'unit-01-1', chapter: '01', kind: 'section', title: '01-1 演示小节', open: true,
    difficulties: ['normal'], ...state('not-started', 'normal'),
  });

  assert.deepEqual((await request('/units/01-1/exercise')).data, { code: '// 模板\n', ...state('not-started', 'normal') });
  assert.equal((await request('/units/1-1/exercise')).status, 200, '也接受不补零的写法');
  assert.equal((await request('/units/01-1/example')).data.code, '// 样例\n');

  const saved = await request('/units/01-1/exercise', 'PUT', { code: '// 我的答案\n' });
  assert.deepEqual(saved.data, { saved: true, ...state('in-progress', null) });
  assert.equal(fs.readFileSync(path.join(section, 'Exercise.js'), 'utf8'), '// 我的答案\n');
  // 章节自己的练习不受影响
  assert.equal((await request('/units/01/exercise')).data.state, 'not-started');

  const reset = await request('/units/01-1/reset', 'POST', { difficulty: 'normal' });
  assert.equal(reset.status, 200);
  assert.match(reset.data.backupPath, /^\.backup\/01-dataset-basics\/sections\/1-demo\/Exercise\..+\.js$/);
  assert.equal(fs.readFileSync(path.join(root, reset.data.backupPath), 'utf8'), '// 我的答案\n');
  assert.equal(fs.readFileSync(path.join(section, 'Exercise.js'), 'utf8'), '// 模板\n');
  assert.equal((await request('/units/01-1/reset', 'POST', { difficulty: 'hard' })).status, 404, '小节只有 normal 一档');

  for (const bad of ['01-0', '01-2', '1-1-1', '01-', '09-1']) {
    assert.equal((await request(`/units/${encodeURIComponent(bad)}/exercise`)).status, 404, bad);
  }
});

test('多个模板相同时 matched 按 easy → normal → hard 取第一个', async (t) => {
  const { directory, exercise, template, request } = await fixture(t);
  fs.writeFileSync(path.join(directory, 'templates/Exercise.easy.js'), template('normal'));
  const result = await request('/units/01/exercise');
  assert.equal(result.status, 200);
  assert.deepEqual(result.data, { code: fs.readFileSync(exercise, 'utf8'), ...state('not-started', 'easy') });
});

test('逐字读取练习、样例和 README，不执行代码', async (t) => {
  const { directory, request } = await fixture(t);
  for (const [route, file, key] of [['exercise', 'Exercise.js', 'code'], ['example', 'Example.js', 'code'], ['readme', 'README.md', 'markdown']]) {
    const result = await request(`/units/01/${route}`);
    assert.equal(result.status, 200);
    assert.equal(result.data[key], fs.readFileSync(path.join(directory, file), 'utf8'));
  }
});

test('保存 ES module / JSX 并更新状态，忽略请求提供的任意路径', async (t) => {
  const { root, exercise, template, request } = await fixture(t);
  const other = path.join(root, 'keep.js');
  fs.writeFileSync(other, '// 不可写\n');
  const code = "import React from 'react';\nexport default () => <div>中文练习</div>;\n";
  const result = await request('/units/01/exercise', 'PUT', { code, path: other, filename: other, number: '09' });
  assert.equal(result.status, 200);
  assert.deepEqual(result.data, { saved: true, ...state('in-progress', null) });
  assert.equal(fs.readFileSync(exercise, 'utf8'), code);
  assert.equal(fs.readFileSync(other, 'utf8'), '// 不可写\n');
  const restored = await request('/units/01/exercise', 'PUT', { code: template('hard') });
  assert.deepEqual(restored.data, { saved: true, ...state('not-started', 'hard') });
});

test('语法错误返回 422 和从 1 开始的行列，原文件和 mtime 完全不变', async (t) => {
  const { exercise, request } = await fixture(t);
  const before = fs.readFileSync(exercise);
  const mtime = fs.statSync(exercise).mtimeMs;
  const result = await request('/units/01/exercise', 'PUT', { code: 'const ok = 1;\nconst bad = ;\n' });
  assert.equal(result.status, 422);
  assert.equal(result.data.error, 'SYNTAX_ERROR');
  assert.match(result.data.message, /代码语法错误/);
  assert.equal(result.data.line, 2);
  assert.equal(result.data.column, 13);
  assert.deepEqual(fs.readFileSync(exercise), before);
  assert.equal(fs.statSync(exercise).mtimeMs, mtime);
});

test('字节相同的保存返回成功且不重写文件', async (t) => {
  const { exercise, request } = await fixture(t);
  fs.utimesSync(exercise, new Date('2000-01-01'), new Date('2000-01-01'));
  const mtime = fs.statSync(exercise).mtimeMs;
  const result = await request('/units/01/exercise', 'PUT', { code: fs.readFileSync(exercise, 'utf8') });
  assert.deepEqual(result.data, { saved: true, ...state('not-started', 'normal') });
  assert.equal(result.status, 200);
  assert.equal(fs.statSync(exercise).mtimeMs, mtime);
});

test('reset 三档逐次备份旧内容并写入对应模板，备份路径相对项目根目录', async (t) => {
  const { root, exercise, template, request } = await fixture(t);
  const backups = new Set();
  for (const difficulty of ['normal', 'easy', 'hard']) {
    const before = fs.readFileSync(exercise);
    const result = await request('/units/01/reset', 'POST', { difficulty });
    assert.equal(result.status, 200);
    assert.deepEqual({ ...result.data, backupPath: undefined }, {
      code: template(difficulty), ...state('not-started', difficulty), backupPath: undefined,
    });
    assert.match(result.data.backupPath, /^\.backup\/01-dataset-basics\/Exercise\..+\.js$/);
    assert.deepEqual(fs.readFileSync(path.join(root, result.data.backupPath)), before);
    assert.equal(fs.readFileSync(exercise, 'utf8'), template(difficulty));
    backups.add(result.data.backupPath);
  }
  assert.equal(backups.size, 3);
});

test('练习文件缺失时 reset 返回 backupPath null 并创建文件', async (t) => {
  const { root, exercise, request, template } = await fixture(t);
  fs.unlinkSync(exercise);
  assert.equal((await request('/units/01/exercise')).status, 404);
  const result = await request('/units/01/reset', 'POST', { difficulty: 'easy' });
  assert.equal(result.status, 200);
  assert.equal(result.data.backupPath, null);
  assert.equal(fs.existsSync(path.join(root, '.backup')), false);
  assert.equal(fs.readFileSync(exercise, 'utf8'), template('easy'));
});

test('不存在的单元 404；未开放单元的全部操作 409', async (t) => {
  const { request } = await fixture(t);
  for (const [method, route, body] of [
    ['GET', 'exercise'], ['GET', 'example'], ['GET', 'readme'],
    ['PUT', 'exercise', { code: '// 不可写' }], ['POST', 'reset', { difficulty: 'normal' }],
  ]) {
    for (const [number, status, error] of [['99', 404, 'UNIT_NOT_FOUND'], ['09', 409, 'UNIT_LOCKED']]) {
      const result = await request(`/units/${number}/${route}`, method, body);
      assert.equal(result.status, status);
      assert.equal(result.data.error, error);
    }
  }
});

test('code 类型不合法返回 400 BAD_REQUEST，难度不合法返回 400 BAD_DIFFICULTY', async (t) => {
  const { exercise, request } = await fixture(t);
  const before = fs.readFileSync(exercise);
  for (const code of [undefined, null, 123, false, {}, []]) {
    const result = await request('/units/01/exercise', 'PUT', { code });
    assert.equal(result.status, 400);
    assert.equal(result.data.error, 'BAD_REQUEST');
  }
  for (const difficulty of [undefined, null, 'expert', '../easy', 1, []]) {
    const result = await request('/units/01/reset', 'POST', { difficulty });
    assert.equal(result.status, 400);
    assert.equal(result.data.error, 'BAD_DIFFICULTY');
  }
  assert.deepEqual(fs.readFileSync(exercise), before);
});

test('畸形 JSON 返回统一 400 JSON 错误，不改文件', async (t) => {
  const { base, exercise } = await fixture(t);
  const before = fs.readFileSync(exercise);
  const response = await fetch(`${base}/units/01/exercise`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: '{"code":',
  });
  assert.equal(response.status, 400);
  assert.equal((await response.json()).error, 'BAD_REQUEST');
  assert.deepEqual(fs.readFileSync(exercise), before);
});

test('请求体限额是 200 KB 字节，边界以内通过，超出返回 413，reset 也受限', async (t) => {
  const { exercise, request } = await fixture(t);
  const limit = 200 * 1024;
  const code = '//'.padEnd(limit - Buffer.byteLength(JSON.stringify({ code: '' })), 'a');
  assert.equal(Buffer.byteLength(JSON.stringify({ code })), limit);
  assert.equal((await request('/units/01/exercise', 'PUT', { code })).status, 200);
  const before = fs.readFileSync(exercise);
  for (const [route, method, body] of [
    ['exercise', 'PUT', { code: `${code}a` }],
    ['exercise', 'PUT', { code: `//${'中'.repeat(70000)}` }],
    ['reset', 'POST', { difficulty: 'easy', padding: 'a'.repeat(limit) }],
  ]) {
    const result = await request(`/units/01/${route}`, method, body);
    assert.equal(result.status, 413);
    assert.equal(result.data.error, 'TOO_LARGE');
    assert.deepEqual(fs.readFileSync(exercise), before);
  }
});

test('编码的路径穿越、非法单元号和畸形百分号被拒绝', async (t) => {
  const { exercise, request } = await fixture(t);
  const before = fs.readFileSync(exercise);
  for (const number of ['../..', '1/../../x', '..\\..', '/tmp/01', '00', '001', '1e0', '01\u0000']) {
    for (const [route, method, body] of [['exercise', 'PUT', { code: '// 不可写' }], ['reset', 'POST', { difficulty: 'easy' }]]) {
      const result = await request(`/units/${encodeURIComponent(number)}/${route}`, method, body);
      assert.equal(result.status, 404);
      assert.equal(result.data.error, 'UNIT_NOT_FOUND');
    }
  }
  const malformed = await request('/units/%E0%A4%A/exercise');
  assert.equal(malformed.status, 400);
  assert.equal(malformed.data.error, 'BAD_REQUEST');
  assert.deepEqual(fs.readFileSync(exercise), before);
});

test('未编码的路径穿越不能穿过路由白名单', async (t) => {
  const { base, exercise } = await fixture(t);
  const before = fs.readFileSync(exercise);
  // http.request 保留原始路径，避免 fetch 在发出请求前归一化 ../。
  for (const number of ['../..', '1/../../x']) {
    const result = await new Promise((resolve, reject) => {
      const url = new URL(base);
      const req = http.request({ hostname: url.hostname, port: url.port, method: 'PUT',
        path: `/__learn/api/units/${number}/exercise`, headers: { 'Content-Type': 'application/json' } }, (res) => {
        let body = '';
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(body) }));
      });
      req.on('error', reject);
      req.end(JSON.stringify({ code: '// 不可写' }));
    });
    assert.equal(result.status, 404);
    assert.equal(result.data.error, 'UNIT_NOT_FOUND');
  }
  assert.deepEqual(fs.readFileSync(exercise), before);
});

test('未注册目录不能获得写权限，预告单元即使出现目录也保持锁定', async (t) => {
  const { root, directory, request } = await fixture(t);
  for (const number of ['09', '10']) {
    const copy = path.join(root, `src/units/${number}-unregistered`);
    fs.cpSync(directory, copy, { recursive: true });
    const before = fs.readFileSync(path.join(copy, 'Exercise.js'));
    const result = await request(`/units/${number}/exercise`, 'PUT', { code: '// 不可写' });
    assert.equal(result.status, number === '09' ? 409 : 404);
    assert.deepEqual(fs.readFileSync(path.join(copy, 'Exercise.js')), before);
    // 复制来的目录里也带着 sections/：未注册章节下的小节同样不能读写
    const sectionCopy = path.join(copy, 'sections/1-fields/Exercise.js');
    const sectionBefore = fs.readFileSync(sectionCopy);
    assert.equal((await request(`/units/${number}-1/exercise`, 'PUT', { code: '// 不可写' })).status, 404);
    assert.equal((await request(`/units/${number}-1/exercise`)).status, 404);
    assert.deepEqual(fs.readFileSync(sectionCopy), sectionBefore);
  }
  const { data } = await request('/units');
  const chapters = data.units.filter((unit) => unit.kind === 'chapter');
  assert.equal(chapters.length, 9);
  assert.equal(chapters[8].open, false);
  // 未开放的章节不列出任何小节
  assert.equal(data.units.some((unit) => unit.chapter === '09' && unit.kind === 'section'), false);
});

test('模板缺失返回 404，备份目录不可写返回 500，两者均保留原练习', async (t) => {
  const { root, directory, exercise, request } = await fixture(t);
  const before = fs.readFileSync(exercise);
  fs.unlinkSync(path.join(directory, 'templates/Exercise.hard.js'));
  let result = await request('/units/01/reset', 'POST', { difficulty: 'hard' });
  assert.equal(result.status, 404);
  assert.equal(result.data.error, 'FILE_NOT_FOUND');
  assert.equal(fs.existsSync(path.join(root, '.backup')), false);
  fs.writeFileSync(path.join(root, '.backup'), '文件阻止创建备份目录');
  result = await request('/units/01/reset', 'POST', { difficulty: 'normal' });
  assert.equal(result.status, 500);
  assert.equal(result.data.error, 'INTERNAL_ERROR');
  assert.deepEqual(fs.readFileSync(exercise), before);
});

test('符号链接练习和备份目录不能绕过写入白名单', async (t) => {
  const { root, exercise, request, template } = await fixture(t);
  const other = path.join(root, 'other.js');
  fs.writeFileSync(other, '// 保留文件\n');
  fs.unlinkSync(exercise);
  fs.symlinkSync(other, exercise);
  for (const [route, method, body] of [['exercise', 'PUT', { code: '// 不可写' }], ['reset', 'POST', { difficulty: 'normal' }]]) {
    const result = await request(`/units/01/${route}`, method, body);
    assert.equal(result.status, 400);
    assert.equal(result.data.error, 'BAD_REQUEST');
  }
  assert.equal(fs.readFileSync(other, 'utf8'), '// 保留文件\n');
  fs.unlinkSync(exercise);
  fs.writeFileSync(exercise, template('normal'));
  const otherDirectory = path.join(root, 'other');
  fs.mkdirSync(otherDirectory);
  fs.symlinkSync(otherDirectory, path.join(root, '.backup'));
  const result = await request('/units/01/reset', 'POST', { difficulty: 'easy' });
  assert.equal(result.status, 400);
  assert.deepEqual(fs.readdirSync(otherDirectory), []);
  assert.equal(fs.readFileSync(exercise, 'utf8'), template('normal'));
});

test('学习接口的 body parser 不影响其他接口的数组请求', async (t) => {
  const { base } = await fixture(t);
  const response = await fetch(`${new URL(base).origin}/other`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '[{"id":1}]',
  });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), [{ id: 1 }]);
});
