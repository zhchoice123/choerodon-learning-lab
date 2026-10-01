# 03-4 值集：lookupCode

## 这一节学什么

选项多、或者由后端维护时，用**值集**：字段上只写编码，选项从后端读取。

## 核心概念

```js
{
  name: 'visibility',
  lookupCode: 'U03.ROLE_VISIBILITY',
  lookupUrl: (code) => `/mock/s/03-4/lookups/${encodeURIComponent(code)}`,
  textField: 'meaning', valueField: 'value',
  lookupAxiosConfig: () => ({ method: 'GET', transformResponse: [/* 取出 content */] }),
}
```

| 配置 | 作用 |
|---|---|
| `lookupCode` | 值集编码 |
| `lookupUrl` | 根据编码生成地址（字段级，不影响其他字段和全局） |
| `lookupAxiosConfig` | 调整请求：方法、响应解析 |

两个坑（都已在样例里处理）：
- 1.6.7 的值集请求**默认是 POST**
- `lookupAxiosConfig` 要写成**返回对象的函数**：直接写对象时，MobX 4 会把 `transformResponse` 数组变成 ObservableArray，axios 无法识别

## 看样例

打开下拉：Network 里有一次 `GET .../lookups/U03.ROLE_VISIBILITY`，选项是「内部可见」「公开可见」。

## 练习

「用工类型」从值集读取选项（2 个 TODO）。

## 验收

- [ ] 下拉里有「全职」「兼职」「实习」
- [ ] Network 里是 GET 请求，不是 POST
- [ ] 选「实习」后状态栏显示 `INTERN`

## 想一想

很多字段都用同一个后端的值集时，每个字段都写一遍 `lookupUrl` 很啰嗦。第 09 章会讲怎么全局配置。
