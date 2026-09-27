# 贡献指南 (Contributing Guide)

感谢你对 **Choerodon Learning Lab** 的关注！我们欢迎社区贡献者一同完善这门面向企业级中后台组件库 Choerodon UI Pro 的实战学习体系。

---

## 🛠️ 环境要求

本项目经过严格锁相依赖适配，请确保使用以下环境开发与构建：

- **Node.js**：`^20.18.0`（暂不建议使用 Node 22，以避免部分开发依赖的原生绑定或解析告警）
- **包管理器**：`Yarn Classic 1.22.22`（**必须**使用 Yarn 并遵循 `yarn.lock`；请勿使用 `npm` 安装，以防 resolutions 字段失效导致循环初始化报错）

---

## 🚀 本地开发与测试

```bash
# 1. 安装锁定依赖
yarn install --frozen-lockfile

# 2. 启动本地开发服务（访问 http://localhost:3000）
yarn start

# 3. 运行前端组件与平台单元测试
CI=true yarn test --watchAll=false

# 4. 运行后端工具与接口契约测试
node --test scripts/ devtools/

# 5. 执行生产环境打包构建
CI=true yarn build
```

---

## 📁 目录组织与规范

- `src/units/`：核心教学单元目录（如 `01-dataset-basics/`、`02-query-conditions/` 等）：
  - 每个单元必须包含：`Example.js`（完整实现）、`Exercise.js`（练习骨架，带 TODO 注释）、`README.md`（知识点讲解与踩坑指南）、`templates/`（包含 easy / normal / hard 三档模板）。
  - 在 `src/units/index.js` 中按顺序集中注册。
- `src/learn/`：在线学习平台前端核心（路由管理、首页卡片与难度选择、Monaco 交互工作台）。
- `devtools/`：开发期本地服务（学习 API 服务、Monaco AMD 本地静态资源分发）。
- `mock/`：CommonJS 规范的本地数据 Mock 路由。
- `scripts/`：练习重置工具（`unit.js`）及 CRA 错误层补丁。

---

## 📝 代码风格与约定

1. **语法与格式**：
   - 2 空格缩进，单引号，加末尾分号。
   - UI 界面提示文案、注释与教学说明统一使用**规范中文**。
   - 组件使用函数式组件与 Hooks，文件名采用 PascalCase（如 `UnitWorkspace.js`）。
2. **Choerodon UI 核心实践**：
   - DataSet 实例在组件中统一使用 `useMemo` 创建，避免多次渲染重复创建。
   - 遵循标准数据契约：`dataKey: 'content'`, `totalKey: 'totalElements'`，分页 1-indexed。
   - 字段类型（string, number, boolean, date）与标签定义在 DataSet fields，Table columns 保持声明只配置 `name` 与布局。
3. **保留学习者代码**：
   - 编写或调整练习时，请保留清晰的 `// TODO` 引导注释与思考题，注重启发而非直接给出完整答案。

---

## 🤝 提交 Pull Request

1. **新建分支**：从 `main` 切出特性分支，例如 `git checkout -b feat/unit-09-global-config`。
2. **本地全量验证**：提交前确保以下 3 项命令全部通过：
   ```bash
   node --test scripts/ devtools/
   CI=true yarn test --watchAll=false
   CI=true yarn build
   ```
3. **清晰的提交信息**：采用语义化 Commit，例如 `feat(units): add unit 09 global config and locale`。
4. **提交 PR**：描述你的改动意图、验证结果与需要协作者关注的细节。
