# 03-5 等待校验：validate() 与保存的区别

## 这一节学什么

`validate()` 返回的是 **Promise**，必须等它完成才知道结果。
另外，「校验通过」只代表数据符合规则，**并不代表已经保存**。

## 核心概念

```js
const check = async () => {
  setChecking(true);
  try {
    const valid = await roleDS.validate();
    setResult(valid ? '校验通过（尚未保存）' : '校验未通过');
  } finally {
    setChecking(false);
  }
};
```

| 写法 | 结果 |
|---|---|
| `const valid = ds.validate()` | `valid` 是 Promise 对象，永远为真 → 总显示「通过」 |
| `const valid = await ds.validate()` | 等异步查重完成，拿到真正的 `true` / `false` |

## 看样例

编码填 `site-admin` 点校验：先显示「正在校验」，约 250ms 后显示「未通过」。

## 练习

修好「先显示通过」的隐患，并加上加载状态（2 个 TODO）。

## 验收

- [ ] 编码 `EMP001` 点校验：不会先显示「校验通过」，最终显示「未通过」并提示已存在
- [ ] 编码 `EMP900`：显示「校验通过（尚未保存）」
- [ ] 校验期间按钮是加载状态，不能重复点击；编码 `EMP503` 时也能恢复

## 想一想

为什么要在提示里写「尚未保存」？如果用户看到「通过」就关掉了页面，会发生什么？
