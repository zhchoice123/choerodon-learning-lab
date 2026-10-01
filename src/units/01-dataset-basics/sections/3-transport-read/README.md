# 01-3 从接口加载：transport.read

## 这一节学什么

把 `data` 换成接口：DataSet 通过 `transport.read` 查询后端，并自动带上分页参数。

## 核心概念

```js
new DataSet({
  primaryKey: 'id',
  autoQuery: true,
  pageSize: 5,
  transport: { read: { url: '/mock/roles', method: 'GET' } },
});
```

| 配置 | 作用 |
|---|---|
| `transport.read` | 查询接口的地址和方法 |
| `autoQuery` | `true`：DataSet 创建后立即查询第 1 页 |
| `pageSize` | 每页条数，查询时作为 `pagesize` 参数发送 |
| `primaryKey` | 记录的唯一标识 |

发出的请求：`GET /mock/roles?page=1&pagesize=5`，`page` 从 1 开始。

## 看样例

1. 打开 Network：页面一加载就有一次 `/mock/roles?page=1&pagesize=5`
2. 点分页器的下一页：请求变成 `page=2`
3. 分页器显示共 12 条

## 练习

让员工列表从接口分页加载（2 个 TODO）。

## 验收

- [ ] 页面加载后自动发出 `GET /mock/guide/user?page=1&pagesize=3`
- [ ] 表格每页 3 行，分页器显示共 45 条
- [ ] 翻页后请求的 `page` 变化

## 想一想

把 `autoQuery` 改成 `false`，表格会怎样？不改回来，还能在哪里触发第一次查询？
