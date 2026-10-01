# 09-6 语言包：localeContext

## 这一节学什么

切换组件库的界面语言：分页器、按钮、校验提示这些内置文案。

## 核心概念

```js
import localeContext from 'choerodon-ui/pro/lib/locale-context';
import zhCN from 'choerodon-ui/pro/lib/locale-context/zh_CN';
import enUS from 'choerodon-ui/pro/lib/locale-context/en_US';

localeContext.setLocale(enUS);
localeContext.locale.lang;   // 'en_US'
```

| 要点 | 说明 |
|---|---|
| 全局单例 | 和 configure 一样，影响整个应用 |
| 只管组件库文案 | 字段 `label` 是我们自己写的，不会跟着变 |
| 刷新 | 读取 `locale` 的组件用 `observer` 包住 |

本项目的入口 `src/index.js` 设置了中文；`LessonConfigScope` 离开本课时会恢复语言。

## 看样例

点「Switch to English」：分页器变成英文，列标题仍是「角色名称」。

## 练习

完成切换按钮和状态栏（3 个 TODO）。

## 验收

- [ ] 点按钮在中英文之间切换，按钮文字随之变化
- [ ] 状态栏显示「当前语言：中文」或「当前语言：English」
- [ ] 切成英文后离开本课：其他课程仍是中文

## 想一想

要让列标题也跟着语言变，你会怎么设计字段的 `label`？
