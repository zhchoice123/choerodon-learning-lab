// 在临时项目里验证覆盖和失败路径，绝不重置真实作业。
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

function fixture(t) {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'choerodon-unit-')));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, 'scripts'));
  fs.copyFileSync(path.join(__dirname, 'unit.js'), path.join(root, 'scripts/unit.js'));
  const directory = path.join(root, 'src/units/02-query-conditions');
  fs.mkdirSync(path.join(directory, 'templates'), { recursive: true });
  fs.writeFileSync(path.join(root, 'src/units/index.js'), "export const units = [{ key: 'unit-03', title: '03 字段校验' }];");
  fs.writeFileSync(path.join(directory, 'index.js'), "export default { key: 'unit-02', title: '02 查询条件' };");
  for (const difficulty of ['easy', 'normal', 'hard']) {
    fs.writeFileSync(path.join(directory, 'templates', `Exercise.${difficulty}.js`), `// ${difficulty}\n`);
  }
  const exercise = path.join(directory, 'Exercise.js');
  fs.writeFileSync(exercise, '// 用户已保存的作业\n');
  const run = (...args) => spawnSync(process.execPath, [path.join(root, 'scripts/unit.js'), ...args], { cwd: os.tmpdir(), encoding: 'utf8' });
  return { root, directory, exercise, run };
}

test('默认 normal，支持 2 / 02，覆盖前保留每一份原文件并打印路径', (t) => {
  const { root, exercise, run } = fixture(t);
  for (const [number, difficulty] of [['2', undefined], ['02', 'easy'], ['2', 'hard']]) {
    const previous = fs.readFileSync(exercise);
    const result = run('reset', number, ...(difficulty ? [difficulty] : []));
    assert.equal(result.status, 0, result.stderr);
    const backup = result.stdout.match(/已备份：(.+)\n/)[1];
    assert.ok(backup.startsWith(path.join(root, '.backup/02-query-conditions/Exercise.')));
    assert.deepEqual(fs.readFileSync(backup), previous);
    assert.equal(fs.readFileSync(exercise, 'utf8'), `// ${difficulty || 'normal'}\n`);
  }
  assert.equal(fs.readdirSync(path.join(root, '.backup/02-query-conditions')).length, 3);
});

test('list 区分模板、已改动和未开放，不修改练习', (t) => {
  const { exercise, run } = fixture(t);
  const before = fs.readFileSync(exercise);
  let result = run('list');
  assert.equal(result.status, 0);
  assert.match(result.stdout, /easy \/ normal \/ hard.*已改动/);
  assert.match(result.stdout, /03 字段校验.*未开放/);
  assert.deepEqual(fs.readFileSync(exercise), before);
  assert.equal(run('reset', '02', 'hard').status, 0);
  result = run('list');
  assert.match(result.stdout, /与 hard 模板一致/);
});

test('未知单元、错误难度、非法参数均报中文错误且不覆盖', (t) => {
  const { exercise, run } = fixture(t);
  const before = fs.readFileSync(exercise);
  for (const args of [[], ['reset'], ['reset', '99'], ['reset', '03'], ['reset', '../2'], ['reset', '2', 'expert'], ['list', '2']]) {
    const result = run(...args);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /单元工具错误/);
    assert.deepEqual(fs.readFileSync(exercise), before);
  }
});

test('模板缺失时不备份、不覆盖', (t) => {
  const { root, directory, exercise, run } = fixture(t);
  const before = fs.readFileSync(exercise);
  fs.unlinkSync(path.join(directory, 'templates/Exercise.hard.js'));
  const result = run('reset', '2', 'hard');
  assert.equal(result.status, 1);
  assert.match(result.stderr, /找不到 hard 模板/);
  assert.deepEqual(fs.readFileSync(exercise), before);
  assert.equal(fs.existsSync(path.join(root, '.backup')), false);
});

test('备份失败时终止，Exercise.js 完全保留', (t) => {
  const { root, exercise, run } = fixture(t);
  fs.writeFileSync(path.join(root, '.backup'), '这里是文件，不能创建备份目录');
  const before = fs.readFileSync(exercise);
  const result = run('reset', '2');
  assert.equal(result.status, 1);
  assert.match(result.stderr, /单元工具错误/);
  assert.deepEqual(fs.readFileSync(exercise), before);
});

test('Exercise.js 缺失时可从模板创建', (t) => {
  const { exercise, run } = fixture(t);
  fs.unlinkSync(exercise);
  const result = run('reset', '2');
  assert.equal(result.status, 0);
  assert.match(result.stdout, /无需备份/);
  assert.equal(fs.readFileSync(exercise, 'utf8'), '// normal\n');
});

test('核心模块 require 无命令行副作用，rootDir 不依赖 cwd', (t) => {
  const { root, exercise } = fixture(t);
  const { createUnitTools } = require('./unit');
  const before = fs.readFileSync(exercise);
  const tools = createUnitTools({ rootDir: root });
  assert.deepEqual(tools.readUnits().map((unit) => unit.number), [2, 3]);
  assert.equal(tools.getUnitState('02').state, 'in-progress');
  assert.equal(tools.getUnitState('03').state, 'locked');
  assert.deepEqual(fs.readFileSync(exercise), before);
  const result = spawnSync(process.execPath, ['-e', `require(${JSON.stringify(path.join(root, 'scripts/unit.js'))})`], { encoding: 'utf8' });
  assert.equal(result.status, 0);
  assert.equal(result.stdout, '');
  assert.equal(result.stderr, '');
});

test('核心 reset 返回结构化结果且静默，备份内容和写入内容准确', (t) => {
  const { root, exercise } = fixture(t);
  const { createUnitTools } = require('./unit');
  const tools = createUnitTools({ rootDir: root });
  const before = fs.readFileSync(exercise);
  const result = tools.resetUnit('2', 'easy');
  assert.equal(result.code, '// easy\n');
  assert.equal(result.state, 'not-started');
  assert.equal(result.matched, 'easy');
  assert.equal(result.exercisePath, exercise);
  assert.deepEqual(fs.readFileSync(path.join(root, result.backupPath)), before);
  assert.equal(fs.readFileSync(exercise, 'utf8'), result.code);
});

test('相同模板的匹配顺序稳定，CLI 仍打印所有匹配项', (t) => {
  const { root, directory, exercise, run } = fixture(t);
  const { createUnitTools } = require('./unit');
  fs.copyFileSync(path.join(directory, 'templates/Exercise.normal.js'), path.join(directory, 'templates/Exercise.easy.js'));
  fs.copyFileSync(path.join(directory, 'templates/Exercise.normal.js'), exercise);
  const result = createUnitTools({ rootDir: root }).getUnitState('02');
  assert.equal(result.matched, 'easy');
  assert.deepEqual(result.matches, ['easy', 'normal']);
  assert.match(run('list').stdout, /与 easy \/ normal 模板一致/);
});
