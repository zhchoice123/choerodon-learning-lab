// 单元 07 独立主从内存集合；重启 dev server 后恢复，不共享 05 / 06 的可变数据。
const express = require('express');
const { toPage } = require('./utils');
const roleSeeds = require('./data/roles');
const employeeSeeds = require('./data/users');
const clone = (value) => JSON.parse(JSON.stringify(value));

module.exports = function registerUnit07(app) {
  app.use('/mock/unit-07', express.json({ limit: '128kb' }));

  function registerCollection(kind, seeds, childName, foreignKey) {
    const isRole = kind === 'roles';
    const base = `/mock/unit-07/${kind}`;
    let heads = clone(seeds.slice(0, 2));
    let lines = heads.flatMap((head) => [1, 2].map((number) => (isRole
      ? { id: head.id * 10 + number, [foreignKey]: head.id, code: `permission-${number}`,
        description: `${head.name}权限${number}`, enabled: true }
      : { id: head.id * 10 + number, [foreignKey]: head.id, skillCode: `SKILL_${number}`, level: number, certified: false })));
    let nextLineId = Math.max(...lines.map((line) => line.id)) + 1;
    const pagination = (query, res) => {
      const { page = '1', pagesize = '50' } = query;
      const valid = (value) => typeof value === 'string' && /^[1-9]\d*$/.test(value) && Number.isSafeInteger(Number(value));
      if (!valid(page) || !valid(pagesize) || Number(pagesize) > 50) {
        res.status(400).json({ message: 'page 必须为正整数，pagesize 必须为 1～50 的整数' });
        return undefined;
      }
      return { page, pagesize };
    };
    app.get(base, (req, res) => {
      const query = pagination(req.query, res);
      // 故意不返回 children 键：返回 [] 会被 1.6.7 视为已经提供了空子表，不再远程读取。
      if (query) res.json(clone(toPage(heads, query)));
    });
    app.get(`${base}/${childName}`, (req, res) => {
      const query = pagination(req.query, res);
      if (!query) return;
      const id = req.query[foreignKey];
      if (typeof id !== 'string' || !/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) {
        res.status(400).json({ message: `${foreignKey} 必须为正整数` });
        return;
      }
      if (!heads.some((head) => head.id === Number(id))) {
        res.status(404).json({ message: '头记录不存在' });
        return;
      }
      res.json(clone(toPage(lines.filter((line) => line[foreignKey] === Number(id)), query)));
    });

    app.post(`${base}/submit`, (req, res) => {
      // 1.6.7 DataSet.js:write + utils.js:prepareForSubmit：未单独配置 create/update/destroy
      // 时交给 transport.submit，默认仍是头记录数组；Record.js:normalizeCascadeData 嵌套行数组。
      // 完整依据：node_modules/choerodon-ui/dataset/data-set/{DataSet,Record,utils}.js。
      const batch = req.body;
      const object = (value) => value && typeof value === 'object' && !Array.isArray(value);
      if (!Array.isArray(batch) || !batch.length || batch.length > 2 || batch.some((head) => !object(head))) {
        res.status(400).json({ message: '请求体必须是包含 1～2 条头记录的数组' });
        return;
      }
      const draftHeads = clone(heads);
      const draftLines = clone(lines);
      let draftNextId = nextLineId;
      const result = [];
      const seenHeads = new Set();
      const seenLinks = new Set();
      const reject = (status, message) => res.status(status).json({ message });
      const linkValid = (record) => Number.isSafeInteger(record.__id) && record.__id > 0 && !seenLinks.has(record.__id);

      for (const input of batch) {
        const head = draftHeads.find((item) => item.id === input.id);
        if (!Number.isSafeInteger(input.id) || seenHeads.has(input.id) || input.__status !== 'update' || !linkValid(input)) {
          reject(400, '本单元只维护已有头；id 不可重复，__status 必须为 update，__id 必须唯一且为正整数');
          return;
        }
        if (!head) { reject(404, '头记录不存在'); return; }
        seenHeads.add(input.id);
        seenLinks.add(input.__id);
        if (!Array.isArray(input[childName]) || input[childName].length > 50 || input[childName].some((item) => !object(item))) {
          reject(400, `${childName} 必须是最多 50 条记录的数组（不是 Page 对象）`);
          return;
        }
        if (input.name !== undefined) head.name = input.name;
        if (!isRole && input.active !== undefined) head.active = input.active;
        if (typeof head.name !== 'string' || !head.name.trim() || (!isRole && typeof head.active !== 'boolean')) {
          reject(400, '头名称不能为空，员工在职必须为布尔值'); return;
        }
        if (head.name === 'FAIL') { reject(400, 'FAIL 触发固定失败，整份主从请求均未保存'); return; }
        const seenRows = new Set();
        const links = new Map();
        const removed = [];
        for (const row of input[childName]) {
          if (!linkValid(row) || !['add', 'update', 'delete'].includes(row.__status)) {
            reject(400, '行 __id 必须唯一且为正整数，__status 必须为 add / update / delete'); return;
          }
          seenLinks.add(row.__id);
          if (row[foreignKey] !== undefined && row[foreignKey] !== head.id) {
            reject(400, '子行外键与所属头不一致'); return;
          }
          let index = -1;
          if (row.__status !== 'add') {
            if (!Number.isSafeInteger(row.id) || seenRows.has(row.id)) { reject(400, '行 id 必须为整数且不能重复'); return; }
            seenRows.add(row.id);
            index = draftLines.findIndex((line) => line.id === row.id && line[foreignKey] === head.id);
            if (index < 0) { reject(404, '子行不存在或不属于该头'); return; }
          } else if (row.id !== undefined && row.id !== null) {
            reject(400, '新增行 id 由后端分配'); return;
          }
          if (row.__status === 'delete') {
            removed.push({ ...draftLines[index], __id: row.__id, __status: 'delete' });
            draftLines.splice(index, 1);
            continue;
          }
          if (!isRole && row.__status === 'add' && !head.active) {
            reject(400, '离职员工不能新增技能'); return;
          }
          const saved = index < 0
            ? { id: draftNextId++, [foreignKey]: head.id, ...(isRole ? { enabled: true } : { level: 1, certified: false }) }
            : { ...draftLines[index] };
          const keys = isRole ? ['code', 'description', 'enabled'] : ['skillCode', 'level', 'certified'];
          keys.forEach((key) => { if (row[key] !== undefined) saved[key] = row[key]; });
          const code = saved[isRole ? 'code' : 'skillCode'];
          if (typeof code !== 'string' || !(isRole ? /^[a-z][a-z0-9-]{2,29}$/ : /^[A-Z][A-Z0-9_]{1,19}$/).test(code)) {
            reject(400, '行编码格式不正确'); return;
          }
          if ((isRole && (typeof saved.description !== 'string' || !saved.description.trim() || typeof saved.enabled !== 'boolean'))
            || (!isRole && (!Number.isInteger(saved.level) || saved.level < 1 || saved.level > 5 || typeof saved.certified !== 'boolean'))) {
            reject(400, isRole ? '权限说明必填，启用必须为布尔值' : '技能等级必须为 1～5 的整数，认证必须为布尔值'); return;
          }
          if (saved.description === 'FAIL' || saved.skillCode === 'FAIL') {
            reject(400, 'FAIL 触发固定失败，整份主从请求均未保存'); return;
          }
          if (index < 0) draftLines.push(saved);
          else draftLines[index] = saved;
          links.set(saved.id, row.__id);
        }
        const currentLines = draftLines.filter((line) => line[foreignKey] === head.id);
        if (!currentLines.length || currentLines.length > 50) { reject(400, '每个头必须保留 1～50 条行记录'); return; }
        const codes = currentLines.map((line) => line[isRole ? 'code' : 'skillCode']);
        if (new Set(codes).size !== codes.length) { reject(409, '同一头下的行编码不能重复'); return; }
        // Record.js:commit 递归调用 child.commitData(data[key])：嵌套响应必须是数组，不能再套 content。
        // 回显两级 __id；未变行保留完整数据，删除行回显墓碑用于匹配；内部标记不存入业务集合。
        result.push({ ...head, __id: input.__id, [childName]: [
          ...currentLines.map((line) => ({ ...line, ...(links.has(line.id) ? { __id: links.get(line.id) } : {}) })),
          ...removed,
        ] });
      }
      // 整份请求的所有头、所有行通过后才发布副本；这不是 05 的多个独立写请求。
      heads = draftHeads;
      lines = draftLines;
      nextLineId = draftNextId;
      res.json({ content: result, totalElements: heads.length, success: true });
    });
  }

  registerCollection('roles', roleSeeds, 'permissions', 'roleId');
  registerCollection('employees', employeeSeeds, 'skills', 'employeeId');
};
