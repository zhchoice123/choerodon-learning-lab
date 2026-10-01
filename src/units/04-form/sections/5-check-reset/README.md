# 04-5 表单校验与重置

## 这一节学什么

在表单上触发校验、把表单恢复到初始值。1.6.7 的 API 和很多教程里写的不一样。

## 核心概念

```jsx
const valid = await formRef.current.checkValidity();   // 不是 validate()

<Form ref={formRef} dataSet={ds} onReset={() => setResult('已恢复')}>
  <Button type="reset">恢复初始值</Button>               {/* Pro Button 用 type，不是 htmlType */}
</Form>
```

| 能力 | 1.6.7 的写法 |
|---|---|
| 校验整张表单 | `form.checkValidity()`，返回 `Promise<boolean>` |
| 恢复初始值 | `<Button type="reset">`，Form 会调用 `record.reset()`，不发请求 |
| 重置时通知 | `onReset` |

`checkValidity` 在有 `dataSet` 时委托给 `dataSet.validate()`，校验的是**记录**，不只是表单里看得见的输入框。

## 看样例

1. 清空名称点「校验」：显示「校验未通过」
2. 改了内容点「恢复初始值」：回到「平台管理员」，提示「已恢复初始值」

## 练习

修好校验按钮、加上恢复按钮（2 个 TODO）。

## 验收

- [ ] 清空姓名点「校验」：不再报错，显示「校验未通过」
- [ ] 合法时显示「校验通过（尚未保存）」
- [ ] 改了姓名后点「恢复初始值」：姓名变回「秦秀英」，显示「已恢复初始值」

## 想一想

为什么 TODO 1 的写法在页面加载时完全不报错，点按钮才出问题？
