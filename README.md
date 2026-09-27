# Choerodon Learning Lab

> **[在线体验 Choerodon Learning Lab](https://zhchoice.xyz/choerodon/)**：无需安装或登录，自动按浏览器独立保存练习与重置备份。换网络仍可继续；换浏览器、无痕模式或清除网站 Cookie 后会创建新身份。mock 数据为临时练习数据。

[![CI](https://github.com/zhchoice123/choerodon-learning-lab/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/zhchoice123/choerodon-learning-lab/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

面向 Choerodon UI Pro **1.6.7** 的个人学习工作台。通过完整样例、带 TODO 的练习和可观察的验收标准，学习 DataSet、表格、表单及业务交互。

这是社区学习项目，与 Choerodon 官方无隶属关系。项目采用 AI 辅助开发和人工验收；示例用于教学，不代表生产系统设计建议。

## 能做什么

- 9 个单元，每个单元提供入门、标准、挑战三档原始模板。
- 浏览器内 Monaco 编辑器：查看样例和说明，编辑 Exercise.js，按 Ctrl/Cmd+S 保存，通过开发服务器热更新预览。
- 保存前检查 JSX 语法；预览组件使用错误边界；离开未保存页面时提示。
- 重置前备份当前练习，可通过页面或命令行操作。
- 本地 mock 提供查询、校验、值集和增删改；安装依赖后，练习接口及编辑器资源不需要外部业务服务器或 CDN。

**运行边界：**完整功能需要 `yarn start`。`yarn build` 只生成前端静态资源，不包含学习 API、mock、Monaco 静态资源服务或热编译。仅上传 `build/` 到 Nginx / GitHub Pages，不能得到完整学习工作台；接口不可用时仅显示降级提示，不保证源码与数据预览可用。详见 [运行与部署说明](docs/deployment.md)。

## 云端在线实例

[zhchoice.xyz 的学习入口](https://zhchoice.xyz/choerodon/) 免登录，自动识别当前浏览器并独立保存练习与重置备份。换网络不丢进度；不同浏览器或清除网站 Cookie 后是新身份。云端使用独立 API 和浏览器沙箱，不运行共享 CRA 写入服务。配置、限制和回滚见 [部署与运维](deployment/README.md)。

## 快速开始

已验证环境：Node **20.18.0**、Yarn Classic **1.22.22**。依赖版本为课程固定条件；其他 Node 主版本尚未作为支持环境验收，不代表已经验证不兼容。建议使用独立版本管理器，勿替换服务器上其他项目共用的 Node。

```bash
git clone https://github.com/zhchoice123/choerodon-learning-lab.git
cd choerodon-learning-lab
# 已安装 nvm 时：nvm install && nvm use
yarn install --frozen-lockfile
cp .env.example .env.local
yarn start
```

打开 [http://localhost:3000/#/](http://localhost:3000/#/)。`.env.example` 默认只监听本机，不需要任何密钥。安装依赖需要网络。

1. 首页选择单元与难度。先读「样例」和「说明」，再完成「练习」的 TODO。
2. 按 Ctrl/Cmd+S 保存实际的 `src/units/0X-xxx/Exercise.js`，右侧预览随编译更新。
3. 重置或重新选择难度会覆盖练习，原代码先备份到 `.backup/<单元目录>/`。如需恢复，先另存当前代码，再把选定备份复制回 Exercise.js。

**修改 `mock/`、`devtools/` 或 `src/setupProxy.js` 后必须重启 `yarn start`。** 若 3000 被占用，检查已有服务终端；不要误把旧服务当成新代码，也不要停止其他项目的服务。浏览器地址以当前终端输出为准。

## 学习路线

| 单元 | 主题 |
| --- | --- |
| 01 | DataSet 基础、Table 绑定与分页 |
| 02 | 查询条件、查询参数与查询栏 |
| 03 | 字段校验、异步 validator、options 与 lookupCode |
| 04 | Form、字段组件、只读与布局 |
| 05 | 行内编辑、增删改提交、状态与失败处理 |
| 06 | 字段联动、事件与级联下拉 |
| 07 | children 主从数据集与一起提交 |
| 08 | Modal 弹窗、抽屉、校验与取消回滚 |
| 09 | 全局配置、国际化与响应格式适配 |

全部单元已开放。练习中的未实现功能是学习任务，验收要求见各单元 README；样例与练习使用不同业务数据。

## 命令与验证

```bash
yarn unit:list                          # 查看难度和当前模板匹配状态
yarn unit:reset 2 hard                   # 先备份，再用挑战模板覆盖单元 02
node --test scripts/ devtools/           # Node 工具、本地 API 与 mock 测试
CI=true yarn test --watchAll=false --runInBand  # Jest / React Testing Library
CI=true yarn build                      # 编译前端，不能替代完整服务
```

CI 在 push / PR 时执行测试与构建。没有设定覆盖率百分比门槛，也不保证所有浏览器行为都被自动测试覆盖。历史验证记录在 [docs/](docs/)，最新开源收尾记录见 [open-source-verification.md](docs/open-source-verification.md)。

## 目录与数据

- `src/units/`：样例、练习、三档模板和学习文档。
- `src/learn/`：首页、路由、编辑器与预览。
- `src/playground/`：自由练习区和框架学习资源。
- `mock/`：CommonJS 本地业务接口；写数据只在内存中，重启后恢复种子。
- `devtools/`：练习文件读写、源码语法检查和 Monaco 静态资源服务。
- `scripts/`：重置工具与依赖安装补丁。
- `docs/`：验证记录及历史任务契约；旧记录中的提交、开放状态和端口仅描述当时结果。

单元写接口与自由练习区拥有各自的内存集合。自由练习区主表读写 `/mock/playground/users`，支持员工与嵌套地址；名称 `FAIL` 可复现提交失败。原有编码黑名单等个人练习规则保留，新增员工请使用未占用的 `EMP900` 等编码，ID 留空。第二个只读查询练习仍使用共享种子接口。

## 使用限制与反馈

本地开发模式没有用户隔离，所有访问者操作同一份练习文件；React 错误边界只处理部分渲染异常，不能隔离恶意代码、死循环或任意异步错误。**不要把开发服务器和文件写接口直接开放到公网。** 云端自动身份模式另见 [部署与运维](deployment/README.md)，不能通过简单去掉开发服务器的密码来替代。

[本次依赖审计](docs/dependency-audit.md) 已报告未修复的安全问题；本仓库未承诺生产安全认证或安全维护 SLA。依赖更新需要单独验证课程兼容性。React 16 / Choerodon 1.6.7 的部分旧生命周期和 DOM 属性警告仍存在；构建也会提示主包较大。

- 使用问题或功能建议：[GitHub Issues](https://github.com/zhchoice123/choerodon-learning-lab/issues)
- 参与开发：[贡献指南](CONTRIBUTING.md)、[行为准则](CODE_OF_CONDUCT.md)
- 安全问题：[安全政策](SECURITY.md)，不要公开敏感漏洞细节或密钥
- 许可证：[MIT](LICENSE)；第三方组件、资源与许可边界见 [第三方说明](THIRD_PARTY_NOTICES.md)
