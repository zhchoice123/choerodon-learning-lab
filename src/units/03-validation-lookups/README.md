# 单元 03：字段校验与值集

## 学习目标

把规则放在 DataSet 的 fields 中，区分内置规则、同步业务规则和异步服务校验；
让下拉显示中文、记录保存编码；在校验真正完成后再显示结果。本单元不写入任何业务数据。

## 核心概念

```text
TextField / NumberField / Select ──▶ 草稿 Record
                                      │ validate()：Promise<boolean>
                                      ▼
fields：required / pattern / min / max / validator
                                      │ 自定义校验可以等待本地接口
                                      ▼
                          true 通过 / 中文字符串失败

本地 options DataSet ──▶ 显示 meaning，保存 value ◀── 字段级 lookupCode
                                                    │ GET 本地值集
                                                    ▼
                                      Spring Page.content → 选项数组
```

| 配置 / 方法 | 含义 |
|---|---|
| `required` | 是否必填；空值不应该只靠格式正则拦截 |
| `pattern` | 字符串格式约束；用 ^ / $ 约束整个值，避免 g 标志带来的游标状态 |
| `min` / `max` | number 的数值范围；不是字符串长度 |
| `defaultValidationMessages` | 内置消息映射，如 valueMissing、patternMismatch、rangeUnderflow、rangeOverflow |
| `validator(value, name, record)` | 返回 true 通过，返回中文字符串失败；第三个参数可读取其他字段 |
| 异步 validator | 返回 Promise；拒绝或网络错误不等于业务通过，应转为明确的失败提示 |
| `options` | 选项 DataSet，适合本地固定选项 |
| `textField` / `valueField` | 显示哪个字段、保存哪个字段；与业务字段自己的 name 不同 |
| `lookupCode` | 标识远程值集；本单元用字段级 lookupUrl / lookupAxiosConfig 指向本地 mock |
| `validate()` | Promise<boolean>；不能直接放进 if，当作已得到的布尔值 |

Form 在这里仅作为已经提供的输入容器，绑定与布局将在单元 04 展开。
每个 DataSet 都在 useMemo 调用的工厂里创建；没有全局 configure，也没有外部接口。

## 样例怎么读

打开 `http://localhost:3000/#unit-03` 的「样例」，对照 [Example.js](./Example.js) 的知识点 1～9：

1. 先打开层级、可见范围：层级是本地 options，不请求；可见范围来自 U03.ROLE_VISIBILITY。
2. 全部留空点「校验角色草稿」：观察必填消息。名称输入单字「角」，观察同步业务提示。
3. 编码输入 `Bad!`，离开输入框或校验，观察格式消息；不应发查重请求。
4. 编码输入 `site-admin`：异步校验提示重复。换成 `learning-role`：编码可以通过。
5. 成员上限分别试 0、101、1、100；理解两侧边界包含关系。
6. 选择层级「项目」、可见范围「内部可见」，下方实际编码应是 project / INTERNAL。
7. 姓名「学习角色」、编码 learning-role、成员上限 10、层级项目、范围内部可见，点击校验，
   最终显示「校验通过（尚未保存）」；Network 没有 create / update / destroy 请求。
8. 将编码换成 `service-down`，观察明确的服务失败提示，不能显示通过；换回可用编码后可以重试。

不要把异步接口请求数理解为始终只有一次：输入变化、失焦、整表校验可能分别触发校验，
值集也可能被 1.6.7 缓存或合并请求。用请求路径、参数、结果和是否等待完成来验收。

## 练习任务

使用员工草稿，完成姓名、员工编码、年龄、邮箱、性别、用工类型六个字段。
已有的 Form 和输入控件是骨架，不要求本单元重写布局；只编辑 [Exercise.js](./Exercise.js)。
初始三档均可打开；尚未接入的下拉为空、校验按钮存在错误判断，属于待完成任务。

与角色样例相比的两个变化点：

1. 员工编码是大写 EMP 加三位数字，使用员工查重接口；年龄使用 18～60 的业务范围。
2. 邮箱除了格式合法，还必须等于「当前员工编码的小写形式@example.com」。
   改变编码后再次整表校验，应能发现旧邮箱不再匹配，不能只校验输入过邮箱的那一次。

### 标准档 TODO 对照

| TODO | 任务 | 样例知识点 |
|---|---|---|
| 1 | 六字段必填，姓名 / 编码的必填消息 | 2 |
| 2 | 员工编码和邮箱格式 | 4 |
| 3 | 年龄边界和消息 | 6 |
| 4 | 邮箱与编码的同步业务校验 | 3 的跨字段延伸 |
| 5 | 异步编码查重、服务异常 | 5 |
| 6 | 性别本地选项和文本 / 值映射 | 1、7 |
| 7 | 用工类型值集和响应适配 | 8 |
| 8 | Promise 判断隐患、等待与结果处理 | 9 |

### 入门档 TODO 对照

| TODO | 任务 | 样例知识点 |
|---|---|---|
| 1、2 | 必填与消息键 | 2 |
| 3 | 编码格式和消息 | 4 |
| 4 | 年龄边界和消息 | 6 |
| 5、6 | 邮箱格式与跨字段业务校验 | 4、3 |
| 7 | 异步编码校验 | 5 |
| 8 | 性别选项与映射 | 1、7 |
| 9、10 | 字段级值集与 content 解析 | 8 |
| 11 | 等待、布尔结果与异常 | 9 |

### 挑战档 TODO 对照

| TODO | 任务 | 样例知识点 |
|---|---|---|
| 1 | 必填、格式、范围、中文提示 | 2、4、6 |
| 2 | 邮箱和编码一致 | 3 的跨字段延伸 |
| 3 | 异步校验与失败处理 | 5 |
| 4 | 本地选项、远程值集、字段隔离 | 1、7、8 |
| 5 | Promise 隐患与结果处理 | 9 |
| 6 | 编码预览与请求观察 | 7、8、9 |
| 7 | 历史失效值不能绕过校验 | 3、8 的延伸；样例没有实现 |

## 接口与数据示例

| GET 路径 | 输入 / 响应 |
|---|---|
| `/mock/unit-03/lookups/U03.ROLE_VISIBILITY` | 角色范围：INTERNAL / 内部可见、PUBLIC / 公开可见 |
| `/mock/unit-03/lookups/U03.EMPLOYMENT_TYPE` | 用工类型：FULL_TIME / 全职、PART_TIME / 兼职、INTERN / 实习 |
| `/mock/unit-03/roles/check-code?code=site-admin` | 约 250ms 后返回 `{ "available": false }` |
| `/mock/unit-03/employees/check-code?code=EMP001` | 已有 EMP001～EMP045，返回 `{ "available": false }` |
| `/mock/unit-03/employees/check-code?code=EMP999` | 可用，返回 `{ "available": true }` |

两个查重接口只读已有种子，格式不合格返回 400；角色 service-down、员工 EMP503 返回 503，
用于主动测试服务故障。未知值集返回 404。没有写入接口；查重通过不代表已经创建记录。
值集量很小，一次返回全部内容；Spring Page 元数据保留，前端无需给值集分页。

用工类型接口响应：

```json
{
  "totalPages": 1,
  "totalElements": 3,
  "numberOfElements": 3,
  "size": 3,
  "number": 0,
  "content": [
    { "value": "FULL_TIME", "meaning": "全职" },
    { "value": "PART_TIME", "meaning": "兼职" },
    { "value": "INTERN", "meaning": "实习" }
  ],
  "empty": false
}
```

员工合法草稿示例（数据，不是练习实现）：

```json
{ "name": "练习员工", "code": "EMP999", "age": 28,
  "email": "emp999@example.com", "sex": "F", "employmentType": "FULL_TIME" }
```

## 验收标准（三档共用，完成 TODO 后检查）

- [ ] 六个字段均可见且全部必填；空表校验失败，姓名提示「请输入姓名」，编码提示「请输入员工编码」。
- [ ] EMP999 合格；emp999、EMP99、EMP0000、ABC001 不合格，出现中文格式提示，格式错误不请求查重接口。
- [ ] 年龄 17、61 不合格并显示中文边界提示；18、60 合格。检查的是规则，不是仅限制加减按钮。
- [ ] 邮箱 `abc`、`a@`、`a@b` 不合格；EMP999 搭配 `other@example.com` 格式虽正确但业务校验失败。
- [ ] EMP999 搭配 `emp999@example.com` 通过；编码改成 EMP998 后不改邮箱再校验，必须失败。
- [ ] EMP001 被判重复；EMP999 可用；EMP503 失败后不显示通过，改回 EMP999 后可再次校验。
- [ ] 校验按钮点击后显示等待状态，异步返回前不能显示通过；结束后能区分通过、未通过和异常。
- [ ] 性别显示男 / 女，选择女后预览编码 F；用工类型显示全职 / 兼职 / 实习，选择全职后预览 FULL_TIME。
- [ ] 所有值集请求都指向 `/mock/unit-03/lookups/`；本地性别 options 不产生远程请求；未修改全局 configure。
- [ ] 输入上面的合法草稿，整表校验通过并明确注明「尚未保存」；Network 只有本地 GET 校验 / 值集请求。
- [ ] 切回 01/02 或自由练习区，原查询仍工作；没有为了本单元改动全局样式、语言包或其他作业。
- [ ] 能解释骨架中的 if 为什么总进入通过分支，以及校验通过与服务端最终保存成功的区别。

异步故障的 503 是测试中主动制造的 HTTP 失败；应显示字段提示且没有未处理的 Promise 异常。
1.6.7 开发模式在校验不通过时会打印 validation 警告，这是校验报告；不要通过屏蔽 console 伪装通过。

## 挑战档额外需求

增加「模拟历史用工类型」按钮，将当前草稿的用工类型设为已经失效的 `LEGACY`。
即使这个值非空，也必须阻止校验通过，并提示「用工类型已失效，请重新选择」。
这里讨论的是旧数据绕过下拉入口的情况，不要求修改后端值集。

- [ ] 先填合法草稿，再模拟历史类型，校验失败；原姓名、编码、年龄和邮箱不被修改。
- [ ] 重新选择全职 / 兼职 / 实习后校验恢复通过；空值仍由必填规则处理。
- [ ] 仅显示三种当前合法选项，没有把 LEGACY 添加到值集里以规避问题。

## 难度与重置

```sh
yarn unit:list
yarn unit:reset 3 easy
yarn unit:reset 03 normal
yarn unit:reset 3 hard
```

按需选择一条重置命令；实际编辑的永远是 Exercise.js。先保存编辑器内容，
重置会备份到 `.backup/03-validation-lookups/Exercise.<时间戳>.js` 后再覆盖。
不指定难度默认为 normal。不要修改 templates，否则重置不再是原始练习。

## 思考题

1. required、pattern、自定义业务 validator 各解决什么问题？空值应该由谁提示？
2. 为什么同步 validator 返回字符串比直接返回 false 更适合学习页面？
3. 为什么 validate() 不能直接当成布尔值？接口异常时默认放行有什么问题？
4. 显示「全职」时，为什么记录里应该是 FULL_TIME？textField / valueField 分别作用在哪里？
5. 改动编码后，已经通过过的邮箱为什么还要重新校验？
6. 前端查重通过后，另一位用户同时创建相同编码，服务端还能拒绝保存吗？

## 常见坑与 1.6.7 依据

- 消息键是 valueMissing / patternMismatch / rangeUnderflow / rangeOverflow，不是 required / pattern / min / max。
- 自定义 validator 的失败字符串就是提示；不要指望 defaultValidationMessages 替代所有自定义错误。
- 字段的 pattern 与 async validator 配合时，异步函数也先判断空值和格式，避免无意义请求。
- LookupCodeStore 读取的是配置上下文的 dataKey，不等于业务 DataSet 的 dataKey 属性。
  本单元在字段级 transformResponse 里提取 content，不修改全局的默认响应规则。
  lookupAxiosConfig 使用函数返回普通配置，避免 MobX 4 把转换器数组变为 ObservableArray，导致 Axios 1.0.0 跳过转换。
  缓存适配器可能复用已转换的响应，因此转换函数也要接受数组，重复调用仍返回同一批选项。
- lookup 的默认请求方式可能是 POST，本地接口是 GET，必须在字段级明确 method。
- 选择框可以限制交互入口，但历史数据仍可能带来非空的无效编码，这是挑战题的来源。
- 当前 01 模板故意保留未用 useMemo 的 TODO；01/02 的旧 Table 还有库警告，本次按保护约束不修改。
- 新表单初次渲染不产生 console.error；展开 Select 时，1.6.7 的菜单会透传 forceClearActiveKey，
  React 16 会打印属性警告（使用 console.error 输出）。这是固定版本的兼容警告，不能等同于未捕获异常，
  也不能把整个交互过程宣称为零控制台输出；本单元没有屏蔽它或修改依赖。
- 所有新 DataSet 都在 useMemo 的工厂里创建；不使用 StrictMode，不新增依赖。

已核对本地 1.6.7 的 `Field.d.ts`、`validator/rules/customError.js`、`LookupCodeStore.js`、
`data-set/utils.js`，对应官方源码：
[Field](https://github.com/open-hand/choerodon-ui/blob/1.6.7/components-dataset/data-set/Field.tsx)、
[customError](https://github.com/open-hand/choerodon-ui/blob/1.6.7/components-dataset/validator/rules/customError.tsx)。
本次用到的 API 没有保留未核实的名称；实际本地验证结果见交付记录。

## 重启与验证

在原开发服务终端按 Ctrl+C 后执行 `yarn start`，加载新增的 mock；无需安装依赖或启动其他后端。

```sh
yarn unit:list
yarn test --watchAll=false
node --test scripts/unit.test.js
```

打开 `http://localhost:3000/#unit-03`：样例有五个字段和「校验角色草稿」，
练习有六个字段和「校验员工草稿」；normal 初始下拉与规则待补齐。
列表应显示 03 有三档并与 normal 一致，04～09 保持未开放。

完成后说「检查单元 03」并贴出 Exercise.js：按验收逐条 review，只给提示，不给完整答案。
