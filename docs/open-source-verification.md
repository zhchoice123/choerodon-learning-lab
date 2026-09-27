# 开源收尾验证记录

日期：2026-09-27。基于 `0e1ad61`，开始时工作区干净。环境 Node 20.18.0 / Yarn 1.22.22。本记录描述工作区修改后的验证，不表示已提交、推送或发布新版本。

## 改动范围

- 修正 README 的仓库地址、静态部署及错误隔离承诺；贡献指南与默认分支 master 对齐。
- 保留 MIT LICENSE，新增安全政策、行为准则、第三方说明、变更记录、Issue / PR 模板、Node 版本与本机环境配置示例。
- 补充 package.json 的 repository / bugs 元数据；保持 private=true 防止误发 npm（不影响 GitHub 开源）。没有添加 homepage 字段，避免改变 CRA 资源根路径。
- 移除未使用的外部开发代理；自由练习区主表四个 CRUD 地址统一为 `/mock/playground/users`，保留原表单、校验和交互代码。
- 新增独立员工 / 地址内存 mock；整批验证后提交，回显关联标识，失败不丢弃内存原值。
- CI 增加显式只读权限、任务超时和模板列表检查。没有变更远程 GitHub 设置。

## 自动验证

| 命令 / 检查 | 结果 |
| --- | --- |
| `yarn install --frozen-lockfile` | PASS，退出码 0；依赖已锁定，postinstall 完成 |
| `yarn unit:list` | PASS，退出码 0；9 个单元均有三档模板，与 normal 一致 |
| `node --test scripts/ devtools/` | PASS，退出码 0；36 个测试通过 |
| `CI=true yarn test --watchAll=false --runInBand` | PASS，退出码 0；16 组、176 个测试通过 |
| `CI=true yarn build` | PASS，退出码 0；主 JS gzip 约 1.06 MB，保留体积警告 |
| `git diff --check` | PASS，无空白错误 |
| GitHub workflow / Issue front matter YAML 解析 | PASS，使用本地 js-yaml 检查 |
| 受保护文件 SHA-256 | PASS，84 个文件逐个一致 |
| 常见令牌与私钥标记扫描 | 未命中；仅工作区文本模式检查，不是完整秘密扫描或历史审计 |
| `yarn audit --json` | **发现未修复问题，退出码 30**；见 dependency-audit.md |

保护范围：`src/units/**`、`mock/unit*.js`、`src/playground/simpleDS.js`、`yarn.lock`。自由练习区 Playground.js 的变更仅限 transport URL 和说明注释。没有执行真实作业重置。

新增 Node 测试使用真实 HTTP 验证分页、员工与地址 CRUD、400 / 404 / 409 / 413、错误批次原子性、ID 分配、重启恢复及与共享种子 / 单元 05 的隔离。

新增 Jest 测试使用真实 Choerodon DataSet、真实 HTTP mock：主从新增回写 ID；修改和删除子行后 dirty=false；HTTP 400 后保留修改和 update 状态；修正后重新提交及删除员工成功。

## 浏览器与运行检查

使用独立测试实例：`HOST=127.0.0.1 PORT=3025 BROWSER=none yarn start`。没有停止或修改原有 3000 / 3001 服务。

- 打开 `http://127.0.0.1:3025/#/playground`：显示 45 名员工，首页 10 条，学习资料区域和主从表正常渲染。
- 编辑 EMP004，将姓名改为「开源验收员工」并确定：弹窗关闭，表格显示新名称；HTTP 重新查询 `/mock/playground/users?code=EMP004` 也返回新名称。
- `/mock/unit-09/v2/employees` 返回 HTTP 200，确认新进程加载了单元 09 路由。
- 测试数据仅存在测试实例内存中，结束后停止该实例即可丢弃。

未运行：所有单元完整浏览器回归、浏览器逐步新增与删除地址、远程部署、纯静态站点部署、升级 Node 的兼容性验收。新增主从 CRUD 的其余分支由上述真实 HTTP / DataSet 自动测试覆盖，不标作浏览器 PASS。

## 已知限制与启动

- 固定依赖树有安全公告命中，本次没有升级依赖；当前定位为受控的个人学习工具。
- 旧版组件库的生命周期 / DOM 属性警告仍存在，主包尚未拆分优化。
- 没有登录、用户隔离、安全执行沙箱或生产后端；静态 build 不能直接提供完整功能。
- 本次未创建 Git 提交、标签或 Release，未推送。新的 CI 配置已本地解析，尚未在 GitHub 上执行本次修改。

应用修改需重启运行本项目的 `yarn start`。首次启动按 README 复制 `.env.example`；若已有 `.env.local`，保留并手动核对，不直接覆盖。浏览器使用终端显示的实际端口，避免继续打开旧进程。
