# 单元 06：字段联动与事件

## 学习目标

根据当前记录计算必填、禁用、只读、标签；建立父子下拉联动；理解 load / update / select 的触发边界。
能区分“计算字段属性”和“修改字段值”，通过事件记录变化，并避免误改其他记录或递归触发。
本单元只查询和修改浏览器草稿，不保存到后端，不引入全局配置。

## 核心概念

```text
角色.scope ──cascadeMap──▶ 权限 options 的 scopeCode ──▶ 下拉可选项
     │ update 事件
     └──record.set──▶ 清空旧 permissionCode / permissionSummary
                            │ 选择新权限 → update
                            └──record.set──▶ 写入权限说明（不反向联动）

record.enabled ──dynamicProps──▶ 权限 required / disabled
record.scope   ──computedProps─▶ 权限 label
record.enabled ──computedProps─▶ 成员数 readOnly

load → 记状态日志，不 set 业务字段
select → 记 previous / record，并显式将 current 设为 record
```

| 概念 | 含义与边界 |
|---|---|
| `dynamicProps` | 属性名到函数的映射，如 required；参数含 dataSet / record / name；record 可能不存在 |
| `computedProps` | 使用 MobX computed 的依赖跟踪和缓存；计算的是字段属性，不是 record 中的业务值 |
| 属性优先级 | 本例不重复定义同一动态属性；Field.get 中 computedProps 优先于 dynamicProps，再回退静态属性 |
| `cascadeMap` | `{ 选项中的父键: 当前记录中的父字段 }`；方向写反会导致没有匹配选项 |
| `load` | loadData 完成后触发；参数是 `{ dataSet }`，不提供当前 record 参数 |
| `update` | record.set 改变值后触发，含 record / name / value / oldValue；同值不会再次触发 |
| `select` | 从未选中变为选中时触发；单选模式提供 previous，重复选择同一条不会再次触发 |
| `current / selected` | 当前编辑对象与选中对象不是同一概念；本例在 select 中显式同步 |
| `record.set` | 写入业务值，会产生 dirty，也可能再次触发 update；需要按字段分支设计单向联动 |
| `dataSet.setState` | 保存计数和日志等 UI 状态，不修改业务字段、不触发 update、不制造 dirty |

属性回调应只读记录，不能在里面 set、query 或注册事件。字段被禁用 / 只读只约束界面输入，
程序调用 record.set 仍然能改变值。校验规则与禁用状态也不是同一件事。

cascadeMap 过滤不等于一定清理旧值：1.6.7 的 Select 在某些条件下自动清理，
但该逻辑依赖组件挂载和非空选项。本例用 update 显式清理，因此不挂载 Select 也能保持一致。

## 样例怎么读

打开 `http://localhost:3000/#unit-06`，对照 [Example.js](./Example.js) 的知识点 1～8。

1. 只发一次 GET `/mock/unit-06/roles?page=1&pagesize=2`；当前 101 平台管理员，范围平台，权限平台查看。
   load=1、update=0、select=0、dirty=false。options 在本地，不额外查询（知识点 1、5）。
2. 展开权限下拉，只能选平台查看 / 平台管理；范围改为项目后，权限清空，标题变为项目权限。
   下拉只能选项目查看 / 项目编辑；旧说明也应清空（知识点 2～4、7）。
3. 选项目编辑，说明变为项目编辑，实际存储的权限编码为 project.edit（知识点 6、7）。
4. 关闭启用：权限不再必填且禁用，成员数只读；原权限与说明保留。重新启用恢复输入。
5. 选择第二位角色：Form 跟随 102 租户管理员。切回第一位，之前修改还在。
   连续两次点同一个选择按钮，只有第一次增加 select（知识点 8）。
6. 保持当前第一位，点“将第二位角色切到项目”：当前仍是 101，它的权限不变。
   事件日志写的是 102；切到第二位可见范围为项目、权限 / 说明为空。这是事件 record 与 current 的区别。
7. 校验检查本次加载的两条角色；启用且权限为空时失败，补齐后通过。校验未显示的另一条也可能失败。
8. 日志最多八条；清权限、填说明本身也会触发 update，因此一次父字段修改不一定只有一条日志。
   同值重复 set 不增加 update；全程没有额外 GET 或 POST。

样例选择按钮用于显式演示 select，避免把“点击行定位”误当作选择事件。
重复点击“将第二位角色切到项目”时，如果第二条本来就是项目，则不会再次清空它后来选择的权限。
校验提示反映上一次点击结果；继续编辑后需要重新校验，不是实时的全表有效性指示。

## 练习任务

只编辑 [Exercise.js](./Exercise.js)，完成员工部门 / 职位联动。
原始模板只读取两位员工，部门 / 职位文本框是占位，三档的事件、属性和交互仍是 TODO。
**不要把最终员工实现放进模板或测试。**

两处变化点：

1. 导师必填由两个条件共同决定：员工在职且部门是 RD。离职或转到其他部门后非必填，但保留导师草稿。
2. EMPTY 筹备部没有职位：换入该部门也要清空旧职位及说明，下拉显示零候选；不能依赖 Select 自动清理。

完成后的字段与行为：

| 字段 | 要求 |
|---|---|
| id / name | 只读，姓名来自原员工种子 |
| active | 布尔开关；控制导师规则，不请求后端 |
| departmentCode | 必填 Select，显示部门名称，存编码 |
| positionCode | 级联 Select；无部门时禁用；部门为 RD / HR 时必填，EMPTY 时非必填 |
| positionLabel | 只读；选择有效职位时写入职位名称，部门变化时清空 |
| mentor | 文本；仅 active=true 且 departmentCode=RD 时必填，其他时候仍可编辑 |

用 computedProps 计算职位字段的 label：研发职位 / 人事职位 / 筹备部职位 / 待选职位。
用 dynamicProps 表达导师 required，以及职位 required / disabled。回调不要修改记录。
职位 options 的父键叫 department，员工字段叫 departmentCode，注意两侧名称不同。

提供单选按钮切换两位员工，select 事件同步 current 并保留两条草稿；
第三个按钮“将第二位员工调到研发”只修改第二条的 departmentCode，不移动当前记录。
load / update / select 日志显示员工 ID、字段、旧值 / 新值、前后选中对象；分别计数，最多八条。

骨架 update 中使用 dataSet.current 清理子字段，这段代码能运行却可能清掉另一个人的职位。
请说明触发条件并修正；分支之外不要无条件互相赋值，避免递归。

### 标准档 TODO 对照

| TODO | 任务 | 样例知识点 |
|---|---|---|
| 1 | 员工字段、下拉与级联 | 1、2 |
| 2 | 动态规则与计算标签 | 3、4 |
| 3 | load 日志，不制造初始 dirty | 5 |
| 4 | 修正 current 隐患与双字段清理、职位说明 | 6、7 |
| 5 | select、定位和两条草稿 | 8 |
| 6 | 非当前员工修改、状态栏与有限日志 | 6～8 |
| 7 | 双条件导师、零候选、校验和请求验收 | 2、3、6、7 的延伸 |

### 入门档 TODO 对照

| TODO | 任务 | 样例知识点 |
|---|---|---|
| 1、2 | 两个选项 DataSet 与字段绑定 | 1 |
| 3 | cascadeMap 两侧名称 | 2 |
| 4、5 | 动态规则与只读属性计算 | 3、4 |
| 6 | load 与状态日志 | 5 |
| 7 | 事件记录与单向写值 | 6、7 |
| 8 | select 与 current | 8 |
| 9、10 | 修改非当前员工、去重边界与可观察日志 | 6～8 |
| 11 | 真实校验、零候选场景和无额外请求 | 2、3、7 的延伸 |

### 挑战档 TODO 对照

| TODO | 任务 | 样例知识点 |
|---|---|---|
| 1 | 数据、下拉与字段规则 | 1、2 |
| 2 | 属性计算保持纯读取 | 3、4 |
| 3 | 三类事件、初始状态和日志上限 | 5、6、8 |
| 4 | 修正误改当前员工，防止循环 | 6、7 |
| 5 | 草稿切换与业务变化点 | 2、3、8 的延伸 |
| 6 | 空结果与恢复后事件不重复 | 5、8 的延伸，样例未实现 |

## 接口与数据示例

| 接口 | 行为 |
|---|---|
| `GET /mock/unit-06/roles` | 独立深拷贝 12 条角色，补 scope / permissionCode / permissionSummary |
| `GET /mock/unit-06/employees` | 独立深拷贝 45 条员工，补部门、职位、说明、导师 |

参数 page 从 1 开始，pagesize 为 1～50，默认 2；返回 Spring Page。
可按 code 等已有字段过滤。empty=true 返回空集合，empty=false 正常读取，仅供挑战档演示。
非法分页或 empty 参数返回 HTTP 400 和中文 message。无写接口，无外部服务器。

第一页响应示意（只展开一条员工，实际 content 有两条）：

```json
{
  "content": [
    { "id": 1, "name": "宋江", "code": "EMP001", "active": true,
      "departmentCode": "RD", "positionCode": "rd.fe", "positionLabel": "前端研发", "mentor": "李导师" }
  ],
  "totalElements": 45,
  "totalPages": 23,
  "size": 2,
  "number": 0,
  "numberOfElements": 2,
  "empty": false
}
```

其他原始员工字段仍保留。第二位员工是张飞，HR / hr.recruit / 招聘专员，mentor 为空。
角色首条为 101 / 平台管理员 / scope=site / permissionCode=site.view / permissionSummary=平台查看。

练习的本地选项数据契约（这是数据，不是完整联动实现）：

| 部门 value | meaning |
|---|---|
| RD | 研发 |
| HR | 人事 |
| EMPTY | 筹备部 |

| 职位 value | meaning | department |
|---|---|---|
| rd.fe | 前端研发 | RD |
| rd.qa | 测试研发 | RD |
| hr.recruit | 招聘专员 | HR |

## 验收标准（三档共用，完成 TODO 后检查）

- [ ] 原始三档可渲染；初次只有一个员工 GET，page=1 / pagesize=2，没有写请求或外部请求。
- [ ] 完成后显示第一位宋江 / 研发 / 前端研发 / 李导师，dirty=false，load=1、update=0、select=0。
- [ ] 展开研发职位，只显示前端研发和测试研发；换人事后只显示招聘专员；标题也随部门变化。
- [ ] 换部门后旧职位与说明一起清空；选择职位后说明正确，记录存职位编码而非名称。
- [ ] 切到 EMPTY 后，职位与说明为空，下拉没有候选，校验不会要求填写不存在的职位。
- [ ] 清空部门后职位禁用，部门自身的必填校验仍失败；部门从空恢复时重新给出正确候选。
- [ ] 在职且研发的员工清空导师，校验失败；改为离职后导师不再必填，部门和合法职位仍有各自规则。
- [ ] 先填写导师再切换在职 / 部门，导师文字保留；属性计算本身不产生额外 update 或请求。
- [ ] 选择第二位后 Form 跟随张飞，选择第一位后原草稿保留；重复选择同一位不重复计数。
- [ ] 当前第一位保持原部门 / 职位；按第三个按钮后只更改第二位到研发并清它的旧职位 / 说明。
      日志中的 ID 是第二位；切过去能看到变化，不能误清第一位的职位。
- [ ] 同值 set 不增加 update；一次父值改变允许联动产生多个 update，但应有限结束，没有事件循环。
- [ ] 三类事件可观察，日志最多八条；日志不写入业务字段，load 不制造 dirty。
- [ ] 校验等待真实结果且不保存；切换、联动、选择与校验不增加 HTTP 次数。
- [ ] 01～05 与自由练习区保持原有行为；重新挂载本单元仍读取后端初始数据。

## 挑战档额外需求

增加“演示空结果”和“重新加载员工”：

- [ ] 空结果只查询本单元接口一次，带 empty=true；current 无记录，不出现属性访问异常。
- [ ] 空结果时选择、调部门、校验均禁用；显示明确空状态；恢复按钮可用。
- [ ] 恢复查询去除 empty 条件，回到两位员工和正确初始字段值，dirty=false；这是丢弃本地草稿的演示，应在操作文案中明确。
- [ ] 同一个 DataSet 内 load 每成功读取只增加一次；恢复后一次选中只增加一次 select，不能重复注册监听器。
- [ ] 在有数据和无数据之间往返三次，仍满足以上次数边界；读取失败显示原因，不报假成功。

## 难度与重置

实际编辑始终是 Exercise.js，不修改 templates。

```sh
yarn unit:list
yarn unit:reset 6 easy
yarn unit:reset 06 normal
yarn unit:reset 6 hard
```

工具会先备份到 `.backup/06-field-events/Exercise.<时间戳>.js` 再覆盖；不传难度默认 normal。
保存编辑器内容后再操作。重置练习是覆盖代码，和 record.reset / DataSet 查询不是一回事。

## 思考题

1. computedProps 能直接让某个字段的业务值随其他字段变化吗？字段属性和 record 值有什么区别？
2. cascadeMap 两侧分别属于哪个 DataSet？父字段对应零候选时，为什么仍需要显式清理旧子值？
3. update 参数中的 record 为什么比 current 更可靠？第三个按钮如何暴露模板隐患？
4. 父值一次改变为什么有多条 update？什么样的双向联动会造成循环？
5. 只把 current 指向第二条会触发 select 吗？“选中”和“当前编辑”各解决什么问题？
6. 为什么加载日志要放 setState，而不是写入业务字段？为什么不能在每次 render 中注册事件？
7. readOnly / disabled 能保证程序不会修改字段吗？校验和界面约束应怎样配合？

## 常见坑与 1.6.7 依据

- dynamicProps 使用属性映射形式，避免废弃的整对象函数形式；缺少 record 时应安全返回。
- 不在动态属性回调内 set，也不调用同一字段的同一动态属性造成循环求值。
- computed 缓存依赖可观察数据，不能把它解释为“函数永远只执行一次”；副作用不能依靠缓存避免。
- 字段属性按记录读取：`dataSet.getField(name).get(prop, record)`；不要依赖已废弃的 record.getField 来逐记录取属性。
- cascadeMap 只做选项关联，不是万能的数据清理机制；清值要使用事件 record。
- 同值 set 不触发 update，但两条字段来回生成不同值仍会循环；采用字段分支和单向联动。
- selectAll / unSelect / indexChange 各有自己的事件，不等于 select；本例只演示单条选择。
- 两条记录都参与 dataSet.validate；未显示的另一条草稿也可能让校验失败。
- 展开 Select 时固定版本仍有已知 forceClearActiveKey 属性警告，旧组件生命周期提示也保留。
  本单元初始渲染和自动测试严格检查零 console.error，没有以屏蔽日志来掩盖错误。
- 原始模板故意保留误改 current 的风险，这是学习任务；本次渲染通过不等于练习已经验收通过。

所有路径相对项目根目录：

| 本地源码 | 依据 |
|---|---|
| `node_modules/choerodon-ui/dataset/data-set/Field.d.ts` | dynamicProps / computedProps 参数和字段属性类型 |
| `node_modules/choerodon-ui/dataset/data-set/Field.js` | get 优先级与 computed 缓存、executeDynamicProps 的 record 参数 |
| `node_modules/choerodon-ui/dataset/data-set/Record.js` | set 比较值、标记 dirty，并发送 update 的参数 |
| `node_modules/choerodon-ui/dataset/data-set/DataSet.js` | initEvents、loadData、select 的触发条件和载荷 |
| `node_modules/choerodon-ui/pro/lib/select/Select.js` | cascadeOptions 过滤、processSelectedData 有条件清理 |
| `node_modules/choerodon-ui/pro/lib/field/FormField.js` | 从 Field 读取 readOnly / disabled 等属性 |

## 重启与验证

新增 mock 需要重启原 dev server，不安装依赖、不启动额外后端：

```sh
yarn start
```

另一个终端：

```sh
CI=true yarn test --watchAll=false
node --test scripts/unit.test.js
CI=true yarn build
yarn unit:list
```

打开 `http://localhost:3000/#unit-06`，按“样例怎么读”操作。06 显示三档可用且与 normal 一致，07～09 未开放。
实际执行证据与未覆盖范围见 docs/unit-06-verification.md。
完成后说“检查单元 06”并贴出 Exercise.js：按上述验收逐项 review，只给提示，不给完整答案。
