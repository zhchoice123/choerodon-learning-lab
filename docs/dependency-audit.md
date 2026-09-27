# 固定依赖审计记录

日期：2026-09-27。环境：Node 20.18.0、Yarn 1.22.22，使用当前 yarn.lock。

执行：`yarn audit --json`，退出码 **30**（报告漏洞，非通过）。Yarn 汇总：

| 严重性 | 报告数量 |
| --- | ---: |
| critical | 1 |
| high | 26 |
| moderate | 31 |
| low | 4 |
| info | 0 |

该结果是依赖树审计快照，不是本应用可利用漏洞数量；尚未逐项完成调用路径、运行环境和可达性分析。CRA 工具链也位于 dependencies 中，不能把全部发现都视为浏览器生产运行时风险。

critical 报告来自 `choerodon-ui > jsonlint > nomnom > underscore`，公告为 [Arbitrary Code Execution in underscore](https://github.com/advisories/GHSA-cf4h-3jhx-xvhq)。这里只记录审计命中，不声称本项目已复现该漏洞。

依赖版本属于课程固定条件，本次未改变依赖或 yarn.lock，也未使用自动修复、忽略引擎限制或宣称安全审计通过。后续升级应单独评估 Choerodon / CRA 的兼容性，运行完整测试、构建和浏览器流程；未经评估，不应把该环境开放成公网服务。

复查时重新执行 `yarn audit --json`，以当时注册表返回的结果为准，并记录日期与退出码。测试 CI 不把此历史快照视为豁免或安全证明。报告漏洞的流程见 [SECURITY.md](../SECURITY.md)。
