# 单元 04 交付与验证记录

本次只开放 04 Form 表单。05～08 等用户回复后逐个生成，09 先提交方案并等待确认。
没有生成练习答案或 unit-04-files.md，最终整体验收留到后续单元全部完成。

## 输入与保护边界

以 `/Users/zhcho/Documents/study/Choero/choerodon-ui-demo` 当前工作区为准，分支 main。
已阅读 01～03 的结构、样例、模板、README、注册表、UnitPage、模板测试、重置脚本及测试、mock 和 03 验证记录。

- 新增 `src/units/04-form/` 七个要求文件；Exercise.js 与 normal 逐字节一致。
- 新增 `src/units/unit04.test.js` 和 `mock/unit04.js`；注册表仅开放 04。
- mock/index.js 只新增 require 与注册调用。移除这两行后与本轮开始时的原文件完全一致。
- mock/unit04.js 在注册时分别深拷贝角色 / 员工种子，使用独立集合，只有 GET 接口。
- 未增加依赖、未改变 yarn.lock、入口、已有单元、自由练习区或重置机制。
- 没有 configure、额外语言包 / 样式导入、StrictMode 或任何保存请求。

## 与新要求的差异

1. 用户描述“01～03 已完成并提交”，但实际 HEAD 为 `0e141c0 update framework`，02/03 等仍在未提交工作区中。
   本轮按现有文件继续，没有提交、覆盖或丢弃此前改动；下面的哈希比较基于本轮开始前，而非与 HEAD 比较。
2. 01 模板故意保留未用 useMemo 的 TODO，按保护要求不修正；04 的 DataSet 均在 useMemo 的工厂中创建。
3. Form 1.6.7 没有公开的 validate() / reset() 方法。用真实 checkValidity() 进行校验，用表单 reset 事件触发记录回滚。
   源码依据在 Example.js 注释与 README 表格中列出；没有编造 API。
4. 固定库有已知开发警告。首次渲染严格零 console.error；键盘输入日期会触发下述精确白名单。
   浏览器展开 Select 仍出现 03 中已记录的 forceClearActiveKey 警告，没有修改依赖或屏蔽日志。

## 重启和验证步骤

本轮使用的临时端口为 3001，验证结束后关闭。用户本地使用原来的 3000：

```sh
cd /Users/zhcho/Documents/study/Choero/choerodon-ui-demo
# 在原服务终端 Ctrl+C 后运行：
yarn start
```

新增 mock 模块需要重启 dev server；不需要 yarn install，不启动额外后端。
另一个终端运行：

```sh
CI=true yarn test --watchAll=false
node --test scripts/unit.test.js
CI=true yarn build
yarn unit:list
```

打开 [单元 04](http://localhost:3000/#unit-04)：

1. 样例显示平台管理员、101、site-admin、层级平台、成员数 3、2023-01-15、启用。
2. 名称占满一行，其余编辑字段两列；下方有显式绑定 Record 的 Output 预览。
3. 修改姓名、数字、日期、选项和开关，预览同步；只读模式禁止输入和校验 / 重置。
4. 清空名称后失焦再校验未通过，修正后通过；恢复初始资料会恢复全部字段并显示“已修改：否”。
5. 练习读取两位员工，状态显示当前宋江；绑定、布局、校验和交互保留 TODO。
6. unit:list 的 04 应显示三档可用且“与 normal 模板一致”；05～09 未开放。

## 已执行的检查（2026-09-27，Asia/Shanghai）

| 命令 / 检查 | 退出码 | 输出摘要 / 范围 |
|---|---|---|
| `CI=true yarn test --watchAll=false` | 0 | 4 suites passed，23 tests passed；04 新增 9 项 |
| `node --test scripts/unit.test.js` | 0 | tests 6，pass 6，fail 0；使用临时项目测试备份与错误路径 |
| `CI=true yarn build` | 0 | Compiled successfully；main.20733956.js；无 ESLint 警告导致的 CI 失败 |
| `yarn unit:list` | 0 | 04：easy / normal / hard，与 normal 模板一致；05～09 未开放 |
| `git diff --check` | 0 | 无空白错误 |
| SHA-256 比较 | 0 | 34 个文件前后一致，详见下表 |
| 04 Exercise / normal 字节比较 | 0 | 完全一致 |
| 旧 mock 注册内容比较 | 0 | 去除新 require / 调用后，与本轮前一致 |
| 实际 HTTP 检查（临时 CRA 3001） | 0 | 7 组新接口 + 4 组旧接口，共 11 组通过 |
| Chrome 实际交互 | 已执行 | 样例与 normal、选项 / 日期 / 布尔预览、必填失败与修正、只读切换和回滚通过 |

构建保留 CRA 的 bundle 体积提示，不是 ESLint 警告；依赖未升级，未通过关闭 CI 规避检查。
全量 Jest 输出保留旧组件生命周期 / Table 警告，以及校验失败时框架的 validation console.warn。

测试范围：

- 样例、easy、normal、hard 分别渲染，首次只发 1 次读取请求，分页参数正确，console.error 严格为零。
- 样例使用真实 Form / DataSet / Field，验证跨列 DOM、Output 同步、只读按钮、文本 / 数字 / 日期 / 布尔回滚。
- checkValidity 发现空名称，修正后返回通过，全过程没有新增保存或查询请求。
- mock 直接注册到假的 app，断言分页内容、Spring Page 元数据、过滤、空结果、非法页码 / 大小 / empty 参数。
- 验证两次 mock 注册的内存数据相互独立，且不修改种子对象。
- HTTP 适配层替换后仍执行真实 mock 路由；没有把 Form / DataSet 换成桩函数，没有提供员工练习的完成实现。

浏览器和实际接口范围：

- 实际打开临时 3001 样例，名称清空后校验未通过，输入“浏览器校验角色”后通过。
- Select 选项目、日期键盘输入 2024-06-01、启用关闭，Output 同步。
- 切只读后文本不可输入、按钮禁用，点击开关值仍不变；切回编辑保留草稿。
- 重置恢复平台管理员、平台、2023-01-15、启用，并清除 dirty；normal 页显示已读取 2 位员工。
- 7 组新 HTTP：角色第一页、员工第一页 / 第二页、员工空结果、非法角色 page、非法员工 pagesize、非法 empty。
- 4 组旧 HTTP：角色总数 12、员工总数 45、02 离职查询总数 11、03 用工类型值集 3 项。

初次测试曾把输入、失焦、按钮点击合并在同一个 React 批处理中，导致 Form 读到旧值。
按真实浏览器的分离事件顺序修正测试，保留原有失败 / 成功和无请求断言；未删除测试或放宽功能要求。

## 版本适配与不确定 API

已经从本地 1.6.7 源码 / 类型确认并由测试或浏览器验证：Form 的绑定优先级、只读、布局、
checkValidity、reset 事件、Button.type、Output 不可编辑、日期和布尔值的输入 / 回滚。
本次没有保留未核实的 API 名称。

`node_modules/choerodon-ui/pro/lib/date-picker/DatePicker.js` 的 setText 将键盘输入字符串交给 toMoment，
toMoment 在解析前调用 warning，产生完整消息：

```text
Warning: DatePicker: The value of DatePicker is not moment.
```

测试只对白名单里这一条完整字符串放行，保留实际 console 输出；其他 console.error 都会让测试失败。
四个初始渲染用例额外断言错误调用数为零，不使用该白名单。
浏览器错误日志也只观察到该消息和 Select 的已知 forceClearActiveKey 属性警告，没有未捕获异常。

尚未用真实浏览器单独验证的范围：

- easy / hard 的完整浏览器页面：本轮使用真实组件的 Jest 渲染验证，浏览器只打开样例和 normal。
- DatePicker 的日历面板跨月 / 键盘导航：本轮验证日期文本输入、显示与回滚；需要时可在浏览器展开面板确认。
- 浏览器 Network 的逐次计数：初始一次及交互不增加请求由 HTTP 适配器断言验证，实际接口另做 HTTP 检查。
  用户可按 README 打开 Network 复核。
- 员工固定预览、切换草稿、单条回滚及 hard 空状态是学习者的 TODO，尚未实现，不能记为功能验收通过。
  完成练习后按 README 检查；本次不替用户完成或以测试泄露完整答案。

## 受保护文件 SHA-256（修改前 / 修改后）

以下清单覆盖所有要求的保护路径，并额外保护 package.json、yarn.lock、UnitPage 和脚本测试。
修改前快照来自本轮首个写操作之前；修改后逐文件重新计算，全部一致。

| 文件（相对项目根目录） | 修改前 SHA-256 | 修改后 SHA-256 |
|---|---|---|
| `mock/data/roles.js` | `4f10a2e1097c9c81e95b5a4c48464980627f298c00d6302205886f2b8822e40c` | `4f10a2e1097c9c81e95b5a4c48464980627f298c00d6302205886f2b8822e40c` |
| `mock/data/users.js` | `43f97aeddb1992f07da29c1a50d0266ec3ffc2d4fefb92ace20492f5526ef610` | `43f97aeddb1992f07da29c1a50d0266ec3ffc2d4fefb92ace20492f5526ef610` |
| `mock/unit03.js` | `b6d8cbaeeb4c230660c52f5fc3981d7fdf08804d0c5f8d199938f404bdc99d40` | `b6d8cbaeeb4c230660c52f5fc3981d7fdf08804d0c5f8d199938f404bdc99d40` |
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
| `src/units/UnitPage.js` | `b699fd81e832bf1271d55c09ce4ae075a6950ac981c69eb2c685047df66ba9c6` | `b699fd81e832bf1271d55c09ce4ae075a6950ac981c69eb2c685047df66ba9c6` |
| `yarn.lock` | `7c082ccd0e2de46719b81ebf66190dcb8acb3b6ecc612933f111ad22b27f8a2c` | `7c082ccd0e2de46719b81ebf66190dcb8acb3b6ecc612933f111ad22b27f8a2c` |

![单元 04 实际回滚后的样例页面](/Users/zhcho/.codex/visualizations/2026/09/26/01a0dde3-c1fb-7220-8c47-bc94483edfd4/unit-04-example.png)
