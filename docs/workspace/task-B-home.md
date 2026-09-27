# 任务 B：首页与选择难度（React）

你是负责首页的前端开发者。项目是一个 Choerodon UI 学习项目：choerodon-ui 1.6.7（choerodon-ui/pro）、React 16.14、mobx 4、CRA 5。
先阅读 [README.md](./README.md) 和 [CONTRACT.md](./CONTRACT.md)。

## 你只能修改

src/learn/home/**（组件、样式、测试）、docs/workspace/report-B.md。
**不能修改** src/learn/api.js、router.js、constants.js、App.js，也不能修改任务 A、C 的文件。不新增依赖。
接口由任务 A 并行开发，你开发期间它还不可用：**一律用 `jest.mock` 模拟 `learnApi`**，并处理好接口不可用的情况。

## 要做的事

用你的实现整体替换桩文件 `src/learn/home/HomePage.js`（组件接口见 CONTRACT 第 3 节）。

1. **页面**：标题和一句使用说明；9 张单元卡片，显示序号、标题、知识点（来自 props.units）、状态标签
   （未开放 / 未开始 / 进行中·当前难度）；每张卡片有三个难度按钮：入门 / 标准 / 挑战（文案取自 constants.js）。
   未开放的单元按钮禁用
2. **点击难度后的流程**（核心逻辑，写成可以单独测试的纯函数或 hook）：
   | 当前状态 | 行为 |
   |---|---|
   | not-started，且 matched 等于所选难度 | 直接进入单元 |
   | not-started，且 matched 不同 | 调用 resetExercise 切换模板（这时没有作业，不必询问），再进入 |
   | in-progress | 弹出确认框（Choerodon `Modal.confirm` 或 `Modal.open`）：「继续上次的代码」直接进入；「以『挑战』难度重新开始」调用 resetExercise，并提示备份路径后进入；「取消」什么都不做 |
   | 接口不可用 | 不修改任何东西，提示「本地接口不可用，已直接进入单元」，然后进入 |
   进入单元一律调用 `navigate()`
3. **进度数据**：挂载时调用 `listUnits()`；按钮操作期间显示 loading，防止重复点击；失败时显示错误提示，可以重试
4. **样式**：写在 src/learn/home/home.css，由组件自己 import；在 1024px 和 1440px 宽度下布局都要正常

## 测试（src/learn/home/*.test.js，jest.mock learnApi）

覆盖上面表格的每一行；确认框三个选项各自的行为；loading 期间重复点击只调用一次接口；
未开放单元的按钮禁用；listUnits 失败时有提示，并且仍然可以进入单元。

## 完成标准

- `CI=true yarn test --watchAll=false`、`CI=true yarn build` 全部通过
- `yarn start` 打开 `#/`：卡片和按钮正常显示（任务 A 未完成时，状态显示为「接口不可用」，但不白屏）
- `git diff --name-only BASE HEAD` 只包含你名下的文件
- 写 docs/workspace/report-B.md：交互流程说明、测试清单、需要在集成后于浏览器里确认的点
