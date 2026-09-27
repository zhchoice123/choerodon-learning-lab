// 单元 08 独立内存集合，重启恢复；不共享其他单元的可变数组或种子对象。
const express = require('express');
const { toPage } = require('./utils');
const clone = value => JSON.parse(JSON.stringify(value));

module.exports = function registerUnit08(app) {
  app.use('/mock/unit-08', express.json({ limit: '64kb' }));
  function register(kind, seeds) {
    let rows = clone(seeds.slice(0, 3));
    let nextId = Math.max(...rows.map(row => row.id)) + 1;
    const isRole = kind === 'roles';
    const base = `/mock/unit-08/${kind}`;
    app.get(base, (req, res) => {
      const { page = '1', pagesize = '5' } = req.query;
      const integer = value => typeof value === 'string' && /^[1-9]\d*$/.test(value) && Number.isSafeInteger(Number(value));
      if (!integer(page) || !integer(pagesize) || Number(pagesize) > 100) {
        res.status(400).json({ message: 'page 必须为正整数，pagesize 必须为 1～100 的整数' });
        return;
      }
      res.json(clone(toPage(rows, { page, pagesize })));
    });
    ['create', 'update'].forEach(operation => {
      app.post(`${base}/${operation}`, (req, res) => {
        // 1.6.7 dataset/data-set/utils.js:prepareForSubmit 与 Record.js:toJSONData：
        // submitRecord 仍使用记录数组，包含 __id / __status；本课一次只保存弹窗捕获的一条记录。
        const batch = req.body;
        const reject = (status, message) => res.status(status).json({ message });
        if (!Array.isArray(batch) || batch.length !== 1 || !batch[0] || typeof batch[0] !== 'object' || Array.isArray(batch[0])) {
          reject(400, '请求体必须是恰好一条记录的数组'); return;
        }
        const input = batch[0];
        if (!Number.isSafeInteger(input.__id) || input.__id <= 0 || input.__status !== (operation === 'create' ? 'add' : 'update')) {
          reject(400, '__id 必须为正整数，__status 必须与操作一致'); return;
        }
        const index = rows.findIndex(row => row.id === input.id);
        if (operation === 'create' && input.id != null) { reject(400, '新增 ID 由后端分配'); return; }
        if (operation === 'update' && (!Number.isSafeInteger(input.id) || index < 0)) { reject(404, '记录不存在'); return; }
        const saved = operation === 'create'
          ? { id: nextId, ...(isRole ? { enabled: true } : { age: 18, active: true, email: '' }) }
          : { ...rows[index] };
        const keys = isRole ? ['name', 'code', 'enabled'] : ['name', 'code', 'age', 'email', 'active'];
        keys.forEach(key => { if (input[key] !== undefined) saved[key] = input[key]; });
        if (typeof saved.name !== 'string' || !saved.name.trim()) { reject(400, '名称不能为空'); return; }
        if (saved.name === 'FAIL') { reject(400, '名称 FAIL 触发单元 08 固定失败，请在弹窗内修正后重试'); return; }
        if (typeof saved.code !== 'string' || !(isRole ? /^[a-z][a-z0-9-]{2,29}$/ : /^EMP\d{3}$/).test(saved.code)) {
          reject(400, isRole ? '角色编码格式不正确' : '员工编码必须为 EMP 加三位数字'); return;
        }
        if (!isRole && operation === 'update' && saved.code !== rows[index].code) { reject(400, '已有员工编码不能修改'); return; }
        if (rows.some(row => row.id !== saved.id && row.code === saved.code)) { reject(409, '编码已存在'); return; }
        if (typeof saved[isRole ? 'enabled' : 'active'] !== 'boolean') { reject(400, '状态必须为布尔值'); return; }
        if (!isRole) {
          if (!Number.isInteger(saved.age) || saved.age < 18 || saved.age > 60) { reject(400, '年龄必须为 18～60 的整数'); return; }
          if (typeof saved.email !== 'string' || (saved.active && !saved.email.trim())
            || (saved.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(saved.email))) {
            reject(400, '在职员工邮箱必填，非空邮箱必须格式正确'); return;
          }
        }
        if (operation === 'create') { rows.push(saved); nextId += 1; }
        else rows[index] = saved;
        // node_modules/choerodon-ui/dataset/data-set/DataSet.js:handleSubmitSuccess / commitData：
        // 外层按 content 解析，__id 匹配浏览器 Record，Record.commit 回写 id 并恢复 sync / dirty=false。
        res.json({ content: [{ ...saved, __id: input.__id }], totalElements: rows.length, success: true });
      });
    });
  }
  register('roles', require('./data/roles'));
  register('employees', require('./data/users'));
};
