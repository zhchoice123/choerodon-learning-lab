// 仅由 CRA 的 src/setupProxy.js 在开发服务器中挂载，遵循 CONTRACT.md 第 4 节。
const fs = require('fs');
const path = require('path');
const express = require('express');
const { parse } = require('@babel/parser');
const { createUnitTools } = require('../scripts/unit');
const readRegisteredUnits = require('./lib/registered-units');

const PREFIX = '/__learn/api';
const BODY_LIMIT = 200 * 1024;

module.exports = function registerLearnApi(app, { rootDir = path.resolve(__dirname, '..') } = {}) {
  const root = fs.realpathSync(rootDir);
  const tools = createUnitTools({ rootDir: root });
  const router = express.Router();
  // 仅解析本接口的请求体，不能影响 mock 接口的记录数组解析。
  router.use(express.json({ limit: BODY_LIMIT }));
  const stateOf = (number) => {
    const { state, matched } = tools.getUnitState(number);
    return { state, matched };
  };
  const registeredUnits = () => readRegisteredUnits(root, tools);

  router.get('/units', (req, res) => {
    res.json({
      units: registeredUnits().map((unit) => ({
        number: String(unit.number).padStart(2, '0'),
        key: `unit-${String(unit.number).padStart(2, '0')}`,
        title: unit.title,
        open: Boolean(unit.directory),
        difficulties: unit.directory ? tools.getUnitState(unit.number).difficulties : [],
        ...(unit.directory ? stateOf(unit.number) : { state: 'locked', matched: null }),
      })),
    });
  });

  router.param('number', (req, res, next, number) => {
    // 不拼接客户端提供的路径；注册表中未开放的单元即使有同名单元目录也拒绝访问。
    const unit = /^\d{1,2}$/.test(number) && registeredUnits().find((item) => item.number === Number(number));
    if (!unit) return res.status(404).json({ error: 'UNIT_NOT_FOUND', message: `找不到单元「${number}」。` });
    if (!unit.directory) return res.status(409).json({ error: 'UNIT_LOCKED', message: `单元 ${number} 尚未开放。` });
    req.learnUnit = unit;
    next();
  });

  router.get('/units/:number/exercise', (req, res) => {
    const number = req.learnUnit.number;
    res.json({ code: fs.readFileSync(tools.exercisePath(number), 'utf8'), ...stateOf(number) });
  });

  router.put('/units/:number/exercise', (req, res) => {
    const code = req.body?.code;
    if (typeof code !== 'string') {
      return res.status(400).json({ error: 'BAD_REQUEST', message: 'code 必须是字符串。' });
    }
    try {
      parse(code, { sourceType: 'module', plugins: ['jsx'] });
    } catch (error) {
      if (!(error instanceof SyntaxError) || !error.loc) throw error;
      return res.status(422).json({
        error: 'SYNTAX_ERROR',
        message: `代码语法错误：${error.message}`,
        line: error.loc.line,
        // Babel 的列从 0 开始；Monaco 和 HTTP 契约的列从 1 开始。
        column: error.loc.column + 1,
      });
    }
    const { state, matched } = tools.saveExercise(req.learnUnit.number, code);
    res.json({ saved: true, state, matched });
  });

  router.post('/units/:number/reset', (req, res) => {
    const difficulty = req.body?.difficulty;
    if (!['easy', 'normal', 'hard'].includes(difficulty)) {
      return res.status(400).json({ error: 'BAD_DIFFICULTY', message: 'difficulty 必须是 easy、normal 或 hard。' });
    }
    const { code, state, matched, backupPath } = tools.resetUnit(req.learnUnit.number, difficulty);
    res.json({ code, state, matched, backupPath });
  });

  for (const [route, filename, key] of [['example', 'Example.js', 'code'], ['readme', 'README.md', 'markdown']]) {
    router.get(`/units/:number/${route}`, (req, res) => {
      const file = tools.assertLocalPath(path.join(req.learnUnit.directory, filename));
      res.json({ [key]: fs.readFileSync(file, 'utf8') });
    });
  }

  router.use((req, res) => res.status(404).json({ error: 'UNIT_NOT_FOUND', message: '找不到指定的学习接口或单元。' }));
  router.use((error, req, res, next) => {
    if (error.type === 'entity.too.large') {
      return res.status(413).json({ error: 'TOO_LARGE', message: '请求体不能超过 200 KB。' });
    }
    if (error.type === 'entity.parse.failed' || error instanceof URIError || error.code === 'BAD_REQUEST') {
      return res.status(400).json({ error: 'BAD_REQUEST', message: '请求格式或文件路径不合法，请检查 JSON 请求体和单元号。' });
    }
    if (error.code === 'ENOENT' || error.code === 'FILE_NOT_FOUND') {
      return res.status(404).json({ error: 'FILE_NOT_FOUND', message: '单元文件或难度模板不存在。' });
    }
    if (error.status >= 400 && error.status < 500) {
      return res.status(400).json({ error: 'BAD_REQUEST', message: '无法解析请求体，请使用 UTF-8 编码的 JSON。' });
    }
    res.status(500).json({ error: 'INTERNAL_ERROR', message: '本地学习文件操作失败，请检查文件权限和单元配置。' });
  });
  app.use(PREFIX, router);
};
