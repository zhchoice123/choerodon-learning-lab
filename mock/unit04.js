// 单元 04 只读取表单初始值，不提供保存接口。
const { filterByQuery, toPage } = require('./utils');
const roleSeeds = require('./data/roles');
const employeeSeeds = require('./data/users');

module.exports = function registerUnit04(app) {
  // 每次注册独立深拷贝；不与旧路由、其他单元或种子对象共享可变数据。
  const roles = JSON.parse(JSON.stringify(roleSeeds));
  const employees = JSON.parse(JSON.stringify(employeeSeeds));

  function registerList(url, rows) {
    app.get(url, (req, res) => {
      const { page = '1', pagesize = '10', empty, ...conditions } = req.query;
      const isPositiveInteger = (value) => typeof value === 'string' && /^[1-9]\d*$/.test(value)
        && Number.isSafeInteger(Number(value));
      if (!isPositiveInteger(page) || !isPositiveInteger(pagesize) || Number(pagesize) > 50) {
        res.status(400).json({ message: 'page 必须为正整数，pagesize 必须为 1～50 的整数' });
        return;
      }
      if (empty !== undefined && empty !== 'true' && empty !== 'false') {
        res.status(400).json({ message: 'empty 只能为 true 或 false' });
        return;
      }
      // empty=true 供挑战档验收空记录场景，不会清空内存数据。
      const matched = empty === 'true' ? [] : filterByQuery(rows, conditions);
      res.json(toPage(matched, { page, pagesize }));
    });
  }

  registerList('/mock/unit-04/roles', roles);
  registerList('/mock/unit-04/employees', employees);
};
