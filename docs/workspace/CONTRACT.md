# 接口契约（三个任务共同遵守，修改需经任务 D 统一处理）

## 1. 课程标识：章节与小节

每章拆成若干**小节**（一个小节一个知识点），章节本身是该章的**综合练习**。两者统称「课程」，结构相同（index.js、Example.js、Exercise.js、README.md、templates/）。

| | 章节（综合练习） | 小节 |
|---|---|---|
| 课程号 `number` | `"01"`～`"09"` | `"01-2"`（章节号-小节序号） |
| key | `"unit-01"` | `"unit-01-2"` |
| 目录 | `src/units/01-dataset-basics/` | `src/units/01-dataset-basics/sections/2-table-columns/` |
| 难度 | `easy` / `normal` / `hard` | 只有 `normal`（单一难度 + 逐级提示） |
| 备份 | `.backup/01-dataset-basics/` | `.backup/01-dataset-basics/sections/2-table-columns/` |

- 难度文案见 src/learn/constants.js（入门 / 标准 / 挑战）
- 学习顺序：每章先学小节，再做综合练习：`01-1 … 01-7, 01, 02-1 …`
- 服务端从目录发现小节；前端从各章 `sections/index.js` 导入。两者必须一致（src/units/sections.test.js 校验）
- 课程号也接受不补零的写法：`1`、`1-2`

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
// 首页
// units：src/learn/lessons.js 的 chapters（含未开放章节），每章带 sections 数组
export default function HomePage({ units }) {}

// 课程工作台
// unit：src/learn/lessons.js 的一门课程（章节或小节）：key、title、doc、Example、Exercise，
//   kind（'chapter' / 'section'）；小节另有 chapter（所属章节）、hints（1～3 条逐级提示）
export default function UnitWorkspace({ unit }) {}
```

src/learn/lessons.js 提供课程目录：`chapters`、`lessons`（学习顺序）、`findLesson(key)`、`chapterOf(lesson)`、`neighbors(key)`、`lessonLabel(lesson)`。

课程 meta 可选 `exclusivePreview: true`：工作台只挂载当前标签的预览（样例和练习不同时存在）。
用于会修改全局状态的课程（第 09 章及其小节的 configure / 语言包），默认不设置，其他课程的预览行为不变。

小节 mock：第 03～09 章的每个小节拥有所属章节 mock 的独立副本，前缀 `/mock/s/<小节号>/`（mock/sections.js），
协议与章节相同、数据互不影响；第 01、02 章小节只读共享接口（`/mock/roles`、`/mock/guide/user`）。

两个组件都要在「本地接口不可用」时（`yarn build` 产物、jest 测试、任务 A 未完成）优雅降级：
显示提示，不白屏、不抛错。

## 4. HTTP 接口（任务 A 实现；只在 yarn start 时存在）

前缀 `/__learn/api`。请求和响应都是 JSON。错误统一为 `{ "error": "<CODE>", "message": "<中文说明>" }`。

### GET /__learn/api/units

按学习顺序列出所有课程（小节在前、章节在后），每项额外带 `chapter`（所属章节号）和 `kind`（`"section"` / `"chapter"`）。未开放章节不列出小节。
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
