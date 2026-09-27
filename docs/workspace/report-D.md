# 任务 D 交付报告：合并与整体验收

## 合并前检查

| 分支 | 提交 | 越界检查 |
|---|---|---|
| feat/learn-api（A） | f9e1efc | 通过 |
| feat/learn-home（B） | e547e93 | 通过 |
| feat/learn-workspace（C） | 5b8a9de + 8189ab1 | 通过。另有 scripts/patch-dev-overlay.test.js，这是任务 C 文档要求编写的测试 |

先在临时 worktree 里试合并并做完整验收，发现 1 个 bug（见下），修复后再正式合并。

## 修复：Monaco 语言服务未启动（8189ab1，在 feat/learn-workspace 上）

- 现象：每次打开编辑器都报未捕获错误 `Failed to parse URL from /__learn/monaco/vs/.../tsWorker.js`，
  TypeScript worker 启动失败，补全和诊断都不可用
- 根因：CONTRACT 第 6 节（任务 0 编写）规定了相对路径 `/__learn/monaco/vs`，任务 C 严格照做。
  Web Worker 无法解析以 `/` 开头的相对路径；只把 loader.config 改成绝对地址也不够，worker 仍用相对路径
- 修复：通过 `window.MonacoEnvironment.getWorkerUrl` 给 worker 带 origin 的绝对 baseUrl；CONTRACT 第 6 节同步更正
- 顺带修复：语法错误提示重复为「语法错误：代码语法错误：…」，并附带 babel 从 0 开始的列号 `(4:6)`，
  与界面上从 1 开始的「第 7 列」矛盾。现在统一显示为「语法错误：Unexpected token（第 4 行，第 7 列）」
- 新增测试：loader 地址必须是绝对地址（旧代码下该测试失败）、worker 启动脚本、文案清洗，以及使用接口真实文案的 422 流程

## 正式合并

```
main 710add0（用户提交：项目更名为 Choerodon Learning Lab）
  ← 02137e2 Merge feat/learn-api (task A)
  ← 0e12018 Merge feat/learn-home (task B)
  ← e8a3788 Merge feat/learn-workspace (task C)
```

三个分支都没有冲突。`yarn install --frozen-lockfile` 触发 postinstall，已关闭 CRA 的运行时错误遮罩。

## 自动检查（main）

| 检查 | 结果 |
|---|---|
| `CI=true yarn test --watchAll=false` | 14 组测试、共 156 个全部通过 |
| `node --test scripts/ devtools/` | 33 个全部通过 |
| `CI=true yarn build` | 编译成功；产物中没有 registerLearnApi、@babel/parser、createUnitTools |
| `yarn unit:list` | 行为与合并前一致 |

## 浏览器端到端验收（main，PORT=3021）

开始前记录全部 8 个 Exercise.js 的 SHA-1，结束后逐个校验全部一致，`git status` 干净。

| 步骤 | 结果 |
|---|---|
| 1 首页 | 01「进行中」；02～08「未开始 · 标准」并高亮「标准」；09「未开放」，3 个按钮禁用 |
| 2 单元 02 选「挑战」 | 不询问，切换为 hard 模板后进入，标签显示「未开始 · 挑战」 |
| 3 单元 01 选「入门」 | 弹出三选一确认框，选「继续」后编辑器里是用户自己的作业，文件未变 |
| 4 编辑并保存 | 预览在不刷新页面的情况下更新 |
| 5 语法错误 | 第 4 行第 7 列标红，横幅「语法错误：Unexpected token（第 4 行，第 7 列），保存已终止。」，文件和预览都未变 |
| 6 运行时错误 | 只在预览区显示，没有全屏遮罩，编辑器可用；改正后预览自动恢复 |
| 7 未保存时离开 | 「返回首页」、侧边栏、切换标签三种方式都有提醒 |
| 8 样例 / 说明 / 自由练习区 | 样例为只读编辑器（101 行）；README 渲染出 12 个标题、7 个表格；自由练习区 10 行数据 |
| 9 页面「重置」为标准 | 恢复 normal 模板，页面显示备份路径 |
| Monaco worker | TypeScript worker 正常启动，没有未捕获错误（修复前每次都报错） |

## 收尾

- 删除不再被引用的 src/units/UnitPage.js（已被 UnitWorkspace 取代）
- 根目录 README.md「学习方式」一节改写为新流程：首页选难度、在线编辑、Ctrl/Cmd+S、重置与备份、命令行
- 删除 learn-a、learn-b、learn-c 三个 worktree；三个分支保留，均已合并进 main

## 已知、未处理

- Choerodon UI 1.6.7 自身的控制台警告（未知 DOM 属性 combineColumnFilter / forceClearActiveKey、旧生命周期方法），与本次改动无关
- 「进行中」的单元无法显示最初选择的难度：作业一旦修改就和任何模板都不一致，契约里也没有记录该信息

下一步：单元 09 和最终整体验收。
