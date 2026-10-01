# 05-5 提交失败：保留草稿

## 这一节学什么

后端拒绝保存时，用户刚输入的内容**不能丢**：显示原因，让用户改了再重试。

## 核心概念

```js
const dataSet = new DataSet({
  feedback: {
    submitFailed: (error) => dataSet.setState('submitError', error.response?.data?.message),
  },
});

try { await dataSet.submit(); }
catch (error) { setResult(`保存失败：${dataSet.getState('submitError')}`); }  // 不要 reset！
```

| 现象 | 原因 |
|---|---|
| catch 里拿不到后端原因 | 抛出的异常被框架包装过，丢了 `response`；要在 `feedback.submitFailed` 里提前记下 |
| 失败后草稿还在 | 新增 / 修改失败时，框架**不会**提交或重置记录 |
| 删除失败例外 | 删除失败时，框架会撤销删除标记，记录回到原状 |

**不要**在失败时 `reset()` 或重新 `query()`：那会把用户的输入全部丢掉。

## 看样例

1. 把名称改成 `FAIL` 保存：提示后端原因，表格里仍是 `FAIL`
2. 改成正常名称再保存：成功

## 练习

记下失败原因、去掉隐患（2 个 TODO）。

## 验收

- [ ] 姓名改成 `FAIL` 保存：提示里有后端返回的原因
- [ ] 失败后表格里仍然是 `FAIL`，没有被撤销
- [ ] 改回正常姓名再保存：提示成功

## 想一想

如果用户一次改了 5 行，只有 1 行触发了后端错误，失败时其他 4 行的修改应该怎样处理？
