# 任务 C 交付报告：单元工作台（Monaco 编辑器 + 实时预览）

分支 `feat/learn-workspace`，基于 BASE `7f7564d`。

## 修改的文件（全部在归属范围内）

| 文件 | 说明 |
|---|---|
| `scripts/patch-dev-overlay.js` | 替换桩文件：关闭 CRA 5 开发模式下全屏运行时错误遮罩（`client.overlay.runtimeErrors: false`），满足幂等性与安全退出 |
| `scripts/patch-dev-overlay.test.js` | `node:test` 测试：临时文件验证替换正确、重复执行幂等性、找不到目标与文件缺失不崩溃 |
| `src/learn/workspace/UnitWorkspace.js` | 替换桩文件：工作台整体实现（Monaco 离线加载、JSX 支持、保存/快捷键/422 Marker、未保存拦截、重置流程、分栏拖拽与降级） |
| `src/learn/workspace/ErrorBoundary.js` | 预览区运行时错误隔离边界：捕获异常防止白屏、支持 resetKey / children 变化自动恢复与手动重试 |
| `src/learn/workspace/ErrorBoundary.test.js` | ErrorBoundary 单元测试（错误隔离、堆栈展示、代码热更自动恢复、手动重试） |
| `src/learn/workspace/UnitWorkspace.test.js` | 工作台单元测试（Mock `@monaco-editor/react` 与 `learnApi`，覆盖全部核心逻辑与降级分支） |
| `src/learn/workspace/workspace.css` | 工作台完整样式（顶部工具栏、未保存动画红点、标签栏、分栏拖拽手柄、错误边界卡片、Markdown 排版等） |
| `docs/workspace/report-C.md` | 本交付报告 |

运行 `git diff --name-only 7f7564d HEAD`，所有变更均落在任务 C 归属范围内。未碰 `src/learn/api.js`、`router.js`、`constants.js`、`App.js` 或 `src/units/**`，未新增任何 npm 依赖。

---

## 核心实现说明

### 1. 布局与分栏
- **顶部工具栏**：
  - 「返回首页」调用 `navigate(HOME_ROUTE)`，受未保存拦截守卫保护。
  - 显示单元完整标题（`unit.title`）。
  - 动态状态与难度标签：未开放（灰）、未开始 · 难度（绿）、进行中（蓝）、接口不可用（灰/黄）。
  - 「保存」按钮：包含未保存修改的呼吸动画圆点（`workspace-unsaved-dot`），提供快捷键提示。
  - 「重置」控制组：下拉选择「入门 / 标准 / 挑战」，点击后弹出确认框，调用 `resetExercise` 并展示服务端备份路径。
- **左右分栏与拖拽**：
  - 左侧编辑器（或说明文档），右侧实时预览区（受 ErrorBoundary 保护）。
  - 中间包含 vertical resizer，支持鼠标拖拽实时调节左右宽度百分比（限定 20%～80% 之间）。
- **三标签页切换**：
  - **练习**：可编辑 Monaco + `<ErrorBoundary resetKey={savedCode}><Exercise /></ErrorBoundary>`。
  - **样例**：只读 Monaco（展示 `getExample` 源码）+ `<ErrorBoundary><Example /></ErrorBoundary>`。
  - **说明**：使用 `marked.parse` 渲染 `getReadme` 返回的 Markdown 内容，并应用美观的排版样式。
  - 切换标签时若存在未保存的代码修改，会弹窗提醒拦截。

### 2. Monaco 编辑器与 JSX 配置
- 通过 `loader.config({ paths: { vs: '/__learn/monaco/vs' } })` 彻底切断外部 CDN 依赖，完全由本地路由服务。
- 在 `beforeMount` 中通过 `monaco.languages.typescript.javascriptDefaults.setCompilerOptions` 配置：
  - `target: ES2020`
  - `jsx: 2`（即 `JsxEmit.React`）
  - `allowJs: true`
  - `reactNamespace: 'React'`
  JSX 语法在 javascript 模式下能够正确解析且无语法报错红线。
- 编辑器参数：字号 14（`fontSize: 14`），关闭小地图（`minimap: { enabled: false }`），启用 `automaticLayout: true`。

### 3. 保存与语法错误标记（422）
- 支持点击「保存」按钮，以及编辑器内与全局快捷键 `Ctrl/Cmd + S` 拦截浏览器默认行为触发保存。
- **422 语法错误**：
  - 捕获 `LearnApiError`（`status === 422` 或 `code === 'SYNTAX_ERROR'`）。
  - 调用 `monaco.editor.setModelMarkers(model, 'syntax-error', [...])` 在对应行列精准标红，并展示错误信息横幅。
  - 服务端不写入文件，右侧预览组件保持上一次正常版本不中断。
- **保存成功**：
  - 清空 markers（`setModelMarkers(model, 'syntax-error', [])`）。
  - 清除未保存状态和圆点，状态标签更新为「进行中」。
  - 依靠 webpack Fast Refresh 热更新，不手动刷新页面。

### 4. 未保存保护
- 状态判定：`hasUnsaved = Boolean(!isUnavailable && code !== savedCode)`。
- **站内跳转拦截**：调用 `router.js` 导出的 `addNavigationGuard` 注册守卫，跳转前弹出确认框，取消时阻止跳转。
- **标签切换拦截**：点击「样例」或「说明」时，若存在未保存内容先弹出确认框。
- **关闭/刷新窗口拦截**：监听 `beforeunload` 事件，在用户尝试刷新或关闭浏览器标签时触发原生拦截。

### 5. 错误隔离与 CRA 遮罩补丁
- **ErrorBoundary**：
  - 包裹练习与样例预览区。若业务组件在 `render` 或生命周期抛出运行时错误，只在预览区域呈现红底错误卡片、错误提示以及完整的 Component Stack 堆栈追踪，主界面、导航栏与编辑器完全可用。
  - 当 `resetKey` 改变（如保存新代码、热更触发）或点击「重试预览」时，组件自动清空错误状态恢复正常渲染。
- **关闭全屏遮罩（patch-dev-overlay.js）**：
  - 正则匹配 `webpackDevServer.config.js` 中的 `overlay: { errors: true, warnings: false }`，添加 `runtimeErrors: false`。
  - 保留语法编译错误的遮罩，仅屏蔽运行时错误的全屏遮盖。
  - 具备完全幂等性，且当文件不存在或配置结构变化时安全警告退出，不影响主流程。

### 6. 离线/接口不可用优雅降级
- 当 `learnApi.getExercise` 遇到网络不通或服务端 503 桩（任务 A 未完成）时：
  - 状态标签显示「接口不可用」。
  - 编辑器显示提示代码 `// 请用 yarn start 启动以启用在线编辑\n`，并设为 `readOnly: true`。
  - 顶部显示警告条：「本地接口不可用，已进入只读模式。请用 yarn start 启动以启用在线编辑。」
  - 两个预览组件（`<Exercise />` 和 `<Example />`）照常渲染展示。

---

## 测试结果清单

1. **Jest 单元测试**：
   ```bash
   CI=true yarn test --watchAll=false
   ```
   - 全部 12 个测试套件，**128 个测试全部通过**（0 失败，0 snapshot）：
     - `src/learn/workspace/ErrorBoundary.test.js`：4 个测试全部通过。
     - `src/learn/workspace/UnitWorkspace.test.js`：13 个测试全部通过。
     - 既有单元测试与任务 0 基础测试全部保持 100% 通过。
2. **Node 脚本测试**：
   ```bash
   node --test scripts/
   ```
   - `scripts/patch-dev-overlay.test.js`（4 个测试）及 `scripts/unit.test.js`（6 个测试）**共 10 个测试全部通过**。
3. **构建测试**：
   ```bash
   CI=true yarn build
   ```
   - 生产环境编译通过（`Compiled successfully.` in 21.77s）。

---

## 浏览器实测验证（yarn start）

在任务 C 分支上启动开发服务器验证：
1. **Monaco 本地加载**：
   - 访问 `GET /__learn/monaco/vs/loader.js` 返回 `200 OK`（30 KB，缓存 1 天）。
   - 访问 `GET /__learn/monaco/vs/editor/editor.main.js` 返回 `200 OK`（3.7 MB）。
   - Network 面板中确认所有 Monaco 资源均来自本地，没有任何外部 CDN 请求。
2. **降级逻辑实测**：
   - 当前分支因为尚未合并任务 A，`/__learn/api/units` 返回 503 NOT_IMPLEMENTED。
   - 页面成功展示降级模式：顶部展示黄色只读提示，状态标签显示「接口不可用」，编辑器禁用输入并呈现引导文案。
   - 右侧 `<Exercise />` 与样例标签中的 `<Example />` 组件均正常挂载与交互，无白屏抛错。
3. **标签切换与 Markdown 说明**：
   - 点击「样例」正常展示样例组件。
   - 点击「说明」正常展示 Markdown 渲染结果。
4. **全屏遮罩补丁实测**：
   - 执行 `node scripts/patch-dev-overlay.js`，成功更新 `webpackDevServer.config.js`，加入 `runtimeErrors: false`。

---

## 需要集成后在浏览器里端到端确认的点

以下项目在任务 C 的单元测试（Mock）中均已通过，但受限于任务 A（接口服务）未合并，需要在任务 D 统一合并后验证：
1. **保存与热更新联动**：在 Monaco 中修改代码后按 Ctrl/Cmd+S，接口落盘保存后，React Fast Refresh 在不刷新浏览器页面的情况下即时更新右侧预览。
2. **422 语法错误波浪线**：输入错误语法（如缺少括号）后按保存，服务端返回 422，验证 Monaco 编辑器真实编辑器窗口中的红色波浪线与 hover tooltip 错误描述。
3. **运行时异常隔离与恢复**：在练习代码中人为抛出运行时错误（如 `throw new Error('boom')`），验证 ErrorBoundary 仅在预览区分区显示错误卡片、无全屏 Red Screen 遮罩，修改代码修复并保存后预览自动恢复。
4. **重置与备份路径**：在下拉框选择不同难度重置，真实验证 `.backup/` 目录下生成的备份文件与提示一致。
