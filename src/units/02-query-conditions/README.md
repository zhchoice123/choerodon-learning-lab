# 单元 02：查询条件

## 学习目标

独立完成「编辑条件 → 查询条件数据集 → 参数适配 → 服务端过滤和分页 → Table 展示」的列表页。
能解释字段改名、空条件、`false`、`0` 和页码的处理，以及为什么修改输入框不等于已经查询。

## 核心概念

```text
queryFields ──自动创建──▶ queryDataSet.current（查询条件）
或：显式创建 queryDataSet ──传给列表 DataSet──┘
                                    │ 点查询 / query(1)
                                    ▼
列表 DataSet ── transport.read({ data: 条件, params: 分页 })
                                    │ 改名、清理、合并
                                    ▼
GET /mock/...?... ── Spring Page ──▶ 列表 records ──▶ Table
```

| 名称 | 责任 / 本单元用法 |
|---|---|
| 列表 `fields` | 结果行的类型和中文标题；不是查询条件定义 |
| `queryFields` | 定义查询字段的简写；1.6.7 自动创建条件 DataSet 和当前记录 |
| `queryDataSet` | 单独管理条件；显式创建时设置 `autoCreate: true`、`paging: false`，不配置远程 read |
| 列表 `current` | 表格当前结果行 |
| `queryDataSet.current` | 当前条件记录；程序设置与输入框写入的是同一条记录 |
| `transport.read({ data, params })` | `data` 是条件；`params` 是分页、排序参数；GET 最终使用 URL 参数 |
| `query(1)` | 按当前条件查第一页；翻页仍带着条件 |
| 查询记录 `reset()` | 恢复初始条件；单独调用它不发列表查询 |
| Table `queryFieldsLimit` | 查询栏直接展示多少个字段，超出的进入更多查询区域 |
| Table `queryBar="normal"` | 使用普通查询栏；布尔查询字段会生成可清空的是/否选择框 |

`queryFields` 与显式 `queryDataSet` 选一种：1.6.7 同时配置时，`queryFields` 会创建并替换查询数据集。
Table 的 `queryFields` 属性则是自定义查询控件映射，和 DataSet 的同名属性不是一回事，本单元不需要它。

本单元不配置远程值集；没有任何查询需要外部服务器。

## 样例怎么读

打开 `http://localhost:3000/#unit-02` 的「样例」，阅读 [Example.js](./Example.js) 中的知识点 1～8。

1. 初次完整刷新只产生 1 次 `/mock/roles` 请求，`page=1&pagesize=5`，共 12 个角色。
2. 输入角色名称 `  管理员  ` 并点击查询，URL 中是 `name=管理员`，结果为 2 个管理员。
3. 修改条件后先不点查询：状态栏的待查询条件变化，表格和「上次查询共」仍是旧结果（知识点 5）。
4. 点「只看项目角色」：名称被清空、层级变为 project，只查一次第一页，结果共 4 个角色（知识点 6）。
5. 点「恢复默认条件并查询」：回到第一页，共 12 个角色（知识点 7）。
6. 对照 Network 理解知识点 3、4：最终 URL 保留分页参数，不能出现 `roleName`。

## 练习任务

样例使用角色的两个字符串条件；练习使用员工数据，有两个变化点：

- 显式建立查询 DataSet，使用前端字段 `keyword`，传输时改为 `q`，后端同时搜索姓名和编码。
- 查询值包含布尔值和数字：`false` 表示离职，`0` 是合法年龄下限；不能把它们当成空值。

只编辑 [Exercise.js](./Exercise.js)。初始模板可以正常打开：normal 会显示员工列表和待完成的提示，
没有查询字段属于未完成状态；easy 预填了一个查询字段；hard 保留最少骨架。
「没有运行异常」不代表通过下面的功能验收。模板不会提供员工查询的完整答案。

### 标准档 TODO 对照

| TODO | 内容 | 对应样例知识点 |
|---|---|---|
| 1 | 显式条件 DataSet，三个字段，无默认过滤 | 1、2 |
| 2 | 参数改名和清理；诊断真假值判断的隐患 | 3、4 |
| 3 | 区分待查询条件与上次结果，实时状态栏 | 5 |
| 4 | 离职快捷条件，一次查询第一页 | 6 |
| 5 | 恢复默认条件并查询 | 7 |
| 6 | 三个条件直接显示在 Table 查询栏 | 8 |
| 7 | 记录请求和页面观察，解释隐患 | 3～8 |

### 入门 / 挑战档 TODO 对照

| 入门 TODO | 内容 | 对应样例知识点 |
|---|---|---|
| 1、2 | 补齐布尔、数字查询字段 | 1、2 |
| 3、4、5 | 空白、改名、保留假值 | 3、4 |
| 6 | 状态栏 | 5 |
| 7、8 | 设置条件、只查询一次 | 6 |
| 9 | 恢复默认条件并查询 | 7 |
| 10 | 查询栏显示数量 | 8 |
| 11 | Network 观察与原因说明 | 3～8 |

| 挑战 TODO | 内容 | 对应样例知识点 |
|---|---|---|
| 1 | 独立条件容器 | 1、2 |
| 2 | 员工列表基本配置 | 单元 01 的 1～4 |
| 3 | 适配参数、修正真假值隐患 | 3、4 |
| 4 | 状态栏与查询栏 | 5、8 |
| 5、6 | 快捷查询与恢复默认 | 6、7 |
| 7 | 记录请求和页面观察 | 3～8 |
| 8 | 女性快捷筛选与跨页保留 | 3、6、7 的延伸，样例未实现 |

## 接口契约与数据示例

练习：`GET /mock/guide/user/search`。样例继续使用 `GET /mock/roles`。
原 `/mock/guide/user`、`mock/utils.js` 和两份源数据均不变。

| 查询参数 | 类型 / 规则 |
|---|---|
| `page` | 从 1 开始，默认 1 |
| `pagesize` | 默认 10；本单元固定每页 5 条 |
| `q` | 关键词，姓名或编码包含匹配；编码不区分大小写，去首尾空白；不传表示不限 |
| `active` | `true` 为在职，`false` 为离职；不传表示不限 |
| `minAge` | 数字，年龄大于或等于此值；`0` 合法；负数或非数字返回 400 |
| `sex` | `M` / `F`，挑战档使用；不传表示不限 |

条件之间是 AND；`q` 内部的姓名/编码匹配是 OR。总数是过滤后、分页前的总数。
`keyword` 不是后端支持的参数名，误传不会实现关键词过滤。

请求 `GET /mock/guide/user/search?page=1&pagesize=5&q=EMP004&active=false&minAge=0`：

```json
{
  "totalPages": 1,
  "totalElements": 1,
  "numberOfElements": 1,
  "size": 5,
  "number": 0,
  "content": [
    {
      "id": 4,
      "name": "廉颇",
      "code": "EMP004",
      "sex": "M",
      "age": 48,
      "email": "emp004@example.com",
      "active": false,
      "startDate": "2022-05-01 00:00:00"
    }
  ],
  "empty": false
}
```

## 验收标准（三档共用，完成 TODO 后检查）

先停下编辑以避免热更新干扰计数。打开 DevTools Network，过滤 `/mock/guide/user/search`，
关闭 Preserve log，完整刷新页面后第一次进入练习。样例 `/mock/roles` 请求不计入练习次数。
每组检查前点「恢复默认条件并查询」，等待结束并清空 Network，再执行该组操作。

- [ ] 首次进入练习恰好 1 次请求，`page=1&pagesize=5`，没有 q / active / minAge；共 45 人。
- [ ] 显示编码、姓名、性别、年龄、在职 5 列中文标题；每页 5 条，不显示 id。
- [ ] 查询栏直接显示「关键词」「在职」「最低年龄」3 个字段；在职可选是/否并能清空，初始均不限。
- [ ] 输入关键词 `  emp004  `，先不查询，状态栏更新但结果仍是 45 人，Network 不增加；点查询后只有廉颇，共 1 人。
- [ ] 上一请求带 `q=emp004`，不带 keyword，保留 `page=1&pagesize=5`；输入 `宋` 能查到宋江，证明同时支持姓名与编码。
- [ ] 关键词只有空格时，URL 不带 q，结果共 45 人；不存在的关键词显示空表、总数 0，状态栏不报错。
- [ ] 单独将「在职」选否并查询，URL 带 `active=false`，结果共 11 人；选是共 34 人，清空后共 45 人。
- [ ] 最低年龄填 0 并查询，URL 仍带 `minAge=0`，状态栏显示 0，结果共 45 人；填 40 时返回的每行年龄都 ≥ 40。
- [ ] 在职选否、最低年龄 40，组合查询结果为 EMP004、EMP016、EMP020、EMP028、EMP032、EMP044，共 6 人。
- [ ] 点「仅离职（年龄不限）」只发 1 次请求：无 q、`active=false&minAge=0&page=1&pagesize=5`，结果共 11 人。
- [ ] 上述条件下翻第 2 页：只发 1 次请求，`page=2`，active / minAge 仍在；分页显示第 6～10 条 / 共 11 条。
- [ ] 从第 2 页改关键词为 `EMP004` 再点查询，请求回到 `page=1`，只显示廉颇。
- [ ] 点「恢复默认条件并查询」只发 1 次请求，三个控件恢复不限，无 q / active / minAge，第 1 页共 45 人。
- [ ] 用自己的话记录原 `if (value)` / `filter` 写法遗漏的合法值，并解释 `data: {}` 与 `...params` 分别解决什么问题。

## 挑战档额外需求

增加「仅女性」快捷筛选按钮，不增加第四个查询栏字段。点击时恢复三个可见条件为不限，
附加 `sex=F` 查询第一页。此限制在翻页和普通查询时继续生效；「恢复默认条件并查询」清除它。
「仅离职」则应退出女性筛选，继续满足共同验收中的 11 人要求。

- [ ] 只点一次「仅女性」，只请求一次，第一页总数 19，所有记录 sex 为 F。
- [ ] 翻第 2 页仍带 `sex=F`；普通查询时也保留此限制；查询栏仍只有 3 个字段。
- [ ] 恢复默认后 URL 不带 sex，总数 45；再点仅女性后点仅离职，URL 不带 sex，总数 11。

## 难度选择与重置

```sh
yarn unit:list
yarn unit:reset 2 easy
yarn unit:reset 02 normal
yarn unit:reset 2 hard
yarn unit:reset 2
```

最后一条默认 normal。以上重置命令按需选一条运行，不是必须逐条执行。
脚本先备份已保存的 `Exercise.js` 到 `.backup/02-query-conditions/Exercise.<时间戳>.js`，
打印路径后再替换；模板缺失或备份失败不会继续覆盖。编辑器中未保存的内容需要先保存。
模板不能随作业一起修改，否则下次重置就不是原始练习。恢复备份时将对应文件复制回 `Exercise.js`。
`unit:list` 按字节比较模板；连空格或注释变化也会显示「已改动」。未开放的 03～09 只列预告，不生成文件。

## 思考题

1. 为什么列表字段与查询字段可以不同名？应在哪一层转换？
2. 不合并分页 params 时，第 2 页可能出现什么现象？
3. 输入框里的条件与「上次查询共」为什么可能暂时不对应？
4. 改条件时沿用旧页码，为什么可能得到空表？
5. `queryDataSet.current.reset()` 和恢复模板脚本的「重置」分别作用于什么？
6. 挑战题中，只为一次查询传入 sex，为什么不一定能覆盖下一次翻页？

## 常见坑与版本依据

- 不要使用 `filter(Boolean)` 或 `if (value)` 清理所有类型的条件，它们会吞掉 false 与 0。
- 对 GET 手动组装 params 后，清空 data；否则 1.6.7 会再次合并原始条件，改名和去空白可能失效。
- `queryFields` 与 `queryDataSet` 不要同时配置；查询 DataSet 不要 autoQuery，不要接列表接口。
- 查询条件的修改不应顺便再发请求；内置查询按钮已经会查询，不要叠加第二次调用。
- `queryBar="normal"` 下布尔查询自动生成是/否选择；换成 professionalBar 时默认控件不同，别直接替换。
- 新的查询端点位于 mock，改动后必须重启 `yarn start`；前端文件可热更新。
- `yarn build` 不包含 mock 服务，直接静态托管 build 无法验证本地查询。
- 未升级依赖；没有新增全局样式或语言包导入；入口仍使用 ReactDOM.render。

已核对本地 `node_modules/choerodon-ui` 的 1.6.7 实现：
`dataset/data-set/DataSet.js`（initQueryDataSet / generateQueryParameter）、
`dataset/data-set/utils.js`（axiosConfigAdapter）、`pro/lib/table/query-bar/index.js` 与 `pro/lib/table/utils.js`。
对应官方源码：[DataSet 1.6.7](https://github.com/open-hand/choerodon-ui/blob/1.6.7/components-dataset/data-set/DataSet.tsx)、
[Table 1.6.7](https://github.com/open-hand/choerodon-ui/blob/1.6.7/components-pro/table/Table.tsx)。

完成后说「检查单元 02」并贴出 Exercise.js：按上述验收逐条 review，只给提示，不给完整答案。
