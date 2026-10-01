# 04-4 表单布局：columns / colSpan

## 这一节学什么

Form 用网格排列字段：一行放几个、某个字段占几格。

## 核心概念

```jsx
<Form dataSet={roleDS} columns={2}>
  <TextField name="code" />
  <TextField name="name" />
  <TextField name="description" colSpan={2} />
</Form>
```

| 属性 | 写在哪 | 作用 |
|---|---|---|
| `columns` | Form | 每行几个字段 |
| `colSpan` | 控件 | 这个字段占几列 |

## 看样例

编码、名称一行，成员数单独一行左边，描述占满整行。

## 练习

每行 3 个字段，邮箱独占一行（2 个 TODO）。

## 验收

- [ ] 编码、姓名、年龄排在同一行
- [ ] 邮箱单独一行，宽度占满

## 想一想

如果把 `colSpan` 写成比 `columns` 还大的数，会怎样？
