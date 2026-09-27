# 任务 D：统一合并与整体验收

在任务 A、B、C 都完成后执行。先阅读 README.md、CONTRACT.md 和三份 report-*.md。

## 1. 合并前检查

对每个分支运行 `git diff --name-only BASE feat/xxx`，确认只修改了各自归属的文件（见 README 的归属表）。
越界的改动先列出来问用户，不要直接合并。

## 2. 依次合并

```bash
git checkout main
git merge --no-ff feat/learn-api
git merge --no-ff feat/learn-home
git merge --no-ff feat/learn-workspace
yarn install --frozen-lockfile   # 触发 postinstall，应用 patch-dev-overlay
```
按设计不应该有冲突。如果有冲突，说明有任务越界，需要报告给用户。

## 3. 自动检查

- `CI=true yarn test --watchAll=false`
- `node --test scripts/ devtools/`
- `CI=true yarn build`，并确认构建产物里没有 `/__learn/api` 的服务端代码（`grep -r "registerLearnApi" build/` 应该没有结果）
- `yarn unit:list`、`yarn unit:reset` 的命令行行为不变

## 4. 浏览器端到端验收（必须真实操作）

1. `#/` 首页：9 张卡片，01 显示「进行中」，02～08 显示「未开始·标准」，09 未开放
2. 单元 02 点「挑战」→ 直接进入，编辑器里是 hard 模板；`yarn unit:list` 显示「与 hard 模板一致」
3. 单元 01 点「入门」→ 弹出确认框 → 选「继续」→ 进入后代码仍然是用户的作业（**不要**选重新开始）
4. 在单元 02 的编辑器里做一个可见的修改 → Ctrl/Cmd+S → 预览在不刷新页面的情况下更新
5. 写一个语法错误 → 保存 → 对应行被标红，文件没有变化，预览没有变化
6. 写一个运行时错误（例如在组件里 throw）→ 保存 → 只有预览区显示错误，编辑器仍然可用，没有全屏红色遮罩 → 改回 → 预览自动恢复
7. 有未保存修改时返回首页 → 出现提醒
8. 「样例」「说明」标签正常；自由练习区 `#/playground` 正常
9. 验收结束后，用重置功能把单元 02 恢复为 normal，并确认 git 工作区里除了备份目录没有其他变化

## 5. 收尾

- 删除不再使用的代码，例如任务 0 的桩逻辑、确认无引用后的 src/units/UnitPage.js
- 更新根目录 README.md「学习方式」一节：首页选难度、在线编辑、保存快捷键、重置与备份、命令行用法
- 写 docs/workspace/report-D.md：合并记录、测试结果、端到端验收的逐条结果
- 提交，并删除三个 worktree：`git worktree remove ../learn-a`（b、c 同理）

之后再继续做单元 09 和最终验收（见之前的提示词 C、E）。
