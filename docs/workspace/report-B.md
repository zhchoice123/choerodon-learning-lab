# 任务 B 交付报告：首页与选择难度

分支 `feat/learn-home`，基于 BASE `7f7564d`。

## 修改的文件（全部在归属范围内）

| 文件 | 说明 |
|---|---|
| src/learn/home/HomePage.js | 替换任务 0 的桩：9 张单元卡片、状态标签、三个难度按钮、提示横幅 |
| src/learn/home/startUnit.js | 点击难度后的流程，纯函数，依赖全部由参数注入 |
| src/learn/home/confirmRestart.js | 三选一确认框（Choerodon `Modal.open` + 自定义 footer） |
| src/learn/home/useUnitStatuses.js | 读取进度：loading / ready / unavailable / error，支持重试 |
| src/learn/home/home.css | 样式，由 HomePage 自行引入 |
| src/learn/home/startUnit.test.js、HomePage.test.js | 测试 |
| docs/workspace/report-B.md | 本报告 |

`git diff --name-only 7f7564d HEAD` 只包含以上文件。没有修改 api.js、router.js、constants.js、App.js，也没有新增依赖。

## 交互流程

| 当前状态 | 点击难度后 |
|---|---|
| 未开放（注册表中没有 Example，或接口返回 locked） | 按钮禁用 |
| 未开始，且 matched 等于所选难度 | 直接进入 |
| 未开始，且 matched 不同 | 调用 resetExercise 切换模板后进入，不询问（此时没有作业） |
| 进行中 | 确认框：「继续上次的代码」直接进入；「以『X』难度重新开始」重置，提示备份路径后进入；「取消」或 ✕ / 遮罩 / Esc 关闭都不做任何事 |
| 接口不可用（listUnits 失败，或 reset 时接口消失） | 不修改任何东西，提示「本地接口不可用，已直接进入单元」后进入 |
| reset 返回其他错误（如 409） | 提示错误，停留在首页 |

- 处理期间：被点击的按钮显示 loading，**所有卡片**的按钮都禁用；另外用同步的 ref 标记防止同一帧内连续点击
- 状态标签：未开放 / 读取进度… / 未开始 · 标准 / 进行中 / 接口不可用。「未开始」时，当前模板对应的难度按钮高亮
- 「进行中」无法得知原来的难度（文件已被修改，与任何模板都不一致），所以只显示「进行中」，这是契约数据的限制
- 读取进度失败（非 UNAVAILABLE）：红色横幅 + 「重试」按钮；卡片仍然可以点击进入

## 测试结果

- 新增 21 个测试：startUnit 11 个（表格每一行 + 接口中途消失 + 两种服务端错误），HomePage 10 个（真实渲染 Choerodon Button 和 Modal，只模拟 learnApi）
- `CI=true yarn test --watchAll=false`：12 组测试、共 132 个全部通过
- `node --test scripts/unit.test.js devtools/`：8 个全部通过
- `CI=true yarn build`：编译成功，没有警告
- 测试输出里只有 Choerodon 自身旧生命周期方法的 console.warn，本任务代码没有产生 console.error

## 浏览器实测（PORT=3012，任务 A 尚未完成，接口是 503 桩）

- 1024px：两列卡片；1440px：三列，按钮对齐在卡片底部
- 顶部横幅显示「本地接口不可用…」，所有卡片的标签显示「接口不可用」，页面没有白屏
- 单元 09 显示「未开放」，三个按钮都是禁用状态
- 点击 02 的「挑战」：提示「本地接口不可用，已直接进入单元」，跳转到 `#/unit-02`；Network 中只有一次 `/__learn/api/units` 请求，没有发起重置请求
- 控制台只有单元 02 页面里 Choerodon Table 的已知警告

## 需要集成后在浏览器里确认的点

1. 接口可用时，状态标签和「当前难度」高亮是否正确（01 应显示「进行中」，02～08 显示「未开始 · 标准」）
2. 对「进行中」的单元点击难度，确认框的外观和三个按钮（jsdom 中已验证行为，未在浏览器中看到真实样式）
3. 「重新开始」后的成功提示里显示的备份路径，与 `.backup/` 中实际生成的文件一致
4. 切换难度后，进入单元时编辑器里的代码就是新难度的模板

## 对契约的说明

没有需要修改契约的地方。补充一点：`resetExercise` 在切换「未开始」单元的模板时，接口依然会生成备份（契约要求原文件存在时必须备份）。
首页不提示这种情况下的备份路径，因为被覆盖的内容只是模板本身。
