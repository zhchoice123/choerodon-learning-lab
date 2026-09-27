// 自由练习区独立内存数据；不改共享员工接口或各学习单元的数据。
const express = require('express');
const seeds = require('./data/users');
const { filterByQuery, toPage } = require('./utils');
const clone = (value) => JSON.parse(JSON.stringify(value));
const object = (value) => value && typeof value === 'object' && !Array.isArray(value);
const positive = (value) => Number.isSafeInteger(value) && value > 0;
const fail = (status, message) => { throw Object.assign(new Error(message), { status }); };
const pick = (input, keys) => Object.fromEntries(keys.filter((key) => input[key] !== undefined).map((key) => [key, input[key]]));

module.exports = function registerPlayground(app) {
  const router = express.Router();
  router.use(express.json({ limit: '128kb' }));
  let rows = clone(seeds).map((row) => ({ ...row, addresses: [] }));
  let nextId = Math.max(...rows.map((row) => row.id)) + 1;
  let nextAddressId = 1;

  router.get('/users', (req, res) => {
    const { page = '1', pagesize = '10' } = req.query;
    const valid = (value) => typeof value === 'string' && /^[1-9]\d*$/.test(value) && positive(Number(value));
    if (!valid(page) || !valid(pagesize) || Number(pagesize) > 100) {
      return res.status(400).json({ message: 'page 必须为正整数，pagesize 必须为 1～100 的整数' });
    }
    res.json(toPage(filterByQuery(rows, req.query), { page, pagesize }));
  });

  function write(operation) {
    return (req, res, next) => {
      try {
        const batch = req.body;
        if (!Array.isArray(batch) || !batch.length || batch.length > 100 || batch.some((item) => !object(item))) {
          fail(400, '请求体必须是包含 1～100 条记录对象的数组');
        }
        // 1.6.7 dataset/data-set/utils.js: prepareSubmitData 按状态发送记录数组；
        // destroy 也是完整记录对象数组。Record.js: toJSONData 附加 __id / __status。
        const draft = clone(rows);
        let userId = nextId;
        let addressId = nextAddressId;
        const seen = new Set();
        const result = batch.map((input) => {
          if (input.__id !== undefined && !positive(input.__id)) fail(400, '__id 必须为正整数');
          if (input.__status !== undefined && input.__status !== operation) fail(400, '__status 与请求方法不一致');
          let index = -1;
          if (operation === 'add') {
            if (input.id != null) fail(400, '新增记录的 id 由服务端分配，请留空');
          } else {
            if (!positive(input.id) || seen.has(input.id)) fail(400, 'id 必须为正整数且不可重复');
            seen.add(input.id);
            index = draft.findIndex((row) => row.id === input.id);
            if (index < 0) fail(404, '员工不存在');
          }
          if (operation === 'delete') {
            const [removed] = draft.splice(index, 1);
            return { ...removed, __id: input.__id };
          }
          const saved = operation === 'add' ? { id: userId++, addresses: [] } : clone(draft[index]);
          Object.assign(saved, pick(input, ['name', 'code', 'sex', 'age', 'email', 'active', 'startDate']));
          if (typeof saved.name !== 'string' || !saved.name.trim()) fail(400, '姓名不能为空');
          if (saved.name === 'FAIL') fail(400, '名称 FAIL 触发固定失败，请修改后重试');
          if (typeof saved.code !== 'string' || !/^EMP\d{3}$/.test(saved.code)) fail(400, '员工编码必须为 EMP 加三位数字');
          if (draft.some((row) => row.id !== saved.id && row.code === saved.code)) fail(409, '员工编码已存在');
          if (saved.age != null && (!Number.isInteger(saved.age) || saved.age < 18 || saved.age > 100)) fail(400, '年龄必须为 18～100 的整数');
          if (saved.sex != null && !['M', 'F'].includes(saved.sex)) fail(400, '性别必须为 M 或 F');

          // children 默认提交增量行，不能直接覆盖整个地址列表。先在副本应用，再整体提交。
          // 依据 1.6.7 dataset/data-set/Record.js: normalizeCascadeData / commit。
          const addressResult = [];
          const removedAddresses = [];
          const seenAddresses = new Set();
          if (input.addresses !== undefined) {
            if (!Array.isArray(input.addresses) || input.addresses.length > 100) fail(400, 'addresses 必须为最多 100 条记录的数组');
            for (const line of input.addresses) {
              if (!object(line) || !['add', 'update', 'delete', 'sync'].includes(line.__status)) fail(400, '地址记录状态不合法');
              if (line.__id !== undefined && !positive(line.__id)) fail(400, '地址 __id 必须为正整数');
              const adding = line.__status === 'add';
              if (adding && line.id != null) fail(400, '新增地址 id 由服务端分配');
              const at = adding ? -1 : saved.addresses.findIndex((row) => row.id === line.id);
              if (!adding && (!positive(line.id) || seenAddresses.has(line.id))) fail(400, '地址 id 不合法或重复');
              if (!adding && at < 0) fail(404, '当前员工不存在该地址');
              seenAddresses.add(line.id);
              if (line.__status === 'delete') {
                // 子表 commitData 需要删除行回显，才能清除 destroyed 和 dirty 状态。
                removedAddresses.push({ ...saved.addresses[at], __id: line.__id, __status: 'delete' });
                saved.addresses.splice(at, 1);
                continue;
              }
              const address = adding ? { id: addressId++, isDefault: false } : { ...saved.addresses[at] };
              Object.assign(address, pick(line, ['city', 'detail', 'phone', 'isDefault']));
              if (!['city', 'detail'].every((key) => typeof address[key] === 'string' && address[key].trim())
                || !/^1[3-9]\d{9}$/.test(address.phone) || typeof address.isDefault !== 'boolean') fail(400, '地址需填写城市、详细地址、有效手机号和布尔类型的默认标记');
              if (adding) saved.addresses.push(address);
              else saved.addresses[at] = address;
              addressResult.push({ ...address, __id: line.__id });
            }
          }
          if (operation === 'add') draft.push(saved);
          else draft[index] = saved;
          // DataSet.js: handleSubmitSuccess 按 dataKey 解包；commitData 用 __id 对应原记录，
          // Record.commit 回写 id 并恢复 sync。关联标识只放响应，不能存入业务集合。
          return { ...saved, __id: input.__id, addresses: [...saved.addresses.map((row) => (
            addressResult.find((line) => line.id === row.id) || row
          )), ...removedAddresses] };
        });
        rows = draft;
        nextId = userId;
        nextAddressId = addressId;
        res.json({ success: true, content: result, totalElements: rows.length });
      } catch (error) { next(error); }
    };
  }
  router.post('/users', write('add'));
  router.put('/users', write('update'));
  router.delete('/users', write('delete'));
  router.use((error, req, res, next) => {
    const status = error.status || 500;
    res.status(status).json({ message: status === 500 ? '本地 mock 操作失败' : error.message });
  });
  app.use('/mock/playground', router);
};
