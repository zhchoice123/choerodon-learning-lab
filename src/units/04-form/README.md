# 单元 04：Form 表单

## 学习目标

把一个 DataSet 中的记录绑定到表单，正确选择输入控件，组织两列表单和只读预览。
能解释编辑、校验、回滚与保存之间的区别，并且切换记录时不会误删其他草稿。
本单元只查询本地初始数据，不保存到后端。

## 核心概念

```text
GET 本地角色 / 员工 → DataSet（fields + records）
                        │ current                 │ 指定 Record
                        ▼                         ▼
                Form dataSet                 Form record
                        │                         │
             输入控件 name ↔ 记录字段        Output 只读预览
                        │
             checkValidity → DataSet.validate → Promise<boolean>
             reset 事件 → 当前绑定的 Record.reset → 查询时的原值
```

| 配置 / 方法 | 含义 |
|---|---|
| `Form dataSet` | 默认绑定 dataSet.current；控件的 name 对应字段名 |
| `Form record` | 显式指定记录，优先于 dataSet / dataIndex；记录仍属于原 DataSet |
| `TextField / Select` | 文本输入 / 选项输入；Select 沿用字段上的 options |
| `NumberField` | 数字输入，对应 number 字段；不要在独立 React state 再保存一份相同值 |
| `DatePicker` | 对应 date 字段，组件内部使用 Moment 日期值；通过字段 format 显示年月日 |
| `Switch` | 对应 boolean 字段，false 是合法值；不用字符串 "false" |
| `Output` | 显示字段格式化结果，本身不能编辑；布尔值可能显示成禁用复选框 |
| `columns / colSpan` | 表单字段列数 / 一个字段占几列；两列并不等于底层只有两个 td |
| `readOnly` | 表单输入只读；不能阻止程序代码直接修改记录，也不能自动禁用表单外按钮 |
| `formRef.current.checkValidity()` | 1.6.7 的真实表单校验入口；有 DataSet 时委托其 validate，不是仅校验可见字段 |
| `type="reset" / onReset` | Pro Button 触发表单重置；Form 先通知 onReset，再默认回滚绑定记录 |
| `Record.reset()` | 恢复该记录的原值并清除其校验状态；不向后端查询，也不是清空所有字段 |

**版本差异**：1.6.7 的 Form 没有名为 validate() / reset() 的公开实例方法。
本单元用 checkValidity() 教“表单校验”，用表单 reset 事件教“表单重置”。
DataSet 和 Record 的 validate / reset 是另外一组 API；不能仅凭名字相似混用。

## 样例怎么读

打开 `http://localhost:3000/#unit-04` 的样例，阅读 [Example.js](./Example.js) 的知识点 1～7。

1. 初次加载请求 `/mock/unit-04/roles?page=1&pagesize=1`，编辑平台管理员。
2. 找到 Form 的 dataSet 和子控件的 name（知识点 1、2）。ID 101、编码 site-admin 始终只读。
3. 观察两列布局；角色名称占满一行（知识点 3）。
4. 修改名称、成员数、日期、启用开关；下方显式绑定 record 的预览随同一条记录变化（知识点 4、5）。
5. 切换只读：输入不能改，校验和重置按钮禁用；切回编辑时草稿仍在。
6. 清空名称、失焦后点校验，结果为未通过；填写名称后再次校验可以通过（知识点 6）。
7. 修改多种类型后点“恢复初始角色资料”：回到平台管理员、成员数 3、2023-01-15、启用，已修改变为否。
   观察 Network 没有新增请求（知识点 7）。

输入值写入 Record 后才会同步预览；进行校验或回滚前先离开正在输入的控件。
校验通过只是内存数据符合规则，按钮文案不会显示“保存成功”。

## 练习任务

使用 [Exercise.js](./Exercise.js) 完成两位员工的资料表单。三档骨架已接入本地查询，
尚未绑定的输入为空、切换按钮暂无功能、整组重置有隐患，这些都是 TODO。
表单首次能渲染并不代表已经完成验收；不要修改 templates 或把练习内容写进样例。

与样例相比的变化点：

1. 同时保留两位员工的草稿，编辑区跟随当前员工；只读预览固定为本次加载的第一位员工。
2. 重置仅恢复当前员工，必须保留另一位员工未保存的修改；说明骨架的整组重置为何有隐患。

字段为 ID、员工编码、姓名、邮箱、性别、年龄、入职日期、在职。
ID / 编码使用只读展示，其他字段使用适当输入控件；布局两列，邮箱跨两列。
姓名、邮箱、性别、年龄、入职日期必填，年龄 18～60；本单元不要求重复实现 03 的异步查重。
只读预览展示第一位员工的全部八个字段。

### 标准档 TODO 对照

| TODO | 任务 | 样例知识点 |
|---|---|---|
| 1 | 编辑表单绑定当前员工 | 1、2 |
| 2 | 控件与两列 / 跨列布局 | 3、4、5 |
| 3 | 两位员工切换、保留草稿、空值保护 | 2 的延伸 |
| 4 | 固定第一位员工的只读预览 | 5 的延伸 |
| 5 | 只读模式与按钮约束 | 5 |
| 6 | 等待真实校验与失败处理 | 6 |
| 7 | 修正整组重置隐患 | 7 |
| 8 | 多类型回滚与请求观察 | 4、6、7 |

### 入门档 TODO 对照

| TODO | 任务 | 样例知识点 |
|---|---|---|
| 1 | Form 的 dataSet 与 current | 2 |
| 2 | columns / colSpan | 3 |
| 3、4 | Output 与五类输入控件 | 4、5 |
| 5 | 切换员工并防止越界 | 2 的延伸 |
| 6 | 显式 record 固定预览对象 | 5 的延伸 |
| 7 | readOnly / disabled | 5 |
| 8、9 | checkValidity、等待、结果和异常 | 6 |
| 10、11 | 重置范围、表单事件和多记录验收 | 7 |

### 挑战档 TODO 对照

| TODO | 任务 | 样例知识点 |
|---|---|---|
| 1 | 字段、控件和布局 | 1、3、4 |
| 2 | 编辑当前员工，保留两份草稿 | 2 的延伸 |
| 3 | 固定第一位预览 | 5 的延伸 |
| 4 | 编辑 / 只读模式 | 5 |
| 5 | 等待并显示校验结果 | 6 |
| 6 | 修正重置范围与清除旧提示 | 7 |
| 7 | 空记录与重新加载 | 2、5、6、7 的延伸，样例没有完整实现 |

## 接口与数据示例

| GET 路径 | 用途 |
|---|---|
| `/mock/unit-04/roles?page=1&pagesize=1` | 样例读取平台管理员，角色总数 12 |
| `/mock/unit-04/employees?page=1&pagesize=2` | 练习读取宋江和张飞，员工总数 45 |
| `/mock/unit-04/employees?page=1&pagesize=2&empty=true` | 挑战档空结果演示，返回 content=[]、totalElements=0 |

正常响应仍为 Spring Page。员工第一页示例：

```json
{
  "content": [
    { "id": 1, "name": "宋江", "code": "EMP001", "sex": "M", "age": 27,
      "email": "emp001@example.com", "active": true, "startDate": "2019-02-01 00:00:00" },
    { "id": 2, "name": "张飞", "code": "EMP002", "sex": "M", "age": 34,
      "email": "emp002@example.com", "active": true, "startDate": "2020-03-01 00:00:00" }
  ],
  "totalElements": 45, "totalPages": 23, "size": 2,
  "number": 0, "numberOfElements": 2, "empty": false
}
```

page 从 1 开始；pagesize 为 1～50 的整数；非法分页参数返回 400 和中文 message。
empty 省略或 false 返回正常数据，true 仅对该次请求返回空结果，其他值返回 400。
其余查询参数沿用 filterByQuery；例：code=EMP001 过滤第一位员工。

mock 在注册时从已有角色 / 员工种子深拷贝独立内存集合，不修改种子，也不共享其他单元的记录。
本单元没有 create / update / destroy 接口；刷新页面会丢失浏览器中的草稿。

## 验收标准（三档共用，完成 TODO 后检查）

- [ ] 首次进入练习只发 1 次员工 GET，请求 page=1、pagesize=2；没有写请求。
- [ ] 显示宋江的八个字段，ID 1、EMP001 不可编辑；性别显示男、年龄 27、日期 2019-02-01、在职开启。
- [ ] 五类输入控件齐全；两列布局，邮箱单独占满一行；元信息来自 fields。
- [ ] 修改第一位姓名为“宋江草稿”，预览同步；切到第二位显示张飞，预览仍显示“宋江草稿”。
- [ ] 第二位年龄改 40，日期改 2024-06-01，在职关闭；来回切换，两人的修改都保留。
- [ ] 在第二位点击恢复：年龄回 34、日期回 2020-03-01、在职开启；第一位仍为“宋江草稿”。
- [ ] 清空当前姓名后失焦、校验，显示未通过及字段提示；修正后可通过，不能显示保存成功。
- [ ] 把第一位姓名清空后切到第二位再校验：仍应发现第一位草稿不合法。
      解释 Form 的 checkValidity 为什么并非只校验当前可见控件；修正第一位后再次校验通过。
- [ ] 校验失败后重置当前员工，其字段错误状态和旧结果提示得到清理；值恢复为查询时的值。
- [ ] 只读模式下五类输入不能修改，校验 / 重置按钮禁用；切回编辑保留之前的草稿。
- [ ] 校验、切换员工、切换模式、重置均不产生新的 HTTP 请求；重置后 F5 会重新读取种子。
- [ ] 解释整组重置隐患与修复范围；三档原始模板可渲染不等于以上项目已经通过。

## 挑战档额外需求

实现“演示空结果”和“重新加载员工”，只使用本单元 GET 接口。
这是显式重新加载操作，会替换本次加载的草稿；在按钮附近说明这一点。

- [ ] 空结果时明确显示“没有员工资料”，不访问不存在的记录，禁用员工切换、校验和重置。
- [ ] 空结果不允许表单校验悄悄创建一条空记录；固定预览也显示为空。
- [ ] 重新加载去掉 empty=true，只发 1 次请求，恢复两位员工和正确的第一位预览绑定。
- [ ] 反复空结果 / 重新加载没有残留上一次的 Record 引用、错误提示或未捕获异常。

## 难度与重置

实际编辑始终是本目录的 Exercise.js，不改 templates。三档共用上述验收，hard 另加空结果要求。

```sh
yarn unit:list
yarn unit:reset 4 easy
yarn unit:reset 04 normal
yarn unit:reset 4 hard
```

重置前保存编辑器文件。脚本先备份到 `.backup/04-form/Exercise.<时间戳>.js` 并打印路径，再覆盖。
没有难度参数时默认 normal；原始 Exercise.js 与 normal 逐字节一致，修改后列表显示已改动。

## 思考题

1. 给两个 Form 传入同一个 Record，为什么不需要再把每个输入值复制到 useState？
2. Form 同时获得 record 和 dataSet 时，哪一个决定显示的记录？切换 current 后显式 record 会自动改变吗？
3. 只读预览固定第一位，而编辑区切到第二位时，为什么预览不应该引用 current？
4. 表单的 readOnly 能否限制代码里的 record.set？只读是否等于权限控制？
5. onReset 调用 preventDefault 会怎样？DataSet.reset 和 Record.reset 的范围有什么差别？
6. 一个 Form 只展示当前员工，checkValidity 为什么仍可能报告另一位员工的字段错误？
7. 查询后的记录与 autoCreate 的新记录，其 reset 所恢复的初始数据有什么不同？

## 常见坑与 1.6.7 依据

- Form 的校验入口是 checkValidity，返回 Promise；不要编造 Form.validate / Form.reset。
- Pro Button 的原生按钮类型属性是 type，不是 htmlType；reset 按钮必须关联到正确表单。
- Form.onReset 在默认回滚之前执行；仅在这里通知 UI 即可，不要再次整组重置或重新查询。
- DatePicker 绑定 date 字段，日期格式写在 fields；不要直接把日期对象作为 React 文本子节点。
- columns 是字段列数，底层还包含标签列；colSpan 写在表单子字段上。
- 单元内不引入样式或语言包，不调用全局 configure，不使用 StrictMode。
- 01 的未用 useMemo TODO 按保护约束保留；04 的所有 DataSet 均在 useMemo 的工厂里创建。
- 固定依赖的 Select 展开时可能打印 forceClearActiveKey 警告；DatePicker 键盘输入字符串时，
  1.6.7 的 setText → toMoment 会打印 not moment 后再解析。初次渲染不触发这些交互警告。
  不屏蔽 console、不改依赖；测试只对白名单中写明源码原因的日期警告放行，其他 console.error 均失败。

已阅读的本地依据（路径均在项目 node_modules 中）：

| 文件 | 已确认行为 |
|---|---|
| `choerodon-ui/pro/lib/form/Form.d.ts`、`Form.js` | record 优先级、readOnly、columns / colSpan、checkValidity、handleReset |
| `choerodon-ui/pro/lib/button/Button.d.ts`、`enum.js` | type 的 button / submit / reset 取值 |
| `choerodon-ui/pro/lib/output/Output.js` | isEditable 返回 false |
| `choerodon-ui/pro/lib/date-picker/DatePicker.js` | 日期值与字符串解析、键盘输入的已知警告 |
| `choerodon-ui/dataset/data-set/Record.js` | reset 恢复 pristineData 并清除校验状态 |
| `choerodon-ui/dataset/data-set/DataSet.js` | validate 遍历数据记录，校验范围与 DataSet 配置有关 |

## 重启与验证

停止原 yarn start 后重新启动，让新增 mock 模块生效；不安装依赖，没有独立后端服务。

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

打开 `http://localhost:3000/#unit-04`，样例显示平台管理员的编辑表单、只读预览和模式按钮；
练习读取两位员工但绑定和交互待完成。04 应显示与 normal 模板一致，05～09 保持未开放。

完成后说“检查单元 04”并贴出 Exercise.js：按验收逐条 review，只给提示，不给完整答案。
