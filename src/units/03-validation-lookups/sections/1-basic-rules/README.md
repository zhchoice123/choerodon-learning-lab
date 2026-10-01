# 03-1 基础校验：required / pattern / min / max

## 这一节学什么

校验规则写在 DataSet 的 `fields` 上，表单、表格编辑都会自动生效。

## 核心概念

| 规则 | 写法 | 提示的键 |
|---|---|---|
| 必填 | `required: true` | `valueMissing` |
| 正则 | `pattern: /^...$/` | `patternMismatch` |
| 数值下限 / 上限 | `min` / `max` | `rangeUnderflow` / `rangeOverflow` |

```js
{
  name: 'code', type: 'string', required: true, pattern: /^[a-z][a-z0-9-]{2,19}$/,
  defaultValidationMessages: { valueMissing: '请输入编码', patternMismatch: '格式不正确' },
}
```

注意：提示的键名**不是**规则名，必填对应 `valueMissing`，不是 `required`。

## 看样例

1. 什么都不填点「校验」：三个字段都提示必填
2. 编码填 `Admin`（大写开头）：提示格式不正确
3. 成员上限填 0 或 101：提示超出范围

## 练习

给员工草稿加规则和提示（3 个 TODO）。

## 验收

- [ ] 都不填点校验：显示「请输入姓名」等提示，结果为「校验未通过」
- [ ] 编码 `E001` 或 `EMP0001`：提示「编码格式为 EMP 加 3 位数字」；`EMP001` 通过
- [ ] 年龄 17、61 分别提示「不能小于 18」「不能大于 60」
- [ ] 全部合法时显示「校验通过」

## 想一想

如果正则写成 `/EMP\d{3}/`（没有 `^` 和 `$`），`xxEMP0012` 能通过吗？
