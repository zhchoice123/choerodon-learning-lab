# 单元 05 交付与验证记录

本次只开放 05 表格编辑与提交。06～08 等用户回复后逐个生成，09 先提交方案并等待确认。
没有生成员工练习答案或 unit-05-files.md；不把尚未完成的 TODO 记为验收通过。

## 输入与保护边界

项目：`/Users/zhcho/Documents/study/Choero/choerodon-ui-demo`，分支 main。
开始时先执行 `git status` 和 `git log -1`：工作区干净，HEAD 为
`763069512bc1c860e413c410cd511f4bd715dc1d`（`init 4`）。以此本地最新提交为基线；没有执行远程同步或提交。

已阅读既有单元、README、模板、注册表、UnitPage、重置脚本及测试、模板测试、mock、04 验证记录，
并先检查 node_modules 中实际安装的 1.6.7 源码，再实现写请求和响应回写。

- 新增 `src/units/05-table-submit/` 七个要求文件；Exercise.js 与 normal 逐字节一致。
- 新增 `mock/unit05.js`、`src/units/unit05.test.js`、本记录；注册表仅开放 05。
- mock/index.js 只新增 require 和注册调用。移除这两行后与开始时原文件逐字节一致。
- mock 在每次注册时分别深拷贝角色 / 员工种子，各自持有 rows 和 nextId，不共享既有单元集合。
- 44 个受保护及额外保护文件 SHA-256 前后一致，包含整个 04-form、mock/unit04.js、unit04.test.js。
- 未修改依赖、yarn.lock、入口、自由练习区、01～04、重置工具或已有测试；没有 configure / StrictMode。

## 1.6.7 源码核实与设计差异

路径均相对项目根目录，关键依据也写入 Example.js / mock/unit05.js 的中文注释。

| 源码 | 核实结果 |
|---|---|
| `node_modules/choerodon-ui/dataset/data-set/utils.js`：prepareSubmitData / prepareForSubmit | 默认 dirty 序列化按 create / update / destroy 分组，data 是记录对象数组 |
| `node_modules/choerodon-ui/dataset/data-set/Record.js`：toJSONData | 数组元素附带内部 __id / __status；destroy 仍携带记录字段，不是业务 ID 数组 |
| `node_modules/choerodon-ui/dataset/data-set/DataSet.js`：handleSubmitSuccess / commitData | 写响应同样按 dataKey 提取；__id 匹配原 Record，业务 id 随响应数据回写 |
| `node_modules/choerodon-ui/dataset/data-set/Record.js`：commit | 新增 / 修改成功后 sync 并清除 dirtyData；删除成功的记录移出集合，不能说被移除的旧对象也一定变成 sync |
| `node_modules/choerodon-ui/dataset/data-set/DataSet.js`：submit / write | submit 已调用 validate，失败返回 false；无提交请求可能返回 undefined；非 2xx 拒绝 Promise |
| 同文件：handleSubmitFail | 新增 / 修改保留 add / update 和草稿；destroyed 则 reset 并恢复选中，删除前的未提交修改可能被回滚 |
| 同文件：write 的 axios.all | 三类写请求分别发送，不构成跨请求事务；一类失败时另一类可能已经落库 |
| 同文件：commitData 的 strictPageSize 分支 | 默认截取页大小；本单元局部 strictPageSize=false，让新增的额外行也参与回写 |
| `node_modules/choerodon-ui/dataset/data-set/DataSetRequestError.js` | 包装异常只复制 message/name/stack；本地 feedback.submitFailed 在包装前保存后端中文错误 |
| `node_modules/choerodon-ui/pro/lib/table/query-bar/index.js` | add/create，save/submit，delete/确认后立即删除，reset/回滚；按钮 tuple 可覆盖 onClick |
| `node_modules/choerodon-ui/pro/lib/button/Button.js` | 等待 onClick 并 finally 结束 loading，没有代替业务捕获异常；样例显式 catch |

因此没有把“没有额外手动 validate”作为错误答案：submit 本身校验。
练习故意保留的隐患是失败分支无条件整表 reset，学习者需要解释并修正丢草稿行为。
员工变化点为字段规则 / 默认值和在职、未保存修改的删除限制；hard 额外要求仅保存勾选员工。

mock 使用已经安装的 Express JSON 中间件，限定到 `/mock/unit-05`，不新增依赖。
每份请求数组先在副本整体验证，再修改内存；name 精确为 FAIL 固定返回 HTTP 400，重复编码返回 409。
删除角色 101 固定失败；员工是否可删除以服务端已经保存的 active 判断，不能用请求伪造 false 绕过。
响应 content 是受影响记录，回显 __id，包含后端业务 id；内部标记不存入种子或业务集合。

## 已执行的检查（2026-09-27，Asia/Shanghai）

| 命令 / 检查 | 退出码 | 输出摘要 / 范围 |
|---|---|---|
| `CI=true yarn test --watchAll=false` | 0 | 5 suites passed，41 tests passed；05 新增 18 项 |
| `node --test scripts/unit.test.js` | 0 | tests 6，pass 6，fail 0 |
| `CI=true yarn build` | 0 | Compiled successfully；main.e08080a1.js；无 CI ESLint 失败 |
| `yarn unit:list` | 0 | 05：easy / normal / hard，与 normal 模板一致；06～09 未开放 |
| `git diff --check` | 0 | 无空白错误 |
| SHA-256 比较 | 0 | 44 个文件全部一致，详见下表 |
| 05 Exercise / normal 字节比较 | 0 | 完全一致 |
| 旧 mock 注册内容比较 | 0 | 去掉新增两行后逐字节一致 |
| 实际 HTTP 检查（临时 CRA 3001） | 0 | 19 次请求通过：CRUD、JSON 数组解析、400/409、员工删除规则和旧接口 |
| Chrome 实际交互 | 已执行 | 角色新增、保存、修改、保存、确认删除、固定失败保留草稿；normal 未配置保存保护 |

全量 Jest 使用真实 DataSet / Table，仅替换 Axios adapter，让它经过真实 mock 路由。
非 2xx 会像真实 Axios 适配器一样 reject；没有把 400 resolve 成成功响应。

新增断言覆盖：

- 样例及三档原始模板可渲染、初次各 1 次 GET、page=1 / pagesize=5；模板保存保护不发额外请求。
- 新增后同一 Record 回写 id=113、sync、dirty=false；只发 create，不靠 query 兜底。
- 修改与暂存删除再 submit，后端集合真正更新 / 删除；destroy 请求体是完整记录数组。
- 新增和修改 FAIL 后保留所有输入、add / update、dirty=true；修正后重试成功。
- required 校验失败返回 false，不发 HTTP；reset 撤销未提交新增 / 修改 / 删除，不发请求。
- 原生 delete 立即请求；保留角色删除失败后还原到基线并恢复选中，展示与保存失败的区别。
- 混合 create 成功 / update 失败时，后端新增存在但前端尚未回写，证明跨接口非事务边界。
- 两种集合正常 CRUD、分页、错误请求、批量原子性、编码唯一性、员工在职限制、注册间隔离、种子不变。

19 次实际 HTTP 在真实 dev server 上运行，补充 fake app 未执行的 JSON 中间件验证：

- 角色新增、修改、查询、FAIL 拒绝且后端仍为旧值、对象请求体 400、重复编码 409、删除后查询消失。
- 员工新增在职、伪造离职删除失败、保存离职后删除成功，总数回到 45。
- 原 `/mock/roles` 总数仍 12、`/mock/guide/user` 仍 45、02 离职查询仍 11、04 角色仍为平台管理员。
- 同时确认浏览器删除的 113 已不在后端，浏览器 FAIL 修改的 102 在后端仍是租户管理员。

构建保留 CRA bundle 体积提示，yarn 保留上层 package.json 的 No license field 提示；均未通过关闭 CI 规避。
原始命令日志在本机临时目录 `/tmp/choerodon-unit05-tests.log`、`/tmp/choerodon-unit05-build.log`，不依赖它们运行项目。

## 浏览器观察与验证边界

实际地址使用临时端口 `http://localhost:3001/#unit-05`，用户正常地址仍是 3000。

1. 新增 lesson-role / 学习角色：add、dirty=true、尚无业务 id。
2. 保存：单次 POST create，数组元素 __id=1042 / __status=add，回写业务 id=113，sync / dirty=false。
3. 改为“修改后的学习角色”：update / dirty=true；保存单次 POST update 后 sync / false。
4. 勾选新行、删除、确认：单次 POST destroy，完整对象数组含 id=113 / __id=1042 / __status=delete；行消失，总数回到 12。
5. 租户管理员名称改为 FAIL 保存：POST update 返回 400，页面仍显示 FAIL、update、dirty=true、update 计数 1，显示后端中文原因。
6. 另开练习页：5 位员工、总数 45；点“保存员工（待完成）”提示先完成三个写接口配置。

操作 3～5 的 Network 证据依次为 update 200、destroy 200、update 400，未夹带补查。
随后页面发生导航 / 重新读取，不能把整个浏览器会话的所有 GET 都归因于提交；只按动作窗口核对请求。

失败场景截图保存在本机：
`/Users/zhcho/.codex/visualizations/2026/09/26/01a0dde3-c1fb-7220-8c47-bc94483edfd4/unit-05-failure.png`。
截图是本次验证证据，不是应用运行依赖。

开发日志的实际限制：

- Table 的已知 combineColumnFilter 属性警告会进入 React console.error。
  单元测试只匹配完整消息格式、两个属性名和 Table 调用栈，保留原输出；其他错误不放行。
- 浏览器还保留整包导入提示和旧组件生命周期警告，没有新增依赖或改动库文件消除它们。
- 删除后再次进入另一行编辑，浏览器观察到
  `Warning: Cannot update during an existing state transition (such as within render)`，堆栈来自 TableEditor。
  `node_modules/choerodon-ui/pro/lib/table/TableEditor.js` 的 render 内有 rendered 的 observable 写入；
  本次记录了警告与源码位置，未声称彻底定位或修复库内部问题，也未把它加入测试白名单。
- 固定失败被按钮 catch 处理，页面有原因与保留的草稿；未观察到未捕获业务异常。
  因上述开发警告存在，本次不声明“控制台完全没有 console.error”。

尚未在真实浏览器逐项验证、可由用户继续确认的范围：

- easy / hard 单独页面由真实组件 Jest 渲染验证；浏览器只检查样例和 normal。
- 新增 FAIL 的失败与重试、修改 FAIL 后重试、暂存删除与 reset、保留角色删除失败，由真实 DataSet 自动测试覆盖，未逐项做浏览器交互。
- 跨页编辑保留、网络断开 / 超时、快速并发点击不是本次浏览器验收范围；不承诺混合提交失败可自动安全重试。
- 重启后的初始化由重新注册 mock / 深拷贝种子的测试覆盖；本次没有为了验证重启而中断正在查看的临时页面。
- 员工完成后的 CRUD、删除前检查、状态栏和 hard 仅保存选中项仍是 TODO，需学习者完成后按 README 验收。

本单元使用的 API 均有本地源码依据；没有待猜测的 API 名称。库开发警告是已观察到的兼容性限制。

## 重启和验证步骤

临时 3001 服务保留运行，内存中可能已有测试操作；3000 未被本次服务占用。
日常验证在原开发服务终端 Ctrl+C 后重新启动。必须重启才能加载新增 mock；不需要安装依赖或额外后端。

```sh
cd /Users/zhcho/Documents/study/Choero/choerodon-ui-demo
yarn start
```

另一个终端：

```sh
CI=true yarn test --watchAll=false
node --test scripts/unit.test.js
CI=true yarn build
yarn unit:list
```

打开 [单元 05](http://localhost:3000/#unit-05)，在样例页依次操作：

| 操作 | 应该看到什么 |
|---|---|
| 新增 | 新行；填 lesson-role / 学习角色，成员数 0；失焦后 add、dirty=true、ID 待分配 |
| 保存 | POST create 200；干净内存首次 id=113；sync、dirty=false、成功提示 |
| 修改 | 名称改为“修改后的学习角色”；update、dirty=true |
| 保存 | POST update 200；sync、dirty=false；重新读取仍是修改后的值 |
| 删除 | 勾选新行、点击删除并确认；立即 POST destroy；该行消失、总数减 1，无需再点保存 |
| 触发失败 | 另一行名称改为 FAIL 再保存；HTTP 400、明确原因；FAIL、update、dirty=true 保留 |
| 修正重试 | 改为合法名称再保存；sync、dirty=false |

若需要观察 delete 状态，勾选旧行后点“暂存删除（观察 delete）”，此时 delete 计数增加且无写请求；
重置恢复该行。内置“删除”则是确认后立即提交，两者不要混淆。

练习初始显示 TODO 和员工列表。05 三档可用且与 normal 一致，06～09 仍未开放。

## 受保护文件 SHA-256（修改前 / 修改后）

以下清单来自首个写操作前的快照，修改后逐文件重新计算；44 项完全一致。
包括全部要求的保护目录，并额外保护 package.json、yarn.lock、UnitPage、脚本测试、模板测试。

| 文件（相对项目根目录） | 修改前 SHA-256 | 修改后 SHA-256 |
|---|---|---|
| `mock/data/roles.js` | `4f10a2e1097c9c81e95b5a4c48464980627f298c00d6302205886f2b8822e40c` | `4f10a2e1097c9c81e95b5a4c48464980627f298c00d6302205886f2b8822e40c` |
| `mock/data/users.js` | `43f97aeddb1992f07da29c1a50d0266ec3ffc2d4fefb92ace20492f5526ef610` | `43f97aeddb1992f07da29c1a50d0266ec3ffc2d4fefb92ace20492f5526ef610` |
| `mock/unit03.js` | `b6d8cbaeeb4c230660c52f5fc3981d7fdf08804d0c5f8d199938f404bdc99d40` | `b6d8cbaeeb4c230660c52f5fc3981d7fdf08804d0c5f8d199938f404bdc99d40` |
| `mock/unit04.js` | `1b96ee3326daa60c675d8a8575361ef4676077f88ed49e360549043d5ea7b7c6` | `1b96ee3326daa60c675d8a8575361ef4676077f88ed49e360549043d5ea7b7c6` |
| `mock/utils.js` | `c310364b1bd8f1fe6813c3617e9409a00e0d9d06dd8a0417f6a21b0341d6d9a0` | `c310364b1bd8f1fe6813c3617e9409a00e0d9d06dd8a0417f6a21b0341d6d9a0` |
| `package.json` | `abb4adeb4436ee7857ed3f8828bebffaa3b8040c5cffbe0e9890662455b5aec3` | `abb4adeb4436ee7857ed3f8828bebffaa3b8040c5cffbe0e9890662455b5aec3` |
| `scripts/unit.js` | `9d33ce2bc84f276c792c6bd5b4a659c69a29ef6e39ce42a5092898ea0c514b2b` | `9d33ce2bc84f276c792c6bd5b4a659c69a29ef6e39ce42a5092898ea0c514b2b` |
| `scripts/unit.test.js` | `6d2ed63786b1df1562010cf415e04cf16c02ecb180693686c76272bc767b439d` | `6d2ed63786b1df1562010cf415e04cf16c02ecb180693686c76272bc767b439d` |
| `src/index.js` | `9bf1c1c517b2df3d58ebebfa9ad318e57e4bd306a042ec2da2a8349202dbf912` | `9bf1c1c517b2df3d58ebebfa9ad318e57e4bd306a042ec2da2a8349202dbf912` |
| `src/playground/Playground.js` | `421227899c79366dce9d4d56febd1872e5fcf248ac7c139e1f06c9de5f107de8` | `421227899c79366dce9d4d56febd1872e5fcf248ac7c139e1f06c9de5f107de8` |
| `src/playground/simpleDS.js` | `7480d80004f947ea148decb24bd658102a05f42c729ad89f6ac80ba210cd4616` | `7480d80004f947ea148decb24bd658102a05f42c729ad89f6ac80ba210cd4616` |
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
| `src/units/UnitPage.js` | `b699fd81e832bf1271d55c09ce4ae075a6950ac981c69eb2c685047df66ba9c6` | `b699fd81e832bf1271d55c09ce4ae075a6950ac981c69eb2c685047df66ba9c6` |
| `src/units/templates.test.js` | `e6a347ecfcd7b9712941624c43fc0d1cab3bedd2ecb99cb51d576b34c87532ea` | `e6a347ecfcd7b9712941624c43fc0d1cab3bedd2ecb99cb51d576b34c87532ea` |
| `src/units/unit04.test.js` | `a58c8d85e26b86ddbfb1daf781acb8e5ea325bd3c6c2c17f842b095c2a06478e` | `a58c8d85e26b86ddbfb1daf781acb8e5ea325bd3c6c2c17f842b095c2a06478e` |
| `yarn.lock` | `7c082ccd0e2de46719b81ebf66190dcb8acb3b6ecc612933f111ad22b27f8a2c` | `7c082ccd0e2de46719b81ebf66190dcb8acb3b6ecc612933f111ad22b27f8a2c` |
