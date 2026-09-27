// 单元 09「旧系统后端」：响应格式和分页参数都不是 Hzero 的 Spring Page，用全局配置一次性适配。
// 样例用 v1（角色），练习用 v2（员工），两者格式故意不同，练习不能照抄样例的配置。
// 只读接口；缺少分页参数时按默认值返回，便于未完成的练习也能渲染并暴露问题。
const roleSeeds = require('./data/roles');
const userSeeds = require('./data/users');

const clone = (value) => JSON.parse(JSON.stringify(value));
const isInteger = (value, min) => /^\d+$/.test(String(value)) && Number(value) >= min;

const LOOKUPS = {
  v1: {
    'ROLE.LEVEL': [
      { value: 'site', meaning: '平台层' },
      { value: 'organization', meaning: '租户层' },
      { value: 'project', meaning: '项目层' },
    ],
  },
  v2: {
    'EMP.SEX': [
      { value: 'M', meaning: '男' },
      { value: 'F', meaning: '女' },
    ],
  },
};

// v1：pageNo 从 0 开始；响应 { success, result: { records, totalCount } }
function v1Page(rows, query) {
  const pageNo = query.pageNo === undefined ? 0 : query.pageNo;
  const pageSize = query.pageSize === undefined ? 10 : query.pageSize;
  if (!isInteger(pageNo, 0) || !isInteger(pageSize, 1) || Number(pageSize) > 100) {
    return { status: 400, body: { success: false, message: 'pageNo 必须是从 0 开始的整数，pageSize 必须是 1～100 的整数' } };
  }
  const start = Number(pageNo) * Number(pageSize);
  return { status: 200, body: { success: true, result: { records: rows.slice(start, start + Number(pageSize)), totalCount: rows.length } } };
}

// v2：current 从 1 开始；可选 orderBy=字段:asc|desc；响应 { code, data: { items, total } }
function v2Page(rows, query) {
  const current = query.current === undefined ? 1 : query.current;
  const limit = query.limit === undefined ? 10 : query.limit;
  if (!isInteger(current, 1) || !isInteger(limit, 1) || Number(limit) > 100) {
    return { status: 400, body: { code: 400, message: 'current 必须是从 1 开始的整数，limit 必须是 1～100 的整数' } };
  }
  let sorted = rows;
  if (query.orderBy !== undefined && query.orderBy !== '') {
    const match = /^(\w+):(asc|desc)$/.exec(query.orderBy);
    if (!match || !rows.length || !(match[1] in rows[0])) {
      return { status: 400, body: { code: 400, message: 'orderBy 格式为「字段:asc」或「字段:desc」，字段必须存在' } };
    }
    const [, field, direction] = match;
    const sign = direction === 'asc' ? 1 : -1;
    sorted = [...rows].sort((a, b) => (a[field] > b[field] ? sign : a[field] < b[field] ? -sign : a.id - b.id));
  }
  const start = (Number(current) - 1) * Number(limit);
  return { status: 200, body: { code: 0, data: { items: sorted.slice(start, start + Number(limit)), total: rows.length } } };
}

module.exports = function registerUnit09(app) {
  const roles = clone(roleSeeds);
  const employees = clone(userSeeds);
  const send = (res, { status, body }) => res.status(status).json(body);

  app.get('/mock/unit-09/v1/roles', (req, res) => send(res, v1Page(roles, req.query)));
  app.get('/mock/unit-09/v2/employees', (req, res) => send(res, v2Page(employees, req.query)));

  // 值集：响应外壳与同一版本的列表接口一致，因为 1.6.7 用全局 dataKey 解析值集响应
  // （dataset/stores/LookupCodeStore.js：generateResponseData(result, getGlobalConfig('dataKey'))）
  ['v1', 'v2'].forEach((version) => {
    const envelope = (items) =>
      version === 'v1' ? { success: true, result: { records: items } } : { code: 0, data: { items } };
    app.get(`/mock/unit-09/${version}/lookups/:code`, (req, res) => {
      const items = LOOKUPS[version][req.params.code];
      if (!items) {
        const message = `值集 ${req.params.code} 不存在`;
        res.status(404).json(version === 'v1' ? { success: false, message } : { code: 404, message });
        return;
      }
      res.json(envelope(clone(items)));
    });
    // 1.6.7 的值集请求默认用 POST（dataset/configure/index.js：lookupAxiosMethod: 'post'）
    app.post(`/mock/unit-09/${version}/lookups/:code`, (req, res) => {
      const message = '值集接口只支持 GET，请配置 lookupAxiosMethod';
      res.status(405).json(version === 'v1' ? { success: false, message } : { code: 405, message });
    });
  });
};
