// 单元 03 只提供值集和校验，不写入员工或角色数据。
const { toPage } = require('./utils');
const roles = require('./data/roles');
const users = require('./data/users');

const lookups = {
  'U03.ROLE_VISIBILITY': [
    { value: 'INTERNAL', meaning: '内部可见' },
    { value: 'PUBLIC', meaning: '公开可见' },
  ],
  'U03.EMPLOYMENT_TYPE': [
    { value: 'FULL_TIME', meaning: '全职' },
    { value: 'PART_TIME', meaning: '兼职' },
    { value: 'INTERN', meaning: '实习' },
  ],
};

module.exports = function registerUnit03(app) {
  app.get('/mock/unit-03/lookups/:code', (req, res) => {
    const values = lookups[req.params.code];
    if (!values) {
      res.status(404).json({ message: '找不到单元 03 值集' });
      return;
    }
    // 小值集一次返回全部；仍遵守现有 Spring Page 响应结构。
    res.json(toPage(values, { page: 1, pagesize: values.length }));
  });

  // 延迟 250ms，便于观察「异步校验完成前不能宣告通过」。
  function checkCode(list, pattern, failureCode) {
    return (req, res) => {
      const code = typeof req.query.code === 'string' ? req.query.code.trim() : '';
      if (!pattern.test(code)) {
        res.status(400).json({ message: '编码格式不正确' });
        return;
      }
      setTimeout(() => {
        if (code === failureCode) {
          res.status(503).json({ message: '单元 03 模拟校验服务暂不可用' });
          return;
        }
        res.json({ available: !list.some((item) => item.code === code) });
      }, 250);
    };
  }

  app.get('/mock/unit-03/roles/check-code', checkCode(roles, /^[a-z][a-z0-9-]{2,19}$/, 'service-down'));
  app.get('/mock/unit-03/employees/check-code', checkCode(users, /^EMP\d{3}$/, 'EMP503'));
};
