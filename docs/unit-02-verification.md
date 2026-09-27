# 单元 02 交付与验证记录

本次只开放单元 02，补齐单元 01/02 的 easy / normal / hard 模板和命令行重置功能。
完整文件内容另见 [unit-02-files.md](./unit-02-files.md)，每个代码块都带绝对路径。

## 文件与练习边界

- 单元 01 当前 `Exercise.js`、`src/playground/`、`src/index.js`、`yarn.lock` 的 SHA-256 与开始前一致。
- 单元 01 normal 模板与 Git 提交 `0e141c0` 中的原始 TODO 版本逐字节一致；当前作业没有被作为模板。
- 单元 02 `Exercise.js` 与 normal 模板逐字节一致。练习仍保留 TODO，没有交付完整答案。
- 03～09 保持未开放；没有创建后续单元目录。
- 依赖版本和 packageManager 不变；package.json 只增加 `unit:reset` 和 `unit:list`。
- 只扩展 `mock/index.js` 的新查询路径；原 mock 工具、源数据和旧路由保留。

## 运行与重启

在原先运行 3000 端口的终端按 Ctrl+C，再执行：

```sh
cd /Users/zhcho/Documents/study/Choero/choerodon-ui-demo
yarn start
```

必须重启这一个 CRA 开发服务，因为它在启动时才加载 mock；没有单独的后端命令。
不用重新安装依赖，不用启动外部后端。前端改动和练习重置可通过热更新生效，
但统计初次请求次数时请完整刷新页面，避免热更新带来的额外请求。

打开 [单元 02](http://localhost:3000/#unit-02)：

1. 左侧「02 查询条件」已开放；03～09 仍显示未开始。
2. 样例显示两个查询输入框、5 行角色、分页总数 12；点「只看项目角色」变成 4 条。
3. 角色名称输入「管理员」后点击查询，结果为平台管理员和租户管理员；恢复默认后回到 12 条。
4. 切换练习：初始 normal 有 5 列员工、总数 45、问号状态栏；查询字段和快捷动作留作 TODO。
5. 共同功能验收与挑战额外验收见 [单元 02 README](../src/units/02-query-conditions/README.md)。

命令行操作：

```sh
yarn unit:list
yarn unit:reset 2 easy
```

第二条是按需执行的难度切换，会先打印备份路径再覆盖练习；也可以选择 normal 或 hard。
`yarn unit:reset 02` 与 `yarn unit:reset 2 normal` 等效。
当前列表应显示：01 已改动，02 与 normal 一致，03～09 未开放。
后续自己编辑练习后，02 会变成已改动；与某个模板完全相同才显示对应难度。

## 已执行的检查（2026-09-26）

| 检查 | 结果与范围 |
|---|---|
| `node --test scripts/unit.test.js` | PASS，6 项；临时目录验证默认难度、2/02、各档切换、备份内容及路径、已改动检测、缺失单元/模板、备份失败保护、缺失练习时创建 |
| `CI=true yarn test --watchAll=false --runInBand` | PASS，2 个测试文件 / 7 项；包括六份原始模板使用真实 DataSet/Table 渲染，HTTP 层使用内存响应 |
| `yarn build` | PASS，成功生成生产构建；保留 bundle 体积提醒 |
| `yarn unit:reset 2` | PASS，真实命令退出码 0，打印备份路径，最终恢复 normal；仅对本次新增的 02 执行 |
| `yarn unit:list` | PASS，输出 9 个单元及正确的难度、匹配状态 |
| `git diff --check` | PASS；`.backup/` 已由 Git 忽略 |
| 浏览器 + 3001 临时 CRA 服务 | PASS，实际 Chrome 操作和网络记录，见下文 |
| 16 组真实 HTTP 检查 | PASS，对本地 3001 新服务调用 fetch，断言响应状态、结果总数、首条记录、页内条数和 Spring Page 元数据 |

HTTP 检查覆盖：旧员工/角色接口、角色名称/层级、员工姓名/大小写编码联合搜索、空白关键词、
不存在关键词、在职 true/false、最低年龄 0、年龄与在职组合、第二页、女性分页、非法年龄 -1/非数字。
确认固定数据中的离职员工为 11 人，在职为 34 人，女性为 19 人；离职且年龄至少 40 为 6 人。

## 浏览器证据

使用本项目的临时服务 `BROWSER=none PORT=3001 yarn start`，验证后已结束临时服务；
原 3000 服务没有被终止，仍需按上文重启一次以加载新 mock。
实际观察到：

- 完整刷新单元 02 只请求一次 `/mock/roles?page=1&pagesize=5`。
- 仅编辑角色名称，预览更新且没有新增 mock 请求。
- 点查询只有一次 `name=管理员` 请求，没有 roleName 参数，结果总数 2。
- 点项目快捷按钮只有一次 `level=project` 请求，旧名称被清除，结果总数 4。
- 恢复默认只有一次无过滤条件请求，总数恢复 12。
- 第一次切换 normal 练习只有一次 `/mock/guide/user/search?page=1&pagesize=5`，45 人、5 列、TODO 占位正常渲染。

![单元 02 样例实际页面](/Users/zhcho/.codex/visualizations/2026/09/26/01a0dde3-c1fb-7220-8c47-bc94483edfd4/unit-02-example.png)

这里验证的是样例和原始模板可运行。员工练习完成 TODO 后的功能验收由学习者实现后再逐项检查，
没有把未完成练习的验收项标为通过。

## 现有限制与版本依据

React 16 / Choerodon 1.6.7 仍输出组件生命周期以及 `combineColumnFilter` DOM 属性警告，
测试与浏览器都能看到；没有因此出现页面崩溃。保持依赖版本和用户入口约束，没有通过升级消除警告。
CRA 开发服务仍有旧 middleware 配置弃用提醒。

查询 API 以本地安装的 1.6.7 源码为准，并对照官方的
[DataSet 1.6.7](https://github.com/open-hand/choerodon-ui/blob/1.6.7/components-dataset/data-set/DataSet.tsx) 和
[Table 1.6.7](https://github.com/open-hand/choerodon-ui/blob/1.6.7/components-pro/table/Table.tsx)。
GET 条件二次合并等行为已通过本地源码和浏览器网络记录核实。

生产 build 不内置 mock 服务，请用 `yarn start` 验证本教程。
