# 单元 02 与三档练习工具：逐文件完整内容

以下是本次新增或修改文件的完整内容，不是 diff。单元 01 当前 Exercise.js 是用户作业，未改动也未复制进本交付。
单元 01 normal 模板来自 Git 提交 0e141c0 的原始 TODO。完整运行、重启和验证记录见 [unit-02-verification.md](./unit-02-verification.md)。

## 文件：/Users/zhcho/Documents/study/Choero/choerodon-ui-demo/scripts/unit.js

````js
// 学习单元工具：只使用 Node 内置模块，不加载或执行练习代码。
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = path.resolve(__dirname, '..');
const unitsRoot = path.join(root, 'src/units');
const difficulties = ['easy', 'normal', 'hard'];

function readUnits() {
  const units = new Map();
  // 未开放单元没有目录，从注册表读取静态 key / title；不执行 React 模块。
  const registry = fs.readFileSync(path.join(unitsRoot, 'index.js'), 'utf8');
  const pattern = /key:\s*['"]unit-(\d+)['"]\s*,\s*title:\s*['"]([^'"]+)['"]/g;
  for (const match of registry.matchAll(pattern)) {
    units.set(Number(match[1]), { number: Number(match[1]), title: match[2] });
  }
  for (const entry of fs.readdirSync(unitsRoot, { withFileTypes: true })) {
    const match = /^(\d+)-.+$/.exec(entry.name);
    if (!entry.isDirectory() || !match) continue;
    const number = Number(match[1]);
    if (units.get(number)?.directory) throw new Error(`单元 ${number} 存在多个目录，请先检查目录名称。`);
    const directory = path.join(unitsRoot, entry.name);
    const metaFile = path.join(directory, 'index.js');
    const meta = fs.existsSync(metaFile) ? fs.readFileSync(metaFile, 'utf8') : '';
    const title = /title:\s*['"]([^'"]+)['"]/.exec(meta)?.[1] || entry.name;
    units.set(number, { number, title, directory, name: entry.name });
  }
  return [...units.values()].sort((a, b) => a.number - b.number);
}

function templatePath(unit, difficulty) {
  return path.join(unit.directory, 'templates', `Exercise.${difficulty}.js`);
}

function listUnits(units) {
  for (const unit of units) {
    if (!unit.directory) {
      console.log(`${unit.title} ｜ 可用难度：无 ｜ 未开放`);
      continue;
    }
    const available = difficulties.filter((difficulty) => fs.existsSync(templatePath(unit, difficulty)));
    const exercise = path.join(unit.directory, 'Exercise.js');
    let status = 'Exercise.js 不存在';
    if (fs.existsSync(exercise)) {
      const content = fs.readFileSync(exercise);
      const matches = available.filter((difficulty) => content.equals(fs.readFileSync(templatePath(unit, difficulty))));
      status = matches.length ? `与 ${matches.join(' / ')} 模板一致` : '已改动（与所有模板均不一致）';
      if (!available.length) status = '暂无模板，无法比较';
    }
    console.log(`${unit.title} ｜ 可用难度：${available.join(' / ') || '无'} ｜ ${status}`);
  }
}

function resetUnit(units, numberInput, difficulty = 'normal') {
  if (!/^\d{1,2}$/.test(numberInput || '') || Number(numberInput) < 1) {
    throw new Error('请提供单元号，例如：yarn unit:reset 2 normal（也支持 02）。');
  }
  if (!difficulties.includes(difficulty)) {
    throw new Error(`未知难度「${difficulty}」，可用值：easy、normal、hard。`);
  }
  const unit = units.find((item) => item.number === Number(numberInput));
  if (!unit) throw new Error(`找不到单元 ${numberInput}，请先运行 yarn unit:list。`);
  if (!unit.directory) throw new Error(`单元 ${numberInput} 尚未开放，没有练习目录或模板。`);
  const template = templatePath(unit, difficulty);
  if (!fs.existsSync(template)) throw new Error(`找不到 ${difficulty} 模板：${template}`);
  // 先读模板，避免模板不可读时已经产生覆盖操作。
  const content = fs.readFileSync(template);
  const exercise = path.join(unit.directory, 'Exercise.js');
  const stamp = `${new Date().toISOString().replace(/[:.]/g, '-')}-${process.pid}-${crypto.randomBytes(4).toString('hex')}`;
  if (fs.existsSync(exercise)) {
    const backupDirectory = path.join(root, '.backup', unit.name);
    fs.mkdirSync(backupDirectory, { recursive: true });
    const backup = path.join(backupDirectory, `Exercise.${stamp}.js`);
    // 备份失败会直接退出；绝不继续覆盖。EXCL 防止覆盖已有备份。
    fs.copyFileSync(exercise, backup, fs.constants.COPYFILE_EXCL);
    console.log(`已备份：${backup}`);
  } else {
    console.log('Exercise.js 不存在，将从模板创建，无需备份。');
  }
  const temporary = path.join(unit.directory, `.Exercise.${stamp}.tmp`);
  try {
    fs.writeFileSync(temporary, content, { flag: 'wx' });
    // 同目录原子替换，避免写入中断留下半个练习文件。
    fs.renameSync(temporary, exercise);
  } finally {
    if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
  }
  console.log(`已重置：${exercise}（${difficulty}）`);
}

try {
  const [command, ...args] = process.argv.slice(2);
  if (command === 'list' && args.length === 0) {
    listUnits(readUnits());
  } else if (command === 'reset' && args.length >= 1 && args.length <= 2) {
    resetUnit(readUnits(), ...args);
  } else {
    throw new Error('用法：yarn unit:list 或 yarn unit:reset <单元号> [easy|normal|hard]。');
  }
} catch (error) {
  console.error(`单元工具错误：${error.message}`);
  process.exitCode = 1;
}
````

## 文件：/Users/zhcho/Documents/study/Choero/choerodon-ui-demo/package.json

````json
{
  "name": "choerodon-ui-demo",
  "version": "0.1.0",
  "private": true,
  "packageManager": "yarn@1.22.22",
  "dependencies": {
    "@babel/runtime": "^7.17.2",
    "@testing-library/dom": "^8.20.1",
    "@testing-library/jest-dom": "6.9.1",
    "@testing-library/react": "12.1.5",
    "@testing-library/user-event": "^13.5.0",
    "axios": "1.0.0",
    "choerodon-ui": "1.6.7",
    "lodash": "^4.17.21",
    "mobx": "4.15.7",
    "mobx-react": "6.1.5",
    "mobx-react-lite": "1.5.2",
    "react": "16.14.0",
    "react-dom": "16.14.0",
    "react-scripts": "5.0.1",
    "web-vitals": "^2.1.4"
  },
  "proxy": "https://hzero-test.open.hand-china.com",
  "scripts": {
    "postinstall": "node scripts/strip-broken-sourcemaps.js",
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject",
    "unit:reset": "node scripts/unit.js reset",
    "unit:list": "node scripts/unit.js list"
  },
  "jest": {
    "transformIgnorePatterns": [
      "[/\\\\]node_modules[/\\\\](?!axios[/\\\\]).+\\.(js|jsx|mjs|cjs|ts|tsx)$",
      "^.+\\.module\\.(css|sass|scss)$"
    ]
  },
  "resolutions": {
    "react-virtualized": "9.22.6"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
````

## 文件：/Users/zhcho/Documents/study/Choero/choerodon-ui-demo/.gitignore

````gitignore
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# production
/build

# 练习重置前的本地备份
.backup/

# misc
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local

npm-debug.log*
yarn-debug.log*
yarn-error.log*
````

## 文件：/Users/zhcho/Documents/study/Choero/choerodon-ui-demo/src/units/01-dataset-basics/templates/Exercise.easy.js

````js
// 【练习·入门】员工列表：按编号完成填空，再按 README 的共同标准验收。
import React from 'react';
import { DataSet, Table, Button, message } from 'choerodon-ui/pro';

function createUserDataSet() {
  return new DataSet({
    // TODO 1：补 primaryKey，设为接口的唯一标识字段。
    // TODO 2：补 pageSize（5）和 autoQuery（true）。
    // TODO 3：补 transport.read，url 为 /mock/guide/user，method 为 GET。
    // TODO 4：补 dataKey 和 totalKey，对应 content / totalElements。
    // TODO 5：照着 id 补全 name、code、sex、age、email、active、startDate。
    //         type 从 string / number / boolean / date 中选择，label 使用中文。
    fields: [{ name: 'id', type: 'number', label: '员工ID' }],
  });
}

// TODO 6：从 mobx-react 导入 observer 并包裹状态栏函数。
const UserStatusBar = ({ dataSet }) => {
  // TODO 7：用 totalCount、current、record.get()、filter() 替换问号。
  //         current 为空时显示「无」，本页在职人数只统计 active 为 true 的记录。
  return <div className="status-bar">共 ? 人 ｜ 当前行：? ｜ 本页在职 ? 人</div>;
};

export default function Exercise() {
  // TODO 8：这行能运行，但组件重新渲染会怎样？从 React 导入 useMemo 后修正。
  const userDS = createUserDataSet();

  // TODO 9：补 7 列，只写 name 和布局属性；不要显示 id。
  const columns = [];

  const handleRefresh = () => {
    // TODO 10：用 query(page) 刷新，page 从 currentPage 读取。
  };

  const handleShowSelected = () => {
    // TODO 11：先检查 selected.length，为 0 时用 message.warning 提示并结束。
    // TODO 12：用 selected.map 取姓名，selected.filter 统计 sex === 'F'，再展示结果。
    message.info('查看选中还没完成');
  };

  return (
    <div>
      <div className="toolbar">
        <Button icon="refresh" onClick={handleRefresh}>刷新</Button>
        <Button onClick={handleShowSelected}>查看选中</Button>
      </div>
      <UserStatusBar dataSet={userDS} />
      <Table dataSet={userDS} columns={columns} />
    </div>
  );
}
````

## 文件：/Users/zhcho/Documents/study/Choero/choerodon-ui-demo/src/units/01-dataset-basics/templates/Exercise.normal.js

````js
// 【练习】员工列表：参照「样例」页的角色列表，完成下面 9 个 TODO。
// 任务说明、验收标准和思考题见同目录的 README.md。
//
// 接口：GET /mock/guide/user?page=1&pagesize=5
// 响应：{ content: [员工, ...], totalElements: 45, totalPages, size, number, ... }
// 员工：{ id, name, code, sex, age, email, active, startDate: '2019-02-01 00:00:00' }
//       sex 取值 'M' / 'F'；active 表示是否在职
import React from 'react';
import { DataSet, Table, Button, message } from 'choerodon-ui/pro';
// eslint-disable-next-line no-unused-vars -- 完成 TODO 6 时会用到，完成后可删除这行注释
import { observer } from 'mobx-react';

function createUserDataSet() {
  return new DataSet({
    // TODO 1：设置主键；每页 5 条；创建后自动查询

    // TODO 2：配置查询接口，并告诉 DataSet 列表数据和总条数分别在响应的哪个字段

    // TODO 3：定义 8 个字段（name / type / label）。
    //         想一想：active、startDate 分别该用什么 type？startDate 只需要显示日期。
    fields: [],
  });
}

// TODO 6：现在翻页、点击行时状态栏不会变化。让它在数据变化时自动刷新。
const UserStatusBar = ({ dataSet }) => {
  // TODO 7：显示「共 X 人 ｜ 当前行：姓名 ｜ 本页在职 Y 人」，没有当前行时显示「无」
  return <div className="status-bar">共 ? 人 ｜ 当前行：? ｜ 本页在职 ? 人</div>;
};

export default function Exercise() {
  // TODO 4：这样写页面也能显示，但有隐患。说说问题在哪，并改成正确写法。
  const userDS = createUserDataSet();

  // TODO 5：定义列：员工编码、姓名、性别、年龄、邮箱、在职、入职日期（不显示 id）
  const columns = [];

  const handleRefresh = () => {
    // TODO 8：重新查询当前页（不要跳回第 1 页）
  };

  const handleShowSelected = () => {
    // TODO 9：没有勾选时提示「请先勾选员工」；
    //         否则提示所有选中员工的姓名，以及其中女性（sex 为 'F'）有几人
    message.info('TODO 9 还没完成');
  };

  return (
    <div>
      <div className="toolbar">
        <Button icon="refresh" onClick={handleRefresh}>
          刷新
        </Button>
        <Button onClick={handleShowSelected}>查看选中</Button>
      </div>
      <UserStatusBar dataSet={userDS} />
      <Table dataSet={userDS} columns={columns} />
    </div>
  );
}
````

## 文件：/Users/zhcho/Documents/study/Choero/choerodon-ui-demo/src/units/01-dataset-basics/templates/Exercise.hard.js

````js
// 【练习·挑战】员工列表。接口 GET /mock/guide/user；完整契约与共同验收见 README。
import React from 'react';
import { DataSet, Table, Button } from 'choerodon-ui/pro';

function createUserDataSet() {
  // TODO 1：首次进入只查询一次；每页 5 人；正确解析员工分页响应与唯一标识。
  // TODO 2：完整定义员工字段，日期只显示年月日，布尔值显示为勾选框。
  return new DataSet({ fields: [] });
}

export default function Exercise() {
  // TODO 3：找出这种创建方式的隐患；普通重新渲染时保留数据、当前行与勾选。
  const userDS = createUserDataSet();
  // TODO 4：展示要求中的 7 个中文列，不显示 id。
  const columns = [];
  // TODO 5：实时展示总人数、当前姓名与本页在职人数，正确处理空列表。
  const status = '共 ? 人 ｜ 当前行：? ｜ 本页在职 ? 人';
  const handleRefresh = () => {
    // TODO 6：刷新当前页，保留页码。
  };
  const handleShowSelected = () => {
    // TODO 7：未选时提示；已选时展示姓名以及女性人数。
  };
  // TODO 8：额外展示本页平均年龄，保留 1 位小数；无记录时显示「—」。

  return (
    <div>
      <div className="toolbar">
        <Button onClick={handleRefresh}>刷新</Button>
        <Button onClick={handleShowSelected}>查看选中</Button>
      </div>
      <div className="status-bar">{status}</div>
      <Table dataSet={userDS} columns={columns} />
    </div>
  );
}
````

## 文件：/Users/zhcho/Documents/study/Choero/choerodon-ui-demo/src/units/01-dataset-basics/README.md

````md
# 单元 01：DataSet 基础与 Table 绑定

## 学习目标

学完本单元，你应该能不看样例，独立写出一个「从后端分页查询 → 表格展示 → 读取选中数据」的列表页。

## 核心概念

Choerodon UI Pro 的核心思想是 **数据驱动**：组件（Table、Form……）本身不保存数据，
数据、字段元信息、和后端的通信都交给 **DataSet** 管理，组件只负责把 DataSet 渲染出来。

```
后端接口 ──transport.read──▶ DataSet（records + fields） ──dataSet 属性──▶ Table
                               ▲                                           │
                               └────────── 选中、翻页、切换当前行 ◀──────────┘
```

| 概念 | 说明 |
|---|---|
| `DataSet` | 一张表的数据容器，里面有很多条 `Record` |
| `Record` | 一条记录，用 `record.get('字段名')` 取值 |
| `fields` | 字段定义。`type` 决定显示和校验方式，`label` 就是列标题 |
| `transport` | 和后端通信的配置，`read` 负责查询 |
| `dataKey` / `totalKey` | 告诉 DataSet 响应里列表和总数在哪个字段，默认是 `rows` / `total` |

## 样例怎么读

打开页面上的「样例」标签，对照 [Example.js](./Example.js) 里的「知识点 1～7」注释：

1. 翻页，观察浏览器 Network 里 `/mock/roles` 请求的 `page`、`pagesize` 参数
2. 点击表格行、勾选行，观察状态栏自动变化（知识点 6）
3. 点「查看选中」「刷新」，对照 `handleShowSelected`、`handleRefresh`

## 练习任务

打开「练习」标签和 [Exercise.js](./Exercise.js)，完成 9 个 TODO：

| TODO | 内容 | 对应样例知识点 |
|---|---|---|
| 1 | 主键、每页 5 条、自动查询 | 1 |
| 2 | 查询接口 + dataKey / totalKey | 2、3 |
| 3 | 8 个字段的 type 和 label | 4 |
| 4 | 用正确方式创建 DataSet | 5 |
| 5 | 表格列 | 4 |
| 6 | 状态栏自动刷新 | 6 |
| 7 | 状态栏内容（含本页在职人数） | 6、7 |
| 8 | 刷新当前页 | 7 |
| 9 | 查看选中姓名 + 女性人数 | 7 |

员工接口 `GET /mock/guide/user` 的每条数据：

```json
{ "id": 5, "name": "秦秀英", "code": "EMP005", "sex": "F", "age": 55,
  "email": "emp005@example.com", "active": true, "startDate": "2023-06-01 00:00:00" }
```

## 验收标准

- [ ] 表格显示 7 列，列标题是中文，不显示 id
- [ ] 每页 5 条，分页栏显示「1 - 5 / 45」，翻页后数据变化
- [ ] 「在职」列显示为勾选框，「入职日期」只显示日期、没有时分秒
- [ ] 状态栏显示总数 45；点击不同行时「当前行」跟着变；翻页后「本页在职」跟着变
- [ ] 翻到第 3 页再点「刷新」，仍然停在第 3 页
- [ ] 不勾选点「查看选中」有提示；勾选后能看到姓名和女性人数
- [ ] Network 里页面加载只发了 1 次 `/mock/guide/user` 请求

## 难度与重置练习

实际编辑的始终是本目录的 `Exercise.js`，不要改 `templates/`。
`templates/Exercise.normal.js` 原样取自 Git 提交 `0e141c0` 的原始 9 个 TODO 版本，
没有使用你正在编辑的练习。为保留原稿，normal 中原有 TODO 的源码位置和编号不调整。

```sh
yarn unit:list
yarn unit:reset 1 easy
yarn unit:reset 01 normal
yarn unit:reset 1 hard
```

每次重置会先将当前文件备份到 `.backup/01-dataset-basics/Exercise.<时间戳>.js`，
终端打印完整路径。切换难度也会覆盖练习，因此先保存编辑器中的内容。
不传难度默认 normal；未匹配任何模板时，列表显示「已改动」。比较按文件字节进行，
包括注释、空格和换行。恢复旧作业时，可把终端显示的备份文件复制回本目录的 `Exercise.js`。

三档都使用上面的共同验收标准；easy 拆小步骤，normal 保留原稿，hard 减少提示。
入门和挑战档的 TODO 对照如下（normal 仍见原对照表）：

| 入门 TODO | 内容 | 样例知识点 |
|---|---|---|
| 1、2 | 主键、分页、自动查询 | 1 |
| 3、4 | 查询与响应解析 | 2、3 |
| 5 | 字段类型和中文标签 | 4 |
| 6、7 | 响应式状态栏 | 6、7 |
| 8 | 发现重复创建的隐患 | 5 |
| 9 | 表格列 | 4 |
| 10 | 刷新当前页 | 7 |
| 11、12 | 空选中提示、姓名与女性人数 | 7 |

| 挑战 TODO | 内容 | 样例知识点 |
|---|---|---|
| 1 | 数据源、分页与请求 | 1、2、3 |
| 2、4 | 字段与列 | 4 |
| 3 | 创建方式的隐患 | 5 |
| 5 | 状态栏 | 6、7 |
| 6、7 | 刷新与读取选中 | 7 |
| 8 | 本页平均年龄 | 6、7 的延伸，样例未实现 |

## 挑战档额外需求

增加「本页平均年龄」展示，只统计当前页，保留 1 位小数；无记录时显示「—」。
不要修改 mock 数据，不要为了统计再发一个查询请求。

- [ ] 每页 5 条时，第 1 页显示 `41.0`，第 2 页显示 `36.0`；翻页后自动更新。
- [ ] 暂时关闭自动查询、刷新页面得到空表时显示「—」，不出现 `NaN` 或异常；验证后恢复自动查询。
- [ ] Network 中没有为了计算平均年龄增加请求。

## 思考题

1. 把 `totalKey` 删掉，分页栏会怎样？为什么？
2. `autoQuery` 改成 `false` 后表格是空的。不改回来，还能在哪里触发第一次查询？
3. `current` 和 `selected` 有什么区别？一条记录可能是 current 但没被 selected 吗？
4. TODO 4 里不用 `useMemo`，页面看起来也正常。什么操作会让问题暴露出来？
5. 如果不用 `observer`，要让状态栏刷新，你得怎么做？哪种更简单？

## 常见坑

- 字段 `name` 必须和后端返回的 key 完全一致，大小写也要一致
- Table 列上写的是 `editor`，不是 `edit`（下一阶段会用到）
- 修改 `mock/` 目录后要重启 `yarn start`，改 `src/` 里的代码会自动热更新

完成后告诉 Claude「单元 01 做完了，帮我检查」，我会对照验收标准帮你 review，
然后开始单元 02。
````

## 文件：/Users/zhcho/Documents/study/Choero/choerodon-ui-demo/src/units/02-query-conditions/index.js

````js
import Example from './Example';
import Exercise from './Exercise';

const unit02 = {
  key: 'unit-02',
  title: '02 查询条件',
  doc: 'src/units/02-query-conditions/README.md',
  points: [
    'queryFields 定义查询字段，queryDataSet 保存查询条件',
    'transport.read 中区分条件 data 和分页 params',
    '字段改名、去空白与空值处理',
    'Table 查询栏与 queryFieldsLimit',
    '程序设置条件、重新查询与恢复默认条件',
  ],
  Example,
  Exercise,
};

export default unit02;
````

## 文件：/Users/zhcho/Documents/study/Choero/choerodon-ui-demo/src/units/02-query-conditions/Example.js

````js
// 【样例】角色查询：先对照 Network 阅读，再完成使用员工数据的练习。
import React, { useMemo } from 'react';
import { DataSet, Table, Button } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

function createRoleDataSet() {
  return new DataSet({
    primaryKey: 'id',
    autoQuery: true,
    pageSize: 5,
    dataKey: 'content',
    totalKey: 'totalElements',

    // 知识点 1：fields 管列表，queryFields 管查询栏，两者可以使用不同的字段名。
    // roleName 是前端查询字段；后端接收的是 name。
    queryFields: [
      { name: 'roleName', type: 'string', label: '角色名称' },
      { name: 'level', type: 'string', label: '层级' },
    ],

    // 知识点 2：queryFields 会让列表自动创建 queryDataSet 和一条条件记录。
    // 条件保存在 roleDS.queryDataSet.current，与表格的 roleDS.current 无关。
    // 另一种写法是显式创建 queryDataSet 后传入；练习采用这种方式，二者不要同时配置。

    transport: {
      // 知识点 3：data 是查询条件；params 是 page / pagesize 等分页、排序参数。
      read: ({ data = {}, params }) => {
        const name = (data.roleName || '').trim();
        const level = (data.level || '').trim();
        const conditions = {};
        // 知识点 4：在传输边界改名、去除首尾空白；不要回写或直接修改条件记录。
        if (name !== '') conditions.name = name;
        if (level !== '') conditions.level = level;
        return {
          url: '/mock/roles',
          method: 'GET',
          params: { ...params, ...conditions },
          // 1.6.7 会将 GET 的 data 再合并进 params。
          // 已手动映射到 params 时清空 data，避免 roleName 和未清理值再次被带上。
          data: {},
        };
      },
    },
    fields: [
      { name: 'id', type: 'number', label: '角色ID' },
      { name: 'name', type: 'string', label: '角色名称' },
      { name: 'code', type: 'string', label: '角色编码' },
      { name: 'level', type: 'string', label: '层级' },
      { name: 'memberCount', type: 'number', label: '成员数' },
      { name: 'enabled', type: 'boolean', label: '启用' },
    ],
  });
}

// 知识点 5：状态栏读取的是「正在编辑的条件」，结果总数则来自上一次成功查询。
const QueryStatus = observer(({ dataSet }) => {
  const query = dataSet.queryDataSet.current;
  return (
    <div className="status-bar">
      待查询名称：{query.get('roleName') || '不限'} ｜ 待查询层级：{query.get('level') || '不限'}
      {' ｜ '}上次查询共 {dataSet.totalCount} 个角色 ｜ 第 {dataSet.currentPage} 页
    </div>
  );
});

export default function Example() {
  const roleDS = useMemo(createRoleDataSet, []);
  const columns = [
    { name: 'code', width: 160 },
    { name: 'name', width: 140 },
    { name: 'level', width: 140 },
    { name: 'memberCount', width: 90 },
    { name: 'enabled', width: 80 },
  ];

  // 知识点 6：设置条件不会自动请求；显式查询第 1 页，避免沿用旧条件的页码。
  const handleProject = () => {
    roleDS.queryDataSet.current.set({ roleName: undefined, level: 'project' });
    return roleDS.query(1);
  };

  // 知识点 7：reset 恢复条件初始值；查询列表仍需主动调用 query。
  const handleReset = () => {
    roleDS.queryDataSet.current.reset();
    return roleDS.query(1);
  };

  return (
    <div>
      <p>名称支持模糊匹配；层级可填 site、organization、project。修改条件后点击查询。</p>
      <div className="toolbar">
        <Button onClick={handleProject}>只看项目角色</Button>
        <Button onClick={handleReset}>恢复默认条件并查询</Button>
      </div>
      <QueryStatus dataSet={roleDS} />
      {/* 知识点 8：查询栏由查询字段自动生成，显示数量独立于表格列数。 */}
      <Table dataSet={roleDS} columns={columns} queryBar="normal" queryFieldsLimit={2} />
    </div>
  );
}
````

## 文件：/Users/zhcho/Documents/study/Choero/choerodon-ui-demo/src/units/02-query-conditions/templates/Exercise.easy.js

````js
// 【练习·入门】员工查询：逐个补齐属性或方法。共同验收见 README。
import React, { useMemo } from 'react';
import { DataSet, Table, Button, message } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

function createUserDataSet() {
  const queryDataSet = new DataSet({
    autoCreate: true,
    paging: false,
    dataKey: 'content',
    totalKey: 'totalElements',
    fields: [
      { name: 'keyword', type: 'string', label: '关键词' },
      // TODO 1：增加 active 字段，type 用 boolean，label 用「在职」。不设默认值。
      // TODO 2：增加 minAge 字段，type 用 number，label 用「最低年龄」。不设默认值。
    ],
  });

  return new DataSet({
    primaryKey: 'id',
    autoQuery: true,
    pageSize: 5,
    dataKey: 'content',
    totalKey: 'totalElements',
    queryDataSet,
    transport: {
      read: ({ data = {}, params }) => {
        // TODO 3：对字符串用 trim()，再判断是否是空条件；不要直接改 data。
        // TODO 4：把 keyword 的参数名改为 q；active、minAge 的名称保持不变。
        const conditions = {};
        Object.entries(data).forEach(([key, value]) => {
          // TODO 5：这句能运行，但 false、0 会怎样？只应排除 undefined、null、空字符串。
          if (value) conditions[key] = value;
        });
        return {
          url: '/mock/guide/user/search',
          method: 'GET',
          params: { ...params, ...conditions },
          data: {},
        };
      },
    },
    fields: [
      { name: 'id', type: 'number', label: '员工ID' },
      { name: 'code', type: 'string', label: '员工编码' },
      { name: 'name', type: 'string', label: '姓名' },
      { name: 'sex', type: 'string', label: '性别' },
      { name: 'age', type: 'number', label: '年龄' },
      { name: 'active', type: 'boolean', label: '在职' },
    ],
  });
}

const QueryStatus = observer(({ dataSet }) => {
  // TODO 6：从 dataSet.queryDataSet.current.get() 读取三个条件，替换问号。
  //         用 totalCount 显示上次查询总数。false 显示「否」，0 显示 0，空值显示「不限」。
  return <div className="status-bar">关键词：? ｜ 在职：? ｜ 最低年龄：? ｜ 上次查询共 ? 人</div>;
});

export default function Exercise() {
  const userDS = useMemo(createUserDataSet, []);
  const columns = [
    { name: 'code', width: 140 },
    { name: 'name', width: 120 },
    { name: 'sex', width: 80 },
    { name: 'age', width: 90 },
    { name: 'active', width: 80 },
  ];
  const handleInactive = () => {
    // TODO 7：对 queryDataSet.current 调用 set()：清空 keyword、active 为 false、minAge 为 0。
    // TODO 8：设置完毕后仅调用一次 userDS.query(1)。
    message.info('快捷查询还没完成');
  };
  const handleReset = () => {
    // TODO 9：对查询记录调用 reset()，再调用 userDS.query(1)。
    message.info('恢复默认条件还没完成');
  };

  // TODO 10：在这个对象补 queryBar: 'normal'、queryFieldsLimit: 3，交给 Table。
  const queryBarProps = {};
  // TODO 11：按 README 检查 Network，记录请求次数、q / active / minAge / page / pagesize。
  //          特别检查 false、0 和只有空格的关键词，并说明原来的 if(value) 为什么有隐患。

  return (
    <div>
      <p>关键词匹配姓名或编码；在职可选是、否或清空为不限；最低年龄包含边界。</p>
      <div className="toolbar">
        <Button onClick={handleInactive}>仅离职（年龄不限）</Button>
        <Button onClick={handleReset}>恢复默认条件并查询</Button>
      </div>
      <QueryStatus dataSet={userDS} />
      <Table dataSet={userDS} columns={columns} {...queryBarProps} />
    </div>
  );
}
````

## 文件：/Users/zhcho/Documents/study/Choero/choerodon-ui-demo/src/units/02-query-conditions/templates/Exercise.normal.js

````js
// 【练习·标准】员工查询：完成 7 个 TODO，知识点编号和验收见 README。
// 接口：GET /mock/guide/user/search；keyword 需映射为 q；active 与 minAge 保持原名。
import React, { useMemo } from 'react';
import { DataSet, Table, Button, message } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

function createUserDataSet() {
  // TODO 1：显式定义查询 DataSet 的 3 个字段：keyword、active、minAge。
  //         默认均不限；分别使用文本、布尔、数字类型。参照知识点 1、2。
  const queryDataSet = new DataSet({
    autoCreate: true,
    paging: false,
    dataKey: 'content',
    totalKey: 'totalElements',
    fields: [],
  });

  return new DataSet({
    primaryKey: 'id',
    autoQuery: true,
    pageSize: 5,
    dataKey: 'content',
    totalKey: 'totalElements',
    queryDataSet,
    transport: {
      read: ({ data = {}, params }) => {
        // TODO 2：完成接口参数适配，参照知识点 3、4。
        //         当前代码能查列表，但隐藏了哪些值丢失问题？说明并修正。
        //         去掉空条件和首尾空白，keyword 改名为 q，保留分页参数。
        const conditions = {};
        Object.entries(data).forEach(([key, value]) => {
          if (value) conditions[key] = value;
        });
        return {
          url: '/mock/guide/user/search',
          method: 'GET',
          params: { ...params, ...conditions },
          data: {},
        };
      },
    },
    fields: [
      { name: 'id', type: 'number', label: '员工ID' },
      { name: 'code', type: 'string', label: '员工编码' },
      { name: 'name', type: 'string', label: '姓名' },
      { name: 'sex', type: 'string', label: '性别' },
      { name: 'age', type: 'number', label: '年龄' },
      { name: 'active', type: 'boolean', label: '在职' },
    ],
  });
}

const QueryStatus = observer(({ dataSet }) => {
  // TODO 3：展示待查询的 keyword、active、minAge 和上次查询总人数，参照知识点 5。
  //         空值显示「不限」；false 显示「否」；年龄 0 应显示为 0。
  return <div className="status-bar">关键词：? ｜ 在职：? ｜ 最低年龄：? ｜ 上次查询共 ? 人</div>;
});

export default function Exercise() {
  const userDS = useMemo(createUserDataSet, []);
  const columns = [
    { name: 'code', width: 140 },
    { name: 'name', width: 120 },
    { name: 'sex', width: 80 },
    { name: 'age', width: 90 },
    { name: 'active', width: 80 },
  ];
  const handleInactive = () => {
    // TODO 4：将关键词清空，在职设为 false，最低年龄设为 0，再查询第 1 页。
    //         只发 1 次请求；参照知识点 6。
    message.info('快捷查询还没完成');
  };
  const handleReset = () => {
    // TODO 5：恢复最初的全部不限条件并查询第 1 页；参照知识点 7。
    message.info('恢复默认条件还没完成');
  };

  // TODO 6：补全 Table 配置，让查询栏直接显示全部 3 个条件；参照知识点 8。
  const queryBarProps = {};
  // TODO 7：按 README 的 Network 验收逐项检查：首次查询、翻页、空白、false、0。
  //         这是观察任务：在这里记录现象，并解释 TODO 2 的原写法为什么有隐患。

  return (
    <div>
      <p>关键词匹配姓名或编码；在职可选是、否或清空为不限；最低年龄包含边界。</p>
      <div className="toolbar">
        <Button onClick={handleInactive}>仅离职（年龄不限）</Button>
        <Button onClick={handleReset}>恢复默认条件并查询</Button>
      </div>
      <QueryStatus dataSet={userDS} />
      <Table dataSet={userDS} columns={columns} {...queryBarProps} />
    </div>
  );
}
````

## 文件：/Users/zhcho/Documents/study/Choero/choerodon-ui-demo/src/units/02-query-conditions/templates/Exercise.hard.js

````js
// 【练习·挑战】员工查询。完整接口、共同验收和挑战需求见 README。
import React, { useMemo } from 'react';
import { DataSet, Table, Button } from 'choerodon-ui/pro';

function createUserDataSet() {
  // TODO 1：提供独立的查询条件容器：关键词、是否在职、最低年龄；初始均不限。
  // TODO 2：首次只查一次，每页 5 人；展示编码、姓名、性别、年龄、在职的中文列。
  return new DataSet({
    primaryKey: 'id',
    autoQuery: true,
    pageSize: 5,
    dataKey: 'content',
    totalKey: 'totalElements',
    fields: [],
    transport: {
      read: ({ data = {}, params }) => {
        // TODO 3：修正能运行却会漏掉条件的写法；满足参数命名、空白、假值和分页契约。
        const conditions = Object.fromEntries(Object.entries(data).filter(([, value]) => value));
        return { url: '/mock/guide/user/search', method: 'GET', params: { ...params, ...conditions }, data: {} };
      },
    },
  });
}

export default function Exercise() {
  const userDS = useMemo(createUserDataSet, []);
  // TODO 4：直接展示全部 3 个查询控件，实时预览待查询条件和上次查询总数。
  const columns = [];
  const handleInactive = () => {
    // TODO 5：一次查询获取全部离职员工；清空关键词，最低年龄为 0，从第一页开始。
  };
  const handleReset = () => {
    // TODO 6：恢复最初的不限条件并回到第一页，只请求一次。
  };
  // TODO 7：记录共同验收的页面及请求观察，解释条件变化与请求时机的区别。
  const handleFemale = () => {
    // TODO 8：新增仅女性快捷筛选，不增加查询栏字段；翻页保留，恢复默认时清除。
  };

  return (
    <div>
      <div className="toolbar">
        <Button onClick={handleInactive}>仅离职（年龄不限）</Button>
        <Button onClick={handleReset}>恢复默认条件并查询</Button>
        <Button onClick={handleFemale}>仅女性</Button>
      </div>
      <div className="status-bar">待完成条件预览</div>
      <Table dataSet={userDS} columns={columns} />
    </div>
  );
}
````

## 文件：/Users/zhcho/Documents/study/Choero/choerodon-ui-demo/src/units/02-query-conditions/Exercise.js

````js
// 【练习·标准】员工查询：完成 7 个 TODO，知识点编号和验收见 README。
// 接口：GET /mock/guide/user/search；keyword 需映射为 q；active 与 minAge 保持原名。
import React, { useMemo } from 'react';
import { DataSet, Table, Button, message } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

function createUserDataSet() {
  // TODO 1：显式定义查询 DataSet 的 3 个字段：keyword、active、minAge。
  //         默认均不限；分别使用文本、布尔、数字类型。参照知识点 1、2。
  const queryDataSet = new DataSet({
    autoCreate: true,
    paging: false,
    dataKey: 'content',
    totalKey: 'totalElements',
    fields: [],
  });

  return new DataSet({
    primaryKey: 'id',
    autoQuery: true,
    pageSize: 5,
    dataKey: 'content',
    totalKey: 'totalElements',
    queryDataSet,
    transport: {
      read: ({ data = {}, params }) => {
        // TODO 2：完成接口参数适配，参照知识点 3、4。
        //         当前代码能查列表，但隐藏了哪些值丢失问题？说明并修正。
        //         去掉空条件和首尾空白，keyword 改名为 q，保留分页参数。
        const conditions = {};
        Object.entries(data).forEach(([key, value]) => {
          if (value) conditions[key] = value;
        });
        return {
          url: '/mock/guide/user/search',
          method: 'GET',
          params: { ...params, ...conditions },
          data: {},
        };
      },
    },
    fields: [
      { name: 'id', type: 'number', label: '员工ID' },
      { name: 'code', type: 'string', label: '员工编码' },
      { name: 'name', type: 'string', label: '姓名' },
      { name: 'sex', type: 'string', label: '性别' },
      { name: 'age', type: 'number', label: '年龄' },
      { name: 'active', type: 'boolean', label: '在职' },
    ],
  });
}

const QueryStatus = observer(({ dataSet }) => {
  // TODO 3：展示待查询的 keyword、active、minAge 和上次查询总人数，参照知识点 5。
  //         空值显示「不限」；false 显示「否」；年龄 0 应显示为 0。
  return <div className="status-bar">关键词：? ｜ 在职：? ｜ 最低年龄：? ｜ 上次查询共 ? 人</div>;
});

export default function Exercise() {
  const userDS = useMemo(createUserDataSet, []);
  const columns = [
    { name: 'code', width: 140 },
    { name: 'name', width: 120 },
    { name: 'sex', width: 80 },
    { name: 'age', width: 90 },
    { name: 'active', width: 80 },
  ];
  const handleInactive = () => {
    // TODO 4：将关键词清空，在职设为 false，最低年龄设为 0，再查询第 1 页。
    //         只发 1 次请求；参照知识点 6。
    message.info('快捷查询还没完成');
  };
  const handleReset = () => {
    // TODO 5：恢复最初的全部不限条件并查询第 1 页；参照知识点 7。
    message.info('恢复默认条件还没完成');
  };

  // TODO 6：补全 Table 配置，让查询栏直接显示全部 3 个条件；参照知识点 8。
  const queryBarProps = {};
  // TODO 7：按 README 的 Network 验收逐项检查：首次查询、翻页、空白、false、0。
  //         这是观察任务：在这里记录现象，并解释 TODO 2 的原写法为什么有隐患。

  return (
    <div>
      <p>关键词匹配姓名或编码；在职可选是、否或清空为不限；最低年龄包含边界。</p>
      <div className="toolbar">
        <Button onClick={handleInactive}>仅离职（年龄不限）</Button>
        <Button onClick={handleReset}>恢复默认条件并查询</Button>
      </div>
      <QueryStatus dataSet={userDS} />
      <Table dataSet={userDS} columns={columns} {...queryBarProps} />
    </div>
  );
}
````

## 文件：/Users/zhcho/Documents/study/Choero/choerodon-ui-demo/src/units/02-query-conditions/README.md

````md
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
````

## 文件：/Users/zhcho/Documents/study/Choero/choerodon-ui-demo/mock/index.js

````js
// 本地 mock 接口注册入口，由 src/setupProxy.js 在 yarn start 时加载。
// 新增接口后需要重启 dev server 才能生效。
const { filterByQuery, toPage, listRoute } = require('./utils');
const users = require('./data/users');
const roles = require('./data/roles');

module.exports = function registerMock(app) {
  // 员工列表：学习单元「练习」、自由练习区使用
  listRoute(app, '/mock/guide/user', () => users);
  // 角色列表：学习单元「样例」使用
  listRoute(app, '/mock/roles', () => roles);

  // 单元 02 员工搜索：q 同时匹配姓名和编码，minAge 表示年龄下限（包含边界）。
  // 使用独立路径，保留单元 01 和自由练习区的接口行为。
  app.get('/mock/guide/user/search', (req, res) => {
    const { q, minAge, ...query } = req.query;
    const keyword = typeof q === 'string' ? q.trim().toLowerCase() : '';
    const hasMinAge = minAge !== undefined && minAge !== '';
    const age = Number(minAge);
    if (hasMinAge && (!Number.isFinite(age) || age < 0)) {
      res.status(400).json({ message: 'minAge 必须是大于或等于 0 的数字' });
      return;
    }
    const matched = users.filter((user) => (
      (!keyword || user.name.includes(keyword) || user.code.toLowerCase().includes(keyword))
      && (!hasMinAge || user.age >= age)
    ));
    res.json(toPage(filterByQuery(matched, query), query));
  });
};
````

## 文件：/Users/zhcho/Documents/study/Choero/choerodon-ui-demo/src/units/index.js

````js
// 学习路线：按顺序一个单元一个单元学。
// 已开放的单元有 Example（样例）和 Exercise（练习）；
// 未开放的单元只有标题和知识点预告，学到时再生成代码。
import unit01 from './01-dataset-basics';
import unit02 from './02-query-conditions';

export const units = [
  unit01,
  unit02,
  {
    key: 'unit-03',
    title: '03 字段校验与值集',
    points: ['required / pattern / min / max', '自定义 validator（含异步）', 'options 下拉数据集', 'lookupCode 值集'],
  },
  {
    key: 'unit-04',
    title: '04 Form 表单',
    points: ['Form 绑定 dataSet / record', 'TextField、Select、NumberField、DatePicker', 'Output 只读展示', '表单布局 columns / colSpan'],
  },
  {
    key: 'unit-05',
    title: '05 表格编辑与提交',
    points: ['editor 行内编辑', 'buttons：新增 / 保存 / 删除', 'transport create / update / destroy', 'submit、记录状态 status、dirty'],
  },
  {
    key: 'unit-06',
    title: '06 字段联动与事件',
    points: ['dynamicProps / computedProps', 'events：load、update、select', 'cascadeMap 级联', 'record.set 联动赋值'],
  },
  {
    key: 'unit-07',
    title: '07 主从 DataSet',
    points: ['children 头行结构', '父子联动查询', '主从一起提交'],
  },
  {
    key: 'unit-08',
    title: '08 Modal 弹窗与抽屉',
    points: ['Modal.open', '弹窗内 Form 绑定 record', 'onOk 校验与提交', 'onCancel 回滚 record.reset'],
  },
  {
    key: 'unit-09',
    title: '09 全局配置与国际化',
    points: ['configure 全局配置', 'localeContext 语言包', '全局 lookup / transport 适配后端'],
  },
];
````

## 文件：/Users/zhcho/Documents/study/Choero/choerodon-ui-demo/scripts/unit.test.js

````js
// 在临时项目里验证覆盖和失败路径，绝不重置真实作业。
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

function fixture(t) {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'choerodon-unit-')));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, 'scripts'));
  fs.copyFileSync(path.join(__dirname, 'unit.js'), path.join(root, 'scripts/unit.js'));
  const directory = path.join(root, 'src/units/02-query-conditions');
  fs.mkdirSync(path.join(directory, 'templates'), { recursive: true });
  fs.writeFileSync(path.join(root, 'src/units/index.js'), "export const units = [{ key: 'unit-03', title: '03 字段校验' }];");
  fs.writeFileSync(path.join(directory, 'index.js'), "export default { key: 'unit-02', title: '02 查询条件' };");
  for (const difficulty of ['easy', 'normal', 'hard']) {
    fs.writeFileSync(path.join(directory, 'templates', `Exercise.${difficulty}.js`), `// ${difficulty}\n`);
  }
  const exercise = path.join(directory, 'Exercise.js');
  fs.writeFileSync(exercise, '// 用户已保存的作业\n');
  const run = (...args) => spawnSync(process.execPath, [path.join(root, 'scripts/unit.js'), ...args], { cwd: os.tmpdir(), encoding: 'utf8' });
  return { root, directory, exercise, run };
}

test('默认 normal，支持 2 / 02，覆盖前保留每一份原文件并打印路径', (t) => {
  const { root, exercise, run } = fixture(t);
  for (const [number, difficulty] of [['2', undefined], ['02', 'easy'], ['2', 'hard']]) {
    const previous = fs.readFileSync(exercise);
    const result = run('reset', number, ...(difficulty ? [difficulty] : []));
    assert.equal(result.status, 0, result.stderr);
    const backup = result.stdout.match(/已备份：(.+)\n/)[1];
    assert.ok(backup.startsWith(path.join(root, '.backup/02-query-conditions/Exercise.')));
    assert.deepEqual(fs.readFileSync(backup), previous);
    assert.equal(fs.readFileSync(exercise, 'utf8'), `// ${difficulty || 'normal'}\n`);
  }
  assert.equal(fs.readdirSync(path.join(root, '.backup/02-query-conditions')).length, 3);
});

test('list 区分模板、已改动和未开放，不修改练习', (t) => {
  const { exercise, run } = fixture(t);
  const before = fs.readFileSync(exercise);
  let result = run('list');
  assert.equal(result.status, 0);
  assert.match(result.stdout, /easy \/ normal \/ hard.*已改动/);
  assert.match(result.stdout, /03 字段校验.*未开放/);
  assert.deepEqual(fs.readFileSync(exercise), before);
  assert.equal(run('reset', '02', 'hard').status, 0);
  result = run('list');
  assert.match(result.stdout, /与 hard 模板一致/);
});

test('未知单元、错误难度、非法参数均报中文错误且不覆盖', (t) => {
  const { exercise, run } = fixture(t);
  const before = fs.readFileSync(exercise);
  for (const args of [[], ['reset'], ['reset', '99'], ['reset', '03'], ['reset', '../2'], ['reset', '2', 'expert'], ['list', '2']]) {
    const result = run(...args);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /单元工具错误/);
    assert.deepEqual(fs.readFileSync(exercise), before);
  }
});

test('模板缺失时不备份、不覆盖', (t) => {
  const { root, directory, exercise, run } = fixture(t);
  const before = fs.readFileSync(exercise);
  fs.unlinkSync(path.join(directory, 'templates/Exercise.hard.js'));
  const result = run('reset', '2', 'hard');
  assert.equal(result.status, 1);
  assert.match(result.stderr, /找不到 hard 模板/);
  assert.deepEqual(fs.readFileSync(exercise), before);
  assert.equal(fs.existsSync(path.join(root, '.backup')), false);
});

test('备份失败时终止，Exercise.js 完全保留', (t) => {
  const { root, exercise, run } = fixture(t);
  fs.writeFileSync(path.join(root, '.backup'), '这里是文件，不能创建备份目录');
  const before = fs.readFileSync(exercise);
  const result = run('reset', '2');
  assert.equal(result.status, 1);
  assert.match(result.stderr, /单元工具错误/);
  assert.deepEqual(fs.readFileSync(exercise), before);
});

test('Exercise.js 缺失时可从模板创建', (t) => {
  const { exercise, run } = fixture(t);
  fs.unlinkSync(exercise);
  const result = run('reset', '2');
  assert.equal(result.status, 0);
  assert.match(result.stdout, /无需备份/);
  assert.equal(fs.readFileSync(exercise, 'utf8'), '// normal\n');
});
````

## 文件：/Users/zhcho/Documents/study/Choero/choerodon-ui-demo/src/units/templates.test.js

````js
import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import dataSetAxios from 'choerodon-ui/dataset/axios';
import Unit01Easy from './01-dataset-basics/templates/Exercise.easy';
import Unit01Normal from './01-dataset-basics/templates/Exercise.normal';
import Unit01Hard from './01-dataset-basics/templates/Exercise.hard';
import Unit02Easy from './02-query-conditions/templates/Exercise.easy';
import Unit02Normal from './02-query-conditions/templates/Exercise.normal';
import Unit02Hard from './02-query-conditions/templates/Exercise.hard';

const originalAdapter = dataSetAxios.defaults.adapter;
let adapter;

beforeEach(() => {
  // 只替换 HTTP 层，DataSet / Table / MobX 与模板均使用真实实现。
  adapter = jest.fn(async (config) => ({
    config,
    status: 200,
    statusText: 'OK',
    headers: {},
    data: { content: [], totalElements: 0, totalPages: 0, size: 5, number: 0, numberOfElements: 0, empty: true },
  }));
  dataSetAxios.defaults.adapter = adapter;
});

afterEach(() => {
  dataSetAxios.defaults.adapter = originalAdapter;
});

test.each([
  ['01 easy', Unit01Easy],
  ['01 normal', Unit01Normal],
  ['01 hard', Unit01Hard],
])('%s：未完成 TODO 时可以渲染且不意外查询', async (_, Exercise) => {
  await act(async () => { render(<Exercise />); });
  expect(screen.getByRole('button', { name: '查看选中' })).toBeInTheDocument();
  expect(adapter).not.toHaveBeenCalled();
});

test.each([
  ['02 easy', Unit02Easy],
  ['02 normal', Unit02Normal],
  ['02 hard', Unit02Hard],
])('%s：未完成 TODO 时可以渲染，初始仅查询一次第一页', async (_, Exercise) => {
  render(<Exercise />);
  expect(screen.getByRole('button', { name: '仅离职（年龄不限）' })).toBeInTheDocument();
  await waitFor(() => expect(adapter).toHaveBeenCalledTimes(1));
  const config = adapter.mock.calls[0][0];
  expect(config.url).toBe('/mock/guide/user/search');
  expect(config.method).toBe('get');
  expect(config.params).toEqual({ page: 1, pagesize: 5 });
});
````

