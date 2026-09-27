# 云端部署与运维

当前 `https://zhchoice.xyz/choerodon/` 使用浏览器自动身份，无账号或密码输入。同一浏览器换网络继续原作业；不同浏览器、无痕窗口、清除 Cookie 后视为新访客。IP 只用于 Nginx 访问日志和限流，不作为作业归属。新访客从 normal TODO 模板开始，管理员原有练习仍保留在旧版本源码中，不公开分配。

## 两种运行方式

- 本地：`yarn start` 沿用 CRA 和共享源码保存，只供本人使用。
- 云端：`node deployment/build-cloud.js` 生成 `cloud-build/`；`node deployment/cloud-server.js` 提供静态页面、隔离的学习 API、Monaco 和 mock。不再运行公共 CRA 编译服务器。

构建环境仍使用锁定的 Node 20.18.0 / Yarn 1.22.22，不新增依赖。本地 `yarn build` 不包含云端 API；部署不能只上传普通 `build/`。

云端启动必须设置 `LEARN_DATA_DIR`（独立持久目录）、`LEARN_SECRET_FILE`（至少 32 字节的随机身份签名密钥）、`LEARN_ORIGIN`（正式 HTTPS 来源）和 `PORT`。身份 Cookie 为 Secure / HttpOnly / SameSite=Lax，保存一年；保留 Cookie 才能找回对应作业。没有注册、跨设备同步或找回账户功能。

## 腾讯云当前配置

- 服务：`choerodon-learning-cloud.service`，开机启动，专用非 root 用户，监听 `127.0.0.1:3421`。
- 版本：`/opt/choerodon-learning-lab/releases/20260927-browser-users`。
- 作业及重置备份：`/opt/choerodon-learning-lab/visitor-data/<随机身份>/`。
- 密钥：`/opt/choerodon-learning-lab/visitor-identity.key`，权限 0600；不要提交或输出内容。更换它会让所有旧身份失效。
- Node：`/opt/choerodon-tooling/node-v20.18.0-linux-x64/bin/node`；系统 Node 保持不变。
- 配置：`nginx-cloud-limits.conf` 放在 Nginx http 范围；`nginx-cloud-locations.conf` 放在 HTTPS server 范围；`nginx-cloud-proxy.conf` 为这些路由共用代理配置。

```sh
systemctl status choerodon-learning-cloud
journalctl -u choerodon-learning-cloud -n 80 --no-pager
systemctl restart choerodon-learning-cloud
nginx -t
```

重启保留源码作业，mock 恢复种子。mock 最多缓存 64 个活跃访客，闲置 24 小时或缓存淘汰也恢复种子；每个缓存实例累计写入上限 1 MB。最多创建 200 个持久访客空间，每人最多 10 MB 重置备份；达到限制拒绝新增，不自动删除作业。API 有身份级及 IP 级限流。管理员扩容前先检查磁盘、内存与备份策略。

## 代码运行边界

访客代码只经固定 Babel 插件转换语法，不加载访客 Babel 配置、不安装依赖、不在 Node 执行。预览在 `sandbox="allow-scripts"` 的不透明来源 iframe 中运行；CSP 禁止直接网络连接、嵌套页面和表单提交。受控消息桥只允许 `/mock/` 路径，使用宿主当前身份。支持课程依赖及 `./LessonConfigScope`，不支持任意相对文件、外部包或服务器文件导入。

发布构建用占位组件替代各单元源码 Exercise.js；实际代码从当前身份空间读取，初始使用 TODO 模板。此方案不保证阻止代码死循环占用访客浏览器资源，也不是面向任意代码托管的通用平台。

## 备份和回滚

同时备份 `visitor-data/` 和签名密钥（加密保管），恢复时保持配对。发布新版本不能覆盖访客数据目录。历史单人源码及 `.backup/` 保留在 `releases/20260927-initial`。

切换前的 Nginx location / Basic Auth snippet 和首页 HTML 保存在 `/opt/choerodon-learning-lab/deployment/browser-users-backup/`。回滚时先确认后续无人修改这些配置：恢复原 `choerodon-location.conf`，启动旧的 `choerodon-learning-lab`，检查 `nginx -t` 后 reload；再停用新服务。旧服务只允许通过原 Basic Auth 保护的入口访问，不能让匿名入口指向旧共享 API。

旧 `choerodon-learning-lab.service` 当前已停止并禁用，旧密码文件仅用于回滚。新旧版本都保留，不清理作业。验证记录见 [浏览器身份验收](../docs/browser-identity-verification.md)；[首次部署记录](../docs/cloud-deployment-verification.md) 为密码版的历史结果。
