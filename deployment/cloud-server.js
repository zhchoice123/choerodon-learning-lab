// 云端免登录模式：只编译字符串，不执行访客代码，也不写入共享 src/。
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const express = require('express');
const babel = require('@babel/core');
const { parse } = require('@babel/parser');
const { createUnitTools, parseLessonId } = require('../scripts/unit');
const readRegisteredUnits = require('../devtools/lib/registered-units');
const registerMock = require('../mock');
const registerMonaco = require('../devtools/monaco-static');

const COOKIE = '__Host-choerodon';
const MAX_BYTES = 200 * 1024;
const error = (res, status, message) => res.status(status).json({ error: 'CLOUD_ERROR', message });
const supportedImports = new Set([
  'react', 'react-dom', 'mobx', 'mobx-react', 'axios', 'choerodon-ui', 'choerodon-ui/pro',
  'choerodon-ui/pro/lib/locale-context', 'choerodon-ui/pro/lib/locale-context/zh_CN',
  'choerodon-ui/pro/lib/locale-context/en_US', './LessonConfigScope',
]);
function compile(code) {
  if (typeof code !== 'string' || Buffer.byteLength(code) > MAX_BYTES) throw new Error('代码必须为不超过 200 KB 的字符串。');
  const ast = parse(code, { sourceType: 'module', plugins: ['jsx'] });
  for (const node of ast.program.body) {
    if (node.source && !supportedImports.has(node.source.value)) {
      throw new Error(`云端预览不支持导入 ${node.source.value}；请使用课程依赖。`);
    }
  }
  return babel.transformFromAstSync(ast, code, {
    babelrc: false, configFile: false, sourceMaps: false,
    plugins: [require('@babel/plugin-transform-react-jsx'), require('@babel/plugin-transform-modules-commonjs')],
  }).code;
}

function createCloudApp({ rootDir = path.resolve(__dirname, '..'), dataDir, origin = 'https://zhchoice.xyz', secret, maxUsers = 200, maxMockUsers = 64 } = {}) {
  if (!dataDir || !secret || secret.length < 32) throw new Error('需要独立数据目录及至少 32 字节的身份签名密钥。');
  fs.mkdirSync(dataDir, { recursive: true, mode: 0o700 });
  const source = createUnitTools({ rootDir });
  const units = readRegisteredUnits(rootDir, source);
  // 课程 = 已开放章节的小节 + 章节本身（综合练习），与本地接口的顺序一致
  const lessonId = (lesson) => lesson.id || String(lesson.number).padStart(2, '0');
  const lessons = units.flatMap((unit) => [...(unit.sections || []), unit]);
  const unitsRoot = path.resolve(rootDir, 'src/units');
  const relativeDir = (lesson) => path.relative(unitsRoot, lesson.directory);
  const app = express();
  app.disable('x-powered-by');
  const mocks = new Map();
  const rates = new Map();
  const sign = (id) => crypto.createHmac('sha256', secret).update(id).digest('hex');
  const readIdentity = (req) => {
    const token = (req.headers.cookie || '').split(';').map((s) => s.trim()).find((s) => s.startsWith(`${COOKIE}=`))?.slice(COOKIE.length + 1);
    if (!/^[a-f0-9]{64}\.[a-f0-9]{64}$/.test(token || '')) return null;
    const [id, signature] = token.split('.');
    return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(sign(id), 'hex')) ? id : null;
  };
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'no-store');
    if (!req.path.startsWith('/__learn/api/') && !req.path.startsWith('/mock/')) return next();
    let id = readIdentity(req);
    if (!['GET', 'HEAD'].includes(req.method)) {
      if (!id || req.headers.origin !== origin || req.headers['sec-fetch-site'] === 'cross-site') {
        return error(res, 403, '身份已失效或请求来源不合法，请刷新页面后重试。');
      }
    }
    if (!id) {
      id = crypto.randomBytes(32).toString('hex');
      res.setHeader('Set-Cookie', `${COOKIE}=${id}.${sign(id)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=31536000`);
    }
    req.visitor = id;
    // 有效身份按分钟限制 API 请求；Nginx 另按来源 IP 限流，防止反复申请身份绕过。
    const now = Date.now();
    let rate = rates.get(id);
    if (!rate || now - rate.start > 60000) rate = { start: now, count: 0 };
    rate.count += 1;
    rates.delete(id); rates.set(id, rate);
    if (rates.size > 1024) rates.delete(rates.keys().next().value);
    if (rate.count > 240) return error(res, 429, '请求过于频繁，请稍后重试。');
    next();
  });
  const visitorRoot = (req) => path.join(dataDir, req.visitor);
  function toolsFor(req, create = false) {
    const root = visitorRoot(req);
    if (!fs.existsSync(root) && create) {
      if (fs.readdirSync(dataDir).filter((name) => /^[a-f0-9]{64}$/.test(name)).length >= maxUsers) {
        throw new Error('当前访客存储名额已满，请联系管理员。');
      }
      const temporary = `${root}.tmp-${crypto.randomBytes(4).toString('hex')}`;
      try {
        fs.mkdirSync(path.join(temporary, 'src/units'), { recursive: true, mode: 0o700 });
        fs.copyFileSync(path.join(rootDir, 'src/units/index.js'), path.join(temporary, 'src/units/index.js'));
        provision(temporary);
        fs.writeFileSync(path.join(temporary, 'visitor.json'), JSON.stringify({ createdAt: new Date().toISOString() }));
        fs.renameSync(temporary, root);
      } finally {
        if (fs.existsSync(temporary)) fs.rmSync(temporary, { recursive: true });
      }
    }
    if (!fs.existsSync(root)) return null;
    // 旧访客的工作区创建于小节上线之前：只补齐缺少的课程目录，已有作业一律不动
    provision(root);
    return createUnitTools({ rootDir: root });
  }
  function provision(root) {
    for (const lesson of lessons.filter((item) => item.directory)) {
      const target = path.join(root, 'src/units', relativeDir(lesson));
      if (fs.existsSync(path.join(target, 'Exercise.js'))) continue;
      fs.mkdirSync(target, { recursive: true, mode: 0o700 });
      for (const file of ['index.js', 'Example.js', 'README.md']) fs.copyFileSync(path.join(lesson.directory, file), path.join(target, file));
      fs.cpSync(path.join(lesson.directory, 'templates'), path.join(target, 'templates'), { recursive: true });
      fs.copyFileSync(path.join(target, 'templates/Exercise.normal.js'), path.join(target, 'Exercise.js'));
    }
  }
  const template = (unit) => fs.readFileSync(path.join(unit.directory, 'templates/Exercise.normal.js'), 'utf8');
  const state = (tools, lesson) => tools
    ? tools.getUnitState(lessonId(lesson))
    : { state: 'not-started', matched: 'normal', difficulties: lesson.kind === 'section' ? ['normal'] : ['easy', 'normal', 'hard'] };
  const api = express.Router();
  api.use(express.json({ limit: MAX_BYTES }));
  api.get('/units', (req, res) => {
    const tools = toolsFor(req);
    res.json({ units: lessons.map((lesson) => ({
      number: lessonId(lesson),
      key: `unit-${lessonId(lesson)}`,
      chapter: String(lesson.number).padStart(2, '0'),
      kind: lesson.kind || 'chapter',
      title: lesson.title,
      open: Boolean(lesson.directory),
      ...(lesson.directory ? state(tools, lesson) : { state: 'locked', matched: null, difficulties: [] }),
    })) });
  });
  api.param('number', (req, res, next, number) => {
    const parsed = parseLessonId(number);
    req.unit = parsed && lessons.find((lesson) => lessonId(lesson) === parsed.id && lesson.directory);
    return req.unit ? next() : error(res, 404, '找不到单元。');
  });
  api.get('/units/:number/exercise', (req, res) => {
    const tools = toolsFor(req);
    const code = tools ? fs.readFileSync(tools.exercisePath(lessonId(req.unit)), 'utf8') : template(req.unit);
    res.json({ code, ...state(tools, req.unit) });
  });
  // 固定 Babel 插件只转换语法；禁止读取 .babelrc、解析访客依赖或在服务器执行代码。
  api.post('/compile', (req, res) => {
    try { res.json({ compiled: compile(req.body.code) }); }
    catch (err) { res.status(422).json({ error: 'SYNTAX_ERROR', message: err.message, line: err.loc?.line, column: err.loc ? err.loc.column + 1 : undefined }); }
  });
  function validate(code, res) {
    try { compile(code); return true; }
    catch (err) { res.status(422).json({ error: 'SYNTAX_ERROR', message: err.message, line: err.loc?.line, column: err.loc ? err.loc.column + 1 : undefined }); return false; }
  }
  api.put('/units/:number/exercise', (req, res) => {
    if (!validate(req.body.code, res)) return;
    const tools = toolsFor(req, true);
    const result = tools.saveExercise(lessonId(req.unit), req.body.code);
    res.json({ saved: true, ...result });
  });
  api.post('/units/:number/reset', (req, res) => {
    if (!['easy', 'normal', 'hard'].includes(req.body.difficulty)) return error(res, 400, '请选择 easy、normal 或 hard。');
    const tools = toolsFor(req, true);
    // 小节只有 normal 一档：请求不存在的难度是 404，不能落到通用错误处理变成 500
    if (!tools.getUnitState(lessonId(req.unit)).difficulties.includes(req.body.difficulty)) {
      return error(res, 404, '这个课程没有该难度的模板。');
    }
    // 保留所有备份，不自动丢弃作业；达到额度时拒绝继续产生备份。
    const backups = path.join(visitorRoot(req), '.backup');
    const bytes = (dir) => fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).reduce((sum, item) => sum + (item.isDirectory() ? bytes(path.join(dir, item.name)) : fs.statSync(path.join(dir, item.name)).size), 0) : 0;
    if (bytes(backups) > 10 * 1024 * 1024 - MAX_BYTES) return error(res, 409, '重置备份已达到 10 MB，请联系管理员导出后整理。');
    res.json(tools.resetUnit(lessonId(req.unit), req.body.difficulty));
  });
  for (const [route, filename, key] of [['example', 'Example.js', 'code'], ['readme', 'README.md', 'markdown']]) {
    api.get(`/units/:number/${route}`, (req, res) => res.json({ [key]: fs.readFileSync(path.join(req.unit.directory, filename), 'utf8') }));
  }
  app.use('/__learn/api', api);
  app.use((req, res, next) => {
    if (!req.path.startsWith('/mock/')) return next();
    let entry = mocks.get(req.visitor);
    if (!entry || Date.now() - entry.last > 24 * 60 * 60 * 1000) {
      const router = express.Router();
      registerMock(router);
      entry = { router };
    }
    entry.last = Date.now();
    mocks.delete(req.visitor); mocks.set(req.visitor, entry);
    if (mocks.size > maxMockUsers) mocks.delete(mocks.keys().next().value);
    // 限制访客写入 mock 的累计体积，避免无界追加内存数据。
    entry.written = entry.written || 0;
    if (!['GET', 'HEAD'].includes(req.method)) {
      const length = Number(req.headers['content-length']);
      if (!Number.isSafeInteger(length) || length < 0 || length > MAX_BYTES) return error(res, 413, 'mock 请求体过大或缺少长度。');
      if (entry.written + length > 1024 * 1024) return error(res, 429, '本次 mock 写入额度已满，请稍后重试或联系管理员。');
      entry.written += length;
    }
    entry.router(req, res, next);
  });
  registerMonaco(app);
  const build = path.join(rootDir, 'cloud-build');
  app.get('/choerodon/preview', (req, res) => {
    // opaque-origin 沙箱：不能读取宿主 Cookie、DOM 或直接访问网络，只有 mock 消息桥。
    res.setHeader('Content-Security-Policy', `sandbox allow-scripts; default-src 'none'; script-src ${origin} 'unsafe-eval'; style-src ${origin} 'unsafe-inline'; font-src ${origin} data:; img-src data: blob:; connect-src 'none'; worker-src 'none'; frame-src 'none'; form-action 'none'; base-uri 'none'`);
    res.sendFile(path.join(build, 'index.html'));
  });
  app.use('/choerodon', express.static(build, { dotfiles: 'deny', setHeaders: (res, file) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (file.includes(`${path.sep}static${path.sep}`)) res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  } }));
  app.use((req, res) => error(res, 404, '找不到资源。'));
  app.use((err, req, res, next) => error(res, err.status === 413 ? 413 : err.status === 400 ? 400 : 500, err.status === 413 ? '请求体不能超过 200 KB。' : '请求处理失败，请稍后重试。'));
  return app;
}

if (require.main === module) {
  const dataDir = process.env.LEARN_DATA_DIR;
  const secret = fs.readFileSync(process.env.LEARN_SECRET_FILE, 'utf8').trim();
  createCloudApp({ dataDir, secret, origin: process.env.LEARN_ORIGIN }).listen(Number(process.env.PORT || 3420), '127.0.0.1');
}
module.exports = { createCloudApp, compile };
