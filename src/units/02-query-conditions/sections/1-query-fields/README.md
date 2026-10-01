# 02-1 查询字段：queryFields

## 这一节学什么

列表通常要带查询条件。DataSet 用 `queryFields` 定义条件字段，Table 根据它自动生成查询栏。

## 核心概念

```js
new DataSet({
  queryFields: [{ name: 'name', type: 'string', label: '角色名称' }],
  fields: [ /* 列表字段 */ ],
});
<Table dataSet={roleDS} queryBar="normal" />
```

| | 作用 |
|---|---|
| `fields` | 列表里每一行的字段 |
| `queryFields` | 查询条件的字段 |
| `queryDataSet` | 写了 `queryFields` 后自动创建，`queryDataSet.current` 保存当前条件 |

查询时，条件会合并进请求参数：`GET /mock/roles?page=1&pagesize=5&name=管理员`。

## 看样例

1. 表格上方出现查询栏，有「角色名称」「层级」两个输入框
2. 输入「管理员」点查询：Network 里出现 `name=管理员`，结果只剩名称含「管理员」的角色

## 练习

给员工列表加上「姓名」「性别」查询条件（2 个 TODO）。

## 验收

- [ ] 表格上方有「姓名」「性别」两个查询条件
- [ ] 姓名输入「孙」查询：请求带 `name=孙`，结果是孙二娘、孙权、孙尚香
- [ ] 性别输入 `F` 查询：只剩女性员工

## 想一想

查询条件保存在 `queryDataSet.current`，列表的当前行是 `dataSet.current`。两者是同一条记录吗？
