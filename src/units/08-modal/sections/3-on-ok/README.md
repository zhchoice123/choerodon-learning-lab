# 08-3 onOk：校验、保存与关闭

## 这一节学什么

「确认保存」不等于「关闭弹窗」：校验不过、保存失败时，弹窗要留着让用户修改。

## 核心概念

```js
onOk: async () => {
  if (!(await record.validate())) return false;
  if (!record.dirty) return true;
  try { return Boolean(await ds.submitRecord(record)); }
  catch (error) { return false; }
},
```

| onOk 的返回值 | 弹窗 |
|---|---|
| `false` | **不关闭** |
| `true` | 关闭 |
| `undefined`（什么都没返回） | **也会关闭** ← 最常见的坑 |

`submitRecord(record)` 只保存这一条捕获的记录，不会把列表里其他草稿一起提交。

## 看样例

清空名称点确认：弹窗不关；改成合法名称确认：保存成功后关闭，表格同步更新。

## 练习

修好「总会关闭」的隐患，并完成保存（2 个 TODO）。

## 验收

- [ ] 清空姓名点确认：弹窗不关闭，显示必填提示
- [ ] 改成合法姓名点确认：Network 里有一次 update 请求，成功后弹窗关闭
- [ ] 不做任何修改点确认：直接关闭，没有请求

## 想一想

如果 onOk 里用 `ds.submit()` 而不是 `ds.submitRecord(record)`，列表里别的未保存修改会怎样？
