# 07-1 主从 DataSet：children

## 这一节学什么

订单和订单行、角色和权限：一条「头」对应多条「行」。DataSet 用 `children` 把它们绑在一起。

## 核心概念

```js
const permissionDS = new DataSet({ autoQuery: false, transport: { read: ... } });
const roleDS = new DataSet({ children: { permissions: permissionDS } });
// 取子表：roleDS.children.permissions
```

| 要点 | 说明 |
|---|---|
| 子 DataSet 不自动查询 | `autoQuery: false`，由头决定何时加载 |
| 切换头自动加载 | 头的 `current` 变化时，框架自动查询子表 |
| `children` 的键名 | 以后提交时，就是请求体里子数组的字段名 |

## 看样例

点第二个角色：Network 里出现 `roleId=102` 的请求，下方权限换成这个角色的。

## 练习

把技能挂到员工上，并显示技能表格（2 个 TODO）。

## 验收

- [ ] 下方显示第一名员工的技能
- [ ] 点击第二名员工：出现 `employeeId=2` 的请求，技能跟着切换

## 想一想

为什么子 DataSet 要设 `autoQuery: false`？如果设成 `true` 会发生什么？
