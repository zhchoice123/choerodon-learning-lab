// 本地 mock 接口注册入口，由 src/setupProxy.js 在 yarn start 时加载。
// 新增接口后需要重启 dev server 才能生效。
const { filterByQuery, toPage, listRoute } = require('./utils');
const users = require('./data/users');
const roles = require('./data/roles');
const registerUnit03 = require('./unit03');
const registerUnit04 = require('./unit04');
const registerUnit05 = require('./unit05');
const registerUnit06 = require('./unit06');
const registerUnit07 = require('./unit07');
const registerUnit08 = require('./unit08');
const registerUnit09 = require('./unit09');
const registerPlayground = require('./playground');

module.exports = function registerMock(app) {
  registerUnit03(app);
  registerUnit04(app);
  registerUnit05(app);
  registerUnit06(app);
  registerUnit07(app);
  registerUnit08(app);
  registerUnit09(app);
  registerPlayground(app);
  // 员工列表：学习单元「练习」、自由练习区使用
  listRoute(app, '/mock/guide/user', () => users);
  // 角色列表：学习单元「样例」使用
  listRoute(app, '/mock/roles', () => roles);

  // 单元 02 员工搜索：q 同时匹配姓名和编码，minAge 表示年龄下限（包含边界）。
  // 使用独立路径，保留单元 01 和自由练习区的接口行为。
  app.get('/mock/guide/user/search', (req, res) => {
    const { q, minAge, ...query } = req.query;
    const keyword = typeof q === 'string' ? q.trim().toLowerCase() : '';
    const hasMinAge = minAge !== undefined && minAge !== '';
    const age = Number(minAge);
    if (hasMinAge && (!Number.isFinite(age) || age < 0)) {
      res.status(400).json({ message: 'minAge 必须是大于或等于 0 的数字' });
      return;
    }
    const matched = users.filter((user) => (
      (!keyword || user.name.includes(keyword) || user.code.toLowerCase().includes(keyword))
      && (!hasMinAge || user.age >= age)
    ));
    res.json(toPage(filterByQuery(matched, query), query));
  });
};
