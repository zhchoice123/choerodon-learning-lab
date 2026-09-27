# 任务 A：本地学习接口（Node）

你是负责 Node 端的开发者。项目是一个 Choerodon UI 学习项目（CRA 5，dev server 通过 src/setupProxy.js 挂接口）。
先阅读 [README.md](./README.md) 和 [CONTRACT.md](./CONTRACT.md)，**第 4 节就是你的需求规格**。

## 你只能修改

scripts/unit.js、scripts/unit.test.js、devtools/learn-api.js、devtools/learn-api.test.js、devtools/lib/**、docs/workspace/report-A.md。
不要碰前端代码、package.json、setupProxy.js（接线已在任务 0 完成）。不新增依赖。

## 要做的事

1. **重构 scripts/unit.js**
   - 导出核心函数（例如 `readUnits`、`getUnitState`、`resetUnit`），命令行 `yarn unit:list` / `yarn unit:reset` 的行为和输出保持不变
   - 项目根目录要能通过参数传入（例如 `createUnitTools({ rootDir })`），这样测试可以在临时目录里运行
   - `resetUnit` 返回结构化结果（备份路径、写入的内容），不要只 console.log
   - 已有的 scripts/unit.test.js 必须仍然全部通过
2. **实现 devtools/learn-api.js**：`registerLearnApi(app, { rootDir })`，替换任务 0 的桩，完整实现 CONTRACT 第 4 节的全部接口
   - 语法检查：`@babel/parser`，`sourceType: 'module'`，`plugins: ['jsx']`；`loc.column` 从 0 开始，返回时加 1
   - 写入白名单：只能写已开放单元的 `Exercise.js`，路径完全由服务端根据单元号解析
   - 请求体大小上限 200 KB；内容和磁盘相同时不重写文件
   - reset 复用 scripts/unit.js 的同一套实现，必须先备份
   - 用 `express.json({ limit })` 解析请求体（express 由 webpack-dev-server 提供，在 devtools 中 require 即可）
3. **测试 devtools/learn-api.test.js**（node:test）
   - 把 src/units 复制到临时目录作为 rootDir，**绝不读写真实作业**
   - 覆盖：列表的三种 state 和 matched；读取练习、样例、README；保存成功；语法错误返回 422 且文件不变、行列号正确；
     内容相同不重写（比较 mtime）；reset 生成备份且内容等于模板；404 / 409 / 400 / 413；
     路径穿越尝试（如单元号 `../..`、`1/../../x`）一律被拒绝

## 完成标准

- `node --test scripts/unit.test.js devtools/` 全部通过；`CI=true yarn test --watchAll=false`、`CI=true yarn build` 仍然通过
- 用 `yarn start` 实测：`curl http://localhost:3000/__learn/api/units` 返回 9 个单元；
  故意 PUT 一段语法错误的代码返回 422，真实文件没有变化（实测完请确认 `git status` 干净）
- `git diff --name-only BASE HEAD` 只包含你名下的文件
- 写 docs/workspace/report-A.md：接口实测的 curl 示例和结果、测试数量、对契约的任何疑问
