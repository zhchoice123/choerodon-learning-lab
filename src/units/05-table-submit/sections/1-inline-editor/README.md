# 05-1 行内编辑：editor

## 这一节学什么

在表格里直接编辑单元格。编辑开关写在列上，规则仍然写在字段上。

## 核心概念

```js
columns: [{ name: 'name', editor: true }]   // 是 editor，不是 edit
fields: [{ name: 'name', required: true }]  // 规则还是写在这里
```

- `editor: true` 时，控件按字段类型自动选择：数字 → NumberField，布尔 → CheckBox
- 编辑后：记录的 `status` 变成 `update`，DataSet 的 `dirty` 变成 `true`
- 本节只在内存里改，刷新页面就恢复

## 看样例

1. 改名称：状态栏显示 `status：update`、`dirty：true`
2. 清空名称：单元格标红（required）
3. 角色编码那一列不能编辑：没写 editor

## 练习

员工三列可编辑，并加上规则（2 个 TODO）。

## 验收

- [ ] 姓名、年龄、在职可以编辑；员工编码不能
- [ ] 清空姓名、年龄改成 70：单元格标红

## 想一想

为什么规则写在 fields 而不是 columns 上？同一个字段同时在表格和表单里编辑时，有什么好处？
