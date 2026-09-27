// 单元 05 独立内存 CRUD；重启 yarn start 后从种子恢复。
// 复用 react-scripts / webpack-dev-server 已安装的 Express，不新增依赖。
const express = require('express');
const { filterByQuery, toPage } = require('./utils');
const roleSeeds = require('./data/roles');
const employeeSeeds = require('./data/users');

module.exports = function registerUnit05(app) {
  app.use('/mock/unit-05', express.json({ limit: '64kb' }));

  function registerCollection(kind, seeds) {
    let rows = JSON.parse(JSON.stringify(seeds));
    let nextId = Math.max(...rows.map((row) => row.id)) + 1;
    const isRole = kind === 'roles';
    const base = `/mock/unit-05/${kind}`;
    const keys = isRole
      ? ['code', 'name', 'level', 'memberCount', 'enabled', 'createdAt']
      : ['code', 'name', 'sex', 'age', 'email', 'active', 'startDate'];

    app.get(base, (req, res) => {
      const { page = '1', pagesize = '5' } = req.query;
      const integer = (value) => typeof value === 'string' && /^[1-9]\d*$/.test(value)
        && Number.isSafeInteger(Number(value));
      if (!integer(page) || !integer(pagesize) || Number(pagesize) > 100) {
        res.status(400).json({ message: 'page 必须为正整数，pagesize 必须为 1～100 的整数' });
        return;
      }
      res.json(toPage(filterByQuery(rows, req.query), { page, pagesize }));
    });

    ['create', 'update', 'destroy'].forEach((operation) => {
      app.post(`${base}/${operation}`, (req, res) => {
        // 1.6.7 默认 dataToJSON='dirty'：按状态分成三个记录数组。
        // 依据 node_modules/choerodon-ui/dataset/data-set/utils.js：prepareSubmitData / prepareForSubmit；
        // Record.js：toJSONData 添加 __id 和 __status。destroy 也是记录对象数组，不是 ID 数组。
        const records = req.body;
        if (!Array.isArray(records) || records.length === 0 || records.length > 100
          || records.some((item) => !item || typeof item !== 'object' || Array.isArray(item))) {
          res.status(400).json({ message: '请求体必须是包含 1～100 条记录对象的数组' });
          return;
        }
        const draft = JSON.parse(JSON.stringify(rows));
        let draftNextId = nextId;
        const result = [];
        const seenIds = new Set();
        const reject = (status, message) => res.status(status).json({ message });

        for (const item of records) {
          if (item.__id !== undefined && (!Number.isSafeInteger(item.__id) || item.__id <= 0)) {
            reject(400, '__id 必须是正整数');
            return;
          }
          const expectedStatus = operation === 'create' ? 'add' : operation === 'destroy' ? 'delete' : 'update';
          if (item.__status !== undefined && item.__status !== expectedStatus) {
            reject(400, '__status 与操作不一致');
            return;
          }
          let index = -1;
          if (operation !== 'create') {
            if (!Number.isSafeInteger(item.id) || seenIds.has(item.id)) {
              reject(400, 'id 必须是整数且同一批次不能重复');
              return;
            }
            seenIds.add(item.id);
            index = draft.findIndex((row) => row.id === item.id);
            if (index < 0) {
              reject(404, '记录不存在，请核对后重试');
              return;
            }
          } else if (item.id !== undefined && item.id !== null) {
            reject(400, '新增记录的 id 由后端分配');
            return;
          }

          if (operation === 'destroy') {
            if ((isRole && item.id === 101) || (!isRole && draft[index].active)) {
              reject(400, isRole ? '平台管理员是保留角色，不能删除' : '在职员工不能删除，请先保存离职状态');
              return;
            }
            // 仅凭 id 定位；不把请求中的其他字段当成已保存值。
            result.push({ ...draft[index], __id: item.__id });
            draft.splice(index, 1);
            continue;
          }

          const saved = operation === 'create'
            ? (isRole ? { id: draftNextId++, level: 'project', memberCount: 0, enabled: true,
              createdAt: '2026-01-01 00:00:00' }
              : { id: draftNextId++, sex: 'M', age: 18, active: false, email: '', startDate: '2026-01-01 00:00:00' })
            : { ...draft[index] };
          keys.forEach((key) => { if (item[key] !== undefined) saved[key] = item[key]; });
          if (typeof saved.name !== 'string' || !saved.name.trim()) {
            reject(400, '名称不能为空');
            return;
          }
          // 稳定失败场景：仅 create / update，前端 required 通过后仍会被后端拒绝。
          if (saved.name === 'FAIL') {
            reject(400, '名称 FAIL 触发单元 05 的固定失败，请修改名称后重试');
            return;
          }
          const pattern = isRole ? /^[a-z][a-z0-9-]{2,29}$/ : /^EMP\d{3}$/;
          if (typeof saved.code !== 'string' || !pattern.test(saved.code)) {
            reject(400, isRole ? '角色编码格式不正确' : '员工编码必须为 EMP 加三位数字');
            return;
          }
          if (draft.some((row) => row.id !== saved.id && row.code === saved.code)) {
            reject(409, '编码已存在');
            return;
          }
          const numericValue = isRole ? saved.memberCount : saved.age;
          if (!Number.isInteger(numericValue) || numericValue < (isRole ? 0 : 18) || numericValue > (isRole ? 200 : 60)) {
            reject(400, isRole ? '成员数必须为 0～200 的整数' : '年龄必须为 18～60 的整数');
            return;
          }
          if (typeof saved[isRole ? 'enabled' : 'active'] !== 'boolean') {
            reject(400, '状态字段必须为布尔值');
            return;
          }
          if (operation === 'create') draft.push(saved);
          else draft[index] = saved;
          // 不把 __id / __status 存入业务集合；仅响应时回显请求关联标识。
          result.push({ ...saved, __id: item.__id });
        }

        // 整个请求批次通过才提交内存；一次失败不部分修改该请求的数据。
        rows = draft;
        nextId = draftNextId;
        // DataSet.js：handleSubmitSuccess 按 dataKey 解析，commitData 优先用 __id 找原记录；
        // Record.js：commit 回写业务 id、清除 dirtyData 并置为 sync（删除记录则移出集合）。
        // 写响应的 content 是受影响记录，不是重新查询的分页；旧接口保持不变。
        res.json({ content: result, totalElements: rows.length, success: true });
      });
    });
  }

  registerCollection('roles', roleSeeds);
  registerCollection('employees', employeeSeeds);
};
