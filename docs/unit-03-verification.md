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
