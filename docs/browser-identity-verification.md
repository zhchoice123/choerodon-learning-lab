# 浏览器自动身份部署验收

日期：2026-09-27。需求：去除登录账号密码输入；用户确认采用“浏览器自动身份，各自保留练习”，IP 仅作为访问日志和限流依据。

## 结果与范围

入口保持 `https://zhchoice.xyz/choerodon/`，首页“Choerodon 实战”改为免登录说明。不显示用户名或登录框。使用 256 位随机身份及 HMAC 签名、Secure / HttpOnly / SameSite=Lax Cookie，首次访问自动取得身份；切换 IP 不改变作业归属，同 IP 的不同 Cookie 互相隔离。Cookie 保存一年，清除 Cookie、换浏览器或无痕会话会创建新身份；不提供找回或跨设备同步。

新访客从 normal TODO 模板开始。原管理员 Exercise.js 保留在原版本，没有分配给首个陌生访客。各访客保存及重置仅写入 visitor-data 下的独立目录。mock 路由按访客创建独立内存集合。

云端改用静态生产包 + 独立 Express API，访客代码由固定 Babel 插件做语法转换，不能读取 .babelrc 或在 Node 执行。预览在不透明来源 iframe 中运行，通过限于 `/mock/` 的消息桥访问自己数据；CSP 禁止直接网络请求。第九单元需要的点号值集（如 EMP.SEX）允许通过，`..` 路径段、其他 API、外站 URL 被拒绝。保存无需全局 Webpack 重编译。本地 yarn start 保持原行为。

## 自动验证

| 命令 / 检查 | 结果 |
| --- | --- |
| `yarn unit:list` | PASS，9 个单元可见 |
| `node --test scripts/ devtools/` | PASS，39 个测试；包括签名防伪、跨站拒绝、两身份存储/备份/mock 隔离、重启恢复、27 模板编译 |
| `CI=true yarn test --watchAll=false --runInBand` | PASS，17 套 / 177 个测试 |
| `CI=true yarn build` | PASS，本地构建未改为云端模式 |
| `CI=true node deployment/build-cloud.js` | PASS，独立 cloud-build；构建钩子拒绝打包管理员 Exercise.js |
| `git diff --check` | PASS |
| 受保护文件 SHA-256 | 84 个文件与开源收尾基线完全相同 |
| 云端 `nginx -t` | PASS，再 reload 切换路由 |

测试新增文件：devtools/cloud-server.test.js、src/learn/cloud/CloudPreview.test.js。测试使用临时目录，不修改课程作业，不填写 TODO。

## 外网与浏览器验证

从本机通过正式 HTTPS 域名请求，两个独立 Cookie 会话（同一出口 IP）：

- 页面、9 单元列表直接返回 200，无 WWW-Authenticate；Cookie 带 Secure / HttpOnly。
- A 保存注释后 A 能读回，B 仍读到原 TODO 模板。
- A 重置生成备份，B 不变；最后恢复测试原文。
- 错误 JSX 返回 422，原文不变；无身份写入及错误 Origin 写入返回 403。
- `/choerodon/preview` 返回 CSP `sandbox allow-scripts` 及 `connect-src 'none'`。
- 原首页、health、WebTTS、workflow、library、learn-react、privacy、terms 均返回 200。

真实浏览器中验证了免登录打开、Monaco 加载、单元 02 mock 表格显示 45 条员工、添加测试注释并保存、刷新仍显示该注释、重置后回到模板并显示独立备份路径。第九单元 TODO 骨架及 LessonConfigScope 在沙箱中正常渲染；抽查控制台无 error。没有声称完整验收 27 份模板全部业务操作或进行长期压力测试。

## 上线与回滚

新服务 `choerodon-learning-cloud` 已启用，监听 127.0.0.1:3421；旧密码版 `choerodon-learning-lab` 已停止并禁用。系统 Node 和其他应用未升级。切换后采样新服务内存约 61 MB，NRestarts 为 0；该数值不是负载保证。

旧配置和首页保存在 `/opt/choerodon-learning-lab/deployment/browser-users-backup/`。身份密钥独立存放，绝不记录到源码或验证日志。恢复方式和持久目录见 [运维说明](../deployment/README.md)。

限制：最多 200 个持久访客空间，每人重置备份 10 MB；mock 最多 64 个活跃缓存、闲置 24 小时或服务重启恢复种子。沙箱不能保证隔离浏览器 CPU / 内存耗尽；仅支持课程依赖，不是任意代码托管服务。固定依赖审计结果仍适用。没有提交或推送 Git。
