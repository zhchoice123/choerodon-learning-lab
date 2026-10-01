# 知识点拆分（小节）验证记录

把 01～09 章拆成 48 个小节，每个小节一个知识点；原单元保留为每章的综合练习。

## 范围

| 章节 | 小节数 | 小节 |
|---|---|---|
| 01 DataSet 基础与 Table 绑定 | 7 | 字段类型、Table 绑定、transport.read、dataKey / totalKey、useMemo、observer、常用实例成员 |
| 02 查询条件 | 5 | queryFields、read 函数、条件转换、查询栏、用代码控制查询 |
| 03 字段校验与值集 | 5 | 基础校验、validator、options、lookupCode、等待 validate |
| 04 Form 表单 | 5 | 绑定当前行、常用控件、只读与 Output、布局、校验与重置 |
| 05 表格编辑与提交 | 5 | 行内编辑、表格按钮、写接口协议、提交结果、提交失败 |
| 06 字段联动与事件 | 5 | 动态属性、级联、事件、联动赋值、事件记录与当前记录 |
| 07 主从 DataSet | 5 | children、cascadeParams、子表快照、主从提交、原子失败 |
| 08 Modal 弹窗与抽屉 | 5 | Modal.open、捕获记录、onOk、onCancel、稳健弹窗 |
| 09 全局配置与国际化 | 6 | configure 作用范围、generatePageQuery、a.b 路径、全局值集、优先级、语言包 |

每个小节：`index.js`（含 1～3 条逐级提示）、`Example.js`、`Exercise.js`、`README.md`、`templates/Exercise.normal.js`。
样例与练习使用不同业务数据；部分练习带「能跑但有隐患」的 TODO（03-5、04-5、05-5、06-5、07-2、07-3、07-5、08-2、08-3、09-5）。

## 自动检查

| 命令 | 结果 |
|---|---|
| `CI=true yarn test --watchAll=false --runInBand` | 19 组测试、共 331 个全部通过 |
| `node --test scripts/ devtools/` | 41 个全部通过 |
| `CI=true yarn build`（清除 ESLint 缓存后） | 编译成功，无警告 |
| `yarn unit:list` | 9 章 + 48 小节；小节只有 normal 一档 |

`src/units/sections.test.js` 对每个小节检查：前端注册与目录一致、元数据与提示、Exercise.js 与模板逐字节一致、样例和未完成的练习都能渲染且没有意外的 console.error、离开后全局配置复原。
主从小节在用例内等待子表 300ms 防抖查询完成。

## 浏览器验证（独立端口）

- 首页 9 章分别列出 7 / 5 / 5 / 5 / 5 / 5 / 5 / 5 / 6 个小节；工作台显示所属章节、逐级提示与上一课 / 下一课
- 01-4：未配 dataKey 的表格 1 行空白记录，配置后 5 行
- 05-4：无修改 / 校验未通过 / 保存成功三种提示；新记录回写 id、status 为 sync、dirty 为 false
- 05-5：名称 FAIL 时显示后端原因并保留草稿，修正后重试成功
- 小节写操作只影响自己的 mock：05-4 新增后为 13 条，综合练习与 05-3 仍为 12 条
- 07-4：子表自动加载；新增权限行后一次 submit 请求，新行回写 id
- 08-3：名称为空时弹窗不关闭且无请求；合法时一次 update 后关闭
- 09-2 / 09-6 修改分页参数与语言后，进入 01-4：请求恢复为 page / pagesize，语言恢复中文
- 全程没有意外的 console.error

未在浏览器中直接观察：03-4 值集下拉（隐藏的浏览器面板不执行 requestAnimationFrame，1.6.7 在下一帧才请求值集）；该行为由 jest 用例覆盖。

## 兼容性

- 章节 id、接口返回结构只增加字段（`chapter`、`kind`），原有调用不变
- 云端旧访客工作区按需补齐小节目录，不改动已有作业（`devtools/cloud-server.test.js` 覆盖）
- 未开放章节下的小节不可读写（`devtools/learn-api.test.js` 覆盖）
