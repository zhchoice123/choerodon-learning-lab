# 任务 A：本地学习接口交付报告

- 日期：2026-09-27
- 工作区：`../learn-a`
- 分支：`feat/learn-api`
- 起点：`7f7564d`（开始前 HEAD 与 BASE 一致，`git status --short` 无输出）
- 规格：`docs/workspace/task-A-learn-api.md`、`CONTRACT.md` 第 4 节。

## 实现内容

1. `scripts/unit.js` 导出 `createUnitTools({ rootDir })`，提供 `readUnits`、`getUnitState`、`resetUnit` 等方法。导入时不执行 CLI；CLI 保留原有用法、默认 normal 和中文输出。核心实现只使用 Node 内置模块。
2. reset 返回代码、相对备份路径、练习路径和匹配状态；先读模板、备份成功后才原子替换练习。备份失败保留原文件；练习不存在时返回 `backupPath: null`。
3. `devtools/learn-api.js` 实现全部六个 HTTP 接口：列表、读取练习、保存、重置、读取样例、读取 README。
4. 使用 `@babel/parser` 的 `sourceType: 'module'`、`plugins: ['jsx']` 检查保存内容；语法错误不写入，行列从 1 开始。内容与磁盘逐字节相同时不改写文件，避免无意义热更新。
5. `express.json({ limit: 200 * 1024 })` 只挂载在 `/__learn/api`，不影响已有 mock 记录数组请求。超限、错误 JSON、非法参数等均返回 JSON 错误。
6. `devtools/lib/registered-units.js` 静态分析当前注册表，不执行前端或练习代码。只有注册表中导入的已开放单元可写；预告单元、未注册目录、路径穿越和符号链接均不能绕过白名单。
7. Node 测试把 `src/units` 复制到临时项目后再操作；所有成功保存、重置和备份测试只操作临时副本。

## 自动验证

执行环境：Node `v20.18.0`、Yarn `1.22.22`。

| 命令 | 实际结果 |
|---|---|
| `yarn install --frozen-lockfile` | PASS，退出码 0；未修改 package.json / yarn.lock，未新增依赖 |
| `yarn unit:list` | PASS，退出码 0；共 9 个单元，01 已改动，02～08 与 normal 一致，09 未开放 |
| `node --test scripts/unit.test.js devtools/` | PASS，退出码 0；29 项：单元工具 9、学习 API 18、Monaco 静态资源 2 |
| `CI=true yarn test --watchAll=false` | PASS，退出码 0；10 个套件、111 项测试 |
| `CI=true yarn build` | PASS，退出码 0；main gzip 970.25 kB |
| `git diff --check` | PASS，无空白错误 |

测试覆盖了三种 state、matched 顺序、原文读取、模块与 JSX 保存、错误语法定位、mtime 不变、三档备份、缺失练习恢复、404 / 409 / 400 / 413、200 KB 精确边界和 UTF-8 多字节、模板缺失、备份失败、编码及未编码的路径穿越、未注册目录、符号链接和其他路由隔离。原有单元工具 6 项测试原样保留并通过。

日志保留在本机 `/tmp/learn-a-install.log`、`/tmp/learn-a-node.log`、`/tmp/learn-a-jest.log`、`/tmp/learn-a-build.log`。日志是本轮临时证据，不属于提交文件。

构建仍提示包体积偏大；安装有依赖 peer 警告，开发服务有 webpack-dev-server 弃用提示，前端测试有框架校验日志。以上均未导致命令失败，也未通过改动依赖或前端文件来消除。

## yarn start / curl 实测

在本工作区执行：

```bash
BROWSER=none PORT=3000 yarn start
```

实际编译成功，监听 `http://localhost:3000`。执行：

```bash
curl -sS -i http://localhost:3000/__learn/api/units
```

结果：HTTP 200，JSON 内 `units.length === 9`。01 为 `in-progress` / `matched: null`；02～08 为 `not-started` / `matched: normal`；09 为 `locked`、`open: false`、`difficulties: []`。

仅向真实工作区发送不能通过语法校验的 PUT，未执行任何真实作业的成功保存或重置：

```bash
shasum -a 256 src/units/01-dataset-basics/Exercise.js
curl -sS -i -X PUT http://localhost:3000/__learn/api/units/01/exercise \
  -H 'Content-Type: application/json' \
  --data-binary '{"code":"const ok = 1;\nconst bad = ;\n"}'
shasum -a 256 src/units/01-dataset-basics/Exercise.js
```

实际响应：HTTP **422 Unprocessable Entity**。

```json
{
  "error": "SYNTAX_ERROR",
  "message": "代码语法错误：Unexpected token (2:12)",
  "line": 2,
  "column": 13
}
```

前后 SHA-256 均为：

```text
da770ea9423c47f9c291019ec009d3755d456a5dfabe5c474999bc94f7bb3931
```

本轮启动的开发服务器在实测完成后已停止。需要继续联调时，在 `learn-a` 重新运行 `yarn start`。

## 文件保护与提交范围

开始前保存全部 132 个已跟踪文件的 SHA-256；扣除本任务允许修改的 3 个已有文件后，**129 个受保护文件全部不变**。其中包含 `src/units/**`、`mock/**`、`src/playground/**`、`src/index.js`、`src/setupProxy.js`、package.json 和 yarn.lock。真实项目没有创建 `.backup/`。

本任务仅提交以下 6 个文件：

```text
devtools/learn-api.js
devtools/learn-api.test.js
devtools/lib/registered-units.js
docs/workspace/report-A.md
scripts/unit.js
scripts/unit.test.js
```

提交后检查：

```bash
git diff --name-only 7f7564d HEAD
git status --short
```

交付要求：前者只有上述 6 个本任务文件，后者无输出。任务 B/C 的工作区和文件未修改。

## 契约说明与待集成验证

- 无阻塞性契约疑问。`200 KB` 按 Express 的 200 × 1024 字节请求体上限处理，包含 JSON 包装；不是 JavaScript 字符数。
- `matched` 始终按 easy → normal → hard 取首个逐字节匹配，包括 reset 后的状态。当前三档模板内容不同，不影响契约中的 reset 示例。
- 契约未定义“已开放单元的文件/模板丢失”和“文件系统写入失败”：分别补充 HTTP 404 `FILE_NOT_FOUND`、HTTP 500 `INTERNAL_ERROR`，不返回内部绝对路径。HTTP reset 缺少 difficulty 返回 400 `BAD_DIFFICULTY`；CLI 继续默认 normal。
- API 输出两位单元号，也兼容请求中的一位单元号；任意路径格式均拒绝。
- 注册表按现有静态格式解析：命名导出的 `units` 数组、默认导入的单元目录、内联预告对象。若以后改为动态生成注册表，应由任务 D 同步调整解析器和契约。
- 未进行任务 B/C 的浏览器编辑、快捷键和热更新整体验收。此处已验证 API 真实开发服务器路径和临时项目中的写入行为；完整工作台体验由任务 D 合并后验收。
