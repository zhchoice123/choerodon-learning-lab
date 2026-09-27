# 任务 0：地基（在 main 上完成，三个并行任务开始之前）

先阅读 [README.md](./README.md) 和 [CONTRACT.md](./CONTRACT.md)。本任务把共享部分一次性落地，
让任务 A、B、C 之后**只替换自己的桩文件**，互不接触对方的代码。

## 要做的事

1. **依赖**（锁定精确版本，只在本任务里改 package.json / yarn.lock）：
   - `@monaco-editor/react@4.7.0`（peer 支持 React 16.8+）
   - `monaco-editor@0.52.2`（包含 `min/vs/loader.js`，可被本地 AMD 加载）
   - `marked@4.3.0`（任务 C 渲染 README）
   - `@babel/parser`：锁定为 node_modules 里已有的版本（任务 A 做语法检查，改为显式依赖）
   - 执行 `yarn add` 后确认 `yarn install --frozen-lockfile` 可以通过
2. **契约代码**（完整实现，后续任务只调用）：
   - `src/learn/constants.js`：`DIFFICULTIES = [{ key: 'easy', label: '入门' }, { key: 'normal', label: '标准' }, { key: 'hard', label: '挑战' }]`
   - `src/learn/router.js`：`parseHash(hash)`、`navigate(route)`、`useRoute()` hook（监听 hashchange）；兼容旧的 `#unit-05`
   - `src/learn/api.js`：按 CONTRACT 第 5 节实现 `learnApi`、`LearnApiError`、`unitNumberFromKey`
   - `devtools/monaco-static.js`：用 express.static 提供 `/__learn/monaco/vs/*`
3. **桩文件**（能运行的最简版本，之后由对应任务整体替换）：
   - `src/learn/home/HomePage.js`（归任务 B）：列出所有单元标题和链接
   - `src/learn/workspace/UnitWorkspace.js`（归任务 C）：直接渲染现有的 `src/units/UnitPage.js`，保持旧功能可用
   - `devtools/learn-api.js`（归任务 A）：导出 `registerLearnApi(app, options)`，所有 `/__learn/api/*` 请求返回 `503 { error: 'NOT_IMPLEMENTED' }`
   - `scripts/patch-dev-overlay.js`（归任务 C）：空操作，只打印一行说明
4. **接线**：
   - `src/App.js` 改用 router：`#/` → HomePage，`#/unit-0X` → UnitWorkspace，`#/playground` → Playground。保留左侧导航，并在导航顶部增加「首页」
   - `src/setupProxy.js`：依次注册 mock、monaco-static、learn-api
   - package.json 的 `postinstall` 改为：`node scripts/strip-broken-sourcemaps.js && node scripts/patch-dev-overlay.js`
5. **测试**：给 router.js、api.js 写单元测试；更新 `src/App.test.js`，确保首页能显示所有单元标题

## 完成标准

- `CI=true yarn test --watchAll=false`、`node --test scripts/unit.test.js`、`CI=true yarn build` 全部通过
- `yarn start` 后：`#/` 显示桩首页；`#/unit-05` 的样例和练习和改造前一样能用；`/__learn/monaco/vs/loader.js` 返回 200；`/__learn/api/units` 返回 503
- 不修改 src/units/**、mock/**、src/playground/**、src/index.js
- 提交到 main，把提交号告诉用户，作为三个并行任务的 BASE
