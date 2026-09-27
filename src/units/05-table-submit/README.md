# 单元 05：表格编辑与提交

## 学习目标

完成行内编辑和内存后端 CRUD，观察 add / update / delete / sync 与 dirty 的变化。
理解校验、提交、响应回写、重置的边界；遇到请求失败能显示原因、保留新增 / 修改草稿并正确重试。
本单元所有数据在本地，重启 yarn start 后恢复种子。

## 核心概念

```text
点击列 → editor → Record 字段发生变化 → add / update + dirty
                                     │ submit() 先等待校验
                                     ▼
                    create / update / destroy（分别发送记录数组）
                                     │ 响应 content + 原 __id + 业务 id
                                     ▼
                    原 Record.commit → sync，清除 dirtyData

remove(旧记录) → delete（暂存）→ submit → destroy → 从记录集合移除
Table delete → 确认 → 直接执行删除请求，无需再点保存
reset → 丢弃新增、恢复未提交修改和删除；不撤销后端已保存的数据
```

| 名称 | 含义 |
|---|---|
| 列的 `editor` | 开启行内编辑；不是 edit；类型、标签、规则仍来自 fields |
| `buttons` | add / save / delete / reset 内置动作；`[类型, props]` 可覆盖按钮事件 |
| `transport create / update / destroy` | 三种写入端点；本单元均使用 POST |
| `record.status` | 新建 add、修改 update、待删除 delete、已同步 sync |
| `dataSet.dirty` | 是否有尚未提交的新增、修改或删除；不是“是否调用过 set” |
| `submit()` | 返回 Promise；先校验，失败返回 false；没有可提交请求可能返回 undefined |
| `id` | 后端业务主键；新建时不伪造，提交成功后回写 |
| `__id` | 前端 Record 的内部关联编号；不是业务主键，也不应存入业务表 |
| `__status` | 默认序列化的 add / update / delete 状态标记 |
| `remove / delete` | remove 只暂存删除，delete 默认先确认再立刻请求；新建未保存行直接移出 |
| `reset()` | 回到最近一次查询 / 提交成功的基线；不会请求后端 |

**失败不是一种统一的状态流转**：

| 场景 | 1.6.7 实际行为 |
|---|---|
| create / update 返回 HTTP 400 | submit 拒绝；不回写成功数据，记录保持 add / update，dirty=true |
| destroy 返回 HTTP 400 | handleSubmitFail 对 destroyed 调用 reset，撤销删除、恢复选中；可能恢复到 sync |
| 删除前还有未保存修改 | 删除失败的 reset 可能把这些修改一起回滚；删除前应理解这条边界 |
| 一次 submit 混合 create / update / destroy | 分别请求并 Promise.all 等待，不保证跨请求事务；某接口失败时另一个可能已落库 |

mock 保证**单个请求数组**内先整体检查，再修改内存；不把三个请求合成跨请求事务。
混合提交失败后不能盲目重试整个批次：成功的新增可能已落库，而本地还没回写 ID。
教学验收按“新增 → 保存 → 修改 → 保存 → 删除”分步进行，固定失败单独操作一条新增或修改记录。

## 样例怎么读

打开 `http://localhost:3000/#unit-05`，阅读 [Example.js](./Example.js) 的知识点 1～8。

1. 初次 GET `/mock/unit-05/roles?page=1&pagesize=5`，总数 12，当前 ID 101、status=sync、dirty=false。
2. 新增一行，填编码 `lesson-role`、名称“学习角色”，成员数 0、启用保持默认；离开单元格。
   ID 待分配，status=add，dirty=true。列的 editor 与 fields 分工见知识点 1、4。
3. 点击保存：POST create 的请求体是数组，包含 __id / __status；返回 content 中有后端 id。
   第一次新增通常拿到 113（若已经新增过则递增），原行变为 sync，dirty=false（知识点 2、3、5）。
4. 把新行名称改为“修改后的学习角色”，离开单元格，status=update；保存后再次 sync，重查能看到新名称。
5. 勾选这一行，点击内置删除，确认后立刻 POST destroy，行消失，总数减少；不要再等保存（知识点 7）。
6. 修改任一角色名称为 `FAIL` 后保存：HTTP 400，状态栏显示后端中文原因，name / status / dirty 保留。
   改成正常名称再次保存可成功；不需要先 reset（知识点 6）。
7. 勾选非保留的旧角色，点“暂存删除（观察 delete）”：行暂时隐藏，delete 计数增加，还没有请求。
   重置可恢复该行；再暂存并保存才发 destroy（知识点 8）。
8. 修改并重置：恢复最近保存的内容。新行尚未保存就重置会被移除；后端数据不会跟着清空。

平台管理员（ID 101）是保留角色，直接删除会返回 400，用于对比删除失败与保存失败。
一次只演示一类操作，观察后再继续；输入值应先失焦再读取状态。

## 练习任务

使用 [Exercise.js](./Exercise.js) 完成员工维护。原始三档只读取员工列表，写接口和按钮行为均待完成。
“保存员工（待完成）”在三个写接口未配置时仅提示，不会请求旧接口或外部服务器。
模板的 catch 中故意调用整表 reset：它能运行，却会在失败时抹掉草稿，需要说明并修正。

与角色样例相比的变化点：

1. 员工编码为 EMP 加三位数字，年龄 18～60；新增默认年龄 18、在职 false，后端 ID 自行分配。
2. 员工删除有业务条件：不能删除在职员工；离职状态必须先保存。前端在选中记录仍在职或有未保存修改时
   提示并阻止删除请求，后端仍独立检查实际已保存的在职状态。

展示 ID、员工编码、姓名、年龄、在职五列，除 ID 外均能编辑。
只编辑 Exercise.js；不要把完成后的员工实现放到其他文件或测试中。

### 标准档 TODO 对照

| TODO | 任务 | 样例知识点 |
|---|---|---|
| 1 | 员工规则、默认值、业务主键 | 1 |
| 2 | 三个写接口与回写协议 | 2、3 |
| 3 | editor 行内编辑 | 4 |
| 4 | 四个内置按钮与删除业务检查 | 7 的延伸 |
| 5 | 异步提交结果、失败分支的丢草稿隐患 | 5、6 |
| 6 | 响应式状态栏 | 3、8 |
| 7 | CRUD、重置、固定失败与重试 | 2、3、5～8 |

### 入门档 TODO 对照

| TODO | 任务 | 样例知识点 |
|---|---|---|
| 1、2 | fields 规则与默认值 | 1 |
| 3、4 | POST 数组与 __id / id | 2、3 |
| 5 | 可编辑列与只读 ID | 4 |
| 6、7 | Table buttons、删除前检查 | 7 的延伸 |
| 8、9 | 等待提交、区分返回结果、保留失败草稿 | 5、6 |
| 10 | 状态与待提交数量 | 3、8 |
| 11 | 回滚与 Network 观察 | 2、3、6、8 |

### 挑战档 TODO 对照

| TODO | 任务 | 样例知识点 |
|---|---|---|
| 1 | 元信息、默认值、编辑 | 1、4 |
| 2 | 三类请求与回写 | 2、3 |
| 3 | 内置操作与员工删除条件 | 7 的延伸 |
| 4 | 结果处理与失败隐患 | 5、6 |
| 5 | 四种状态与 dirty | 3、8 |
| 6 | 仅保存勾选员工 | submit 范围的延伸，样例没有实现 |

## 接口与数据示例

| 接口 | 用途 |
|---|---|
| `GET /mock/unit-05/roles` | 角色查询，独立种子 12 条 |
| `POST /mock/unit-05/roles/create`、`update`、`destroy` | 角色写接口 |
| `GET /mock/unit-05/employees` | 员工查询，独立种子 45 条 |
| `POST /mock/unit-05/employees/create`、`update`、`destroy` | 员工写接口 |

查询使用 page（从 1 开始）/ pagesize（1～100），返回原 Spring Page 格式；非法分页参数返回 400。
写请求为非空记录对象数组，最多 100 条；字段不足、类型错误、错误 id / __status 返回 400，
记录不存在返回 404，编码重复返回 409。错误响应都有中文 message。

角色 create 请求示例（__id 只是当次示意，不要硬编码）：

```json
[
  { "code": "lesson-role", "name": "学习角色", "memberCount": 0, "enabled": true,
    "__id": 1234, "__status": "add" }
]
```

成功响应：

```json
{
  "content": [
    { "id": 113, "code": "lesson-role", "name": "学习角色", "level": "project",
      "memberCount": 0, "enabled": true, "createdAt": "2026-01-01 00:00:00", "__id": 1234 }
  ],
  "totalElements": 13,
  "success": true
}
```

destroy 的请求仍是记录数组，通常包含该记录的字段以及 id、__id、__status: "delete"。
后端只按 id 定位并检查删除条件，不把请求里顺带携带的未保存值当成已保存内容。
__id 只在响应里回显用于匹配，不持久化；__status 不存入业务集合。
写响应的 content 是受影响的记录，并非一次新的分页查询；totalElements 是该集合的当前总数。

固定失败：create / update 中任一记录的 name 精确等于 `FAIL`，整份请求返回：

```json
{ "message": "名称 FAIL 触发单元 05 的固定失败，请修改名称后重试" }
```

HTTP 状态为 400，不是 200 + 假成功。员工离职删除检查以服务端已保存的 active 为准。
新增员工的其他非本单元字段由 mock 提供简单默认值；不涉及外部服务或真实人事数据。

## 验收标准（三档共用，完成 TODO 后检查）

- [ ] 原始三档均可渲染；未配置写接口时保存仅提示，Network 不出现外部地址或写请求。
- [ ] 完成后员工五列显示正确，ID 不可编辑，其他四列支持行内编辑；初始查询一次，每页 5 条。
- [ ] 新增后年龄 18、在职 false、ID 未分配、status=add、dirty=true；必填空值保存不发写请求。
- [ ] 编码 EMP900、姓名“学习员工”保存后，拿到后端 ID（干净内存首次为 46），status=sync、dirty=false。
      create 请求体是数组；响应包含对应 __id；不靠额外查询掩盖回写失败。
- [ ] 修改这名员工的年龄为 30，失焦后 update / dirty=true；保存后 sync / false，GET 能查到年龄 30。
- [ ] 保存成功后再改姓名并重置，恢复最近保存值；新增未保存行重置后移除，不产生 HTTP 请求。
- [ ] 未勾选删除不请求；选中在职员工、或有未保存修改的员工时明确提示，不发送 destroy。
- [ ] 已保存为离职且无未保存修改的员工可删除；确认后立即 destroy，GET 查不到它，其他员工不受影响。
- [ ] 新增 name=FAIL 保存失败时仍为 add，无后端 ID，dirty=true；填写的编码、年龄、在职均保留。
- [ ] 修改已有员工 name=FAIL 保存失败时仍为 update、dirty=true，所有修改保留，后端仍是旧值。
- [ ] 两种失败都显示明确错误，按钮不一直加载；把姓名修正后可以重试并回到 sync / dirty=false。
- [ ] 没有修改时点击保存不报“保存成功”；校验不通过、没有请求、HTTP 失败、成功分别处理。
- [ ] 状态栏随当前行和数据变化更新；解释为何删除失败不能套用新增 / 修改失败的状态结论。
- [ ] 01～04、自由练习区的旧数据和接口不受本单元写操作影响；重启 yarn start 后恢复种子。

## 挑战档额外需求

增加“仅保存勾选员工”，与默认保存全部修改区分：

- [ ] 两条员工都做合法修改，只勾选其中一条，操作后仅该条落库并变为 sync。
- [ ] 未勾选的另一条保持 update，dataSet.dirty 仍为 true；GET 核对后端仍是它的旧值。
- [ ] 未勾选时提示，不发写请求；请求失败时保留选中员工草稿。
- [ ] 阅读 submit 的参数与 validate 调用：提交范围和校验范围不应想当然等同；本题用两条都合法的草稿验收。

## 难度与重置

实际编辑始终是 Exercise.js，不修改 templates。

```sh
yarn unit:list
yarn unit:reset 5 easy
yarn unit:reset 05 normal
yarn unit:reset 5 hard
```

先保存编辑器文件；工具先备份到 `.backup/05-table-submit/Exercise.<时间戳>.js`，再覆盖。
不传难度默认 normal。**重置练习代码**不会重置 mock 数据；重启 yarn start 才恢复内存种子。
Table 的 reset 也只回滚本地未提交数据，不等于撤销已完成的后端写入。

## 思考题

1. 业务 id 与内部 __id 各解决什么问题？为什么新建响应只有“成功”还不够？
2. submit 已内置校验，为什么“提交前不再手动 validate”本身并不构成漏洞？
3. 为什么不能在 catch / finally 中无条件 reset 或 query？
4. 默认 delete 与暂存 remove 的请求时机不同，哪一步能观察到 delete 状态？
5. 删除失败为何可能恢复成 sync？如果删除前修改了名称，失败后草稿是否一定保留？
6. 一次提交包含新增与修改，新增接口成功、修改接口失败，本地与后端可能分别是什么状态？
7. dirty=true 是否代表当前可见行有改动？未勾选的行还能影响 dirty 吗？

## 常见坑与 1.6.7 依据

- `submit()` 返回 Promise，不要直接作为布尔值判断；false 是校验失败，undefined 不等于成功。
- 默认提交的是记录对象数组；destroy 不是仅包含 id 的数组，服务端应忽略无关字段和内部标记。
- 回写前端靠响应 content 与 __id；不要用“保存后重新 query”掩盖缺失的业务 id。
- 1.6.7 默认 strictPageSize 会在 commitData 前截取记录；本单元局部设置 false，保留新增的额外行。
  所以当前页新增后可能显示 6 条，下一次查询仍按 pagesize=5；没有改变全局配置。
- 内置 save/delete 返回拒绝的 Promise 时，Button 只有 finally，没有 catch。
  样例用按钮 tuple 覆盖 onClick 来处理失败，不依赖未处理的 Promise。
- DataSetRequestError 只复制 message/name/stack。后端 response.data.message 在本 DataSet 的
  feedback.submitFailed 中保留，再由按钮 catch 显示；没有全局 configure 或 console 屏蔽。
- 错误消息与失败状态是学习目标；不要把 catch 中吞异常、清空草稿当成“修好”。
- 混合请求不保证事务；本单元只保证每份请求数组原子处理，不承诺跨接口回滚或安全自动重试。
- Table 固定版本的 combineColumnFilter 属性警告和旧生命周期警告仍保留。
  测试只对白名单里的已知属性及完整消息放行，其他 console.error 均失败。
- 浏览器在删除后再次进入编辑时还观察到 TableEditor 的 render 状态更新警告；
  未捕获异常和业务失败已分别检查，但不能把本版本描述为“完全没有开发警告”。
  该交互警告没有加入测试白名单、没有屏蔽；详情与源码位置见验证记录。

所有源码路径均相对项目根目录：

| 本地源码 | 确认的行为 |
|---|---|
| `node_modules/choerodon-ui/dataset/data-set/DataSet.js` | submit 先校验；write 分组并发；成功解析 / 回写；删除失败 reset；remove / delete / reset |
| `node_modules/choerodon-ui/dataset/data-set/utils.js` | prepareSubmitData / prepareForSubmit 数组协议；generateResponseData 按 dataKey 解析 |
| `node_modules/choerodon-ui/dataset/data-set/Record.js` | toJSONData 附加 __id / __status；commit 更新 ID、sync 和 dirty |
| `node_modules/choerodon-ui/dataset/configure/index.js` | 默认 statusKey=__status 和三种状态值 |
| `node_modules/choerodon-ui/dataset/data-set/DataSetRequestError.js` | 包装异常不会保留 response |
| `node_modules/choerodon-ui/pro/lib/table/query-bar/index.js` | 四个默认按钮行为、tuple 覆盖和 afterClick |
| `node_modules/choerodon-ui/pro/lib/button/Button.js` | 等待 onClick 的 Promise，但没有替业务 catch 失败 |

## 重启与验证

在原开发服务终端 Ctrl+C 后重新启动，加载 mock/unit05.js；不安装依赖，不启用外部后端。

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

打开 `http://localhost:3000/#unit-05`：样例可执行角色 CRUD 和固定失败；练习保留 TODO。
05 显示与 normal 模板一致，06～09 未开放。实际执行结果见 docs/unit-05-verification.md。
完成练习后说“检查单元 05”并贴出 Exercise.js：按验收逐条 review，只给提示，不给完整答案。
