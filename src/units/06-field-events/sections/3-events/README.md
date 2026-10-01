# 06-3 DataSet 事件：load / update / select

## 这一节学什么

在数据读取完成、字段值变化、记录被勾选时执行自己的逻辑。

## 核心概念

```js
new DataSet({
  events: {
    load: ({ dataSet }) => {},
    update: ({ dataSet, record, name, value, oldValue }) => {},
    select: ({ dataSet, record, previous }) => {},
  },
});
```

| 事件 | 何时触发 | 参数 |
|---|---|---|
| `load` | 查询完成、数据装载后 | `dataSet`（**没有** record） |
| `update` | 字段值**真的变化**时 | `record`、`name`、`value`、`oldValue` |
| `select` | 记录被勾选时 | `record`、`previous` |

事件在创建 DataSet 时注册一次，不要在 render 里反复注册。

## 看样例

翻页、改成员数、勾选：日志依次出现 load、update、select。

## 练习

统计三种事件的次数，并记录最近一次修改（2 个 TODO）。

## 验收

- [ ] 页面加载后 load 为 1，每翻一页加 1
- [ ] 改一名员工的年龄：update 加 1，「最近一次修改」显示姓名、字段和新旧值
- [ ] 勾选一行：select 加 1

## 想一想

把一个值改成和原来一样，会触发 update 吗？这对写联动逻辑有什么好处？
