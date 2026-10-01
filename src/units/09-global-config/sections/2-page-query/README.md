# 09-2 generatePageQuery：翻译分页参数

## 这一节学什么

对接的后端不一定用 `page` / `pagesize`。全局写一个翻译函数，所有 DataSet 都按新参数名发请求。

## 核心概念

```js
configure({
  generatePageQuery: ({ page, pageSize }) => ({ pageNo: page - 1, pageSize }),
});
```

| 要点 | 说明 |
|---|---|
| 参数 | `page`（**从 1 开始**）、`pageSize`，还有 `sortName`、`sortOrder` |
| 返回值 | **整体替换**默认的 `page` / `pagesize` |

## 看样例

Network 里是 `pageNo=0&pageSize=5`（v1 从 0 开始）；翻页后 `pageNo` 变化。

## 练习

翻译成 v2 的 `current` / `limit`（1 个 TODO）。

## 验收

- [ ] 请求是 `current=1&limit=5`，没有 `page` / `pagesize`
- [ ] 表格每页 5 行，翻页后 `current` 变化

## 想一想

如果后端还需要排序参数 `orderBy=age:desc`，参数里的哪两个值可以用来生成它？
