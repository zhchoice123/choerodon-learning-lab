# 01-2 Table 绑定：columns 只写 name

## 这一节学什么

Choerodon UI Pro 的核心思想是**数据驱动**：DataSet 管数据，Table 只负责显示。
Table 通过 `dataSet` 属性拿到数据，通过 `columns` 决定显示哪些列。

## 核心概念

```jsx
<Table dataSet={roleDS} columns={[{ name: 'name', width: 140 }, { name: 'code' }]} />
```

| 写在哪里 | 写什么 |
|---|---|
| DataSet 的 `fields` | `name`、`type`、`label`：数据本身的含义 |
| Table 的 `columns` | `name` 和布局：`width`、`align`、`lock`…… |

- 列的**顺序**由 `columns` 决定；没写进 `columns` 的字段不显示
- 列**标题**来自字段的 `label`，列上不用再写

## 看样例

1. DataSet 里有 `id` 字段，但表格没有这一列：`columns` 里没写
2. 「角色名称」排在「角色编码」前面：`columns` 的顺序
3. 「启用」列居中：`align: 'center'`

## 练习

fields 已经写好，完成 `columns`（2 个 TODO）。

## 验收

- [ ] 依次显示：姓名、员工编码、年龄、在职
- [ ] 不显示员工 ID 和邮箱
- [ ] 「姓名」列宽 120，「在职」列居中

## 想一想

如果在 `columns` 里给某一列写了 `label: '别的名字'`，会发生什么？标题应该在哪里改才对？
