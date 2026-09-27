// 单元 06 只读接口；联动修改留在浏览器，不提供写接口。
const { filterByQuery, toPage } = require('./utils');
const roleSeeds = require('./data/roles');
const employeeSeeds = require('./data/users');

module.exports = function registerUnit06(app) {
  // 注册时深拷贝并补充本单元字段；不修改种子或其他单元的内存集合。
  const roles = JSON.parse(JSON.stringify(roleSeeds)).map((role) => ({
    ...role,
    scope: role.level,
    permissionCode: `${role.level}.view`,
    permissionSummary: { site: '平台查看', organization: '租户查看', project: '项目查看' }[role.level],
  }));
  const employees = JSON.parse(JSON.stringify(employeeSeeds)).map((employee, index) => ({
    ...employee,
    departmentCode: index % 2 === 0 ? 'RD' : 'HR',
    positionCode: index % 2 === 0 ? 'rd.fe' : 'hr.recruit',
    positionLabel: index % 2 === 0 ? '前端研发' : '招聘专员',
    mentor: index % 2 === 0 ? '李导师' : '',
  }));

  function registerList(url, rows) {
    app.get(url, (req, res) => {
      const { page = '1', pagesize = '2', empty, ...conditions } = req.query;
      const positiveInteger = (value) => typeof value === 'string' && /^[1-9]\d*$/.test(value)
        && Number.isSafeInteger(Number(value));
      if (!positiveInteger(page) || !positiveInteger(pagesize) || Number(pagesize) > 50) {
        res.status(400).json({ message: 'page 必须为正整数，pagesize 必须为 1～50 的整数' });
        return;
      }
      if (empty !== undefined && empty !== 'true' && empty !== 'false') {
        res.status(400).json({ message: 'empty 只能为 true 或 false' });
        return;
      }
      const matched = empty === 'true' ? [] : filterByQuery(rows, conditions);
      // 返回独立响应副本，测试直接调用路由时也不会泄露可变内存引用。
      res.json(JSON.parse(JSON.stringify(toPage(matched, { page, pagesize }))));
    });
  }

  registerList('/mock/unit-06/roles', roles);
  registerList('/mock/unit-06/employees', employees);
};
