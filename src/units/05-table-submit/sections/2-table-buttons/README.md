# 05-2 表格按钮：add / save / delete / reset

## 这一节学什么

表格的常用操作有内置按钮，写名字就能用。

## 核心概念

```jsx
<Table dataSet={roleDS} columns={columns} buttons={['add', 'save', 'delete', 'reset']} />
```

| 按钮 | 作用 | 是否请求后端 |
|---|---|---|
| `add` | 在顶部新增一行 | 否 |
| `save` | 提交所有新增、修改、删除 | 是（create / update / destroy） |
| `delete` | 确认后**立即**删除选中行 | 是（destroy） |
| `reset` | 撤销本地未保存的修改 | 否 |

`strictPageSize: false`：新增后当页超过 `pageSize` 条时，新行也能正确回写后端分配的 id。

## 看样例

1. 点「新增」，填编码 `learning-role`、名称，点「保存」：Network 里有 create 请求，新行拿到 id
2. 改一行，点「重置」：改动被撤销，没有请求

## 练习

加上四个按钮（1 个 TODO）。

## 验收

- [ ] 表格上方有新增、保存、删除、重置四个按钮
- [ ] 新增 `EMP900` 并保存：Network 里有一次 create 请求，响应 200；之后点「重置」不会让这行消失（已经保存了）
- [ ] 改姓名后点重置：恢复原值，没有请求

## 想一想

`delete` 是确认后立即请求后端；如果想「先标记删除，和其他修改一起保存」，该怎么做？（05-5 会用到 `remove`）
