# 单元 08 交付与验证记录

本次只开放 08 Modal 弹窗与抽屉，保留员工练习 TODO，不提供完成答案。
09 尚未开放，按约定先讨论全局配置隔离方案再实施；03～09 总体验证记录等全部完成后生成。

## 输入与保护边界

项目：`/Users/zhcho/Documents/study/Choero/choerodon-ui-demo`，分支 main。
开始先运行 git status 和 git log -1，确认当前只有上轮单元 07 改动。
根据用户“commit all changes, continue chapter 8”，逐项暂存并提交这些已有文件：
`8aa8d54dec6c287243a0dc8351ace7ea1eafa141`，`Add unit 07 master-detail DataSet lessons`。
提交后工作区干净，再开始本轮写入。未 push、未执行远程同步；单元 08 新改动暂留工作区等待用户本地验收。

已读取既有样例/练习/README、注册表、UnitPage、重置脚本及测试、模板测试、mock、入口、依赖及 07 验证记录。
所有 API 先核实本地安装的 choerodon-ui 1.6.7 源码，依据写入代码注释与 README。

- 新增 `src/units/08-modal/` 七个要求文件：index.js、Example.js、Exercise.js、README.md 和三档 templates。
- 新增 `mock/unit08.js`、`src/units/unit08.test.js` 与本记录。
- 注册表只开放 08；mock/index.js 只新增两行 require / 注册调用。
- 写入前保存全部既有已跟踪文件（除上述两个允许改动的注册文件）的 SHA-256，共 102 项。
- 01～07 全目录、playground、既有 mock / 测试 / 文档、package.json、yarn.lock、入口、重置脚本均保持原字节。
- 未执行旧单元 reset；08 Exercise.js 与自己的 normal 模板逐字节一致。
- 无新增依赖、升级、StrictMode、全局 configure、额外样式/语言包或外部请求。
- 本单元角色和员工集合分别深拷贝前三条种子；create / update 只影响 08 集合。

## 源码核实与设计说明

源码路径相对 `node_modules/choerodon-ui/`：

| 源码 | 核实行为 / 本单元做法 |
|---|---|
| pro/lib/modal/index.js；pro/lib/modal-container/ModalContainer.js：open | Modal.open 返回含 update / close 的句柄；保存自己句柄，组件卸载时只关闭它 |
| pro/lib/modal/Modal.js：handleOk / handleCancel | 等待回调和子事件，严格 false 阻止关闭；undefined 不自动表示阻止关闭。样例所有分支显式返回布尔值 |
| 同上：getClassName / render / defaultProps | drawer 使用同一个 Modal；destroyOnClose 默认 true。样例复用同一 Form 和回调 |
| pro/lib/form/Form.js：record | Form 可直接绑定 record；样例捕获打开时 Record，不在保存时重取 current |
| pro/lib/modal-container/ModalContainer.js：open.close | 句柄 close 调用 onClose，不等同于 onCancel；onClose 补回滚，但 accepted 标记保护成功结果 |
| 同上：handleAnimationEnd | afterClose 在退出动画完成时触发；立即关闭后的 DOM 可能短暂存在，不能马上计数断言已销毁 |
| dataset/data-set/Record.js：reset | 恢复 pristineData；add 不会自动移除，也不变为 sync。取消新增另调用 DS.remove |
| dataset/data-set/DataSet.js：submitRecord | 只校验并写指定记录；不顺带提交其他合法草稿。样例显式 record.validate 后调用它 |
| DataSet.js：write / handleSubmitSuccess / commitData；utils.js：prepareForSubmit | 单条也是数组请求；按 dataKey=content 解析，并用 __id 回写 id / 状态 |
| DataSet.js：handleSubmitFail；DataSetRequestError.js | 包装错误不保留原 response；本 DS feedback 先保存服务端 message，onOk catch 返回 false |

样例：角色列表只读，弹窗内直接编辑捕获的 Record；新增和编辑共享 editor，drawer 只改变呈现。
取消回到最近一次成功载入/保存的值；这是列表没有提前编辑的前提下的取消语义，不是任意打开时快照。
保存中局部 pending 门禁、Form 只读、确认/取消/关闭保护，避免重复请求或提交中途 reset。
卸载关闭自身窗口；请求若已发送仍继续，结果不再通知卸载页面，未保存失败草稿在退出后清理。
本例不承诺网络请求撤销，也不把关窗当作后端回滚。

练习变化点：在职邮箱动态必填、已有员工编码不可改（后端也校验）。
三档都保留“未经校验/保存就 return true”的隐患；原始 Form 只读且不创建新记录，确保没做 TODO 也能运行。
hard 额外要求有修改时取消前二次确认，未提供完成实现。

## 已执行检查（2026-09-27，Asia/Shanghai）

| 命令 / 检查 | 退出码 | 输出摘要 |
|---|---|---|
| `CI=true yarn test --watchAll=false --runInBand src/units/unit08.test.js` | 0 | 首轮修正测试输入事件时序后 16/16；后来增加两项卸载中异步结果测试并随全量通过 |
| `CI=true yarn test --watchAll=false` | 0 | 最终 8 suites、88 tests 全通过，08 共 18 项 |
| `node --test scripts/unit.test.js` | 0 | 6/6；只在临时目录验证 reset 与备份，不覆盖真实练习 |
| `CI=true yarn build` | 0 | Compiled successfully；主 bundle gzip 969.79 kB |
| `yarn unit:list` | 0 | 08 三档齐全、Exercise 与 normal 一致；01 仍显示用户已改动；09 未开放 |
| `git diff --check` | 0 | 无空白错误 |
| SHA-256 比较 | 0 | 102 项前后一致，完整表见文末 |
| mock 旧注册比较 | 0 | 剔除新 require / 注册调用后，与初始 mock/index.js 完全一致 |
| 08 Exercise / normal 比较 | 0 | 逐字节一致 |
| 浏览器与真实 HTTP | 通过 | 实际 CRA 3002 服务，见下节 |

初始两项测试在同一次 React act 内 change 后立即按新值寻找 input，未等 React 刷新，导致找不到元素。
修正为持有原 input 并分别等待 change / blur 的 act，保留原绑定/取消断言；不是通过放宽业务断言修复。
后续仅添加两项异步卸载测试，没有变更生产实现，最终重新运行完整 Jest 88/88。

18 项覆盖：样例与三档骨架安全初始渲染/打开；固定 Record 绑定；取消编辑只回滚目标；新增取消移除；
新增成功 ID / sync / dirty；校验失败与无修改；新增/编辑 FAIL 留窗回调及重试；只提交目标行；
保存后再取消恢复最近保存值；保存中重复确认/取消/关闭；自身句柄清理；保存中卸载成功/失败；
真实 Modal portal 校验留窗及取消；mock 数组、状态、主键、编码冲突、字段、分页、隔离和重新注册恢复种子。

## 浏览器与真实 HTTP 验证

已有 3001 / PID 70081 服务保持不动。
本轮启动 `BROWSER=none PORT=3002 yarn start`；Chrome UI 与 HTTP 都访问这个装载了新 mock 的服务。
本轮服务 PID 78691，验证结束仅停止该进程；之后确认 3001 原 PID 仍在监听，3002 已释放。
正式复验需要用户重启自己的 yarn start，默认打开 `http://localhost:3000/#unit-08`。

| 实际操作 | 实际结果 |
|---|---|
| 打开样例、编辑当前弹窗 | 三条角色，初始 sync / dirty=false；弹窗显示平台管理员，列表四个打开按钮锁定 |
| 改名后取消编辑 | 恢复平台管理员，dirty=false；没有写入 |
| 新增弹窗空表单点击确认 | 显示“校验未通过，请检查必填与格式”，窗口保留；自动测试同时断言无 POST |
| 新增抽屉填写 browser-modal / FAIL，启用关闭 | POST create 返回 400，仍在新增抽屉；输入、add / dirty=true、enabled=false 保留，显示后端中文原因 |
| 修正名称后重试 | POST create 返回 200；拿到 ID=104、status=sync、dirty=false；动画后关闭 |
| 重新编辑该行、保存为“浏览器再次保存” | POST update 200，列表与后端更新 |
| 再以抽屉编辑为另一名字后取消 | 恢复“浏览器再次保存”，没有第二次 update |
| 新增弹窗点右上关闭图标 | 草稿行被移除，页面回到四条已保存记录 |
| 未修改直接确认 | 提示没有修改，无写请求 |
| 单元卸载 | 打开编辑器后通过 hash 导航离开，等待关闭动画结束，确认保存按钮数量为 0，07 正常呈现 |
| normal 练习骨架 | 三位员工，只读编辑抽屉可打开；确认只提示“骨架提前允许关闭，尚未校验或保存”，取消也可关闭 |

首个验证标签中途被切换到 03，本轮没有将该次中断冒充完成取消操作；另建标签完成后续流程。
CDP 记录的新标签写请求恰为 create 400、create 200、update 200，各请求 body 是一条记录数组，false 未丢失。
没有通过注入页面 DataSet 或替换 UI 事件函数完成浏览器操作。

独立 Node fetch 实际 HTTP 断言：角色总数 4、ID104 名称为“浏览器再次保存”且 enabled=false；
员工总数仍 3；page=0 与非数组 body 为 400；不存在的记录 404；FAIL 400；重复编码 409；错误后后端旧值不变。
测试只使用本单元临时内存数据，不写真实业务系统。

截图：`/Users/zhcho/.codex/visualizations/2026/09/26/01a0dde3-c1fb-7220-8c47-bc94483edfd4/unit-08-drawer-failure.png`。
画面展示抽屉失败留窗、FAIL 输入、具体后端提示，以及背景 add / dirty=true。
临时证据：`/tmp/choerodon-unit08-{target,full,node,build,dev}.log`、
`/tmp/choerodon-unit08-browser-network.json`、`/tmp/choerodon-unit08-before.json`。
这些文件可能被系统清理，本记录保留实际结论与保护文件完整哈希。

## 控制台与验证边界

- 没有观察到本单元新增未捕获异常；不能表述为整个旧版依赖链没有任何警告。
- combineColumnFilter DOM 透传警告保持输出；测试仅精确识别此前已有消息，其余 console.error 导致失败。
- Chrome 中保留旧生命周期警告、Pro 全包引入体积提醒；构建保留 CRA bundle size 建议，没有升级/新增依赖来隐藏它们。
- 400 是固定教学失败，onOk 已捕获并返回 false；不会通过 finally 强制关闭窗口或清空输入。
- 使用的 Modal / Form / Record API 已核实源码并做运行验证，没有留给用户猜测的未确认 API。
- hard 的二次确认交互是练习需求，未替用户实现；easy/hard 初始渲染由测试验证，Chrome 操作的是样例与 normal 骨架。
- 保存中卸载的成功/失败、重复点击门禁由可控 Promise 测试验证，没有宣称浏览器已做网络限速实验。
- 仅支持本地内存 create/update；没有测试生产部署、真实服务器并发控制或请求取消。
- 未提交或 push 本轮 08 文件；未开始 09，也未提前生成最终 03～09 汇总。

## 用户复验命令与步骤

mock 改动必须重启开发服务；单独修改前端 Exercise.js 通常热更新即可。

```bash
yarn unit:list
CI=true yarn test --watchAll=false
node --test scripts/unit.test.js
CI=true yarn build
yarn start
```

打开 `http://localhost:3000/#unit-08`：

1. 初始三条角色；编辑改名后取消，恢复旧值，无 POST。
2. 新增空表单确认，校验失败留窗；取消后条数恢复，无空行。
3. 新增抽屉填写唯一合法编码和名称，确认一次 POST，成功关闭，ID 回写、sync、dirty=false。
4. 编辑名称为 FAIL 后保存，400、留窗、草稿仍在；修正后重试成功。
5. 已保存后再次编辑取消，恢复最新保存值；右上关闭图标也应回滚。
6. 练习页只提供可运行骨架；完成 TODO 后按 README 共同验收，hard 另验收取消二次确认。

## 受保护文件 SHA-256

以下是首次写入前与交付前实际读取计算的哈希，102 项全部一致。

| 文件 | 写入前 SHA-256 | 交付前 SHA-256 |
|---|---|---|
| `.gitignore` | `22a0f56d71757174b9bad414330e0a944cfe93b16d6366192a04a8cadbe8fcae` | `22a0f56d71757174b9bad414330e0a944cfe93b16d6366192a04a8cadbe8fcae` |
| `.idea/.gitignore` | `de3dcd3b67895aa24d01485c60e342e81e37ea1530859b0756519a00f1b6d700` | `de3dcd3b67895aa24d01485c60e342e81e37ea1530859b0756519a00f1b6d700` |
| `.idea/choerodon-ui-demo.iml` | `e9c004d5beedb8d8501aa5456096bd5d18180f3081cd2f56e8196c44659838a2` | `e9c004d5beedb8d8501aa5456096bd5d18180f3081cd2f56e8196c44659838a2` |
| `.idea/inspectionProfiles/Project_Default.xml` | `725960a07196ca7e40f4c7343c9b56132ec0a79956ab048cd6568c27dc68d50c` | `725960a07196ca7e40f4c7343c9b56132ec0a79956ab048cd6568c27dc68d50c` |
| `.idea/modules.xml` | `71e0b486df02e0103d91c64e6464be92355ec45bfc1353a143212ea5c1c7323d` | `71e0b486df02e0103d91c64e6464be92355ec45bfc1353a143212ea5c1c7323d` |
| `.idea/vcs.xml` | `6323e12648862a0a96fc0d7877672817d6cd91e2c2a3c3d78f1090db23c6e88e` | `6323e12648862a0a96fc0d7877672817d6cd91e2c2a3c3d78f1090db23c6e88e` |
| `README.md` | `e52640fdce7164ef6ba3e6198c57bb75773d714b9550952467d27bae22fad0d8` | `e52640fdce7164ef6ba3e6198c57bb75773d714b9550952467d27bae22fad0d8` |
| `dev.log` | `41212269f749c372b0b87ea7e74c09c77e7c36a25eb3bf8284434e3008a133d1` | `41212269f749c372b0b87ea7e74c09c77e7c36a25eb3bf8284434e3008a133d1` |
| `docs/unit-02-files.md` | `5202d147568b3833f645d089326ee26ec5613cee19cdf43cd857d6aa8bc850f5` | `5202d147568b3833f645d089326ee26ec5613cee19cdf43cd857d6aa8bc850f5` |
| `docs/unit-02-verification.md` | `15e4889eef82d26e0d5d89e1d67be5b28184c5602df897804c59e272e7248c21` | `15e4889eef82d26e0d5d89e1d67be5b28184c5602df897804c59e272e7248c21` |
| `docs/unit-03-files.md` | `ceee8ec80ee40ff3cc5f53623fc4759e37414da8c749e0c636cfb987a23cc4f5` | `ceee8ec80ee40ff3cc5f53623fc4759e37414da8c749e0c636cfb987a23cc4f5` |
| `docs/unit-03-verification.md` | `2c7604910b22df35a9d05ad8fa92e6990ad1ac65f6b6f467d058abda9b2d18f9` | `2c7604910b22df35a9d05ad8fa92e6990ad1ac65f6b6f467d058abda9b2d18f9` |
| `docs/unit-04-verification.md` | `a4fae33d3123281c8605628bd1cac4cb9cee33940ea0dd3f93af8ebdf6a0d187` | `a4fae33d3123281c8605628bd1cac4cb9cee33940ea0dd3f93af8ebdf6a0d187` |
| `docs/unit-05-verification.md` | `0d8ef5ca7666d68c8b1907952603add9cc3c6e7d22db9ef2e74d6c289fc2ecb2` | `0d8ef5ca7666d68c8b1907952603add9cc3c6e7d22db9ef2e74d6c289fc2ecb2` |
| `docs/unit-06-verification.md` | `7f35c94bcf6f44632bba0bb55ec70c91db2bb0a468d07524043a9b1c34e0e648` | `7f35c94bcf6f44632bba0bb55ec70c91db2bb0a468d07524043a9b1c34e0e648` |
| `docs/unit-07-verification.md` | `94508ae97a275d5d28dd5312126750e92e14b2c2984dde2fdb72191a3dd09c3d` | `94508ae97a275d5d28dd5312126750e92e14b2c2984dde2fdb72191a3dd09c3d` |
| `mock/data/roles.js` | `4f10a2e1097c9c81e95b5a4c48464980627f298c00d6302205886f2b8822e40c` | `4f10a2e1097c9c81e95b5a4c48464980627f298c00d6302205886f2b8822e40c` |
| `mock/data/users.js` | `43f97aeddb1992f07da29c1a50d0266ec3ffc2d4fefb92ace20492f5526ef610` | `43f97aeddb1992f07da29c1a50d0266ec3ffc2d4fefb92ace20492f5526ef610` |
| `mock/unit03.js` | `b6d8cbaeeb4c230660c52f5fc3981d7fdf08804d0c5f8d199938f404bdc99d40` | `b6d8cbaeeb4c230660c52f5fc3981d7fdf08804d0c5f8d199938f404bdc99d40` |
| `mock/unit04.js` | `1b96ee3326daa60c675d8a8575361ef4676077f88ed49e360549043d5ea7b7c6` | `1b96ee3326daa60c675d8a8575361ef4676077f88ed49e360549043d5ea7b7c6` |
| `mock/unit05.js` | `b2e0e8064455887ba7283eca05d8badc010875bbec1fbb3e62637b8a43b47a38` | `b2e0e8064455887ba7283eca05d8badc010875bbec1fbb3e62637b8a43b47a38` |
| `mock/unit06.js` | `4393d7608009bbdf7f558f9fb02126236564e47c8cad5ee2bf6a0d69e7562c18` | `4393d7608009bbdf7f558f9fb02126236564e47c8cad5ee2bf6a0d69e7562c18` |
| `mock/unit07.js` | `247044d1d4a97728403337b42fd51c04b023a25bc0c5172ebb48caa74f7308cd` | `247044d1d4a97728403337b42fd51c04b023a25bc0c5172ebb48caa74f7308cd` |
| `mock/utils.js` | `c310364b1bd8f1fe6813c3617e9409a00e0d9d06dd8a0417f6a21b0341d6d9a0` | `c310364b1bd8f1fe6813c3617e9409a00e0d9d06dd8a0417f6a21b0341d6d9a0` |
| `package.json` | `abb4adeb4436ee7857ed3f8828bebffaa3b8040c5cffbe0e9890662455b5aec3` | `abb4adeb4436ee7857ed3f8828bebffaa3b8040c5cffbe0e9890662455b5aec3` |
| `public/favicon.ico` | `3d10f7da6c603178340081668c4ac5b3ae9743ca9a262ab0fcd312fbb9f48bdd` | `3d10f7da6c603178340081668c4ac5b3ae9743ca9a262ab0fcd312fbb9f48bdd` |
| `public/index.html` | `20afc17b6358bfdf5d74513225cd4a73443fa0bd15b944af71e143f694a5cf7c` | `20afc17b6358bfdf5d74513225cd4a73443fa0bd15b944af71e143f694a5cf7c` |
| `public/logo192.png` | `c386396ec70db3608075b5fbfaac4ab1ccaa86ba05a68ab393ec551eb66c3e00` | `c386396ec70db3608075b5fbfaac4ab1ccaa86ba05a68ab393ec551eb66c3e00` |
| `public/logo512.png` | `9ea4f4da7050c0cc408926f6a39c253624e9babb1d43c7977cd821445a60b461` | `9ea4f4da7050c0cc408926f6a39c253624e9babb1d43c7977cd821445a60b461` |
| `public/manifest.json` | `50b3d8c3903af3f78d871b94557ab14f4e39ca192eaca3d2cfa863c867279a14` | `50b3d8c3903af3f78d871b94557ab14f4e39ca192eaca3d2cfa863c867279a14` |
| `public/robots.txt` | `90d24bc3bf698ac1e173739502298ccca72adf1f564fab05f484b8c48d1cadd2` | `90d24bc3bf698ac1e173739502298ccca72adf1f564fab05f484b8c48d1cadd2` |
| `scripts/strip-broken-sourcemaps.js` | `6ef6d93abbaad7635cd084cb05cbae27154785169c94b0a1a822861c1e42c748` | `6ef6d93abbaad7635cd084cb05cbae27154785169c94b0a1a822861c1e42c748` |
| `scripts/unit.js` | `9d33ce2bc84f276c792c6bd5b4a659c69a29ef6e39ce42a5092898ea0c514b2b` | `9d33ce2bc84f276c792c6bd5b4a659c69a29ef6e39ce42a5092898ea0c514b2b` |
| `scripts/unit.test.js` | `6d2ed63786b1df1562010cf415e04cf16c02ecb180693686c76272bc767b439d` | `6d2ed63786b1df1562010cf415e04cf16c02ecb180693686c76272bc767b439d` |
| `src/App.css` | `21ffafa875414e7ab17821f1f3f9f7f5bfbaf2e952e967dfc784472de2b5bd54` | `21ffafa875414e7ab17821f1f3f9f7f5bfbaf2e952e967dfc784472de2b5bd54` |
| `src/App.js` | `ab64ee03983c706cd590bd850e946afadceef399069bb060b5b92eb1416607df` | `ab64ee03983c706cd590bd850e946afadceef399069bb060b5b92eb1416607df` |
| `src/App.test.js` | `33bf4ea08b262c757d05436f8cd4f7a28178842a6998eca8f595356df3db3d98` | `33bf4ea08b262c757d05436f8cd4f7a28178842a6998eca8f595356df3db3d98` |
| `src/index.css` | `daf22c296c801d3d533083361cc59fbdc22e5bfe528aa4bad1973b54cc5448a4` | `daf22c296c801d3d533083361cc59fbdc22e5bfe528aa4bad1973b54cc5448a4` |
| `src/index.js` | `9bf1c1c517b2df3d58ebebfa9ad318e57e4bd306a042ec2da2a8349202dbf912` | `9bf1c1c517b2df3d58ebebfa9ad318e57e4bd306a042ec2da2a8349202dbf912` |
| `src/logo.svg` | `6000b0e9b0b05b3f112de04f0d039768a1db63588ff9b6ef7099dbd71632f383` | `6000b0e9b0b05b3f112de04f0d039768a1db63588ff9b6ef7099dbd71632f383` |
| `src/playground/Playground.js` | `421227899c79366dce9d4d56febd1872e5fcf248ac7c139e1f06c9de5f107de8` | `421227899c79366dce9d4d56febd1872e5fcf248ac7c139e1f06c9de5f107de8` |
| `src/playground/simpleDS.js` | `7480d80004f947ea148decb24bd658102a05f42c729ad89f6ac80ba210cd4616` | `7480d80004f947ea148decb24bd658102a05f42c729ad89f6ac80ba210cd4616` |
| `src/reportWebVitals.js` | `714851669856152806c289f9aac6240b414bbac50c60ee4f7e6247f31eac0c1c` | `714851669856152806c289f9aac6240b414bbac50c60ee4f7e6247f31eac0c1c` |
| `src/setupProxy.js` | `1364b4e0461e5a3dc24c4ef7f90ad39bf1ec77f069a7c0bd5b43984c37726f15` | `1364b4e0461e5a3dc24c4ef7f90ad39bf1ec77f069a7c0bd5b43984c37726f15` |
| `src/setupTests.js` | `cc0ed7f64dc22eaca4a6738bd80722190911f43745fe456fee679024eed9e4c9` | `cc0ed7f64dc22eaca4a6738bd80722190911f43745fe456fee679024eed9e4c9` |
| `src/units/01-dataset-basics/Example.js` | `a91c3d5293a9184e92fce75284295eca39093f2d6957a0300b45fdb736e9b0c7` | `a91c3d5293a9184e92fce75284295eca39093f2d6957a0300b45fdb736e9b0c7` |
| `src/units/01-dataset-basics/Exercise.js` | `da770ea9423c47f9c291019ec009d3755d456a5dfabe5c474999bc94f7bb3931` | `da770ea9423c47f9c291019ec009d3755d456a5dfabe5c474999bc94f7bb3931` |
| `src/units/01-dataset-basics/README.md` | `d02fb1cf99e857bcfd5568e15da64f0be15acead261361ef444a6544dfb670f7` | `d02fb1cf99e857bcfd5568e15da64f0be15acead261361ef444a6544dfb670f7` |
| `src/units/01-dataset-basics/index.js` | `09520aa8226acfb8d3d8662c845c6ccf0ac2e951e55f2fd3fb04ddc40a326269` | `09520aa8226acfb8d3d8662c845c6ccf0ac2e951e55f2fd3fb04ddc40a326269` |
| `src/units/01-dataset-basics/templates/Exercise.easy.js` | `fd9295ff87c60539009a5340d7858e5b9a8be9023de55662760a5bf720874507` | `fd9295ff87c60539009a5340d7858e5b9a8be9023de55662760a5bf720874507` |
| `src/units/01-dataset-basics/templates/Exercise.hard.js` | `861658fcdb3a8e08c52c66e53e4fed498c0597add4a829d35ae4710635b2a111` | `861658fcdb3a8e08c52c66e53e4fed498c0597add4a829d35ae4710635b2a111` |
| `src/units/01-dataset-basics/templates/Exercise.normal.js` | `4569a570f354ef23ac816c8a5212e12422199158e1515a9e58fb3afd6a29da3e` | `4569a570f354ef23ac816c8a5212e12422199158e1515a9e58fb3afd6a29da3e` |
| `src/units/02-query-conditions/Example.js` | `b56632681f9afc12d6349db15cc5c90b1853b5d26fa0f823d993614267b2960f` | `b56632681f9afc12d6349db15cc5c90b1853b5d26fa0f823d993614267b2960f` |
| `src/units/02-query-conditions/Exercise.js` | `17a94a5fdf02823863e694e97bbcc427233d8205281e4d23bbc8e8fe72738246` | `17a94a5fdf02823863e694e97bbcc427233d8205281e4d23bbc8e8fe72738246` |
| `src/units/02-query-conditions/README.md` | `ef06a7e6f818265a6f9bd0d7e1e4976284ed1704cd40a927b4a1cbf8d693d5ac` | `ef06a7e6f818265a6f9bd0d7e1e4976284ed1704cd40a927b4a1cbf8d693d5ac` |
| `src/units/02-query-conditions/index.js` | `c7dd86a17225478e319fb3ad4e6251d5297befaebc33927f5cc565d54aa413c7` | `c7dd86a17225478e319fb3ad4e6251d5297befaebc33927f5cc565d54aa413c7` |
| `src/units/02-query-conditions/templates/Exercise.easy.js` | `1e2e69f7258d5aa526dc805156ffacd1a2576af04c4eed861755590bbde54d68` | `1e2e69f7258d5aa526dc805156ffacd1a2576af04c4eed861755590bbde54d68` |
| `src/units/02-query-conditions/templates/Exercise.hard.js` | `ff3a283283e32bb3deddccfd0fd10cfa038c2003caed08af3817b7692f3022fd` | `ff3a283283e32bb3deddccfd0fd10cfa038c2003caed08af3817b7692f3022fd` |
| `src/units/02-query-conditions/templates/Exercise.normal.js` | `17a94a5fdf02823863e694e97bbcc427233d8205281e4d23bbc8e8fe72738246` | `17a94a5fdf02823863e694e97bbcc427233d8205281e4d23bbc8e8fe72738246` |
| `src/units/03-validation-lookups/Example.js` | `8bc0ba7accc5799c2cfa5b64c6acbc150f727a456756d95cad651abe6de0385c` | `8bc0ba7accc5799c2cfa5b64c6acbc150f727a456756d95cad651abe6de0385c` |
| `src/units/03-validation-lookups/Example.test.js` | `60f0c06851bf47cb5bd599a199a7cd7801f3f9fe4f0bbdaef496b497d959aa2a` | `60f0c06851bf47cb5bd599a199a7cd7801f3f9fe4f0bbdaef496b497d959aa2a` |
| `src/units/03-validation-lookups/Exercise.js` | `df9d3b05f53ae4d55750bf292cfa40686429209fffff373394343580f0faed13` | `df9d3b05f53ae4d55750bf292cfa40686429209fffff373394343580f0faed13` |
| `src/units/03-validation-lookups/README.md` | `00a9e793bfa714cdc76fcf29a1658b8d996c605a7e5eb29170e55d0fe6dc6434` | `00a9e793bfa714cdc76fcf29a1658b8d996c605a7e5eb29170e55d0fe6dc6434` |
| `src/units/03-validation-lookups/index.js` | `3a240e253a4130d7645040655f8224d3b9277e52a2183ff1e75a9a9ae5e7a290` | `3a240e253a4130d7645040655f8224d3b9277e52a2183ff1e75a9a9ae5e7a290` |
| `src/units/03-validation-lookups/templates/Exercise.easy.js` | `0a4999dfd359d626da1dba6d03e1944c686581c97871d46d22d8636eca844440` | `0a4999dfd359d626da1dba6d03e1944c686581c97871d46d22d8636eca844440` |
| `src/units/03-validation-lookups/templates/Exercise.hard.js` | `94ca6b6f6e8b9c825598106846b2567e2d25fd4a3f4fff144f294f988953a39b` | `94ca6b6f6e8b9c825598106846b2567e2d25fd4a3f4fff144f294f988953a39b` |
| `src/units/03-validation-lookups/templates/Exercise.normal.js` | `df9d3b05f53ae4d55750bf292cfa40686429209fffff373394343580f0faed13` | `df9d3b05f53ae4d55750bf292cfa40686429209fffff373394343580f0faed13` |
| `src/units/04-form/Example.js` | `c5735543a0e95691072ef59ff686db3bed51d6ce657bd05fc3bf0467d60e6097` | `c5735543a0e95691072ef59ff686db3bed51d6ce657bd05fc3bf0467d60e6097` |
| `src/units/04-form/Exercise.js` | `5932823313df8e25cbf6967107e9d8adc0dc6d7a1325a8b6bcc2a3d7a6530408` | `5932823313df8e25cbf6967107e9d8adc0dc6d7a1325a8b6bcc2a3d7a6530408` |
| `src/units/04-form/README.md` | `7a1f9fcc21dcec614da903d09a7634f96cb4461115df528e19201c72d144db7d` | `7a1f9fcc21dcec614da903d09a7634f96cb4461115df528e19201c72d144db7d` |
| `src/units/04-form/index.js` | `64970a3958bf5968e8a7970a5e6e85aa0e78d671e182301ef2a4599edbc0b194` | `64970a3958bf5968e8a7970a5e6e85aa0e78d671e182301ef2a4599edbc0b194` |
| `src/units/04-form/templates/Exercise.easy.js` | `477caa47ade59c440ae97892ddb2f2d9851ca84454b76f7257996639b776399e` | `477caa47ade59c440ae97892ddb2f2d9851ca84454b76f7257996639b776399e` |
| `src/units/04-form/templates/Exercise.hard.js` | `d21c3588752cba1d24c50301d06853cbed157e0f96cca456054447574ce4f129` | `d21c3588752cba1d24c50301d06853cbed157e0f96cca456054447574ce4f129` |
| `src/units/04-form/templates/Exercise.normal.js` | `5932823313df8e25cbf6967107e9d8adc0dc6d7a1325a8b6bcc2a3d7a6530408` | `5932823313df8e25cbf6967107e9d8adc0dc6d7a1325a8b6bcc2a3d7a6530408` |
| `src/units/05-table-submit/Example.js` | `98cf3ca95b1b7b9bd2108416f4d608a690ba1a9cc5775eb68eaf2612754c48c3` | `98cf3ca95b1b7b9bd2108416f4d608a690ba1a9cc5775eb68eaf2612754c48c3` |
| `src/units/05-table-submit/Exercise.js` | `7aa517334eb88071eac0922bc9fb5a95faf4a1c0377267acd85f5b856fcb92e0` | `7aa517334eb88071eac0922bc9fb5a95faf4a1c0377267acd85f5b856fcb92e0` |
| `src/units/05-table-submit/README.md` | `8c9bf559d6b38fd72c297ebbe47bb64137aed47bea3c6cfb01c65ae804577edc` | `8c9bf559d6b38fd72c297ebbe47bb64137aed47bea3c6cfb01c65ae804577edc` |
| `src/units/05-table-submit/index.js` | `93bf555fd68e0cdc6f5c28e7a21fefadd780a7f3e10912ac2c76ed48a1646c6d` | `93bf555fd68e0cdc6f5c28e7a21fefadd780a7f3e10912ac2c76ed48a1646c6d` |
| `src/units/05-table-submit/templates/Exercise.easy.js` | `22d3d664ceac5984d0fde86cee2022a4d0852e7da77bdd23ef496389f5ef475b` | `22d3d664ceac5984d0fde86cee2022a4d0852e7da77bdd23ef496389f5ef475b` |
| `src/units/05-table-submit/templates/Exercise.hard.js` | `ff4b89869a41134152a40a5cf732819686d20764400d789975209232846c8b3b` | `ff4b89869a41134152a40a5cf732819686d20764400d789975209232846c8b3b` |
| `src/units/05-table-submit/templates/Exercise.normal.js` | `7aa517334eb88071eac0922bc9fb5a95faf4a1c0377267acd85f5b856fcb92e0` | `7aa517334eb88071eac0922bc9fb5a95faf4a1c0377267acd85f5b856fcb92e0` |
| `src/units/06-field-events/Example.js` | `ea24c39090338e33cab0d8592c311b6c82d847a71970c52b664a7fd2517df1a3` | `ea24c39090338e33cab0d8592c311b6c82d847a71970c52b664a7fd2517df1a3` |
| `src/units/06-field-events/Exercise.js` | `652608869246baeabb037452593e3f1b0ef4a0b3ce5402851294302e3745d01a` | `652608869246baeabb037452593e3f1b0ef4a0b3ce5402851294302e3745d01a` |
| `src/units/06-field-events/README.md` | `c2836dfa7bdcec46e11e9aa82daa8902921beb59c9ecfc050d3dede0d822f3ae` | `c2836dfa7bdcec46e11e9aa82daa8902921beb59c9ecfc050d3dede0d822f3ae` |
| `src/units/06-field-events/index.js` | `608e709d705aeccf579fdf828043a123b22e189c5ec6562866f82b26719d77ef` | `608e709d705aeccf579fdf828043a123b22e189c5ec6562866f82b26719d77ef` |
| `src/units/06-field-events/templates/Exercise.easy.js` | `e7fe8be5d4357359181515ea7eb14bdc540a0caa566067bc096ff96990a60931` | `e7fe8be5d4357359181515ea7eb14bdc540a0caa566067bc096ff96990a60931` |
| `src/units/06-field-events/templates/Exercise.hard.js` | `13fe72f3b18ec9494a2b6ac6ab71cb56991c2f40f0c27d3b822f40cbc6ba51b3` | `13fe72f3b18ec9494a2b6ac6ab71cb56991c2f40f0c27d3b822f40cbc6ba51b3` |
| `src/units/06-field-events/templates/Exercise.normal.js` | `652608869246baeabb037452593e3f1b0ef4a0b3ce5402851294302e3745d01a` | `652608869246baeabb037452593e3f1b0ef4a0b3ce5402851294302e3745d01a` |
| `src/units/07-master-detail/Example.js` | `d349440869bf4f435f521ed036d83e52afbf2a882b012b1c931ef9291565a8ac` | `d349440869bf4f435f521ed036d83e52afbf2a882b012b1c931ef9291565a8ac` |
| `src/units/07-master-detail/Exercise.js` | `d59d8f5ea466e2ab01740fbfbd854b737000f2577965f962705151d1dd6759f6` | `d59d8f5ea466e2ab01740fbfbd854b737000f2577965f962705151d1dd6759f6` |
| `src/units/07-master-detail/README.md` | `274a61f81e08b94560109442fdf76feb0a0e13c0562ab9d0d6ca1a788bfa6aa3` | `274a61f81e08b94560109442fdf76feb0a0e13c0562ab9d0d6ca1a788bfa6aa3` |
| `src/units/07-master-detail/index.js` | `5ffe14d3b313e3a8955cc44081c382d60f665bbb5ff91c06782f136198d0c0b2` | `5ffe14d3b313e3a8955cc44081c382d60f665bbb5ff91c06782f136198d0c0b2` |
| `src/units/07-master-detail/templates/Exercise.easy.js` | `ff0c6dc867bc20e5b473f0cfffcc0f35fb81859162d926f26875e9ddf500d632` | `ff0c6dc867bc20e5b473f0cfffcc0f35fb81859162d926f26875e9ddf500d632` |
| `src/units/07-master-detail/templates/Exercise.hard.js` | `d936905962214e86191fe3ea50ccacc44b0b620608e26ba444b7724ee89ee59a` | `d936905962214e86191fe3ea50ccacc44b0b620608e26ba444b7724ee89ee59a` |
| `src/units/07-master-detail/templates/Exercise.normal.js` | `d59d8f5ea466e2ab01740fbfbd854b737000f2577965f962705151d1dd6759f6` | `d59d8f5ea466e2ab01740fbfbd854b737000f2577965f962705151d1dd6759f6` |
| `src/units/UnitPage.js` | `b699fd81e832bf1271d55c09ce4ae075a6950ac981c69eb2c685047df66ba9c6` | `b699fd81e832bf1271d55c09ce4ae075a6950ac981c69eb2c685047df66ba9c6` |
| `src/units/templates.test.js` | `e6a347ecfcd7b9712941624c43fc0d1cab3bedd2ecb99cb51d576b34c87532ea` | `e6a347ecfcd7b9712941624c43fc0d1cab3bedd2ecb99cb51d576b34c87532ea` |
| `src/units/unit04.test.js` | `a58c8d85e26b86ddbfb1daf781acb8e5ea325bd3c6c2c17f842b095c2a06478e` | `a58c8d85e26b86ddbfb1daf781acb8e5ea325bd3c6c2c17f842b095c2a06478e` |
| `src/units/unit05.test.js` | `c938979936d435faa31b9e99937f01611a09a290dd405e570958ce3fe6c61fde` | `c938979936d435faa31b9e99937f01611a09a290dd405e570958ce3fe6c61fde` |
| `src/units/unit06.test.js` | `af6efd9e60a7305a3d9c078c24af372c27be8d598909dd070631fc10d33eda88` | `af6efd9e60a7305a3d9c078c24af372c27be8d598909dd070631fc10d33eda88` |
| `src/units/unit07.test.js` | `2c8bee2689f966033cd31bfbf7541ea328136b56d4656af72dee91bddbcc7869` | `2c8bee2689f966033cd31bfbf7541ea328136b56d4656af72dee91bddbcc7869` |
| `yarn.lock` | `7c082ccd0e2de46719b81ebf66190dcb8acb3b6ecc612933f111ad22b27f8a2c` | `7c082ccd0e2de46719b81ebf66190dcb8acb3b6ecc612933f111ad22b27f8a2c` |
