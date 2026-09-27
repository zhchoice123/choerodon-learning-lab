# 单元 09：全局配置与国际化

## 学习目标

学会用 `configure` 一次性让所有 DataSet 适配一个「格式不同的后端」，而不是在每个 DataSet 上重复配置；
理解全局配置的作用范围、优先级和副作用；会用 `localeContext` 切换组件库的语言包。
样例对接「旧系统 v1」的角色，练习对接「旧系统 v2」的员工，两个后端的格式故意不同。

## 核心概念

```text
DataSet.query()
  │ 分页信息 { page: 1, pageSize: 5 }
  ├─ generatePageQuery ──▶ 后端要的参数：v1 { pageNo: 0, pageSize: 5 } / v2 { current: 1, limit: 5 }
  ▼
后端响应 { success, result: { records, totalCount } }
  ├─ dataKey  'result.records'    ──▶ 表格数据
  └─ totalKey 'result.totalCount' ──▶ 分页器总数

字段 { lookupCode: 'ROLE.LEVEL' } ─ lookupUrl(code) + lookupAxiosMethod ─▶ 值集 ─ 同样按全局 dataKey 解析
```

| 概念 | 含义与边界 |
|---|---|
| `configure(config)` | 写入整个应用共享的全局配置（模块级单例）。没有作用域，也没有「取消设置」 |
| `getConfig(key)` | 读取**当前生效值**：设置过就是设置的值，没设置就是默认值 |
| `generatePageQuery` | 参数含 `page`（从 1 开始）、`pageSize`、`sortName`、`sortOrder`；返回值**整体替换**默认的 `page` / `pagesize` |
| `dataKey` / `totalKey` | 支持 `a.b` 路径。默认值是 `rows` / `total` |
| 值集也用全局 `dataKey` | 值集响应按全局 `dataKey` 解析，所以值集接口的外壳要和列表一致 |
| `lookupUrl` / `lookupAxiosMethod` | 值集地址函数 `(code) => url`；1.6.7 的值集默认用 **POST** |
| 优先级 | DataSet 自己写了 `dataKey` / `totalKey`，就**优先于**全局配置 |
| `localeContext.setLocale` | 切换组件库内置文案（分页器、按钮、校验提示）；我们自己写的 `label` 不会变 |

**为什么用 `<LessonConfigScope>`，而不是直接调用 `configure`？**
真实项目只有一个后端，`configure` 写在入口 `src/index.js`，调用一次即可。
本项目把 9 个单元放在同一个页面里：如果单元 09 直接调用 `configure`，离开后单元 01～08 的分页参数和响应解析也被改掉了。
`LessonConfigScope` 在进入时用 `getConfig` 做快照、应用配置，离开时用 `configure(快照, false)` 精确恢复（`false` 表示整体覆盖、不合并对象），语言包同样恢复。
样例和练习的全局配置不同，所以本单元的工作台**只挂载当前标签的预览**（单元 meta 的 `exclusivePreview`）。

## 样例怎么读

打开 `http://localhost:3000/#/unit-09` 的「样例」标签，对照 [Example.js](./Example.js) 的知识点 1～7：

1. 「当前生效」一行显示 `dataKey = result.records`、`lookupAxiosMethod = get`：配置已经生效（知识点 1、7）
2. Network 里查看列表请求：参数是 `pageNo=0&pageSize=5`，没有 `page` / `pagesize`；翻到第 2 页变成 `pageNo=1`（知识点 2）
3. 表格 5 行，状态栏「共 12 个角色 ｜ 第 1/3 页」：`dataKey` 和 `totalKey` 都指向嵌套路径（知识点 3）
4. 「层级」列显示「平台层 / 租户层 / 项目层」，Network 里有一次 `GET .../lookups/ROLE.LEVEL`（知识点 4）
5. `createRoleDataSet` 里没有写 `dataKey` / `totalKey`，全靠全局配置（知识点 5）
6. 点「Switch to English」：分页器文案变成英文，列标题仍是中文；状态栏显示「当前语言：English」（知识点 6）
7. 离开本单元再打开单元 02，Network 里的参数恢复成 `page` / `pagesize`，语言恢复中文（作用域恢复）

## TODO 与知识点对照

三档共用同一套验收标准，只修改 `Exercise.js`。

### 入门 easy

| TODO | 内容 | 知识点 |
|---|---|---|
| 1 | `generatePageQuery` 返回 `{ current, limit }` | 2 |
| 2、3 | `dataKey` / `totalKey` 写成 v2 的路径 | 3 |
| 4、5 | `lookupUrl`、`lookupAxiosMethod` | 4 |
| 6 | 删除 DataSet 上遗留的 `dataKey` / `totalKey` | 5 |
| 7 | 「性别」加 `lookupCode: 'EMP.SEX'` | 4 |
| 8、9 | 状态栏：`observer` + 三个值 | 6（复习单元 01） |
| 10、11 | 语言切换及按钮文案 | 6 |

### 标准 normal

| TODO | 内容 | 知识点 |
|---|---|---|
| 1 | 分页参数翻译 | 2 |
| 2 | 响应解析 | 3 |
| 3 | 全局值集，性别显示「男 / 女」 | 4 |
| 4 | **能跑但有问题**：遗留的 DataSet 配置盖住了全局配置 | 5 |
| 5 | 自动刷新的状态栏 | 6（复习单元 01） |
| 6 | 语言切换 | 6 |

### 挑战 hard

| TODO | 内容 | 知识点 |
|---|---|---|
| 1 | 全局配置：分页、响应、值集 | 2、3、4 |
| 2 | 检查 DataSet 上的每项配置 | 5 |
| 3 | 状态栏 | 6 |
| 4 | 语言切换 | 6 |
| 5 | 服务端排序（见「挑战档额外需求」） | 2 的延伸，样例未实现 |

## 接口数据示例

旧系统 v2（练习用）：

```text
GET /mock/unit-09/v2/employees?current=1&limit=5[&orderBy=age:desc]
→ { "code": 0, "data": { "items": [ { "id": 1, "code": "EMP001", "name": "宋江", "sex": "M", "age": 27, "active": true, ... } ], "total": 45 } }

GET /mock/unit-09/v2/lookups/EMP.SEX
→ { "code": 0, "data": { "items": [ { "value": "M", "meaning": "男" }, { "value": "F", "meaning": "女" } ] } }
```

- `current` 从 1 开始，`limit` 为 1～100。**缺省时按 `current=1`、`limit=10` 返回**，所以没翻译参数也能看到数据，只是页数不对
- `current=0` 或非整数返回 `400 { code: 400, message }`；`orderBy` 格式为「字段:asc」或「字段:desc」
- 值集接口用 POST 请求会返回 `405 { code: 405, message: '值集接口只支持 GET，请配置 lookupAxiosMethod' }`

旧系统 v1（样例用）：`GET /mock/unit-09/v1/roles?pageNo=0&pageSize=5` → `{ "success": true, "result": { "records": [...], "totalCount": 12 } }`

## 验收标准（三档共同）

### 原始模板

- [ ] 能正常渲染，没有报错；表格只有**一行空白记录**（整条响应被当成了一条记录），分页器显示 1 条
- [ ] 列表请求的参数：normal / hard 是默认的 `page=1&pagesize=5`；easy 的骨架 `generatePageQuery` 返回空对象，不带分页参数。后端都按默认值返回
- [ ] `Exercise.js` 与 normal 模板逐字节一致（`yarn unit:list` 显示「与 normal 模板一致」）

### 完成 TODO 后

- [ ] 列表请求参数是 `current=1&limit=5`，不再带 `page` / `pagesize`；翻页后 `current` 变化
- [ ] 表格每页 5 行，第 1 页是宋江、张飞、赵云、廉颇、秦秀英；分页器共 9 页
- [ ] 「性别」显示「男 / 女」；Network 里有一次 `GET /mock/unit-09/v2/lookups/EMP.SEX`，没有 405
- [ ] `createEmployeeDataSet` 里不再有 `dataKey` / `totalKey`
- [ ] 状态栏显示「共 45 人 ｜ 第 1/9 页 ｜ 当前语言：中文」，翻页和切换语言后自动变化
- [ ] 切换语言后分页器文案变化，列标题仍是中文
- [ ] 离开单元 09 后打开单元 02：列表参数恢复为 `page` / `pagesize`，数据正常，语言恢复中文

## 挑战档额外需求

「年龄」列可以点击排序，排序在**服务端**完成：

- [ ] 降序时请求带 `orderBy=age:desc`，第 1 页依次是关羽 59、王昭君 58、李逵 57、马超 56、秦秀英 55
- [ ] 升序时带 `orderBy=age:asc`，第 1 页依次是李清照 20、小乔 21、孔秀兰 22、黄忠 23、吴用 24
- [ ] 取消排序后请求不带 `orderBy`；排序状态下翻页，排序保持

提示：`generatePageQuery` 的参数里除了 `page` / `pageSize`，还有什么？列要能点击排序，需要打开哪个属性？

## 难度与重置

在首页或单元页面上选择难度 / 重置；也可以用命令行：

```bash
yarn unit:list
yarn unit:reset 9 easy
yarn unit:reset 09 normal
yarn unit:reset 9 hard
```

重置会先把当前练习备份到 `.backup/09-global-config/`。

## 思考题

1. 如果在 `Exercise` 组件里直接调用 `configure(...)`，离开单元 09 后单元 02 会出现什么现象？为什么？
2. 为什么恢复时要用 `configure(快照, false)`？如果用默认的合并方式，哪类配置可能恢复不干净？
3. 值集接口为什么必须和列表接口用同一种响应外壳？如果两个后端格式不同，你会怎么处理？
4. DataSet 上的 `dataKey` 优先于全局配置。什么情况下，你反而应该在 DataSet 上单独写？
5. 切换语言后，为什么「性别」「年龄」这些列标题没有变成英文？要让它们也变，需要怎么做？

## 常见坑与源码依据

以下路径相对 `node_modules/choerodon-ui/`：

| 坑 / 行为 | 源码 |
|---|---|
| `configure` 写入模块级单例，没有作用域 | `dataset/configure/index.js`：`globalConfig`、`configure` |
| `getConfig` 返回当前生效值（自定义值或默认值） | 同文件 `getConfig` |
| `configure(config, false)` 不合并对象、整体覆盖 | `lib/configure/index.js`：第二个参数为 false 时传 null |
| `generatePageQuery` 的参数和返回值 | `dataset/data-set/DataSet.js`：`generatePageQueryString` 之后的 `getConfig('generatePageQuery')` |
| `dataKey` / `totalKey` 支持 `a.b` 路径 | `dataset/data-set/utils.js`：`generateResponseData` 使用 `ObjectChainValue.get` |
| 路径不存在时整条响应被当成一条记录 | 同上：`result === undefined` 时返回 `[item]` |
| DataSet 属性优先于全局配置 | `DataSet.js`：`dataKey` getter 先取 `this.props.dataKey` |
| 值集默认 POST，响应按全局 `dataKey` 解析 | `dataset/configure/index.js`：`lookupAxiosMethod: 'post'`；`dataset/stores/LookupCodeStore.js` |
| 语言包是全局单例 | `dataset/locale-context/LocaleContext.js` |

## 本地验证

`mock/` 有改动，需要停止旧的 `yarn start` 后重新启动。只改 `Exercise.js` 会自动热更新。

```bash
yarn unit:list
CI=true yarn test --watchAll=false
node --test scripts/ devtools/
CI=true yarn build
```
