# 07-2 子表查询参数：cascadeParams

## 这一节学什么

子表查询时要告诉后端「是哪个头的行」。默认的参数名不一定是后端要的。

## 核心概念

```js
const permissionDS = new DataSet({
  cascadeParams: (parent) => ({ roleId: parent.get('id') }),
});
```

| 情况 | 子表查询参数 |
|---|---|
| 不写 `cascadeParams` | 父 DataSet 的主键名：`id=101` |
| 写了 | 函数的返回值：`roleId=101` |

## 看样例

切换角色：Network 里是 `roleId=101` / `roleId=102`，「所属角色 ID」列和当前角色一致。

## 练习

修好写死的参数（1 个 TODO）。

## 验收

- [ ] 第一名员工：技能请求带 `employeeId=1`
- [ ] 切换到第二名员工：请求参数变成 `employeeId=2`，「所属员工 ID」列显示 2

## 想一想

如果后端需要两个参数（比如员工 id 和租户 id），`cascadeParams` 应该怎么写？
