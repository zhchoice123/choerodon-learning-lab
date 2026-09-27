# 任务 C：单元工作台（Monaco 编辑器 + 实时预览）

你是负责工作台的前端开发者。项目是一个 Choerodon UI 学习项目：choerodon-ui 1.6.7（choerodon-ui/pro）、React 16.14、mobx 4、CRA 5（webpack 5 + React Fast Refresh）。
先阅读 [README.md](./README.md) 和 [CONTRACT.md](./CONTRACT.md)。

## 你只能修改

src/learn/workspace/**（组件、样式、测试）、scripts/patch-dev-overlay.js、docs/workspace/report-C.md。
**不能修改** src/learn/api.js、router.js、constants.js、App.js、src/units/**，也不能修改任务 A、B 的文件。不新增依赖（`@monaco-editor/react`、`monaco-editor`、`marked` 已由任务 0 安装）。
接口由任务 A 并行开发，你开发期间它还不可用：测试里一律 `jest.mock` 模拟 `learnApi`；浏览器里先验证「接口不可用」时的降级表现。

## 要做的事

用你的实现整体替换桩文件 `src/learn/workspace/UnitWorkspace.js`（组件接口见 CONTRACT 第 3 节）。

1. **布局**
   - 顶部工具栏：返回首页（`navigate`）、单元标题、难度和状态标签、「保存」按钮（有未保存修改时显示圆点）、「重置」（下拉选择三种难度，确认后调用 resetExercise，并提示备份路径）
   - 下方三个标签：
     - **练习**：左边 Monaco 编辑器，右边实时预览 `<unit.Exercise />`
     - **样例**：左边只读 Monaco 显示 Example.js，右边预览 `<unit.Example />`
     - **说明**：用 marked 渲染 README.md
   - 左右分栏的宽度可以拖动调整，这一项可选
2. **Monaco**：`@monaco-editor/react` + `loader.config({ paths: { vs: '/__learn/monaco/vs' } })`，**不走 CDN**；
   语言设为 javascript，并开启 JSX 支持，保证 JSX 不被标红；字号 14；关闭 minimap
3. **保存**：Ctrl/Cmd+S（在编辑器内拦截浏览器默认的保存行为）或点「保存」按钮 → `saveExercise`
   - 422 语法错误：用 `monaco.editor.setModelMarkers` 在对应行标红，并显示错误信息；预览保持上一次成功的版本
   - 保存成功：清除标记和未保存状态；预览由 webpack 热更新，**不要**手动刷新页面
   - 有未保存修改时，切换标签、返回首页、关闭页面前都要提醒：站内跳转用 router.js 的 `addNavigationGuard`，关闭或刷新页面用 `beforeunload`（见 CONTRACT 第 2 节）
   - 任务 0 已实测：Monaco 从本地路由加载成功、没有外部请求，JSX 不会产生错误标记；
     但内置 javascript 模式对 JSX 的着色比较单一，可以按需调整主题或 tokenizer
4. **预览错误隔离**：用 ErrorBoundary 包住预览区。练习代码在运行时报错时，只在预览区显示错误和堆栈，不能让整个页面白屏；
   代码修好并热更新后，预览要能自动恢复（例如在模块更新时重置 ErrorBoundary）
5. **关闭 CRA 的全屏错误层**：CRA 5 在开发模式下遇到运行时错误会弹出全屏遮罩，挡住编辑器。实现 `scripts/patch-dev-overlay.js`：
   把 `node_modules/react-scripts/config/webpackDevServer.config.js` 里 `client.overlay` 改为 `{ errors: true, warnings: false, runtimeErrors: false }`。
   要求：可以重复执行、找不到目标文本时打印警告但不报错退出。保留编译错误的遮罩（编译错误本来就已经被保存前的语法检查拦住了）
6. **降级**：接口不可用时，编辑器显示只读提示「请用 yarn start 启动以启用在线编辑」，两个预览照常可用

## 测试（src/learn/workspace/*.test.js）

jsdom 里无法运行 Monaco：**mock `@monaco-editor/react`**（替换成一个 textarea），测试你自己的逻辑：
保存快捷键调用 saveExercise；422 时生成正确的 marker 参数；未保存状态；重置流程；ErrorBoundary 能捕获并恢复；降级提示。
为 patch-dev-overlay.js 写 node:test 测试：在临时文件上验证替换正确、重复执行结果一致、找不到目标时不崩溃。

## 完成标准

- `CI=true yarn test --watchAll=false`、`node --test scripts/`、`CI=true yarn build` 全部通过
- `yarn start` 实测：Monaco 从 `/__learn/monaco/vs` 加载（Network 里没有 CDN 请求）；JSX 高亮正常；
  「样例」和「说明」标签正常显示；接口不可用时有降级提示
- `git diff --name-only BASE HEAD` 只包含你名下的文件
- 写 docs/workspace/report-C.md：实测截图或描述、测试清单、需要集成后才能验证的点（保存后的热更新、语法错误标记）
