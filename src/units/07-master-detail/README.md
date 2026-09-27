# 单元 07：主从 DataSet

## 学习目标

用 children 关联两个 DataSet，切换头记录时自动查询或恢复对应行，理解“当前子表”与“所有头的子表草稿”。
从头 DataSet 发出一次嵌套提交，观察级联校验、后端分配行 ID、失败后保留草稿。
样例维护已有角色与权限行，练习维护已有员工与技能行；本单元不新增或删除头记录。

## 核心概念

```text
角色 DataSet（头，current = 101）
 ├─ children.permissions ──▶ 权限 DataSet（当前 101 的行）
 ├─ 101 的子表快照：权限草稿
 └─ 102 的子表快照：权限草稿

切 current → 有快照：恢复 → 无快照：300ms 防抖后 GET permissions?roleId=102
头.submit() → 校验所有待提交头行 → POST [头 + permissions:[脏行]]
             → 成功：content:[头 + permissions:[行]]，两级 __id 匹配回写
             → 失败：后端不发布副本，浏览器保留草稿
```

| 概念 | 含义与边界 |
|---|---|
| `children` | 头的命名子 DataSet；键名也是嵌套提交字段。与树表 childrenField 不同 |
| `cascadeParams` | 子查询从父记录取参数；默认父 primaryKey 为 id，本接口明确要求 roleId / employeeId |
| `current` | 更换头当前记录即可驱动子表；不是勾选 selected，也不需要再手动 query |
| 子表快照 | 当前子 DS 是同一个对象，各头草稿分别保存；切回已读头不再请求，刷新页面会丢失未提交草稿 |
| 头响应省略子键 | 表示需要远程查询；返回 `permissions: []` 会被当作已有空数据而跳过远程读取 |
| 就绪窗口 | 初次切换存在 300ms 防抖，status 短暂 ready 不代表已读到子行；样例另外记录加载完成标记 |
| `dataToJSON` | 保留默认 dirty 行为，包含嵌套脏行；本单元不使用 self 模式 |
| `record.status / dirty` | 只改子行时头 status 可以仍为 sync，但主 DS dirty 为 true；请求中的该头为 update |
| `transport.submit` | 只放在头，收集未独立配置 create / update / destroy 的记录，一次数组请求包含所有已加载的脏主从 |
| `remove / delete` | remove 只暂存删除；delete 会直接写请求。本单元用 remove，统一由头提交 |
| `id / __id` | id 是后端业务主键；__id 是浏览器记录关联号，成功响应回显后才能可靠匹配新行 |
| 原子性 | 来自本 mock 的副本校验后一次发布，不是 DataSet 对多个 HTTP 请求自动提供事务 |

为聚焦主从，本单元限定已有两条头记录，每头 1～50 行；一次完整读取子表，隐藏分页操作。
上限不是通用主从分页方案。新增空行可先在页面存在，但提交时必须通过字段及后端约束。

### 1.6.7 的局部兼容底座

非当前头在 Record.commit 中使用临时 DataSet 恢复快照；DataSetSnapshot 不保存 props。
commitData 默认分页切片后，待删行可能仍留在临时快照，使后端已删除而主 DS dirty 仍为 true。
样例和三档模板都保留 `masterContext`：仅让这个头及它内部创建的临时 DS 关闭 strictPageSize，
其余配置读取原 getConfig。没有调用 configure，也没有修改全局值或其他单元。
这是框架兼容底座，不列为练习答案；不要删掉头构造器第二个参数。
子表完整返回、每头至少一行也避免“无回写数据时框架自动补查”的另一条分支。

## 样例怎么读

打开 `http://localhost:3000/#unit-07`，对照 Example.js 的知识点 1～8。

1. 头 GET `/mock/unit-07/roles?page=1&pagesize=2`，随后权限 GET 带 page=1、pagesize=50、roleId=101。
   第一位为平台管理员，两条权限；读取期间操作按钮禁用，完成后显示子表已就绪（知识点 1～4）。
2. 改第一条权限说明，再切第二位角色：自动读 roleId=102。切回第一位，说明草稿仍在，Network 不再查询（知识点 6）。
3. 新增权限行，填写 `learning-permission`、说明“学习权限”，取消启用；ID 暂时为空，新增行=1。
   可修改头名称，第二位角色也留下修改（知识点 4、5）。
4. 保存全部主从：只有一个 POST `/mock/unit-07/roles/submit`，请求体是头数组，行在 permissions 数组中。
   所有合法草稿成功同步，新行拿到业务 ID，主从 dirty=false。不是对子表逐个独立保存（知识点 5、7）。
5. 勾选一行“暂存删除权限”：有效行数先减少，Table 将该行标记为待删除，保存前后端仍有；保存后后端删除，至少保留一行（知识点 5、8）。
6. 把权限说明或角色名填为 `FAIL`，保存返回 HTTP 400，页面显示具体失败消息，dirty=true、修改仍在。
   修正后再次保存成功；另一个头的修改也不会在失败请求里提前落库（知识点 8）。
7. 把非当前角色的必填权限说明清空，切换后保存全部：级联校验不通过，返回 false，不发 POST（知识点 7）。

## TODO 与知识点对照

三档共用后面的验收标准；只编辑 Exercise.js。变化点为员工在职限制，以及技能整数等级与认证默认值。

### 入门 easy

| TODO | 任务 | 样例知识点 |
|---|---|---|
| 1 | children 绑定 skills | 1、4 |
| 2 | 子查询与 employeeId 参数 | 2 |
| 3 | 头的统一提交接口 | 5 |
| 4 | 技能字段校验、等级与认证默认值 | 7；复习 03 |
| 5 | 行内编辑和只读主外键 | 4；复习 05 |
| 6 | 切头、加载保护与草稿快照 | 3、6 |
| 7 | 在职新增与暂存删除 | 4、5 的变化点 |
| 8 | 修正仅子提交，判断实际结果 | 7、8 |
| 9 | 可观察状态与失败重试 | 3、8 |
| 10 | 多头与接口契约验收 | 2、6～8 |

### 标准 normal

| TODO | 任务 | 样例知识点 |
|---|---|---|
| 1 | 员工与技能关系 | 1、4 |
| 2 | 父参数与延迟加载保护 | 2、3 |
| 3 | 主从提交、字段规则与编辑 | 5、7；复习 03、05 |
| 4 | 切换与快照 | 6 |
| 5 | 在职新增、行归属与暂存删除 | 4、5 的变化点 |
| 6 | 修正隐患、结果判断与失败反馈 | 7、8 |
| 7 | 状态与共同验收 | 3、7、8 |

### 挑战 hard

| TODO | 任务 | 样例知识点 |
|---|---|---|
| 1 | 完成主从关系和界面 | 1、2、4 |
| 2 | 自动加载、快照和操作保护 | 3、6 |
| 3 | 技能维护与在职限制 | 4、5 的变化点 |
| 4 | 修复提交隐患，保存所有主从 | 5、7、8 |
| 5 | 状态与错误场景验收 | 3、6～8 |
| 6 | 仅保存当前员工主从 | 额外需求，自行研究 |

隐患提示：仅调用技能 DS 的 submit，员工姓名、在职变化会去哪？没有子写接口时，Promise 完成是否说明保存成功？
模板中的保护使原始页面可以运行；配置完成后，需要自己修正这个隐患，而不是删除保护就认为完成。

## 接口数据示例

所有查询返回 Spring Page；单元独立内存集合，重启 yarn start 恢复。旧接口和种子对象不被修改。

| 方法 | 路径 | 用途 |
|---|---|---|
| GET | `/mock/unit-07/roles` | 已有角色头，不含 permissions |
| GET | `/mock/unit-07/roles/permissions` | roleId 必填，权限子表 |
| POST | `/mock/unit-07/roles/submit` | 原子保存角色主从 |
| GET | `/mock/unit-07/employees` | 已有员工头，不含 skills |
| GET | `/mock/unit-07/employees/skills` | employeeId 必填，技能子表 |
| POST | `/mock/unit-07/employees/submit` | 原子保存员工主从 |

查询 page 从 1 开始，pagesize 为 1～50 正整数；非法参数 400，不存在的头 404。

GET `/mock/unit-07/employees/skills?employeeId=1&page=1&pagesize=50`：

```json
{
  "content": [
    { "id": 11, "employeeId": 1, "skillCode": "SKILL_1", "level": 1, "certified": false },
    { "id": 12, "employeeId": 1, "skillCode": "SKILL_2", "level": 2, "certified": false }
  ],
  "totalElements": 2, "totalPages": 1, "size": 50,
  "number": 0, "numberOfElements": 2, "empty": false
}
```

角色提交示意（__id 每次运行由框架分配，示例数字不应写进业务代码）：

```json
[
  {
    "id": 101, "name": "平台管理员", "__id": 1001, "__status": "update",
    "permissions": [
      { "roleId": 101, "code": "learning-permission", "description": "学习权限", "enabled": false, "__id": 1005, "__status": "add" }
    ]
  }
]
```

成功响应外层按 dataKey 取 content，嵌套 permissions / skills 直接是数组，不能再包 content。
响应含存活行和已删行标记，受影响的行回显 __id；这些内部标记不写入业务集合。
例如新增行得到 `{ "id": 1023, "roleId": 101, "code": "learning-permission", "description": "学习权限", "enabled": false, "__id": 1005 }`。
`1023` 仅是新启动后的首次角色新增 ID，后续以实际响应为准。

员工请求使用相同两级数组结构，子键换为 skills。字段契约：

| 字段 | 规则 |
|---|---|
| 头 id / 行 id | 已有头不可新增删除；新增行 id 由后端分配，更新/删除必须属于当前提交的头 |
| 头 name | 非空；恰好 FAIL 固定失败 |
| active | 员工在职布尔值，最终为 false 时不允许新增技能，但可以维护已有技能 |
| employeeId | 新增技能绑定当前员工，不能串到其他员工 |
| skillCode | 大写字母开头，后续大写字母/数字/下划线，总长 2～20；同员工内唯一，不同员工可重复 |
| level | 1～5 整数、默认 1；小数也必须拒绝，仅 min/max 还不够 |
| certified | 布尔值，默认 false，不能用真假判断丢掉 false |

FAIL 触发 400：`{"message":"FAIL 触发固定失败，整份主从请求均未保存"}`。
同头重复编码返回 409。错误主键归属返回 404。整个批次通过校验才发布副本，失败也不消耗新增 ID。
本单元只删除子行，不能据此推断“删除头失败”时的 Record.status 行为。

## 验收标准（所有难度）

### 原始模板

- [ ] 选择练习页，员工 GET 一次，显示已读取 2 位员工；技能表为空，主从关联尚未完成。
- [ ] 点击保存只提示“请先完成 skills 关联与头提交接口”，无 POST，无新增控制台异常。
- [ ] easy / normal / hard 各自初始渲染均正常；Exercise.js 默认逐字节等于 normal。

### 完成 TODO 后

- [ ] 初始显示第一位员工及两条技能，先头后行共 2 个 GET；子请求 employeeId=1，page=1、pagesize=50。
- [ ] 首次切第二位多一个 employeeId=2 的 GET；切回第一位不再查询，草稿及新行 ID 空值保留，未串头。
- [ ] 读取未完成期间新增、删除、保存和切头受保护，不能把行错误归到上一个员工。
- [ ] 在职员工新增技能，等级默认 1、认证默认 false、外键等于当前员工；离职员工不能新增。
- [ ] 编码必填且符合格式；等级空值、0、6、1.5 均不能通过保存。非当前头的非法行也阻止保存全部。
- [ ] 两位员工分别改头和行，点击保存全部只有 1 个 POST；请求包含两头及各自 skills 数组。
- [ ] 新增行获得后端 ID，status=sync；切回各员工数据仍在，主从 dirty=false，不靠重新查询清空草稿。
- [ ] 只改头、只改行都能保存；只改行时能解释头 status=sync 与主从 dirty=true 并不矛盾。
- [ ] 暂存删除后未发写请求；保存成功才实际删除。删除非当前头的行后，dirty 也必须归 false。
- [ ] 每个头至少保留一条技能；同员工重复技能码保存返回 409，草稿保留；不同员工同码允许。
- [ ] 技能码 FAIL 或员工名 FAIL 返回 400：主从 dirty=true，用户输入、新增行和待删行均保留，两位员工后端均未部分更新。
- [ ] 修正 FAIL 重试成功；不 reset/query 掩盖失败，不把 false 或无请求的 undefined 提示成保存成功。
- [ ] 刷新页面只展示已经保存的数据；重启 dev server 恢复初始种子。

## 挑战档额外需求

增加“仅保存当前员工主从”。两位员工都有合法草稿时，只保存当前头与其技能；Network 请求数组只含当前员工。
当前员工同步，另一位员工仍 dirty、输入和新行仍在，后端仍是旧值；随后保存全部才提交剩余修改。
这是样例没有提供的交互，模板只留按钮；不要求隔离另一位员工非法草稿的校验行为。

## 难度与重置

```bash
yarn unit:list
yarn unit:reset 7 easy
yarn unit:reset 07 normal
yarn unit:reset 7 hard
```

重置前会备份当前 Exercise.js 到 .backup/07-master-detail/；终端打印备份路径。
不要编辑模板；重置会覆盖当前练习。本次交付没有对 01～06 执行 reset。

## 思考题

1. 头 GET 提供 skills:[] 与完全省略 skills，为什么请求数不同？
2. `child.parent`、`parent.current`、子行 employeeId 分别表达什么？
3. 为什么切换时手动重新 query 可能覆盖草稿？浏览器刷新还能恢复快照吗？
4. 如果两个头改动分两次 HTTP 保存，第二次失败，第一个会自动回滚吗？
5. 成功响应只有业务 id、没有 __id 时，新行如何匹配？两个新增行回写顺序变化会怎样？
6. 为什么全局 strictPageSize 与某个 DS 的 props 不是一个作用域？兼容代码为什么没有改 configure？

## 常见坑与源码依据

| 坑 / 行为 | 1.6.7 本地源码（node_modules/choerodon-ui/ 下） |
|---|---|
| children 名称错误、切换重复查询 | dataset/data-set/DataSet.js：bind / handleCascade / syncChildren / syncChild |
| 自动子查询 300ms 后才开始 | 同上：syncChildrenRemote 防抖 |
| 默认级联参数是父主键 id | 同上：getParentParams / defaultProps.cascadeParams |
| 将行单独提交，漏掉头或其他头草稿 | 同上：submit / write；dataset/data-set/utils.js：prepareForSubmit |
| 只看头 status 判断有没有修改 | dataset/data-set/Record.js：dirty / normalizeCascadeData / toJSONData |
| 回写必须外层 content、内层行数组 | DataSet.js：handleSubmitSuccess / commitData；Record.js：commit |
| 非当前头删除后仍 dirty | DataSetSnapshot.js 不保存 props；DataSet.js：restore / commitData；Record.js：commit / records |
| 局部配置底座合法性 | DataSet.d.ts：DataSetContext / 构造器第二参数；DataSet.js：getConfig；lib/index.js 导出 getConfig |
| 提交失败后清空用户输入 | DataSet.js：handleSubmitFail；样例不 reset/query，mock 不发布失败副本 |

子表读取失败与写失败是两回事。1.6.7 自动 syncChild 的 read().then 链没有本例可用的完整重试流程；
本课验收覆盖正常本地读取和可复现写失败，不声明断网读取恢复已完成。服务中断后恢复服务并刷新页面。
固定版本 Table 的 combineColumnFilter 透传警告可能出现，测试保留输出且只精确识别该已知警告；其他异常不放行。

## 本地验证

mock 新增后需要停止并重新运行 `yarn start`，打开 `http://localhost:3000/#unit-07`。
仅改 Exercise.js 通常热更新，无需重启；重启会清空本单元内存写入。

```bash
yarn unit:list
CI=true yarn test --watchAll=false
node --test scripts/unit.test.js
CI=true yarn build
yarn start
```

实际执行结果、保护文件 SHA-256 和浏览器验证边界见 `docs/unit-07-verification.md`。
