# 单元 07 交付与验证记录

本次只开放 07 主从 DataSet。08 等用户验证后回复继续；09 仍先提交隔离方案并等待确认。
没有生成员工练习答案或 unit-07-files.md；最终 03～09 汇总验收留到全部完成后。

## 输入与保护边界

项目：`/Users/zhcho/Documents/study/Choero/choerodon-ui-demo`，分支 main。
本轮先执行 git status、git log -1，确认当前改动只有已交付的单元 06。
按用户“commit all changes, continue chapter 7”指示，逐项暂存这些已有改动并提交：
`72a2fdb4c59f860e9702f296085932930a3a709d`，`Add unit 06 field linkage and events lessons`。
提交后工作区干净，基于该本地提交开始 07；未 push、未远程同步。本单元新改动保留在工作区等待本地验收。

已阅读既有单元、注册表、UnitPage、模板/重置测试、mock 和上次验证记录。
API 先查本地安装的 choerodon-ui 1.6.7 源码，依据保留在样例、模板兼容注释、mock 与 README。

- 新增 `src/units/07-master-detail/`：index.js、Example.js、Exercise.js、README.md、templates 下 easy / normal / hard 共七个文件。
- 新增 `mock/unit07.js`、`src/units/unit07.test.js`、本记录。
- `src/units/index.js` 只将 07 从占位改成 meta 导入；08、09 未开放。
- `mock/index.js` 只新增 require 与注册两行；剔除后与起始副本逐字节一致。
- 写入前 SHA-256 快照覆盖所有既有已跟踪文件，除这两个允许修改的注册文件，共 92 项。
  01～06 全目录、playground、所有旧 mock / 测试 / README、依赖、入口和重置工具均受保护。
- 不升级、不新增依赖；无 StrictMode、额外样式/语言包引入、外部服务或全局 configure。
- 角色权限与员工技能使用独立内存集合；两组种子均深拷贝，整个主从批次校验通过后一次发布。

## 源码核实与设计说明

下列路径均相对 `node_modules/choerodon-ui/`。

| 文件 / 方法 | 已核实行为与采用方式 |
|---|---|
| dataset/data-set/DataSet.js：bind / handleCascade | children 为子 DS 设置 parent / parentName，头 indexChange 驱动主从切换 |
| 同上：syncChildren / syncChild | 无快照时读取，有快照时恢复；头数据内已有子数组（包括 []）时直接加载该数组，不发子查询 |
| 同上：syncChildrenRemote | 300ms 防抖；样例不能只以 status=ready 判断首次子加载完成 |
| 同上：getParentParams / defaultProps.cascadeParams | 默认父主键作为参数名；本单元显式映射 roleId / employeeId |
| 同上：submit / validate / write；utils.js：prepareForSubmit | 默认级联校验和序列化，未配置独立写操作时落到头 transport.submit，一次记录数组请求 |
| Record.js：dirty / normalizeCascadeData / toJSONData | 子表脏也使头 dirty；头 status 可能仍 sync，序列化为 update，并携带脏子行数组 |
| DataSet.js：handleSubmitSuccess / commitData | 外层响应按 dataKey 取 content；优先通过 __id 回写，避免新行无主键无法匹配 |
| Record.js：commit | 递归 child.commitData(data[key])，嵌套响应是数组；非当前头通过临时 DS 恢复子表快照 |
| DataSetSnapshot.js；DataSet.js：restore / commitData；Record.js：records | 快照不保存 props；临时 DS 默认分页切片后，非当前头删除行可残留于提交后的快照 |
| DataSet.d.ts：DataSetContext；DataSet.js：getConfig；lib/index.js | 构造器支持局部 getConfig 上下文，临时 DS 继承父 context；本例局部 strictPageSize=false，其他 key 委托原 getConfig |
| DataSet.js：handleSubmitFail | 不清空编辑数据；本课只删除子行，不能外推为所有父记录删除失败场景均保持 delete |
| DataSet.js：submitRecord | 角色 API 测试验证只提交指定头及其子行，另一头的合法草稿保留；未实现员工挑战按钮 |

最初目标测试 13/15 通过，两个失败均是“非当前头已有行删除 + 新增回写后，主 DS dirty 仍 true”。
保留原断言并核实上述快照实现，使用局部 masterContext 关闭分页切片后，15/15 通过；未改 node_modules 或全局配置。
另有断言确认全局 strictPageSize 未被修改、其余配置值保持委托原 getConfig。
这段兼容底座在三档模板中预置，不作为员工练习答案。

设计边界：已有两条头，每头完整读取 1～50 行，不提供头新增删除或子表分页交互。
子表只有 read，头只有 read + submit；remove 暂存子行删除，统一通过头保存。
响应包含完整存活子行和删除标记，改动行回显 __id；新增 ID、布尔 false、非当前快照都在测试中验收。
主从写失败触发值固定为 FAIL，不用随机失败；后端不发布任何部分更新、不消耗新增 ID。

练习变化点：员工在职限制；技能编码、整数等级 1～5、等级默认 1 / 认证默认 false。
共同隐患 TODO 是只调用子 DS.submit，要求解释为何漏头以及无请求不能当成功。
hard 额外要求仅保存当前员工主从；留按钮与需求，不给实现答案。

## 已执行的检查（2026-09-27，Asia/Shanghai）

| 命令 / 检查 | 退出码 | 输出摘要 / 范围 |
|---|---|---|
| `CI=true yarn test --watchAll=false --runInBand src/units/unit07.test.js` | 0 | 15/15，真实 DataSet + axios adapter 接真实 mock handler；先前 2 失败已修复 |
| `CI=true yarn test --watchAll=false` | 0 | 最终 7 suites、70 tests 全通过；07 新增 15 项 |
| `node --test scripts/unit.test.js` | 0 | 6/6；仅在临时目录验证 reset / 备份，不覆盖用户 Exercise |
| `CI=true yarn build` | 0 | 最终 Compiled successfully；主 bundle gzip 约 968.1 kB |
| `yarn unit:list` | 0 | 07 三档齐全、与 normal 一致；01 显示已改动，保持用户原状；08、09 未开放 |
| `git diff --check` | 0 | 无空白错误 |
| SHA-256 复核 | 0 | 92 项一致，详见下表 |
| 07 Exercise / normal 字节比较 | 0 | 完全一致 |
| mock 旧注册内容比较 | 0 | 去掉 07 新增两行后完全一致 |
| CRA 实际 HTTP + Chrome UI | 通过 | 临时 3002 服务执行，见下节；不是只测 adapter |

最后修改了初始提示文案，并增加配置作用域断言后，重新执行全量 Jest 和构建，均退出 0。
重置脚本未修改，6/6 不重复跑；没有通过改旧测试、压制 console 或替换依赖绕过问题。

测试覆盖：初始样例和三档模板渲染；自动子查询参数；切回快照不重复请求；两头一次提交；
只改子行；新增行 ID / status=sync / dirty=false；非当前子表更新删除；级联校验不发 POST；
原子失败保留新增、修改、待删草稿和 ID 分配；只改头；指定角色提交；mock 正常和错误请求、
跨头归属、重复编码、重复 __id、全删、错误布尔值、员工整数等级与离职新增限制、种子隔离。

## 浏览器与真实 HTTP 验证

已有 dev server 为 3001 / PID 70081，未停止或重启。
本轮启动 `BROWSER=none PORT=3002 yarn start`，只用该新服务测试本次注册的 mock。
验证完成停止本轮 3002 / PID 75913，并确认 3001 原 PID 仍在监听。
本地正式复验请自行重启 yarn start，默认地址 `http://localhost:3000/#unit-07`。

Chrome 页面交互和 CDP Network 观察如下，未注入 DataSet 状态或替代点击处理函数：

| 操作 | 实际观察 |
|---|---|
| 打开样例 | 先 GET roles?page=1&pagesize=2，再 GET permissions?page=1&pagesize=50&roleId=101，均 200；读完两行、dirty=false |
| 第一位改名、新增权限 | browser-permission / 浏览器新增权限，启用取消；新增行=1，ID 空，dirty=true |
| 切第二位改名，再切回 | 仅首次 roleId=102 多一个 GET；第一位新增行和头名称草稿仍在 |
| 从第二位点击保存全部 | 一个 POST，数组包含 101 与 102，101.permissions 包新增行；200；主 dirty=false |
| 切回第一位 | 新行业务 ID=1023（页面数字格式 1,023），enabled=false，新增行计数=0；未补查 |
| 第一位暂存删除 1012，将 1011 说明设 FAIL，切第二位保存 | 一个 POST，含非当前头的 update + delete 行；HTTP 400；页面错误为“整份主从请求均未保存”，主 dirty=true |
| 独立 HTTP 读取失败后的后端 | 仍有 1011 / 1012 / 1023；1011 仍是旧说明，证明没有部分写入 |
| 切回第一位修正 FAIL，再到第二位保存 | 一个 POST 200；切回后只有 1011 / 1023，说明为“浏览器修正后保存”，主与子 dirty=false |
| 独立 HTTP 读取重试后后端 | 1012 确实删除，1011 修改已保存，1023 仍在 |
| 进入练习点击保存 | 显示 2 位员工、空技能表；提示“请先完成 skills 关联与头提交接口”，没有替用户完成 TODO |

暂存删除时有效行数减少，Table 仍可能渲染标记删除的行（禁用编辑）；不能要求它马上从 DOM 消失。
真实 HTTP 还断言：员工技能正常读取 200；未知员工 404；缺 roleId 400；page=0 400；非数组提交 400。
主从首次读取共 2 GET、第二头首次读取 1 GET、三次保存 POST 分别 200 / 400 / 200，期间切回及提交后未额外查询。

截图：`/Users/zhcho/.codex/visualizations/2026/09/26/01a0dde3-c1fb-7220-8c47-bc94483edfd4/unit-07-master-detail.png`。
截图展示修正后保存成功、主子 dirty=false、新行 ID=1023，以及被删除的 1012 已不在表中。
临时证据（不入仓库）：
`/tmp/choerodon-unit07-{target,full,node,build,dev}.log`、`/tmp/choerodon-unit07-browser-network.json`、
`/tmp/choerodon-unit07-before.json`。临时文件可能被系统清理，本记录保留结论与完整哈希。

## 控制台与未验证边界

- 没有观察到本单元新增未捕获异常；不能说整个固定版本依赖链零警告。
- 原有 combineColumnFilter DOM 透传警告仍输出；Jest 仅精确识别该既有消息，其他 console.error 会导致断言失败。
- Chrome 仍有旧生命周期警告与 pro 全包导入体积提醒；生产构建有 CRA bundle size 建议。没有为这些提示新增插件或改依赖。
- FAIL 的 HTTP 400 是教学预期，页面已捕获并显示后端消息。
- 本轮没有待用户确认的 API 名称：主从、参数、回写、局部上下文和指定头提交均已查源码并有运行验证。
- 自动子读取的断网恢复流程未实现/未验收：1.6.7 syncChild 的 read().then 链存在拒绝处理边界；服务恢复后刷新页面。
- 不声明 50 行以上分页主从、父头新增删除、后台并发冲突或生产数据库事务已支持。
- easy/hard 初始渲染由 React 测试验证；真实 Chrome 操作的是样例与 normal 原始练习。员工 TODO 完成后的验收由学习者执行。
- 未执行本单元 Git 提交或 push；没有继续 08 / 09。

## 用户复验命令与操作

停止自己正在使用的旧 dev server 后重新运行 yarn start；mock 改动必须重启才生效。

```bash
yarn unit:list
CI=true yarn test --watchAll=false
node --test scripts/unit.test.js
CI=true yarn build
yarn start
```

打开 `http://localhost:3000/#unit-07`：

1. 等两条权限加载完成，观察 dirty=false。
2. 改第一位权限说明，切第二位再切回；草稿仍在，切回没有子查询。
3. 新增行填写合法编码和说明，改两位角色名称，从第二位保存全部；只有一次 POST，新行回写 ID，dirty=false。
4. 勾选权限暂存删除，先不保存，后端仍有；保存后后端删除。每头至少保留一行。
5. 说明填 FAIL 再保存：400、dirty=true、输入保留；改回合法说明重试：200、dirty=false。
6. 练习页初始只读员工头，主从功能留给 TODO；三档共同验收及 hard 额外要求见 README。

## 受保护文件 SHA-256

下表是本轮第一次写入前与交付前的实际比较；所有 92 项相同。

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
| `mock/data/roles.js` | `4f10a2e1097c9c81e95b5a4c48464980627f298c00d6302205886f2b8822e40c` | `4f10a2e1097c9c81e95b5a4c48464980627f298c00d6302205886f2b8822e40c` |
| `mock/data/users.js` | `43f97aeddb1992f07da29c1a50d0266ec3ffc2d4fefb92ace20492f5526ef610` | `43f97aeddb1992f07da29c1a50d0266ec3ffc2d4fefb92ace20492f5526ef610` |
| `mock/unit03.js` | `b6d8cbaeeb4c230660c52f5fc3981d7fdf08804d0c5f8d199938f404bdc99d40` | `b6d8cbaeeb4c230660c52f5fc3981d7fdf08804d0c5f8d199938f404bdc99d40` |
| `mock/unit04.js` | `1b96ee3326daa60c675d8a8575361ef4676077f88ed49e360549043d5ea7b7c6` | `1b96ee3326daa60c675d8a8575361ef4676077f88ed49e360549043d5ea7b7c6` |
| `mock/unit05.js` | `b2e0e8064455887ba7283eca05d8badc010875bbec1fbb3e62637b8a43b47a38` | `b2e0e8064455887ba7283eca05d8badc010875bbec1fbb3e62637b8a43b47a38` |
| `mock/unit06.js` | `4393d7608009bbdf7f558f9fb02126236564e47c8cad5ee2bf6a0d69e7562c18` | `4393d7608009bbdf7f558f9fb02126236564e47c8cad5ee2bf6a0d69e7562c18` |
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
| `src/units/UnitPage.js` | `b699fd81e832bf1271d55c09ce4ae075a6950ac981c69eb2c685047df66ba9c6` | `b699fd81e832bf1271d55c09ce4ae075a6950ac981c69eb2c685047df66ba9c6` |
| `src/units/templates.test.js` | `e6a347ecfcd7b9712941624c43fc0d1cab3bedd2ecb99cb51d576b34c87532ea` | `e6a347ecfcd7b9712941624c43fc0d1cab3bedd2ecb99cb51d576b34c87532ea` |
| `src/units/unit04.test.js` | `a58c8d85e26b86ddbfb1daf781acb8e5ea325bd3c6c2c17f842b095c2a06478e` | `a58c8d85e26b86ddbfb1daf781acb8e5ea325bd3c6c2c17f842b095c2a06478e` |
| `src/units/unit05.test.js` | `c938979936d435faa31b9e99937f01611a09a290dd405e570958ce3fe6c61fde` | `c938979936d435faa31b9e99937f01611a09a290dd405e570958ce3fe6c61fde` |
| `src/units/unit06.test.js` | `af6efd9e60a7305a3d9c078c24af372c27be8d598909dd070631fc10d33eda88` | `af6efd9e60a7305a3d9c078c24af372c27be8d598909dd070631fc10d33eda88` |
| `yarn.lock` | `7c082ccd0e2de46719b81ebf66190dcb8acb3b6ecc612933f111ad22b27f8a2c` | `7c082ccd0e2de46719b81ebf66190dcb8acb3b6ecc612933f111ad22b27f8a2c` |
