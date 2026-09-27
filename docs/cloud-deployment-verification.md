# 腾讯云个人学习实例部署记录

> 本文保留首次密码版的历史验证。当前入口已切换为[浏览器自动身份模式](browser-identity-verification.md)，旧服务停止并保留作业用于回滚。

日期：2026-09-27。目标：将本项目运行于现有腾讯云服务器，通过 zhchoice.xyz 首页进入；用户选择独立访问密码保护完整工作台。

## 交付

- 入口：`https://zhchoice.xyz/choerodon/`。
- 首页新增“Choerodon 实战”卡片、侧栏和快捷搜索入口，保留已有“前端学习”。收藏 / 最近访问使用独立 choerodon 标识。
- HTTP Basic Auth 保护页面、静态资源、Monaco、学习读写 API、mock 和 WebSocket。未登录不能读写练习。
- 应用仅监听 `127.0.0.1:3420`；systemd 服务 `choerodon-learning-lab` 以专用非 root 用户运行，并设置开机启动。
- 独立 Node 20.18.0，未升级系统 Node 18.20.8。既有首页、伴读、代码运行和前端预览服务保持运行。

源代码先从 GitHub 克隆提交 `0e1ad616c31f864e40c91cdacb8ce2d4061c51be`，再同步本地已验证但尚未提交的开源收尾补丁。代码位于 `/opt/choerodon-learning-lab/releases/20260927-initial`，current 为指向该目录的符号链接。本次没有代为提交或推送 GitHub。

## 环境与配置

服务器为 OpenCloudOS 8.10 / x86_64。开始时约 1.5 GB 可用内存、52 GB 可用磁盘，无 swap。Node 官方下载包通过发布的 SHA-256 校验，Yarn 版本 1.22.22，执行 frozen-lockfile 安装。

配置源码在 [deployment/](../deployment/README.md)。根路径 `/__learn/` 和 `/mock/` 在 Nginx 中作为本应用专用、受密码保护的路由；部署前确认没有占用这两个路由的其他应用。前端资源前缀是 `/choerodon`。

密码只保存于管理员的本机私密文件及服务器的散列密码文件 `/etc/nginx/choerodon.htpasswd`，没有写入仓库、网页或日志。配置文件权限为 root:nginx 0640。

## 验证结果

| 检查 | 结果 |
| --- | --- |
| 云端 `yarn install --frozen-lockfile` | PASS，退出码 0，安装补丁完成，未改变依赖版本 |
| 云端 `node --test scripts/ devtools/` | PASS，36 个测试通过，退出码 0 |
| 原首页 `node --test test/server.test.js` | PASS，8 个测试通过，退出码 0 |
| `systemd-analyze verify` | PASS，本服务配置可用；输出包含既有其他服务的警告 |
| `nginx -t` | PASS，多次修改后均检查通过再 reload |
| 首次编译及禁用缓存后的编译 | PASS，日志显示 Compiled successfully |
| 无凭据访问页面、学习 API、mock、Monaco、WebSocket | 全部返回 401 |
| 带凭据访问页面、前端 bundle、Monaco、9 单元列表、mock | 全部返回 200 |
| 带凭据保存相同源码 | 200，文件不变 |
| 无凭据写入 | 401 |
| 无效 JSX 保存 | 422，原 Exercise.js 保留 |
| mock 固定失败场景 | 400 |
| WSS 经 Nginx TLS 认证升级 | PASS，收到 hot / hash / ok 等编译消息 |
| HTTPS 保存临时注释 → WebSocket 编译完成 | PASS |
| 通过 API 恢复原文 → WebSocket 编译完成 | PASS，Exercise.js 逐字节恢复 |
| 本地受保护文件 SHA-256 | 84 个文件一致 |
| 部署源文件 SHA-256 | 完成同步后的清单保存在云端 deployment/source-sha256.json |
| 原 `/`、`/health`、`/webtts/`、`/workflow/`、`/library`、`/learn-react/`、`/privacy`、`/terms` | 部署前后均返回 200 |

浏览器验证了线上首页显示 5 个工具及新的 Choerodon 入口。内置浏览器自动化无法完成 Basic Auth 登录，因此未把“浏览器登录后逐个单元完整操作”记为 PASS；登录后的页面、资源和读写接口通过 HTTPS 实测，热更新通过真实 WSS 实测。WSS 测试在服务器本机通过正式域名的 TLS / Nginx 入口进行，HTTP 测试从本机外网访问正式域名。

前端 176 个 Jest 测试和生产构建沿用本次开源收尾已完成的本地结果；本次新增部署配置没有修改前端课程代码。没有在服务器额外运行生产构建或完整 Jest，以避免与在线编译争用内存。

## 部署中发现并解决的问题

1. macOS 归档附带 AppleDouble `._` 文件，Node 扫描测试目录时误当作测试源文件。已识别归档元数据并移到 root 专用目录，之后云端 36 项测试通过。后续同步应禁用 macOS 扩展属性归档。
2. CRA 的 WDS_SOCKET_PATH 只设置客户端 URL，Webpack 服务端仍监听 `/ws`。Nginx 对 `/choerodon/ws` 精确重写到 `/ws`，保留认证，再验证 WSS 成功。
3. 默认 Webpack filesystem cache 在编译后序列化时触发 1200M cgroup 内存上限，服务曾被内核终止并自动重启，期间短暂 502。通过云端专用启动脚本关闭磁盘缓存和源码映射，保持本地配置不变。修正后的启动、两次保存编译均成功，最终检查主进程未再次自动重启，采样内存约 530 MB。该观察不等于长期负载测试。

## 运维与恢复

- 查看：`systemctl status choerodon-learning-lab`。
- 日志：`journalctl -u choerodon-learning-lab -n 80 --no-pager`。
- 重启：`systemctl restart choerodon-learning-lab`（业务 mock 恢复种子，已保存的源码保留）。
- 原首页和 Nginx 配置备份：`/opt/zhchoice-homepage/backups/choerodon-20260927/`。
- 源码补丁、散列清单、验证日志：`/opt/choerodon-learning-lab/deployment/`，root 专用。
- 回滚操作和作业迁移要求见 [部署运维说明](../deployment/README.md)。

这是密码保护的个人学习环境，没有注册、用户隔离或安全执行沙箱。固定依赖仍有审计告警，不能移除认证后开放给不可信用户。记得定期备份 src/units/*/Exercise.js 和 .backup/。
