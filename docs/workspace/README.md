# 在线学习工作台：任务拆分总览

目标：首页按单元选择难度（入门 / 标准 / 挑战）→ 进入单元 → 在页面里用 Monaco 编辑练习代码 →
Ctrl/Cmd+S 保存 → 预览实时刷新。学习过程中不再需要打开 IDE。

## 为什么能并行

三个任务之间**只通过 [CONTRACT.md](./CONTRACT.md) 约定的接口通信**，并且**各自只修改自己名下的文件**。
共享部分（依赖、路由、API 客户端、入口接线、桩文件）在任务 0 一次性落地，之后三个任务只替换自己的桩。

```
             任务 0：地基（依赖 + 契约代码 + 桩 + 接线）
                    │ 提交 = 三个分支的共同起点
      ┌─────────────┼─────────────┐
   任务 A        任务 B        任务 C          ← 并行，互不修改对方文件
 本地学习接口     首页与选难度    单元工作台
  (Node)        (React)       (Monaco+预览)
      └─────────────┼─────────────┘
             任务 D：统一合并与整体验收
```

## 文件归属（最重要的规则）

| 归属 | 可以修改的文件 |
|---|---|
| 任务 0（已完成） | package.json、yarn.lock、src/App.js、src/App.test.js、src/setupProxy.js、src/learn/api.js、src/learn/router.js、src/learn/constants.js 及它们的 *.test.js、devtools/monaco-static.js、devtools/monaco-static.test.js、docs/workspace/README.md、CONTRACT.md、task-*.md，以及下面三个任务的**初始桩文件** |
| 任务 A | scripts/unit.js、scripts/unit.test.js、devtools/learn-api.js、devtools/learn-api.test.js、devtools/lib/** |
| 任务 B | src/learn/home/**（含组件、样式、测试） |
| 任务 C | src/learn/workspace/**（含组件、样式、测试）、scripts/patch-dev-overlay.js |
| 任务 D | 任何文件，但只做合并、修复集成问题、清理和文档 |
| **任何任务都不能改** | src/units/**、mock/**、src/playground/**、src/index.js、.backup/ |

每个任务结束前运行 `git diff --name-only <任务0的提交> HEAD`，输出必须全部落在自己的归属范围内。

## 分支与执行顺序

1. 在 main 上完成任务 0 并提交，记下提交号（下文称 BASE）
2. 从 BASE 分别创建分支，建议每个智能体用独立的 git worktree，互不干扰：
   ```bash
   git worktree add ../learn-a -b feat/learn-api BASE
   git worktree add ../learn-b -b feat/learn-home BASE
   git worktree add ../learn-c -b feat/learn-workspace BASE
   ```
   每个 worktree 需要单独执行一次 `yarn install --frozen-lockfile`
3. 三个智能体分别执行 [task-A](./task-A-learn-api.md)、[task-B](./task-B-home.md)、[task-C](./task-C-workspace.md)
4. 三个分支都完成后，执行 [task-D](./task-D-integration.md) 合并与验收

## 每个任务的通用完成标准

- `CI=true yarn test --watchAll=false`、`node --test scripts/unit.test.js devtools/`、`CI=true yarn build` 全部通过
- 只修改自己归属的文件
- 不新增依赖（所有依赖已在任务 0 安装）
- 在 `docs/workspace/report-<任务>.md` 写交付报告：做了什么、测试结果、没法自己验证的点、对契约的疑问

注意：`docs/workspace/report-*.md` 属于各自任务，所以也在各自的归属范围内。
