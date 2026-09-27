# Choerodon Learning Lab

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![React](https://img.shields.io/badge/React-16.14.0-blue.svg)](https://reactjs.org/)
[![MobX](https://img.shields.io/badge/MobX-4.15.7-orange.svg)](https://mobx.js.org/)
[![Choerodon UI](https://img.shields.io/badge/Choerodon%20UI-1.6.7-red.svg)](https://open.hand-china.com/choerodon-ui/zh)
[![Node](https://img.shields.io/badge/Node-20.18.0-green.svg)](https://nodejs.org/)
[![Tests](https://img.shields.io/badge/Tests-208%20passed-brightgreen.svg)](#测试与验证)

> **Choerodon UI Pro 交互式实战学习工作台**：免 IDE、零外部网络依赖、开箱即用的前端企业级组件库沉浸式演练平台。

---

## 📖 项目简介

Choerodon UI Pro 是国内企业级开发（如 HZero 微服务平台）广泛采用的中后台前端组件库。其核心采用 `DataSet` 响应式数据驱动体系，集成了 MobX 状态管理、级联 Lookup、复杂校验与主从表提交等特性，具有较高的工程生产力，但对初学者而言学习曲线较陡。

**Choerodon Learning Lab** 为解决传统学习中“在本地 IDE、浏览器、文档之间频繁切换”的繁琐体验而设计。它直接在浏览器中集成 Monaco 编辑器与实时预览沙箱，让开发者无需打开本地 IDE，即可在页面中完成练习、快捷保存、实时热更与错误调试。

---

## ✨ 核心特性

- 💻 **Monaco 在线学习工作台**：彻底摆脱外部 CDN 依赖，通过本地 AMD 路由按需加载 Monaco 资源；开启原生 React JSX 编译支持，JSX 语法着色自然且无语法红线。
- ⚡ **毫秒级热更新预览**：在编辑器中修改练习代码，按 `Ctrl/Cmd + S` 保存后，依托 Webpack Fast Refresh 毫秒级无刷新更新右侧预览视图。
- 🛡️ **双层错误隔离与防白屏**：
  - 预览区封装 `ErrorBoundary`，代码抛出运行时异常时，仅在预览区域呈现红底错误堆栈，编辑器与主页面完全可用；代码修复保存后自动恢复。
  - 自动打入补丁禁用 Create React App 默认的全屏红色遮罩（保留真正的语法编译错误提示）。
- 🎯 **三档难度分层与安全备份**：
  - 每个单元提供 **入门（细致拆解）**、**标准（与单元契约一致）**、**挑战（进阶实战）** 三种模板。
  - 随时切换难度或一键重置，原文件自动在 `.backup/` 目录下生成带时间戳的安全备份。
- 🚦 **多层未保存保护**：
  - 路由守卫拦截（侧边栏跳转或返回首页）、内部标签切换拦截、浏览器刷新与关闭（`beforeunload`）三重防护，防止手滑丢失作业。
- 🔌 **全天候优雅降级**：
  - 本地学习 API 服务未启动或在纯静态环境（如 GitHub Pages）下，自动进入只读降级模式，呈现提示横幅与源码，两个预览组件照常可用，绝不白屏。
- 🧪 **自动化测试与工业级契约**：
  - 包含 150+ 个前端单元测试和 30+ 个 Node 服务端测试，覆盖白名单安全、路径穿越防御、200KB 限额与回滚等边缘场景。

---

## 🗺️ 单元学习路线 (Roadmap)

| 单元 | 核心知识点 | 状态 |
|:---|:---|:---:|
| **01 DataSet 基础与 Table 绑定** | primaryKey、autoQuery、分页协议、DataSet 字段类型、Table 绑定机制 | ✅ 已开放 |
| **02 查询条件与参数适配** | 独立 queryDataSet 绑定、参数过滤与映射、假值处理、快捷查询 | ✅ 已开放 |
| **03 校验规则与动态 Lookup** | required/validator 校验器、级联下拉 Lookup、代码缓存与联动重置 | ✅ 已开放 |
| **04 Form 表单与复杂控件联动** | 响应式 Form、DatePicker 适配、Switch/Radio、多字段计算与只读切换 | ✅ 已开放 |
| **05 Table 批量提交与状态流转** | 增删改状态标记（`__status`）、提交校验、write 并发控制、错误回滚 | ✅ 已开放 |
| **06 Field 级联事件与动态计算** | `dynamicProps` 计算属性、`initEvents` 监听、Record 级联属性推导 | ✅ 已开放 |
| **07 主从数据集级联与同步提交** | `bind` 绑定主从关系、`cascadeParams` 过滤、主从事务一致性提交 | ✅ 已开放 |
| **08 Modal & Drawer 弹窗事务** | 命令式 `Modal.open`、抽屉表单绑定、异步确定保存、关闭状态恢复 | ✅ 已开放 |
| **09 全局配置与国际化扩展** | `configure` 全局配置、`localeContext` 语言包、全局 Transport 适配 | ✅ 已开放 |

---

## 🚀 快速上手

### 环境要求
- **Node.js**：`^20.18.0`（建议使用 `v20.18.x`，不建议使用 Node 22+）
- **包管理器**：`Yarn Classic 1.22.22`（必须使用 Yarn 并锁定 `yarn.lock`；请勿使用 `npm`）

### 安装与运行

```bash
# 1. 克隆仓库
git clone https://github.com/your-username/choerodon-learning-lab.git
cd choerodon-learning-lab

# 2. 安装锁定依赖
yarn install --frozen-lockfile

# 3. 启动开发服务器（包含学习 API、Monaco 资源服务与 Mock 服务）
yarn start
```

启动后在浏览器打开 [http://localhost:3000](http://localhost:3000)：
1. 首页展示所有单元卡片，点击任意卡片的难度按钮（如 **入门 / 标准 / 挑战**）即可进入单元工作台。
2. 在左侧 Monaco 编辑器中完成带有 `// TODO` 的练习代码。
3. 按快捷键 `Ctrl + S`（Mac 上为 `Cmd + S`），右侧预览将即时更新！

---

## ⌨️ 常用工作流与命令行

### 快捷操作
- **保存代码**：在工作台中按 `Ctrl/Cmd + S`，或点击顶部工具栏的「保存」按钮。
- **重置练习**：点击顶部「重置」下拉选择对应难度并确认，当前练习会自动备份至 `.backup/` 目录。
- **查看样例与文档**：工作台上方提供「练习」、「样例（只读完整实现）」和「说明（Markdown 笔记与思考题）」三个标签页随时切换。

### 命令行工具
项目内置了便捷的练习管理脚本：

```bash
# 查看所有单元的当前状态与匹配难度
yarn unit:list

# 将指定单元重置为指定难度模板（会自动备份当前文件）
yarn unit:reset 02 hard
yarn unit:reset 05 normal
```

---

## 🧪 测试与验证

项目具备极高的测试覆盖率，建议在提交改动前执行全量验证：

```bash
# 运行全部前端 Jest 测试（包含工作台、首页与各单元练习测试）
CI=true yarn test --watchAll=false

# 运行 Node 端工具测试与接口安全契约测试
node --test scripts/ devtools/

# 运行生产环境构建打包
CI=true yarn build
```

---

## 🏗️ 依赖兼容与技术背景说明

- **React 16.14.0 & MobX 4.15.7**：严格匹配 Choerodon UI 1.6.7 的底层依赖要求；保留 `ReactDOM.render` 挂载机制且不开启 StrictMode。
- **react-virtualized 解析覆盖**：通过 `resolutions` 将 Choerodon 依赖的 `9.18.5` 锁定为 `9.22.6`，解决 Webpack 5 环境下的循环初始化报错。
- **Axios ESM 转换**：在 Jest 配置中对 Axios 进行 Babel 转译，保证测试直接运行真实的 Choerodon 组件与 DataSet 数据流，无需 Mock 组件库本身。

---

## 🤝 参与贡献

欢迎提交 Issue 和 Pull Request！请在提交代码前阅读 [贡献指南 (CONTRIBUTING.md)](./CONTRIBUTING.md)。

---

## 📄 开源许可证

本项目采用 [MIT License](./LICENSE) 开源许可证。
