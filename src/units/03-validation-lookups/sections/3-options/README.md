# 03-3 options 下拉：显示与保存

## 这一节学什么

下拉框经常是「看到的是中文，存下来的是编码」。用字段的 `options` 实现。

## 核心概念

```js
const levelOptions = new DataSet({
  paging: false,
  data: [{ value: 'site', meaning: '平台层' }, { value: 'project', meaning: '项目层' }],
});

fields: [
  { name: 'level', type: 'string', options: levelOptions, textField: 'meaning', valueField: 'value' },
]
```

| 属性 | 作用 |
|---|---|
| `options` | 选项来源，本身是一个 DataSet |
| `textField` | 下拉里显示的字段 |
| `valueField` | 选中后记录里保存的字段 |

## 看样例

选「项目层」：下拉框显示「项目层」，状态栏显示记录里保存的是 `project`。

## 练习

性别下拉显示「男 / 女」，保存 `M` / `F`（2 个 TODO）。

## 验收

- [ ] 下拉里有「男」「女」两个选项
- [ ] 选「女」后，下拉框显示「女」，状态栏显示 `F`

## 想一想

选项很多、或者需要从后端读取时，还像这样手写 `data` 合适吗？（下一节 03-4）
