# 单元 08：Modal 弹窗与抽屉

## 学习目标

用 Modal.open 打开编辑器，用 drawer 切换呈现方式；新增与编辑复用 Form。
理解弹窗关闭和数据保存是两件事，用 onOk 的异步返回值控制关闭；取消时正确回滚，失败时保留输入。
样例维护角色，练习维护员工。本单元不提供删除接口，不改变 05～07 的集合。

## 核心概念

```text
点击新增 → DS.create() ─┐
点击编辑 → DS.current ─┴→ 捕获 record → Modal.open({ drawer, children: Form(record) })
                                        │
          确认 → await validate → await submitRecord(record)
                   │ false / HTTP 失败 → return false → 留窗保留草稿
                   └ 成功 → id 回写 / sync → return true → 关闭
          取消 → record.reset → 新增另做 remove → return true → 关闭
          卸载 → 自己的句柄.close(true) → 不影响别的 Modal
```

| 概念 | 含义与边界 |
|---|---|
| `Modal.open` | 创建命令式弹窗，返回 update / close / open 句柄，不是一个代表保存结果的 Promise |
| `drawer: true` | 抽屉外观；记录、校验、保存、取消流程完全可以复用 |
| `Form record` | 明确绑定打开时记录，避免之后 current 改变而保存到另一行 |
| 直接绑定 | 输入马上写进 Record，底层列表会显示草稿；这不是隔离副本编辑 |
| `onOk` | 1.6.7 等待其结果，严格 false 阻止关闭；undefined 不等于阻止关闭，要明确返回 true / false |
| `record.validate()` | 等待当前记录字段校验；只检查浏览器规则，不能替代后端校验 |
| `submitRecord(record)` | 只提交捕获的记录，自带再次校验；避免整个 DS.submit 顺带保存别的行 |
| `onCancel` | 取消按钮/关闭图标的取消入口；样例在这里 reset，并对新增草稿额外 remove |
| `record.reset()` | 回到最近一次 pristineData，通常是载入或成功保存时的值；不是任意“打开时快照” |
| 新增取消 | add 记录 reset 后仍是 add；必须移除它，否则空白草稿还留在列表 |
| `onClose / afterClose` | onClose 是关闭前门禁；afterClose 是退出动画后的清理。成功关闭也经过 onClose，不能无条件 reset |
| 程序关闭 | 句柄 close 不自动走 onCancel；样例 onClose 补充回滚，accepted 标记保护已保存记录 |
| 生命周期 | Modal.open 的窗口不随普通组件 JSX 自动消失；组件卸载只清理自己的句柄，不 destroyAll |

列表是只读入口，确保弹窗打开前目标记录没有其他未保存修改。因此取消编辑恢复最近保存值也就是打开前值。
如果以后允许列表先编辑，record.reset 会撤销更早的未保存内容，应另行设计快照/副本边界，不能照搬本例。

## 样例怎么读

打开 `http://localhost:3000/#unit-08`，按 Example.js 知识点 1～9 阅读。

1. 列表初始查询一次，三位角色；点击行定位 current，表格无 editor（知识点 1）。
2. “编辑当前（弹窗）”打开捕获的角色；Form record 固定绑定这条记录（知识点 2、4）。
3. 改名点取消：恢复最近保存值，dirty=false，没有 POST。新增弹窗取消则恢复原条数（知识点 3）。
4. 清空名称确认：校验失败留窗，Network 没有 POST。填合法内容确认：等待提交后才关闭（知识点 5、6）。
5. 名称填 FAIL：HTTP 400，窗口和输入保留，显示后端中文原因。修正再确认，成功回写后关闭（知识点 7）。
6. 用抽屉重复新增和编辑，行为与弹窗一致。新增 ID 初始为空，保存成功后 ID 有值、status=sync（知识点 4、6）。
7. 保存时表单只读、确认/取消按钮禁用，重复回调也有 pending 保护；不允许一边保存一边撤销（知识点 5、8）。
8. 在路由切换导致卸载时，只清理本单元句柄。已发到后端的请求不会因为关窗自动撤销（知识点 9）。

## TODO 与知识点对照

三个难度共用共同验收；只改 Exercise.js。样例不含员工答案，员工字段要求见接口表。
练习有两个变化点：在职时邮箱动态必填；已有员工编码不可修改，新员工可填写。

### 入门 easy

| TODO | 任务 | 知识点 |
|---|---|---|
| 1 | 字段规则与默认值 | 1；复习 03 |
| 2 | 在职邮箱必填、旧编码只读 | 2 的变化点；复习 06 |
| 3 | create / update 接口 | 1、6；复习 05 |
| 4 | 新增/编辑时捕获 record | 2、3 |
| 5 | 弹窗与抽屉复用 | 4 |
| 6 | 等待校验与单条提交，修正提前关闭 | 5、6 |
| 7 | 失败留窗和返回值 | 5、7 |
| 8 | 取消编辑/新增 | 3、8 |
| 9 | 保存保护、固定目标与卸载 | 2、5、9 |
| 10 | 状态与共同验收 | 6～9 |

### 标准 normal

| TODO | 任务 | 知识点 |
|---|---|---|
| 1 | 员工规则及接口 | 1、6 |
| 2 | 员工业务变化点 | 2；复习 03、06 |
| 3 | 共用编辑器与绑定目标 | 2、4 |
| 4 | 修正提前关闭，判断真实结果 | 5、6 |
| 5 | 失败留窗与保存保护 | 5、7 |
| 6 | 回滚与取消新增 | 3、8 |
| 7 | 清理和验收 | 8、9 |

### 挑战 hard

| TODO | 任务 | 知识点 |
|---|---|---|
| 1 | 员工字段与界面 | 1、2 的变化点 |
| 2 | 共用弹窗/抽屉并固定目标 | 2、4 |
| 3 | 修正关闭隐患，等待成功 | 5～7 |
| 4 | 取消与重复操作保护 | 3、5、8 |
| 5 | 卸载与可观察验收 | 8、9 |
| 6 | 有修改时取消需二次确认 | 额外需求 |

骨架 onOk 会立即返回 true，只改变提示文案，未做校验或保存。
说明它为什么“能跑但有隐患”，再自行修复。不要把窗口消失当作保存成功的证据。

## 接口数据示例

mock/unit08.js 注册独立内存数据，两组各取三条种子并深拷贝，重启 yarn start 恢复初始状态。

| 方法 | 角色 | 员工 |
|---|---|---|
| GET | `/mock/unit-08/roles` | `/mock/unit-08/employees` |
| POST 新增 | `/mock/unit-08/roles/create` | `/mock/unit-08/employees/create` |
| POST 修改 | `/mock/unit-08/roles/update` | `/mock/unit-08/employees/update` |

GET 分页 page 从 1 开始，pagesize 为 1～100 正整数，列表默认 5。
响应 Spring Page；示意仅显示 content 中本课需要的字段，种子还包含既有其他字段。

```json
{
  "content": [{ "id": 101, "code": "site-admin", "name": "平台管理员", "enabled": true }],
  "totalElements": 3, "totalPages": 3, "size": 1,
  "number": 0, "numberOfElements": 1, "empty": false
}
```

上例对应 page=1&pagesize=1。页面实际初始 pagesize=5，显示三条。
新增角色请求示意，__id 是运行时关联号，不能硬编码：

```json
[{ "code": "modal-role", "name": "弹窗角色", "enabled": false, "__id": 1005, "__status": "add" }]
```

```json
{
  "content": [{ "id": 104, "code": "modal-role", "name": "弹窗角色", "enabled": false, "__id": 1005 }],
  "totalElements": 4, "success": true
}
```

更新请求增加已有 id，__status 为 update。虽然只保存一条，请求仍是长度 1 的数组。
后端回显 __id 与业务 id，供 DataSet 按 content 匹配回写；标记不存入业务集合。
角色新启动后首个新增 ID=104，员工为 4，以真实响应为准。

| 员工字段 | 约束 |
|---|---|
| id | 新增不填；已有记录主键由后端定位，不允许更新不存在的记录 |
| code | EMP 加三位数字、唯一；新增可填写，已有员工不可改，后端也校验 |
| name | 非空；精确值 FAIL 固定返回 400 |
| age | 18～60 整数，新建默认 18；小数不能仅凭 min/max 通过 |
| active | 布尔值，新建默认 true；提交 false 必须保留 |
| email | active=true 时必填；非空值总是需要合法邮箱格式，离职可以为空字符串 |

固定失败：`{"message":"名称 FAIL 触发单元 08 固定失败，请在弹窗内修正后重试"}`（400）。
重复编码 409；不存在的记录 404；错误数组格式、状态、字段规则 400。
失败不会写入或消耗新增 ID；这里没有真正数据库事务或并发版本锁。

## 验收标准（三档共同）

### 原始模板

- [ ] 初始只有一次员工 GET，显示已读取 3 位员工；无写请求。
- [ ] 新增/编辑按钮可打开弹窗或抽屉骨架，easy/normal 表单只读，hard 只显示提示。
- [ ] 骨架确认会提前允许关闭，并显示“尚未校验或保存”；这是待修复隐患，后端不会改变。
- [ ] 骨架取消/离开单元不报新异常；Exercise.js 默认逐字节等于 normal。

### 完成 TODO 后

- [ ] 新增与编辑各能以弹窗/抽屉打开，共用保存和取消流程；同时最多一个本单元编辑器。
- [ ] 编辑绑定打开时的 Record；即使 current 改变，原窗口仍操作原记录，不误改别的员工。
- [ ] 旧员工编码只读，新员工可输入；在职勾选改变邮箱必填要求，不丢失其他字段输入。
- [ ] 新增年龄默认 18、在职默认 true；非法编码、空姓名、年龄 17/61/18.5、非法邮箱不能保存。
- [ ] 前端校验失败返回 false，窗口留在原处、无 POST，字段提示可观察。
- [ ] 合法新增确认只有一次 POST create，body 是一条记录的数组；成功才关闭，ID 回写、status=sync、dirty=false。
- [ ] 编辑确认只有一次 POST update；关闭后列表显示保存值，不额外 query 掩盖回写问题。
- [ ] 未改动点确认直接关闭，没有写请求；配置缺失导致无提交结果时不能伪称成功。
- [ ] 已有行取消后恢复最近保存值、没有 POST；刚保存一次后再次编辑取消应恢复新保存值。
- [ ] 新增取消后列表条数恢复，不留空白 add 记录，不发 create 或 destroy。
- [ ] 取消按钮和右上关闭图标都执行取消语义；点击遮罩/Esc 不应误丢草稿（本例禁用这两个关闭入口）。
- [ ] 名称 FAIL 保存返回 400，窗口不关闭，显示具体原因，输入及 add/update、dirty 保留。
- [ ] 修正 FAIL 再保存成功；失败后选择取消则回滚/移除草稿，不把失败数据保留成已保存行。
- [ ] 慢网络期间表单只读、取消/确认受保护；快速重复点击不产生多次 POST，也不在请求中途 reset。
- [ ] 程序关闭窗口与单元卸载都有清理，不调用全局 destroyAll，不误关其他单元窗口。
- [ ] 只提交本窗口目标行；其他合法草稿保持未保存，后端旧值不变。

## 挑战档额外需求

有未保存修改时取消，需要二次确认。选择“继续编辑”应保留原窗口和全部输入；选择“放弃修改”才回滚并关闭。
无修改可以直接取消，新增取消不能留下空行。取消按钮与右上角关闭图标的行为一致，保存中不弹出放弃确认。
自行研究 1.6.7 的确认框 Promise 返回结果；样例未实现该交互，不能把“打开了确认框”当作“用户确认放弃”。

## 难度与重置

```bash
yarn unit:list
yarn unit:reset 8 easy
yarn unit:reset 08 normal
yarn unit:reset 8 hard
```

实际编辑 Exercise.js；重置会先备份到 .backup/08-modal/，终端打印路径，再覆盖当前练习。
本次没有重置任何旧单元练习。

## 思考题

1. 为什么 onOk 忘写 return false 可能让校验失败的窗口关闭？
2. record.reset 为什么不能代替取消新增时的 remove？
3. 如果 onClose 一律 reset，会不会把成功新增的记录移除？
4. 如果列表允许先编辑再开窗，reset 恢复的是“打开时”还是“最近保存时”？
5. 点击确认后切到别的单元，已经到达后端的 HTTP 是否会被关闭弹窗撤销？
6. 如果直接 dataSet.submit，另一行的未保存内容会发生什么？

## 常见坑与源码依据

以下路径相对 node_modules/choerodon-ui/：

| 坑 / 行为 | 已核实源码 |
|---|---|
| Modal.open 返回的是句柄 | pro/lib/modal/index.js；pro/lib/modal-container/ModalContainer.js：open |
| onOk/onCancel 严格 false 才阻止关闭 | pro/lib/modal/Modal.js：handleOk / handleCancel |
| drawer 复用 Modal 与 Form | pro/lib/modal/Modal.js：getClassName / render；pro/lib/form/Form.js：record |
| 程序 close 不自动走 onCancel | pro/lib/modal-container/ModalContainer.js：open 中的 close，调用 onClose |
| afterClose 要等动画结束 | 同文件 handleAnimationEnd；不能在发起关闭时就当所有资源已清理 |
| 新增 reset 不会移除 add | dataset/data-set/Record.js：reset；DataSet.js：remove / deleteRecord |
| 单条提交仍为数组，按 content 回写 | DataSet.js：submitRecord / handleSubmitSuccess / commitData；utils.js：prepareForSubmit |
| 错误被包装后无 response | DataSet.js：handleSubmitFail；DataSetRequestError.js；本地 feedback 提前保留 message |

不要用 destroyAll 做组件卸载清理；不要取消后重新查询掩盖错误的回滚边界；不要在 finally 无条件关闭或 reset。
卸载中的已发送保存请求仍可能成功，本例不声称提供请求撤销；用户应重新进入页面核对后端结果。
既有 Table 的 combineColumnFilter、旧生命周期等依赖警告可能出现，保持输出，不为消除警告升级框架。

## 本地验证

mock 变更需要停止旧 yarn start 并重新启动，默认打开 `http://localhost:3000/#unit-08`。
仅改前端 Exercise.js 通常热更新；重启后本单元内存恢复初始三条。

```bash
yarn unit:list
CI=true yarn test --watchAll=false
node --test scripts/unit.test.js
CI=true yarn build
yarn start
```

实际测试、浏览器操作和保护文件哈希见 `docs/unit-08-verification.md`。
