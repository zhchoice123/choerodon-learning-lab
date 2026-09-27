# 贡献指南

欢迎修正文档、补充可复现测试、改进学习体验。提交前请阅读 [行为准则](CODE_OF_CONDUCT.md) 和 [安全政策](SECURITY.md)。

## 环境与启动

使用 `.nvmrc` 中的 Node 20.18.0 和 Yarn Classic 1.22.22：

```bash
yarn install --frozen-lockfile
cp .env.example .env.local
yarn start
```

依赖安装会执行 `postinstall`，修复固定版本依赖的 source map 和 CRA 运行时遮罩；补丁只作用于本地 node_modules。不要提交 node_modules 或构建输出。修改开发中间件和 mock 后重启服务。

## 分支与提交

仓库默认分支是 `master`。外部贡献者先 fork，从最新的 `upstream/master` 创建分支，PR 目标为 `master`。历史任务文档中的 `main` 指当时的开发流程。

提交主题用简洁的动词开头，例如 `Fix playground mock submission`。不强制 Conventional Commits。每个 PR 聚焦一个问题，提供：

- 改动原因和可观察的行为变化，相关 Issue（如有）。
- 实际执行的命令、结果，以及尚未验证的部分。
- UI 改动的截图或操作步骤；接口改动的成功与失败用例。
- 是否触及练习、模板或依赖；不要夹带自己的作业答案或运行数据。

## 代码与课程约定

2 空格缩进、单引号、分号；函数组件使用 PascalCase 文件名，注释和教学文案使用中文。CRA 的 ESLint 配置为 react-app / react-app/jest，没有另外配置格式化器。

保持 Choerodon UI 1.6.7、React 16.14、MobX 4.15.7、mobx-react 6.1.5 和 CRA 5 固定；未经单独讨论不要升级依赖或重写锁文件。使用 ReactDOM.render，不启用 StrictMode；DataSet 用 useMemo 创建。Table 使用 editor；类型和标签写在 fields 中。

默认数据协议是 `content` / `totalElements` 和从 1 开始的 `page` / `pagesize`；单元 09 为教学有意演示其他协议。请以单元 README 和源码依据为准。

保护已有 Exercise.js 和自由练习内容。新增练习初始文件与 normal 模板逐字节一致，三档未完成时均能渲染；给出 TODO 和提示，不提交练习答案。写 mock 使用独立内存集合，不改变其他单元行为。

## 验证

```bash
yarn unit:list
node --test scripts/ devtools/
CI=true yarn test --watchAll=false --runInBand
CI=true yarn build
```

前端使用 Jest / React Testing Library，文件为 `src/**/*.test.js`；Node 使用内置 node:test，文件为 `scripts/*.test.js`、`devtools/*.test.js`。没有硬性覆盖率百分比要求；测试应验证行为，尤其是提交失败、状态保留、路径限制和备份。

文件读写测试使用临时副本，不能重置真实作业。学习内容修改前后核对受保护文件 SHA-256，记录到 docs/。构建通过不等于浏览器验收通过：涉及 UI 时补充实际操作结果。没运行的检查标为 NOT RUN，不能写 PASS。

## 许可与维护

请仅贡献有权按本项目 MIT 许可证发布的内容，保留引入代码与资源的出处和许可。无需签署额外 CLA。不提交令牌、真实个人资料、`.env.local`、作业备份或个人绝对路径。维护者按实际精力处理 Issue / PR，不承诺响应时限。
