# 02-2 read 函数：data 与 params

## 这一节学什么

`transport.read` 除了写成对象，还可以写成**函数**：拿到查询条件和分页参数，自己组装请求。

## 核心概念

```js
transport: {
  read: ({ data, params }) => ({
    url: '/mock/roles',
    method: 'GET',
    params: { ...params, ...data, enabled: true },
  }),
}
```

| 参数 | 内容 |
|---|---|
| `data` | 查询条件（来自 `queryDataSet` 的当前记录） |
| `params` | 分页、排序参数：`page`、`pagesize`…… |

函数的返回值就是 axios 的请求配置，可以改地址、加参数、改方法。

## 看样例

每次请求都带 `enabled=true`：「启用」列全是勾选；按名称查询时 `name` 和 `enabled` 一起发出。

## 练习

员工列表只显示在职员工，同时保留姓名查询（2 个 TODO）。

## 验收

- [ ] 首次加载、翻页、查询，请求都带 `active=true`
- [ ] 「在职」列全部是勾选
- [ ] 姓名查询仍然有效

## 想一想

如果返回值里只写 `params: data`，会丢掉什么？表格会出现什么现象？
