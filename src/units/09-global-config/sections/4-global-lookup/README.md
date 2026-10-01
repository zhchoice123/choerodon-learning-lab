# 09-4 全局值集：lookupUrl / lookupAxiosMethod

## 这一节学什么

03-4 在每个字段上写值集地址。值集多了以后，改成全局配置一次，字段上只写编码。

## 核心概念

```js
configure({
  lookupUrl: (code) => `/mock/s/09-4/v1/lookups/${code}`,
  lookupAxiosMethod: 'get',
});
// 字段：{ name: 'level', lookupCode: 'ROLE.LEVEL' }
```

| 坑 | 说明 |
|---|---|
| 值集默认 **POST** | 后端只支持 GET 时，要配 `lookupAxiosMethod: 'get'` |
| 值集也用**全局 dataKey** 解析 | 值集接口的响应外壳要和列表一致 |

## 看样例

「层级」显示中文；Network 里是一次 `GET .../lookups/ROLE.LEVEL`。

## 练习

性别显示「男 / 女」（3 个 TODO）。

## 验收

- [ ] 「性别」列显示男 / 女
- [ ] Network 里是 GET `.../v2/lookups/EMP.SEX`，没有 405

## 想一想

全局 `dataKey` 改成 `data.items` 后，为什么值集也能正确解析？如果值集接口的外壳不一样，会怎样？
