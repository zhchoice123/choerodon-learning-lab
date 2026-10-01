# 02-4 查询栏：queryFieldsLimit

## 这一节学什么

条件一多，查询栏会很长。`queryFieldsLimit` 控制直接显示几个，其余收进「更多」。

## 核心概念

```jsx
<Table dataSet={roleDS} columns={columns} queryBar="normal" queryFieldsLimit={1} />
```

| 属性（写在 Table 上） | 作用 |
|---|---|
| `queryBar="normal"` | 显示查询栏 |
| `queryFieldsLimit` | 直接显示的条件个数，按 `queryFields` 的顺序 |

## 看样例

查询栏只显示「角色名称」；点「更多」才出现「角色编码」「层级」。

## 练习

员工 4 个条件，直接显示 2 个（1 个 TODO）。

## 验收

- [ ] 查询栏直接显示「姓名」「员工编码」
- [ ] 「性别」「在职」在「更多」里
- [ ] 填写「更多」里的性别 `F` 查询，结果只剩女性员工

## 想一想

最常用的条件应该放在 `queryFields` 的什么位置？
