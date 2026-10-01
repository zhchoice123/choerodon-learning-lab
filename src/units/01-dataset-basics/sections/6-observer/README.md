# 01-6 observer：自动刷新

## 这一节学什么

DataSet 是 **MobX 可观察对象**：`current`、`selected`、`totalCount` 这些属性变化时，会通知关心它的组件。
组件要「关心」，就要用 `observer` 包起来。

## 核心概念

```js
import { observer } from 'mobx-react';

const Status = observer(({ dataSet }) => (
  <div>当前行：{dataSet.current ? dataSet.current.get('name') : '无'}</div>
));
```

- observer 组件**读取过**哪些可观察属性，那些属性一变，它就重新渲染
- 不需要自己写 `useState` 去同步 DataSet 的状态

## 看样例

点击不同的行、勾选几行：
1. 「observer」状态栏跟着变
2. 「普通组件」状态栏一直停在初始值

## 练习

让员工状态栏自动刷新（2 个 TODO）。

## 验收

- [ ] 点击不同的行，「当前行」跟着变
- [ ] 勾选、取消勾选，「已选 N 人」跟着变

## 想一想

如果不用 observer，要让状态栏刷新，你得怎么做？哪种更简单？
