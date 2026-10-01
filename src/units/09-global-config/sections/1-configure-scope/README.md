# 09-1 configure：全局配置与作用范围

## 这一节学什么

很多 DataSet 都要写同样的配置（比如 `dataKey`）时，用 `configure` 写一次，全局生效。

## 核心概念

```js
import { configure } from 'choerodon-ui';
configure({ dataKey: 'content', totalKey: 'totalElements' });   // 真实项目：写在 src/index.js
```

| 要点 | 说明 |
|---|---|
| 作用范围 | **整个应用共享的单例**，没有「局部生效」 |
| 生效时机 | 之后创建 / 查询的 DataSet 都会读取 |
| 读取当前值 | `getConfig('dataKey')`：自定义值，或默认值 |

本项目把所有课程放在同一个页面里：如果直接 `configure`，离开本课后其他课程也被改掉了。
所以用 `<LessonConfigScope config={...}>`：进入时用 `getConfig` 做快照再应用，离开时 `configure(快照, false)` 精确恢复。

## 看样例

DataSet 上没有写 `dataKey`，表格照样有 5 行、共 12 条；状态栏显示当前生效的配置。

## 练习

不改 DataSet，用全局配置修好员工列表（2 个 TODO）。

## 验收

- [ ] 员工列表显示 5 行，分页器共 45 条
- [ ] 员工 DataSet 里没有 `dataKey` / `totalKey`
- [ ] 离开本课去 01-4，那里没配 dataKey 的左表格仍然是「一行空白」（全局配置已恢复）

## 想一想

为什么 DataSet 必须在 `LessonConfigScope` 的**子组件**里创建，而不能和它写在同一个组件里？
