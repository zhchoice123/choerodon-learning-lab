// mock 通用工具：让所有列表接口都返回和 Hzero 后端一致的 Spring Page 格式。

// 分页和排序参数不参与过滤
const RESERVED_PARAMS = ['page', 'pagesize', 'sort'];

// 按查询参数过滤：字符串字段模糊匹配，其他类型精确匹配，空值忽略
function filterByQuery(list, query) {
  const conditions = Object.entries(query).filter(
    ([key, value]) => !RESERVED_PARAMS.includes(key) && value !== undefined && value !== '',
  );
  return list.filter((item) =>
    conditions.every(([key, value]) => {
      if (!(key in item)) return true;
      const field = item[key];
      return typeof field === 'string' ? field.includes(value) : String(field) === String(value);
    }),
  );
}

// DataSet 发送的页码从 1 开始；返回的 number 与 Spring Page 一致，从 0 开始
function toPage(list, query) {
  const page = Math.max(Number(query.page) || 1, 1);
  const size = Math.max(Number(query.pagesize) || 10, 1);
  const content = list.slice((page - 1) * size, page * size);
  return {
    totalPages: Math.ceil(list.length / size),
    totalElements: list.length,
    numberOfElements: content.length,
    size,
    number: page - 1,
    content,
    empty: content.length === 0,
  };
}

// 注册一个「可过滤 + 分页」的列表查询接口
function listRoute(app, url, getList) {
  app.get(url, (req, res) => {
    res.json(toPage(filterByQuery(getList(), req.query), req.query));
  });
}

module.exports = { filterByQuery, toPage, listRoute };
