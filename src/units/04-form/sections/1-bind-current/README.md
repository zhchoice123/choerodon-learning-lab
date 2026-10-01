# 04-1 Form 绑定 dataSet：编辑当前行

## 这一节学什么

`Form` 和 `Table` 一样是「显示 DataSet」的组件。Form 一次只编辑一条记录：**默认是 `dataSet.current`**。

## 核心概念

```jsx
<Form dataSet={roleDS} columns={1}>
  <TextField name="name" />
  <NumberField name="memberCount" />
</Form>
```

- 子控件只写 `name`，标签、类型、校验都来自 `fields`
- 表格点击行会改变 `current`，Form 自动切换到那一行
- 表格和表单编辑的是**同一条记录**：一边改，另一边立刻变

## 看样例

1. 点表格第 3 行：右边表单变成那个角色
2. 在表单里改名称：表格同一行跟着变

## 练习

用 Form 编辑当前员工（1 个 TODO）。

## 验收

- [ ] 右边表单有员工编码、姓名、年龄三个字段，标签是中文
- [ ] 点击表格不同的行，表单内容跟着切换
- [ ] 在表单里改姓名，表格同一行立刻变化

## 想一想

如果想同时编辑两条记录（比如对比两名员工），一个 Form 够吗？（提示：04-3 的 `record` 属性）
