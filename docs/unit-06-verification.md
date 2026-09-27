# 单元 06 交付与验证记录

本次只开放 06 字段联动与事件。07、08 等用户回复后逐个生成；09 先提交全局配置隔离方案并等待确认。
没有生成员工练习答案或 unit-06-files.md，最终整体验收留到后续单元完成。

## 输入与保护边界

项目：`/Users/zhcho/Documents/study/Choero/choerodon-ui-demo`，分支 main。
本轮开始先执行 `git status` 和 `git log -1`，确认工作区干净；HEAD 为
`d29aa41180410bfa8f8167e1f48f619521632a93`（`init5`）。使用本地最新提交，未执行远程同步或 Git 提交。

此前一次“继续”因单元 05 尚未提交而按要求停止；本轮重新检查后才开始写入。
已阅读既有单元、注册表、UnitPage、模板测试、重置脚本及测试、mock、05 验证记录，按现有结构继续。
API 先查本地安装的 1.6.7 源码，依据写在样例注释和 README 中。

- 新增 `src/units/06-field-events/` 七个要求文件；Exercise.js 与 normal 逐字节一致。
- 新增 `mock/unit06.js`、`src/units/unit06.test.js` 和本记录；注册表仅开放 06。
- mock/index.js 只增加 require 与注册调用，移除这两行后与开始时逐字节一致。
- 首次写入前，对所有既有受 Git 跟踪文件（除上述两个允许修改的注册文件）做 SHA-256 快照，共 82 项。
  因此 01～05 全目录、mock/unit03～05、既有测试、入口、自由练习区、依赖和重置工具均受保护。
- 不改依赖或 yarn.lock；无 StrictMode、全局 configure、额外语言包 / 样式、写接口或外部请求。
- mock 注册时深拷贝种子，再补充本单元角色 / 员工字段，查询响应也使用独立副本。

## 源码核实与设计说明

| 本地源码（相对项目根目录） | 核实行为与采用方式 |
|---|---|
| `node_modules/choerodon-ui/dataset/data-set/Field.d.ts` | dynamicProps / computedProps 都支持属性函数映射，参数含 dataSet / record / name；整对象 dynamicProps 函数已标为 deprecated |
| `node_modules/choerodon-ui/dataset/data-set/Field.js`：get / executeDynamicProps | computedProps 使用 MobX computed；本例的字段属性依次取 computed / dynamic / 静态值，回调只读、对无 record 安全返回 |
| `node_modules/choerodon-ui/pro/lib/select/Select.js`：cascadeOptions | 左键是选项父字段、右值是当前记录字段；本地过滤候选，不会修改原 options 数据 |
| 同文件：processSelectedData | 自动清理旧子值有 filteredOptions.length 等条件，不能当作不挂载组件或零候选时的数据一致性保证 |
| `node_modules/choerodon-ui/dataset/data-set/Record.js`：set | 值变化后产生 dirty 和 update，提供事件 record / name / value / oldValue；同值不触发 |
| `node_modules/choerodon-ui/dataset/data-set/DataSet.js`：initEvents / loadData | 构造时注册事件；load 的载荷只有 dataSet，不能假设有 record 参数 |
| 同文件：select | 单条从未选中到选中才触发，单选提供 previous；不自动把记录设为 current |
| `node_modules/choerodon-ui/pro/lib/field/FormField.js` | UI 从 Field 读取 readOnly / disabled；程序 record.set 不受这些界面属性阻止 |

样例使用角色范围 / 权限 / 说明，练习使用员工部门 / 职位 / 导师：

- 样例用 dynamicProps 演示 required / disabled，用 computedProps 演示 label / readOnly。
- update 显式清理旧权限和说明、填写新权限说明，按字段分支建立单向联动。
- load 只记非业务状态，不制造初始 dirty；select 显式定位 current。
- 三类事件计数与日志可观察，日志保留最近八条；监听器只在工厂构造时注册。
- 提供修改第二位角色的按钮，以当前第一位为对照，暴露“事件 record 不一定是 current”。
- 练习保留误用 current 清理子值的隐患；变化点是双条件导师必填、零职位的筹备部。
- hard 增加空结果 / 恢复和事件不重复注册的验收要求，未提供完成实现。

与要求无 API 名称冲突；明确区分 computedProps 属性计算与 record.set 业务值写入。
本次不把 cascadeMap 宣传成会自动处理所有旧值的机制，也不把选中和当前记录混为一谈。

## 已执行的检查（2026-09-27，Asia/Shanghai）

| 命令 / 检查 | 退出码 | 输出摘要 / 范围 |
|---|---|---|
| `CI=true yarn test --watchAll=false` | 0 | 6 suites passed，55 tests passed；06 新增 14 项 |
| `node --test scripts/unit.test.js` | 0 | tests 6，pass 6，fail 0；只在临时项目测试备份和覆盖 |
| `CI=true yarn build` | 0 | Compiled successfully；无 CI ESLint 失败 |
| `yarn unit:list` | 0 | 06：easy / normal / hard，与 normal 模板一致；07～09 未开放 |
| `git diff --check` | 0 | 无空白错误 |
| SHA-256 比较 | 0 | 82 项前后一致，详见下表 |
| 06 Exercise / normal 字节比较 | 0 | 完全一致 |
| 旧 mock 注册内容比较 | 0 | 去掉新增两行后逐字节一致 |
| 实际 HTTP（临时 CRA 3002） | 0 | 15 次请求通过，新接口正常 / 错误路径与旧接口兼容 |
| Chrome 实际交互 | 已执行 | 级联候选、清理子值、动态校验 / 禁用 / 只读、非当前记录隔离、切换草稿和请求计数 |

Jest 使用真实 DataSet / Select / Form，只有 Axios adapter 接到真实 mock 路由，非 2xx 按真实语义拒绝。
未替换框架组件或事件逻辑，未提供完整员工答案，未删旧测试、改旧断言或屏蔽 console。

14 项单元 06 测试覆盖：

- 样例和三档初次正常渲染，严格零 console.error；各一次 GET，page=1 / pagesize=2。
- 原始模板校验按钮只提示待完成，不发额外请求。
- load 日志不会改业务字段，初始 sync / dirty=false；再次查询 load 只增加一次。
- dynamicProps / computedProps 按各自记录计算，多次读取属性不产生 update 或 dirty。
- 未挂载 Select 时也能清旧子值；程序修改第二条不影响 current 第一条。
- 真实 Select.cascadeOptions 在平台 / 项目 / 空父值之间正确过滤，没有额外请求。
- 真正的动态 required 校验失败 / 修正通过；readOnly 元信息不阻止程序 set。
- select 的 previous、current 与 selected 差异、重复选择去重、事件单向终止和日志上限。
- 样例按钮与实际可见输入的禁用 / 只读 DOM 状态。
- 两种 mock 列表的分页、过滤、空结果、非法参数；响应和注册相互独立，种子不变。

首轮一个断言误查 Select 的隐藏 name 输入，而不是实际可见输入，导致 toBeDisabled 失败。
已改为检查同一表单单元格内的可见输入，保留禁用断言；修正后专项和全量测试通过。
专项日志：`/tmp/choerodon-unit06-target.log`；全量与构建日志：
`/tmp/choerodon-unit06-tests.log`、`/tmp/choerodon-unit06-build.log`，均为本机临时证据。

实际 HTTP 的 15 次检查：

- 新角色第一页 / 第二页，员工第一页 / 研发过滤，empty=true / false 恢复，共 6 次成功请求。
- 非法 page、pagesize、empty，共 3 次 HTTP 400，均含中文 message。
- 旧角色总数 12、员工总数 45、02 离职结果 11、04 平台管理员、05 角色 12 / 员工 45，共 6 次。

构建保留 CRA bundle 体积提示；yarn 保留上层 package.json 的 No license field 提示。
全量旧单元日志仍有固定依赖的既有警告；06 的自动测试没有设置 console.error 白名单。
全量命令之后只补充了源码路径注释和说明文字，没有改变可执行逻辑。

## 浏览器证据与验证边界

浏览器使用独立的 `http://localhost:3002/#unit-06`，不重启原有 3001 服务。
3002 本次临时服务验证后已关闭；未停止其他端口的进程。

已观察到：

1. 样例初始 101 / 平台管理员 / 平台查看，load=1、update=0、select=0、dirty=false，初始 error 日志为空。
2. 权限弹层只有平台查看 / 平台管理；选择平台管理，说明同步、update=2。
3. 范围改为项目：标题变项目权限，权限与说明清空；校验未通过，弹层只显示项目查看 / 项目编辑。
4. 选项目编辑，说明与编码 project.edit 同步，重新校验通过。
5. 关闭启用：权限输入 disabled，成员数可见输入具有 readonly，原权限保持 project.edit；重新启用恢复。
6. 当前第一位时，第三个按钮只改变 102 的范围并清它的权限 / 说明；101 仍保留 project.edit。
7. 连点选择第二位两次，select 只增加一次；切回第一位，草稿仍在，select=2。
8. 从上述交互前的 Network 游标读取，requestWillBeSent 事件为零，未截断；联动没有额外 HTTP。
9. 切到练习仅新增一个员工 GET，page=1 / pagesize=2；显示已读取 2 位员工 / 宋江，校验按钮提示待完成。

截图：
`/Users/zhcho/.codex/visualizations/2026/09/26/01a0dde3-c1fb-7220-8c47-bc94483edfd4/unit-06-linkage.png`。
截图中的校验文字是上一次点击结果，不代表随后修改后的所有草稿仍然有效；继续修改应重新校验。

开发日志限制：展开 Select 弹层出现已在 03 / 04 记录的 forceClearActiveKey 属性透传警告，
来自固定版本菜单组件；保留日志，没有修改依赖或增加屏蔽。
旧组件生命周期提示仍存在，未观察到未捕获业务异常或事件循环。
因此“初始渲染 / 本次自动测试无 console.error”与“所有浏览器交互完全无警告”必须区分，后者不成立。

尚未在真实浏览器逐项验证的范围：

- easy / hard 独立页面由真实组件 Jest 渲染验证；浏览器只检查样例和 normal。
- 空父值的真实 Select 过滤与清值由自动测试覆盖，浏览器演示了平台切项目。
- 没有运行学习者完成后的员工联动和 hard 空状态按钮；它们仍是 TODO，不能记为已完成验收。
- 网络中断、反复快速切换输入、移动端布局不在本次浏览器验收范围。
- 初次 GET 的精确次数由 Axios adapter 断言，浏览器 CDP 主要核对加载后的交互零请求和切练习的一次 GET。

本次使用的 API 均有本地源码和测试依据，没有待猜测的 API 名称。库警告是已知兼容性限制。

## 重启和验证步骤

新增 mock 模块需要重启原 dev server；不需要 yarn install，也不启动额外后端：

```sh
cd /Users/zhcho/Documents/study/Choero/choerodon-ui-demo
# 在原开发服务终端 Ctrl+C 后运行：
yarn start
```

另一个终端：

```sh
CI=true yarn test --watchAll=false
node --test scripts/unit.test.js
CI=true yarn build
yarn unit:list
```

打开 [单元 06](http://localhost:3000/#unit-06)：

1. 初始显示平台管理员、平台范围 / 平台查看、dirty=false、load=1。
2. 范围改为项目：旧权限与说明清空，标题变项目权限；下拉只剩项目查看 / 项目编辑。
3. 选项目编辑：说明同步；关闭启用后权限禁用、成员数只读，值保留。
4. 保持第一位，点“将第二位角色切到项目”：日志只修改 102；切到第二位可见权限为空，切回第一位保留草稿。
5. 重复点同一选择按钮不重复增加 select；联动不发新请求。
6. 练习显示两位员工，待完成部分仍保留 TODO；06 与 normal 一致，07～09 未开放。

完整共同验收和挑战档额外验收见单元 README。验证通过并提交后回复“继续”，再做 07。

## 受保护文件 SHA-256（修改前 / 修改后）

以下 82 项从首次写入前快照重新逐文件计算，全部一致。
两个注册文件允许的差异另已核对，不计入此表。

| 文件（相对项目根目录） | 修改前 SHA-256 | 修改后 SHA-256 |
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
| `mock/data/roles.js` | `4f10a2e1097c9c81e95b5a4c48464980627f298c00d6302205886f2b8822e40c` | `4f10a2e1097c9c81e95b5a4c48464980627f298c00d6302205886f2b8822e40c` |
| `mock/data/users.js` | `43f97aeddb1992f07da29c1a50d0266ec3ffc2d4fefb92ace20492f5526ef610` | `43f97aeddb1992f07da29c1a50d0266ec3ffc2d4fefb92ace20492f5526ef610` |
| `mock/unit03.js` | `b6d8cbaeeb4c230660c52f5fc3981d7fdf08804d0c5f8d199938f404bdc99d40` | `b6d8cbaeeb4c230660c52f5fc3981d7fdf08804d0c5f8d199938f404bdc99d40` |
| `mock/unit04.js` | `1b96ee3326daa60c675d8a8575361ef4676077f88ed49e360549043d5ea7b7c6` | `1b96ee3326daa60c675d8a8575361ef4676077f88ed49e360549043d5ea7b7c6` |
| `mock/unit05.js` | `b2e0e8064455887ba7283eca05d8badc010875bbec1fbb3e62637b8a43b47a38` | `b2e0e8064455887ba7283eca05d8badc010875bbec1fbb3e62637b8a43b47a38` |
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
| `src/units/UnitPage.js` | `b699fd81e832bf1271d55c09ce4ae075a6950ac981c69eb2c685047df66ba9c6` | `b699fd81e832bf1271d55c09ce4ae075a6950ac981c69eb2c685047df66ba9c6` |
| `src/units/templates.test.js` | `e6a347ecfcd7b9712941624c43fc0d1cab3bedd2ecb99cb51d576b34c87532ea` | `e6a347ecfcd7b9712941624c43fc0d1cab3bedd2ecb99cb51d576b34c87532ea` |
| `src/units/unit04.test.js` | `a58c8d85e26b86ddbfb1daf781acb8e5ea325bd3c6c2c17f842b095c2a06478e` | `a58c8d85e26b86ddbfb1daf781acb8e5ea325bd3c6c2c17f842b095c2a06478e` |
| `src/units/unit05.test.js` | `c938979936d435faa31b9e99937f01611a09a290dd405e570958ce3fe6c61fde` | `c938979936d435faa31b9e99937f01611a09a290dd405e570958ce3fe6c61fde` |
| `yarn.lock` | `7c082ccd0e2de46719b81ebf66190dcb8acb3b6ecc612933f111ad22b27f8a2c` | `7c082ccd0e2de46719b81ebf66190dcb8acb3b6ecc612933f111ad22b27f8a2c` |
