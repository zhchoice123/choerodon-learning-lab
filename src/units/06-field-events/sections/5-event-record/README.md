# 06-5 事件记录与当前记录

## 这一节学什么

写联动时最常见的 bug：在事件里改了 `dataSet.current`，而不是触发事件的那条记录。

## 核心概念

| 概念 | 含义 |
|---|---|
| `current` | 当前行：点击行、或程序设置时变化 |
| 事件的 `record` | **值发生变化的那一条**，可能不是 current |
| `selected` | 勾选的记录；勾选**不会**改变 current |

```js
update: ({ record, name }) => {
  if (name === 'scope') record.set('permission', undefined);   // ✅ 事件记录
  // dataSet.current.set(...)                                   // ❌ 可能是另一条
},
select: ({ dataSet, record }) => { dataSet.current = record; }  // 勾选时同时定位
```

程序修改其他行、批量导入、表格里编辑非当前行时，事件记录和 current 都可能不同。

## 看样例

当前行是第一行时点按钮：只有第二行的权限被清空。

## 练习

修好联动作用错行的隐患，并让勾选同时定位（2 个 TODO）。

## 验收

- [ ] 第一行是当前行时点按钮：第二位的小组被清空，宋江的小组仍是 OPS-NET
- [ ] 勾选第二行：它同时成为当前行（行高亮）

## 想一想

为什么这个 bug 在「用户在表单里编辑当前行」时完全看不出来？
