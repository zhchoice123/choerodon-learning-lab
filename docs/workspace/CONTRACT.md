# 接口契约（三个任务共同遵守，修改需经任务 D 统一处理）

## 1. 单元标识

- 单元号 `number`：两位字符串，`"01"`～`"09"`
- 单元 key：`"unit-01"`，与 src/units/index.js 中一致
- 难度：`"easy" | "normal" | "hard"`，页面文案见 src/learn/constants.js（入门 / 标准 / 挑战）

## 2. 页面路由（src/learn/router.js，任务 0 提供）

| hash | 页面 | 负责 |
|---|---|---|
| `#/` 或空 | 首页 | 任务 B：`src/learn/home/HomePage.js` |
| `#/unit-05` | 单元工作台 | 任务 C：`src/learn/workspace/UnitWorkspace.js` |
| `#/playground` | 自由练习区 | 已有，不改 |
| `#unit-05`（旧格式，无斜杠） | 兼容，等同 `#/unit-05` | 任务 0 |

router.js 导出：

```js
HOME_ROUTE                 // { page: 'home' }
PLAYGROUND_ROUTE           // { page: 'playground' }
unitRoute('unit-05')       // { page: 'unit', key: 'unit-05' }
parseHash(hash)            // → 路由对象；无法识别时 { page: 'not-found', path }
toHash(route)              // → '#/unit-05'，用于 <a href>
navigate(route)            // 跳转；被拦截时返回 false
useRoute()                 // React hook，返回当前路由对象
addNavigationGuard(guard)  // guard(目标路由) 返回 false 即取消跳转；返回值是移除函数
```

- 跳转一律使用 `navigate(route)`，不要自己拼 hash。侧边栏和首页的链接也走 `navigate`
- 「有未保存修改」的提醒（任务 C）：用 `addNavigationGuard` 拦截站内跳转，用 `beforeunload` 拦截关闭或刷新页面。
  浏览器前进 / 后退按钮造成的 hash 变化无法取消，不在要求范围内

## 3. 组件接口

```js
// 任务 B：首页
// units：src/units/index.js 导出的数组（含未开放单元）
export default function HomePage({ units }) {}

// 任务 C：单元工作台
// unit：注册表中的一项（key、title、points、doc、Example、Exercise）
export default function UnitWorkspace({ unit }) {}
```

单元 meta 可选 `exclusivePreview: true`：工作台只挂载当前标签的预览（样例和练习不同时存在）。
用于会修改全局状态的单元（单元 09 的 configure / 语言包），默认不设置，其他单元的预览行为不变。

两个组件都要在「本地接口不可用」时（`yarn build` 产物、jest 测试、任务 A 未完成）优雅降级：
显示提示，不白屏、不抛错。

## 4. HTTP 接口（任务 A 实现；只在 yarn start 时存在）

前缀 `/__learn/api`。请求和响应都是 JSON。错误统一为 `{ "error": "<CODE>", "message": "<中文说明>" }`。

### GET /__learn/api/units
```json
{ "units": [
  { "number": "01", "key": "unit-01", "title": "01 DataSet 基础与 Table 绑定",
    "open": true, "difficulties": ["easy", "normal", "hard"],
    "state": "in-progress", "matched": null },
  { "number": "09", "key": "unit-09", "title": "09 全局配置与国际化",
    "open": false, "difficulties": [], "state": "locked", "matched": null }
] }
```
- `state`：`"locked"`（未开放）｜`"not-started"`（Exercise.js 与某个模板逐字节一致）｜`"in-progress"`（与所有模板都不一致）
- `matched`：一致的那个难度；多个模板内容相同时取顺序 easy → normal → hard 中的第一个；不一致时为 `null`

### GET /__learn/api/units/:number/exercise
`200 { "code": "<Exercise.js 内容>", "state": "...", "matched": "normal" | null }`

### PUT /__learn/api/units/:number/exercise
请求：`{ "code": "<新内容>" }`
- `200 { "saved": true, "state": "...", "matched": ... }`
- `422 { "error": "SYNTAX_ERROR", "message": "...", "line": 12, "column": 5 }`：**不写入文件**。line、column 都从 1 开始，可直接用于 Monaco。
  message 的实际格式是 `代码语法错误：Unexpected token (4:6)`：已带前缀，末尾是 babel 从 0 开始的列号。
  前端展示时应去掉前缀和末尾的 `(行:列)`，改用 line / column 显示位置（见 UnitWorkspace.js 的 `syntaxErrorText`）
- `400 BAD_REQUEST`：code 不是字符串；`413 TOO_LARGE`：超过 200 KB
- 内容与磁盘相同时也返回 200，但不重写文件（避免触发无意义的热更新）

### POST /__learn/api/units/:number/reset
请求：`{ "difficulty": "hard" }`
`200 { "code": "<模板内容>", "state": "not-started", "matched": "hard", "backupPath": ".backup/01-dataset-basics/Exercise.<时间戳>.js" }`
- 原文件存在时**必须先备份**，`backupPath` 为相对项目根目录的路径；原文件不存在时为 `null`
- 与 `yarn unit:reset` 使用同一套实现

### GET /__learn/api/units/:number/example
`200 { "code": "<Example.js 内容>" }`

### GET /__learn/api/units/:number/readme
`200 { "markdown": "<README.md 内容>" }`

### 通用错误
- `404 UNIT_NOT_FOUND`：单元号不存在；`409 UNIT_LOCKED`：单元未开放；`400 BAD_DIFFICULTY`：难度不合法
- **写入白名单**：只允许写 `src/units/<已开放单元目录>/Exercise.js`，路径由服务端根据单元号解析，绝不使用请求里的路径

## 5. 前端 API 客户端（src/learn/api.js，任务 0 提供，B 和 C 只调用、不修改）

```js
learnApi.listUnits()                       // → units 数组
learnApi.getExercise(number)               // → { code, state, matched }
learnApi.saveExercise(number, code)        // → { saved, state, matched }
learnApi.resetExercise(number, difficulty) // → { code, state, matched, backupPath }
learnApi.getExample(number)                // → { code }
learnApi.getReadme(number)                 // → { markdown }
unitNumberFromKey('unit-05')               // → '05'
```
失败时抛出 `LearnApiError`：`status`、`code`（如 `SYNTAX_ERROR`）、`message`、`line`、`column`；
网络不通或接口不存在时 `code` 为 `"UNAVAILABLE"`。jest 测试里用 `jest.mock('../api')`（相对路径按所在目录调整）。

## 6. Monaco 静态资源（任务 0 提供）

`GET /__learn/monaco/vs/*` → `node_modules/monaco-editor/min/vs/*`。编辑器从本地加载，**不使用 CDN**。

**必须使用带 origin 的绝对地址，并且同时配置 worker**（本节最初写成相对路径 `'/__learn/monaco/vs'`，是错误的）：
Monaco 的语言服务（补全、诊断）运行在 Web Worker 里，Worker 无法解析以 `/` 开头的相对路径，
会报 `Failed to parse URL from /__learn/monaco/vs/.../tsWorker.js`。只改 `loader.config` 不够，worker 仍然会用相对路径。

```js
const MONACO_BASE_URL = `${window.location.origin}/__learn/monaco`;
window.MonacoEnvironment = {
  getWorkerUrl: () => `data:text/javascript;charset=utf-8,${encodeURIComponent(
    `self.MonacoEnvironment = { baseUrl: '${MONACO_BASE_URL}/' };` +
    `importScripts('${MONACO_BASE_URL}/vs/base/worker/workerMain.js');`)}`,
};
loader.config({ paths: { vs: `${MONACO_BASE_URL}/vs` } });
```

实现位置：src/learn/workspace/UnitWorkspace.js。

## 7. 保存后的热更新

保存只负责写文件。webpack 监听到 `Exercise.js` 变化后，React Fast Refresh 会自动更新预览，
页面不需要手动刷新，也不需要重新请求代码。
