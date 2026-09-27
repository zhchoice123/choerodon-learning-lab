# 第三方项目与资源

Choerodon Learning Lab 自身代码按根目录 LICENSE 中的 MIT 许可证提供。第三方依赖继续适用各自的许可证；项目名称、标志和商标不因本项目许可证而获得额外授权。

主要依赖包括：

| 项目 | 本仓库用途 | 已安装包声明的许可证 |
| --- | --- | --- |
| Choerodon UI | Pro DataSet、表格和表单组件 | MIT |
| React / React DOM | 页面渲染 | MIT |
| MobX / mobx-react | 响应式状态 | MIT |
| Monaco Editor / @monaco-editor/react | 浏览器代码编辑器 | MIT |
| Create React App / react-scripts | 开发、测试和构建 | MIT |

这不是完整传递依赖许可清单。准确版本见 yarn.lock，原始版权和许可文本见相应 node_modules 包内 LICENSE / NOTICE 文件。分发生产 bundle 时保留构建产生的 `*.LICENSE.txt`；另行分发 Monaco 资源或其他依赖时也应附带该依赖的原始许可文件。

public/ 中的 React 图标和 src/logo.svg 来自原 Create React App 模板，沿用 React 项目资源；本仓库未宣称这些图标为原创。自由练习区链接的 Ant Design Pro、Arco Design、Semi Design 为独立项目，链接不表示关联或背书。

mock 中的员工和角色用于演示，不对应真实业务用户。引用第三方文档或代码时，请保留出处，不复制无权重新发布的内容。
