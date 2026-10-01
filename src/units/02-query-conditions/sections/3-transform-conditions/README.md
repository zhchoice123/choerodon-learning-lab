# 02-3 条件转换：改名、去空白、空值

## 这一节学什么

前端查询字段和后端参数经常对不上：名字不同、用户多输了空格、或者没填。
统一在 `read` 函数里转换，**不要回写**条件记录。

## 核心概念

```js
read: ({ data = {}, params }) => {
  const name = (data.roleName || '').trim();
  return {
    url: '/mock/roles',
    method: 'GET',
    params: { ...params, ...(name ? { name } : {}) },
    data: {},
  };
}
```

| 处理 | 写法 |
|---|---|
| 改名 | `roleName` → `name` |
| 去空白 | `.trim()` |
| 丢弃空值 | 只在有值时放进 `params` |
| 清空 `data` | GET 时 1.6.7 会把 `data` 合并进参数，已手动转换就清空它 |

## 看样例

输入「 管理员 」查询：请求是 `name=管理员`，没有 `roleName`，也没有多余的空格。

## 练习

把 `keyword` 转成 `q`，`minAge` 有值才发送（2 个 TODO）。

## 验收

- [ ] 关键词输入「 EMP01 」查询：请求是 `q=EMP01`，没有 `keyword`
- [ ] 最低年龄填 50：请求带 `minAge=50`，结果年龄都 ≥ 50
- [ ] 两个条件都不填：请求里没有 `q` 和 `minAge`

## 想一想

为什么不在查询前直接把条件记录里的值改成 trim 之后的值？那样会有什么问题？
