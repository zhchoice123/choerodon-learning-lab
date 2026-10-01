# 05-3 写接口：记录数组协议

## 这一节学什么

保存时，DataSet 按记录状态把修改分成三类，分别调用三个写接口。

## 核心概念

```js
transport: {
  create: { url: '/mock/s/05-3/roles/create', method: 'POST' },
  update: { url: '/mock/s/05-3/roles/update', method: 'POST' },
  destroy: { url: '/mock/s/05-3/roles/destroy', method: 'POST' },
}
```

请求体（1.6.7 默认）是**记录数组**：

```json
[{ "code": "learning-role", "name": "学习角色", "__id": 1031, "__status": "add" }]
```

| 字段 | 含义 |
|---|---|
| `__id` | 前端记录的临时标识，响应里原样带回，框架靠它把后端 id 回写到原记录 |
| `__status` | `add` / `update` / `delete` |

`destroy` 收到的**也是记录对象数组**，不是 id 数组。不要擅自改成 `{ rows: [...] }` 之类的格式。

## 看样例

依次新增保存、修改保存、删除：状态栏显示三种请求体，`__status` 分别是 add、update、delete。

## 练习

配好三个写接口（1 个 TODO）。

## 验收

- [ ] 新增 `EMP900` 保存：发出 create 请求，请求体是数组，`__status` 为 add
- [ ] 修改一名员工保存：发出 update 请求
- [ ] 删除一名离职员工：发出 destroy 请求；删除在职员工会被后端拒绝

## 想一想

为什么请求体要带 `__id`？如果没有它，后端返回的新 id 怎么对应回前端的哪一行？
