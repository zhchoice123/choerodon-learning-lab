# 09-3 全局 dataKey / totalKey：a.b 路径

## 这一节学什么

很多后端把列表包在好几层里。`dataKey` / `totalKey` 可以写成路径，逐层取值。

## 核心概念

```text
{ "success": true, "result": { "records": [...], "totalCount": 12 } }
dataKey:  'result.records'
totalKey: 'result.totalCount'
```

路径不存在时，整条响应会被当成一条记录（01-4 见过这个现象）。

## 看样例

v1 的列表在 `result.records`：表格 5 行，分页器 12 条。

## 练习

按 v2 的格式写出两个路径（2 个 TODO）。

## 验收

- [ ] 表格显示 5 名员工，分页器共 45 条
- [ ] 翻页正常

## 想一想

如果某个接口的响应外壳和其他接口都不一样，你会改全局配置，还是在那个 DataSet 上单独写？（09-5）
