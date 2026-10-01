# 07-4 主从一起提交：头的 transport.submit

## 这一节学什么

头和行的修改要**一起**保存：一次请求、要么全成功、要么全失败。

## 核心概念

```js
const roleDS = new DataSet({
  children: { permissions: permissionDS },
  transport: { submit: { url: '/mock/s/07-4/roles/submit', method: 'POST' } },
});
await roleDS.submit();   // 只提交头
```

请求体：

```json
[{ "id": 101, "name": "平台管理员", "__status": "update",
   "permissions": [{ "code": "report-view", "__status": "add", "__id": 1203 }] }]
```

| 要点 | 说明 |
|---|---|
| 只配头的 `submit` | 子表不配写接口 |
| 只调用头的 `submit()` | 会级联校验子表，并把修改过的行嵌进去 |
| 子数组的键名 | 就是 `children` 里的键名（这里是 `permissions`） |
| 只改了行时 | 头也会出现在请求里（作为 update） |

`masterContext` 是 1.6.7 的兼容底座，照抄即可，不是本节知识点。

## 看样例

新增一条权限保存：只有一次 submit 请求，新行拿到 id。

## 练习

配置提交接口、完成保存（2 个 TODO）。

## 验收

- [ ] 新增技能 `SKILL_X` 保存：只有一次 submit 请求，请求体里员工带着 `skills` 数组
- [ ] 保存成功后，新技能的 ID 列显示后端分配的 id
- [ ] 技能编码填小写 `abc`：前端校验拦住，不发请求

## 想一想

为什么不让子表自己配 create / update，分别提交？那样会有什么风险？
