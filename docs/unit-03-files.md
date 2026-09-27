# 单元 03：逐文件完整内容

本文件列出本次新增或修改的全部源文件、测试和验证记录；每个代码块都是完整内容，使用绝对路径。
仅交付单元 03；04～09 等用户回复「继续」后逐个生成。练习答案未提供。

## 文件：/Users/zhcho/Documents/study/Choero/choerodon-ui-demo/src/units/03-validation-lookups/index.js

````js
import Example from './Example';
import Exercise from './Exercise';

const unit03 = {
  key: 'unit-03',
  title: '03 字段校验与值集',
  doc: 'src/units/03-validation-lookups/README.md',
  points: [
    'required、pattern、min / max 与 defaultValidationMessages',
    '同步和异步 validator：返回值与异常处理',
    'options 下拉 DataSet：显示文本与实际值',
    'lookupCode 与字段级 lookupAxiosConfig',
    '等待 validate()，区分校验通过与保存成功',
  ],
  Example,
  Exercise,
};

export default unit03;
````

## 文件：/Users/zhcho/Documents/study/Choero/choerodon-ui-demo/src/units/03-validation-lookups/Example.js

````js
// 【样例】角色草稿：只校验，不提交。表单是现成容器，本单元重点阅读 fields。
import React, { useMemo, useState } from 'react';
import { DataSet, Form, TextField, NumberField, Select, Button } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

const CODE_PATTERN = /^[a-z][a-z0-9-]{2,19}$/;

export function createRoleDataSet() {
  // 知识点 1：options 本身也是 DataSet；它只保存选项，不代表待编辑的角色。
  // 工厂整体由 useMemo 调用，因此这里的两个 DataSet 都只在本次挂载时创建。
  const levelOptions = new DataSet({
    paging: false,
    dataKey: 'content',
    totalKey: 'totalElements',
    fields: [
      { name: 'value', type: 'string', label: '编码' },
      { name: 'meaning', type: 'string', label: '名称' },
    ],
    data: [
      { value: 'site', meaning: '平台' },
      { value: 'organization', meaning: '租户' },
      { value: 'project', meaning: '项目' },
    ],
  });

  return new DataSet({
    autoCreate: true,
    paging: false,
    dataKey: 'content',
    totalKey: 'totalElements',
    fields: [
      {
        name: 'name', type: 'string', label: '角色名称',
        // 知识点 2：规则写在 fields；消息的键是 valueMissing，不是 required。
        required: true,
        defaultValidationMessages: { valueMissing: '请输入角色名称' },
        // 知识点 3：同步 validator 返回 true 代表通过，返回中文字符串代表失败。
        // 空值交给 required；避免给一个问题提供两套冲突提示。
        validator: (value) => !value || value.trim().length >= 2 || '角色名称至少需要两个字符',
      },
      {
        name: 'code', type: 'string', label: '角色编码',
        // 知识点 4：pattern 约束整个编码，不要给正则加 g，否则 test 会保留游标。
        required: true,
        pattern: CODE_PATTERN,
        defaultValidationMessages: {
          valueMissing: '请输入角色编码',
          patternMismatch: '编码须为 3～20 位，以小写字母开头，仅含小写字母、数字和短横线',
        },
        // 知识点 5：1.6.7 会等待 validator 的 Promise；网络失败也必须给出失败消息。
        validator: async (value) => {
          if (!value || !CODE_PATTERN.test(value)) return true;
          try {
            const response = await fetch(`/mock/unit-03/roles/check-code?code=${encodeURIComponent(value)}`);
            if (!response.ok) return '编码校验服务暂不可用，请稍后重试';
            const result = await response.json();
            if (typeof result.available !== 'boolean') return '编码校验响应不正确，请稍后重试';
            return result.available || '角色编码已存在';
          } catch (error) {
            return '编码校验请求失败，请检查本地服务';
          }
        },
      },
      {
        name: 'memberLimit', type: 'number', label: '成员上限', defaultValue: 10,
        // 知识点 6：number 的 min / max 是数值边界，不是字符串长度。
        required: true, min: 1, max: 100,
        defaultValidationMessages: {
          valueMissing: '请输入成员上限',
          rangeUnderflow: '成员上限不能小于 1',
          rangeOverflow: '成员上限不能大于 100',
        },
      },
      {
        name: 'level', type: 'string', label: '层级', required: true,
        // 知识点 7：Select 显示 meaning，记录保存 value；可观察下方的实际编码。
        options: levelOptions, textField: 'meaning', valueField: 'value',
      },
      {
        name: 'visibility', type: 'string', label: '可见范围', required: true,
        // 知识点 8：字段级 lookup 配置，不调用全局 configure。
        lookupCode: 'U03.ROLE_VISIBILITY',
        lookupUrl: (code) => `/mock/unit-03/lookups/${encodeURIComponent(code)}`,
        textField: 'meaning', valueField: 'value',
        // 用函数返回普通配置，避免 MobX 4 把 transformResponse 数组转成 ObservableArray。
        lookupAxiosConfig: () => ({
          method: 'GET',
          // LookupCodeStore 使用配置上下文的 dataKey，并不直接使用列表的 dataKey 属性。
          // 在字段的 Axios 响应转换中取出 content，交给 1.6.7 支持的数组解析分支。
          transformResponse: [(body) => {
            const payload = typeof body === 'string' ? JSON.parse(body) : body;
            // 1.6.7 的缓存适配器可能复用已转换的响应，重复转换时也保留数组。
            return Array.isArray(payload) ? payload : payload.content;
          }],
        }),
      },
    ],
  });
}

const RoleValues = observer(({ dataSet }) => (
  <div className="status-bar">
    实际层级编码：{dataSet.current.get('level') || '未选择'} ｜
    实际可见范围编码：{dataSet.current.get('visibility') || '未选择'}
  </div>
));

export default function Example() {
  const roleDS = useMemo(createRoleDataSet, []);
  const [result, setResult] = useState('尚未校验');
  const [checking, setChecking] = useState(false);

  // 知识点 9：validate() 返回 Promise<boolean>，必须等待；校验通过并没有保存角色。
  const handleValidate = async () => {
    setChecking(true);
    setResult('正在校验，请等待');
    try {
      const valid = await roleDS.validate();
      setResult(valid ? '校验通过（尚未保存）' : '校验未通过，请检查字段提示');
    } catch (error) {
      setResult('校验未完成，请检查本地服务后重试');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div>
      <p>试试重复编码 site-admin、可用编码 learning-role。这里不会创建角色。</p>
      <Form dataSet={roleDS} columns={2}>
        <TextField name="name" />
        <TextField name="code" />
        <NumberField name="memberLimit" />
        <Select name="level" />
        <Select name="visibility" />
      </Form>
      <div className="toolbar">
        <Button onClick={handleValidate} loading={checking}>校验角色草稿</Button>
      </div>
      <p role="status">{result}</p>
      <RoleValues dataSet={roleDS} />
    </div>
  );
}
````

## 文件：/Users/zhcho/Documents/study/Choero/choerodon-ui-demo/src/units/03-validation-lookups/Exercise.js

````js
// 【练习·标准】员工草稿：只校验，不提交；请先阅读 README 的共同验收。
import React, { useMemo, useState } from 'react';
import { DataSet, Form, TextField, NumberField, Select, Button } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

// TODO 1：让六个字段必填，自定义姓名、编码的空值提示。参照知识点 2。
// TODO 2：员工编码是 EMP 加三位数字；邮箱先检查基本格式并提供中文提示。参照知识点 4。
// TODO 3：年龄限制在 18～60，定制上下界消息。参照知识点 6。
// TODO 4：邮箱还必须等于「员工编码的小写形式@example.com」；空值交给必填校验。
//         用同步 validator 实现，不改写输入值。参照知识点 3；跨字段读取是变化点。
// TODO 5：编码接入员工查重接口；格式不合格不请求；重复和请求失败都不能通过。参照知识点 5。
// TODO 6：补齐性别选项 M / F，显示男 / 女，实际保存编码。参照知识点 1、7。
// TODO 7：用字段级配置接入 U03.EMPLOYMENT_TYPE，适配 content；不改全局配置。参照知识点 8。
// TODO 8：handleValidate 能运行却提前宣告通过。解释原因并修正，处理等待、失败和异常。参照知识点 9。

function createEmployeeDataSet() {
  const sexOptions = new DataSet({
    paging: false,
    dataKey: 'content',
    totalKey: 'totalElements',
    fields: [
      { name: 'value', type: 'string', label: '编码' },
      { name: 'meaning', type: 'string', label: '名称' },
    ],
    data: [],
  });
  return new DataSet({
    autoCreate: true,
    paging: false,
    dataKey: 'content',
    totalKey: 'totalElements',
    fields: [
      { name: 'name', type: 'string', label: '姓名' },
      { name: 'code', type: 'string', label: '员工编码' },
      { name: 'age', type: 'number', label: '年龄' },
      { name: 'email', type: 'string', label: '邮箱' },
      { name: 'sex', type: 'string', label: '性别', options: sexOptions },
      { name: 'employmentType', type: 'string', label: '用工类型' },
    ],
  });
}

const EmployeeValues = observer(({ dataSet }) => (
  <div className="status-bar">
    实际性别编码：{dataSet.current.get('sex') || '未选择'} ｜
    实际用工类型编码：{dataSet.current.get('employmentType') || '未选择'}
  </div>
));

export default function Exercise() {
  const employeeDS = useMemo(createEmployeeDataSet, []);
  const [result, setResult] = useState('尚未校验，请完成 TODO');
  const handleValidate = () => {
    // 故意保留的隐患：不要把这个判断直接当成验收通过。
    const valid = employeeDS.validate();
    if (valid) setResult('骨架提前显示通过，请修正校验判断');
  };

  return (
    <div>
      <p>员工校验与值集待完成；本单元不保存数据。</p>
      <Form dataSet={employeeDS} columns={2}>
        <TextField name="name" />
        <TextField name="code" />
        <NumberField name="age" />
        <TextField name="email" />
        <Select name="sex" />
        <Select name="employmentType" />
      </Form>
      <div className="toolbar">
        <Button onClick={handleValidate}>校验员工草稿</Button>
      </div>
      <p role="status">{result}</p>
      <EmployeeValues dataSet={employeeDS} />
    </div>
  );
}
````

## 文件：/Users/zhcho/Documents/study/Choero/choerodon-ui-demo/src/units/03-validation-lookups/README.md

````markdown
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
````

## 文件：/Users/zhcho/Documents/study/Choero/choerodon-ui-demo/src/units/03-validation-lookups/templates/Exercise.easy.js

````js
// 【练习·入门】员工草稿：按编号补齐属性；表单容器已提供。
import React, { useMemo, useState } from 'react';
import { DataSet, Form, TextField, NumberField, Select, Button } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

// TODO 1：六个字段都补 required: true。
// TODO 2：姓名、编码补 defaultValidationMessages.valueMissing，内容见 README。
// TODO 3：code 用 pattern 限制为 EMP 加三位数字；用 patternMismatch 写格式提示。
// TODO 4：age 补 min: 18、max: 60，定制 rangeUnderflow / rangeOverflow。
// TODO 5：email 补基本邮箱 pattern；不要只凭包含 @ 就认为邮箱合法。
// TODO 6：email 的 validator(value, name, record) 用 record.get('code') 检查邮箱和编码的关系。
//         正确时返回 true，错误时返回中文字符串；空值交给 required。
// TODO 7：code 的 async validator 调用 /mock/unit-03/employees/check-code?code=...。
//         先跳过空值和格式错误；检查 response.ok 和 available；catch 返回失败消息。
// TODO 8：sexOptions.data 补 F / 女；sex 字段补 textField / valueField。
// TODO 9：employmentType 补 lookupCode: 'U03.EMPLOYMENT_TYPE' 和字段级 lookupUrl。
// TODO 10：lookupAxiosConfig 用函数返回 GET 配置，并用 transformResponse 提取 content，兼容已转换的数组。
// TODO 11：下面 validate() 返回的是什么？为 handleValidate 增加 async / await 和异常处理。
//          等待期间显示「正在校验」，结束后区分 true / false；不要写成保存成功。

function createEmployeeDataSet() {
  const sexOptions = new DataSet({
    paging: false,
    dataKey: 'content',
    totalKey: 'totalElements',
    fields: [
      { name: 'value', type: 'string', label: '编码' },
      { name: 'meaning', type: 'string', label: '名称' },
    ],
    data: [{ value: 'M', meaning: '男' }],
  });
  return new DataSet({
    autoCreate: true,
    paging: false,
    dataKey: 'content',
    totalKey: 'totalElements',
    fields: [
      { name: 'name', type: 'string', label: '姓名' },
      { name: 'code', type: 'string', label: '员工编码' },
      { name: 'age', type: 'number', label: '年龄' },
      { name: 'email', type: 'string', label: '邮箱' },
      { name: 'sex', type: 'string', label: '性别', options: sexOptions },
      { name: 'employmentType', type: 'string', label: '用工类型' },
    ],
  });
}

const EmployeeValues = observer(({ dataSet }) => (
  <div className="status-bar">
    实际性别编码：{dataSet.current.get('sex') || '未选择'} ｜
    实际用工类型编码：{dataSet.current.get('employmentType') || '未选择'}
  </div>
));

export default function Exercise() {
  const employeeDS = useMemo(createEmployeeDataSet, []);
  const [result, setResult] = useState('尚未校验，请完成 TODO');
  const handleValidate = () => {
    const valid = employeeDS.validate();
    if (valid) setResult('骨架提前显示通过，请修正校验判断');
  };

  return (
    <div>
      <p>先配置 fields，再验证；本单元不保存数据。</p>
      <Form dataSet={employeeDS} columns={2}>
        <TextField name="name" />
        <TextField name="code" />
        <NumberField name="age" />
        <TextField name="email" />
        <Select name="sex" />
        <Select name="employmentType" />
      </Form>
      <div className="toolbar">
        <Button onClick={handleValidate}>校验员工草稿</Button>
      </div>
      <p role="status">{result}</p>
      <EmployeeValues dataSet={employeeDS} />
    </div>
  );
}
````

## 文件：/Users/zhcho/Documents/study/Choero/choerodon-ui-demo/src/units/03-validation-lookups/templates/Exercise.normal.js

````js
// 【练习·标准】员工草稿：只校验，不提交；请先阅读 README 的共同验收。
import React, { useMemo, useState } from 'react';
import { DataSet, Form, TextField, NumberField, Select, Button } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

// TODO 1：让六个字段必填，自定义姓名、编码的空值提示。参照知识点 2。
// TODO 2：员工编码是 EMP 加三位数字；邮箱先检查基本格式并提供中文提示。参照知识点 4。
// TODO 3：年龄限制在 18～60，定制上下界消息。参照知识点 6。
// TODO 4：邮箱还必须等于「员工编码的小写形式@example.com」；空值交给必填校验。
//         用同步 validator 实现，不改写输入值。参照知识点 3；跨字段读取是变化点。
// TODO 5：编码接入员工查重接口；格式不合格不请求；重复和请求失败都不能通过。参照知识点 5。
// TODO 6：补齐性别选项 M / F，显示男 / 女，实际保存编码。参照知识点 1、7。
// TODO 7：用字段级配置接入 U03.EMPLOYMENT_TYPE，适配 content；不改全局配置。参照知识点 8。
// TODO 8：handleValidate 能运行却提前宣告通过。解释原因并修正，处理等待、失败和异常。参照知识点 9。

function createEmployeeDataSet() {
  const sexOptions = new DataSet({
    paging: false,
    dataKey: 'content',
    totalKey: 'totalElements',
    fields: [
      { name: 'value', type: 'string', label: '编码' },
      { name: 'meaning', type: 'string', label: '名称' },
    ],
    data: [],
  });
  return new DataSet({
    autoCreate: true,
    paging: false,
    dataKey: 'content',
    totalKey: 'totalElements',
    fields: [
      { name: 'name', type: 'string', label: '姓名' },
      { name: 'code', type: 'string', label: '员工编码' },
      { name: 'age', type: 'number', label: '年龄' },
      { name: 'email', type: 'string', label: '邮箱' },
      { name: 'sex', type: 'string', label: '性别', options: sexOptions },
      { name: 'employmentType', type: 'string', label: '用工类型' },
    ],
  });
}

const EmployeeValues = observer(({ dataSet }) => (
  <div className="status-bar">
    实际性别编码：{dataSet.current.get('sex') || '未选择'} ｜
    实际用工类型编码：{dataSet.current.get('employmentType') || '未选择'}
  </div>
));

export default function Exercise() {
  const employeeDS = useMemo(createEmployeeDataSet, []);
  const [result, setResult] = useState('尚未校验，请完成 TODO');
  const handleValidate = () => {
    // 故意保留的隐患：不要把这个判断直接当成验收通过。
    const valid = employeeDS.validate();
    if (valid) setResult('骨架提前显示通过，请修正校验判断');
  };

  return (
    <div>
      <p>员工校验与值集待完成；本单元不保存数据。</p>
      <Form dataSet={employeeDS} columns={2}>
        <TextField name="name" />
        <TextField name="code" />
        <NumberField name="age" />
        <TextField name="email" />
        <Select name="sex" />
        <Select name="employmentType" />
      </Form>
      <div className="toolbar">
        <Button onClick={handleValidate}>校验员工草稿</Button>
      </div>
      <p role="status">{result}</p>
      <EmployeeValues dataSet={employeeDS} />
    </div>
  );
}
````

## 文件：/Users/zhcho/Documents/study/Choero/choerodon-ui-demo/src/units/03-validation-lookups/templates/Exercise.hard.js

````js
// 【练习·挑战】员工草稿。规则、接口和共同验收见 README。
import React, { useMemo, useState } from 'react';
import { DataSet, Form, TextField, NumberField, Select, Button } from 'choerodon-ui/pro';

// TODO 1：六个字段必填；编码、邮箱满足格式约定；年龄 18～60；提示用中文。
// TODO 2：邮箱与员工编码一致，改变编码后再次校验也必须发现不一致。
// TODO 3：服务端判断编码是否可用，格式错误不请求；重复和服务故障不能放行。
// TODO 4：性别来自本地选项，用工类型来自本地值集；显示文本、保存编码，不影响其他单元。
// TODO 5：修正下面能运行却提前判定通过的逻辑；显示等待和最终结果，异常后仍可重试。
// TODO 6：实时展示两个选择字段的实际编码，完成共同验收中的请求观察。
// TODO 7：增加模拟历史数据操作，写入已失效用工类型 LEGACY；校验必须阻止，重新选择合法值后恢复。

function createEmployeeDataSet() {
  return new DataSet({
    autoCreate: true,
    paging: false,
    dataKey: 'content',
    totalKey: 'totalElements',
    fields: [
      { name: 'name', type: 'string', label: '姓名' },
      { name: 'code', type: 'string', label: '员工编码' },
      { name: 'age', type: 'number', label: '年龄' },
      { name: 'email', type: 'string', label: '邮箱' },
      { name: 'sex', type: 'string', label: '性别' },
      { name: 'employmentType', type: 'string', label: '用工类型' },
    ],
  });
}

export default function Exercise() {
  const employeeDS = useMemo(createEmployeeDataSet, []);
  const [result, setResult] = useState('尚未校验，请完成 TODO');
  const handleValidate = () => {
    const valid = employeeDS.validate();
    if (valid) setResult('骨架提前显示通过，请修正校验判断');
  };
  const handleLegacy = () => {};

  return (
    <div>
      <Form dataSet={employeeDS} columns={2}>
        <TextField name="name" />
        <TextField name="code" />
        <NumberField name="age" />
        <TextField name="email" />
        <Select name="sex" />
        <Select name="employmentType" />
      </Form>
      <div className="toolbar">
        <Button onClick={handleValidate}>校验员工草稿</Button>
        <Button onClick={handleLegacy}>模拟历史用工类型</Button>
      </div>
      <p role="status">{result}</p>
      <div className="status-bar">实际性别编码：? ｜ 实际用工类型编码：?</div>
    </div>
  );
}
````

## 文件：/Users/zhcho/Documents/study/Choero/choerodon-ui-demo/mock/unit03.js

````js
// 单元 03 只提供值集和校验，不写入员工或角色数据。
const { toPage } = require('./utils');
const roles = require('./data/roles');
const users = require('./data/users');

const lookups = {
  'U03.ROLE_VISIBILITY': [
    { value: 'INTERNAL', meaning: '内部可见' },
    { value: 'PUBLIC', meaning: '公开可见' },
  ],
  'U03.EMPLOYMENT_TYPE': [
    { value: 'FULL_TIME', meaning: '全职' },
    { value: 'PART_TIME', meaning: '兼职' },
    { value: 'INTERN', meaning: '实习' },
  ],
};

module.exports = function registerUnit03(app) {
  app.get('/mock/unit-03/lookups/:code', (req, res) => {
    const values = lookups[req.params.code];
    if (!values) {
      res.status(404).json({ message: '找不到单元 03 值集' });
      return;
    }
    // 小值集一次返回全部；仍遵守现有 Spring Page 响应结构。
    res.json(toPage(values, { page: 1, pagesize: values.length }));
  });

  // 延迟 250ms，便于观察「异步校验完成前不能宣告通过」。
  function checkCode(list, pattern, failureCode) {
    return (req, res) => {
      const code = typeof req.query.code === 'string' ? req.query.code.trim() : '';
      if (!pattern.test(code)) {
        res.status(400).json({ message: '编码格式不正确' });
        return;
      }
      setTimeout(() => {
        if (code === failureCode) {
          res.status(503).json({ message: '单元 03 模拟校验服务暂不可用' });
          return;
        }
        res.json({ available: !list.some((item) => item.code === code) });
      }, 250);
    };
  }

  app.get('/mock/unit-03/roles/check-code', checkCode(roles, /^[a-z][a-z0-9-]{2,19}$/, 'service-down'));
  app.get('/mock/unit-03/employees/check-code', checkCode(users, /^EMP\d{3}$/, 'EMP503'));
};
````

## 文件：/Users/zhcho/Documents/study/Choero/choerodon-ui-demo/mock/index.js

````js
// 本地 mock 接口注册入口，由 src/setupProxy.js 在 yarn start 时加载。
// 新增接口后需要重启 dev server 才能生效。
const { filterByQuery, toPage, listRoute } = require('./utils');
const users = require('./data/users');
const roles = require('./data/roles');
const registerUnit03 = require('./unit03');

module.exports = function registerMock(app) {
  registerUnit03(app);
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
import unit03 from './03-validation-lookups';

export const units = [
  unit01,
  unit02,
  unit03,
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
import Unit03Easy from './03-validation-lookups/templates/Exercise.easy';
import Unit03Normal from './03-validation-lookups/templates/Exercise.normal';
import Unit03Hard from './03-validation-lookups/templates/Exercise.hard';

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

test.each([
  ['03 easy', Unit03Easy],
  ['03 normal', Unit03Normal],
  ['03 hard', Unit03Hard],
])('%s：原始模板可渲染和点击，且不发未配置的请求', async (_, Exercise) => {
  const errors = jest.spyOn(console, 'error');
  try {
    render(<Exercise />);
    const button = screen.getByRole('button', { name: '校验员工草稿' });
    await act(async () => { button.click(); });
    expect(screen.getByRole('status')).toHaveTextContent('骨架提前显示通过');
    expect(adapter).not.toHaveBeenCalled();
    expect(errors).not.toHaveBeenCalled();
  } finally {
    errors.mockRestore();
  }
});
````

## 文件：/Users/zhcho/Documents/study/Choero/choerodon-ui-demo/src/units/03-validation-lookups/Example.test.js

````js
import dataSetAxios from 'choerodon-ui/dataset/axios';

const originalAdapter = dataSetAxios.defaults.adapter;
const originalFetch = global.fetch;
let createRoleDataSet;
let lookupRequests;

beforeAll(() => {
  lookupRequests = [];
  // 在加载 Pro 的 LookupCodeStore 之前替换 HTTP 适配器，保留真实字段和解析逻辑。
  dataSetAxios.defaults.adapter = async (config) => {
    lookupRequests.push(config);
    return {
      config, status: 200, statusText: 'OK', headers: {},
      data: JSON.stringify({ content: [{ value: 'INTERNAL', meaning: '内部可见' }], totalElements: 1 }),
    };
  };
  ({ createRoleDataSet } = require('./Example'));
});

beforeEach(() => {
  global.fetch = jest.fn(async () => ({ ok: true, json: async () => ({ available: true }) }));
});

afterAll(() => {
  dataSetAxios.defaults.adapter = originalAdapter;
  global.fetch = originalFetch;
});

test('真实 options 与字段级 lookup 能解析显示文本，保留编码', async () => {
  const ds = createRoleDataSet();
  const field = ds.getField('visibility');
  await field.fetchLookup();
  expect(field.getLookupText('INTERNAL')).toBe('内部可见');
  expect(lookupRequests.some((config) => config.url.endsWith('/U03.ROLE_VISIBILITY') && config.method === 'get')).toBe(true);
  expect(ds.getField('level').get('options').get(2).get('value')).toBe('project');
  expect(global.fetch).not.toHaveBeenCalled();
});

test('必填、同步业务规则、格式与数值边界使用真实 1.6.7 校验', async () => {
  const ds = createRoleDataSet();
  const name = ds.getField('name');
  expect(await name.checkValidity(ds.current)).toBe(false);
  expect(name.getValidationMessage(ds.current)).toBe('请输入角色名称');
  ds.current.set('name', '角');
  expect(await name.checkValidity(ds.current)).toBe(false);
  expect(name.getValidationMessage(ds.current)).toBe('角色名称至少需要两个字符');
  ds.current.set('name', '学习角色');
  expect(await name.checkValidity(ds.current)).toBe(true);

  ds.current.set('code', 'Bad!');
  expect(await ds.getField('code').checkValidity(ds.current)).toBe(false);
  expect(global.fetch).not.toHaveBeenCalled();
  for (const [value, valid] of [[0, false], [101, false], [1, true], [100, true]]) {
    ds.current.set('memberLimit', value);
    expect(await ds.getField('memberLimit').checkValidity(ds.current)).toBe(valid);
  }
});

test('重复编码与 HTTP / 网络故障均校验失败，可用编码通过', async () => {
  const ds = createRoleDataSet();
  const validator = ds.getField('code').get('validator');
  global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ available: false }) });
  expect(await validator('site-admin')).toBe('角色编码已存在');
  global.fetch.mockResolvedValueOnce({ ok: false });
  expect(await validator('service-down')).toBe('编码校验服务暂不可用，请稍后重试');
  global.fetch.mockRejectedValueOnce(new Error('测试网络中断'));
  expect(await validator('learning-role')).toBe('编码校验请求失败，请检查本地服务');
  expect(await validator('learning-role')).toBe(true);
});

test('整表 validate 等待异步编码结果，返回布尔值', async () => {
  const ds = createRoleDataSet();
  ds.current.set({ name: '学习角色', code: 'learning-role', memberLimit: 10, level: 'project', visibility: 'INTERNAL' });
  let finishRequest;
  global.fetch.mockImplementation(() => new Promise((resolve) => { finishRequest = resolve; }));
  let settled = false;
  const validation = ds.validate().then((valid) => { settled = true; return valid; });
  // 等待 DataSet 准备字段和值集；不把是否返回 Promise 当作校验成功。
  for (let attempt = 0; !finishRequest && attempt < 50; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  expect(finishRequest).toBeDefined();
  expect(settled).toBe(false);
  finishRequest({ ok: true, json: async () => ({ available: true }) });
  expect(await validation).toBe(true);
});
````

## 文件：/Users/zhcho/Documents/study/Choero/choerodon-ui-demo/docs/unit-03-verification.md

````markdown
# 单元 03 交付与验证记录

本次只开放 03 字段校验与值集。04～09 等用户回复「继续」后依次生成；
汇总文件 `docs/units-03-09-verification.md` 留到全部单元完成时输出。
逐文件完整内容与绝对路径见 [unit-03-files.md](./unit-03-files.md)。

## 输入与保护边界

本轮消息未提供可读取的压缩包附件，以当前工作区的现有文件为准。
已阅读 01/02 的结构、样例、模板、README、注册表、UnitPage、重置脚本及测试、mock 和前次验证记录。

- 01/02 的全部文件、playground、入口、package.json、yarn.lock、重置脚本及其测试等共 26 个文件，SHA-256 与本轮开始前一致。
- 03 的 Exercise.js 与 normal 模板逐字节一致；三档均保留 TODO，没有给出员工练习答案。
- mock/index.js 只增加新模块的导入与注册；旧路由内容逐字节核对未改，旧接口真实请求回归通过。
- 单元 03 仅使用 GET 校验 / 值集接口，不保存草稿，也不修改角色和员工种子。
- 没有 configure 调用、样式或语言包重复导入、StrictMode、依赖增改。
- 没有对 04～09 生成实现文件。

## 与新要求的差异

现有 01 模板包含故意未用 useMemo 的 TODO；按保护要求原样保留，03 中的 DataSet 均由 useMemo 的工厂创建。
固定版本的 UI 库有以下警告，本次不升级、不屏蔽 console、不修改依赖：

| 场景 | 观察结果 |
|---|---|
| 03 原始三档模板首次渲染、点击校验按钮 | 正常渲染，无 console.error；测试有明确断言 |
| 展开 Select 下拉 | 菜单透传 forceClearActiveKey，React 16 通过 console.error 打印未知 DOM 属性警告 |
| 校验不通过 | 1.6.7 开发模式打印 validation 警告，同时正常展示字段提示 |
| 旧单元的 Table | 仍有 combineColumnFilter 和旧生命周期警告 |

因此能确认 03 原始模板正常渲染、没有未捕获异常，但不能声称整个项目的所有交互都没有控制台警告。
这与「零控制台报错」按 console.error 严格计数的解释存在冲突，已明确报告。

## 重启和验证步骤

在原先运行 3000 服务的终端按 Ctrl+C，然后：

```sh
cd /Users/zhcho/Documents/study/Choero/choerodon-ui-demo
yarn start
```

mock 由 CRA 启动时加载，必须重启；没有独立后端命令，不需要 yarn install。
另一个终端运行：

```sh
yarn unit:list
yarn test --watchAll=false
node --test scripts/unit.test.js
```

期望 03 列出 easy / normal / hard，当前与 normal 一致；04～09 显示未开放。
需要切换难度时运行 `yarn unit:reset 3 easy` 或 `yarn unit:reset 03 hard`，会先打印备份路径。
本轮没有为测试而重置 01/02 的作业。

打开 [单元 03](http://localhost:3000/#unit-03)：

1. 样例有角色名称、角色编码、成员上限、层级、可见范围五个字段。
2. 层级下拉有平台 / 租户 / 项目；可见范围下拉有内部可见 / 公开可见。
3. 编码 site-admin 重复；learning-role 可用。填写其他必填项后可看到「校验通过（尚未保存）」。
4. 成员上限填 0 时不能通过校验；选择项目、内部可见后实际编码显示 project / INTERNAL。
5. 练习有六个员工字段和校验按钮；未补齐的下拉、规则与 Promise 判断仍是 TODO。

## 已执行的检查（2026-09-27，Asia/Shanghai）

| 检查 | 结果 / 覆盖范围 |
|---|---|
| yarn unit:list | PASS，03 开放且与 normal 一致，04～09 未开放 |
| yarn test --watchAll=false | PASS，3 个测试文件、14 项；覆盖 01～03 原始模板、03 真实字段规则、值集解析、异步等待与请求失败 |
| node --test scripts/unit.test.js | PASS，原有 6 项备份、覆盖和错误路径测试 |
| yarn build | PASS，编译成功，保留原有 bundle 体积提醒 |
| git diff --check | PASS |
| 26 个保护文件的 SHA-256 | PASS，无变化 |
| 03 Exercise / normal 字节比较 | PASS |
| 本地 HTTP 检查 | PASS，14 组，见下文 |
| Chrome 实际交互 | PASS，中文值集、编码回填、重复拒绝、可用通过、数值下限及原始 normal 页面 |

HTTP 检查使用临时 3001 CRA 服务：两个值集、角色重复 / 可用 / 非法格式 / 模拟 503、
员工重复 / 可用 / 非法格式 / 模拟 503、未知值集 404，共 11 组新接口检查；
另回归原角色 12 条、原员工 45 条、02 离职查询 11 条，共 3 组旧接口检查。
验证完成后已关闭本轮启动的临时 3001 服务；本地查看时请按上面的步骤启动 yarn start。

Jest 中只替换 HTTP 层，保留真实 DataSet、Field、Select、Form 等实现。
员工模板仅检查可渲染与骨架按钮行为；没有通过测试代码提供员工练习的完整实现。
练习完成后的共同验收和挑战验收仍由学习者完成后检查，没有将未完成练习标为功能通过。

## 版本适配与不确定 API

已在本地 1.6.7 验证 required、pattern、min / max、defaultValidationMessages、同步 / 异步 validator、
options、textField / valueField、lookupCode、lookupUrl、lookupAxiosConfig、transformResponse、validate。
本次没有需要用户替我验证的未知 API 名称。

实际验证修正了一个组合兼容问题：把带 transformResponse 数组的静态配置交给 MobX 4 后，
它会变成 ObservableArray，Axios 1.0.0 可能跳过转换，表现为 HTTP 200 但下拉为空。
现在 lookupAxiosConfig 使用函数返回普通配置，转换函数同时兼容字符串、Spring Page 对象和已经转换的数组。
这个修正经过真实 lookup 测试和浏览器下拉验证，不需要全局 configure。

依据为本地安装包的 Field、LookupCodeStore、Axios 适配器和 validator 实现，并对照官方
[Field 1.6.7](https://github.com/open-hand/choerodon-ui/blob/1.6.7/components-dataset/data-set/Field.tsx) 与
[customError 1.6.7](https://github.com/open-hand/choerodon-ui/blob/1.6.7/components-dataset/validator/rules/customError.tsx)。

![单元 03 实际校验通过页面](/Users/zhcho/.codex/visualizations/2026/09/26/01a0dde3-c1fb-7220-8c47-bc94483edfd4/unit-03-example.png)
````
