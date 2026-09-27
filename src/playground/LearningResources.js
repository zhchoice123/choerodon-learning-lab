import React from 'react';
import './learning-resources.css';

// 后续增加同类项目时，在这里补充官网、源码和一个具体的学习方向即可。
const relatedProjects = [
  {
    name: 'Ant Design Pro',
    category: '中后台应用方案',
    description: '从完整应用出发，参考后台页面组织、布局与常见业务交互。',
    website: 'https://pro.ant.design/',
    repository: 'https://github.com/ant-design/ant-design-pro',
  },
  {
    name: 'Arco Design',
    category: 'React 组件库',
    description: '对照表格、表单和反馈组件，比较相同需求的 API 与实现方式。',
    website: 'https://arco.design/react/docs/start',
    repository: 'https://github.com/arco-design/arco-design',
  },
  {
    name: 'Semi Design',
    category: 'React 组件库与设计系统',
    description: '参考组件交互、主题定制和设计规范，练习界面的一致性。',
    website: 'https://semi.design/zh-CN/',
    repository: 'https://github.com/DouyinFE/semi-design',
  },
];

function ExternalLink({ href, children, className }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}<span aria-hidden="true"> ↗</span>
      <span className="learning-resources-sr-only">（在新标签页打开）</span>
    </a>
  );
}

export default function LearningResources() {
  return (
    <aside className="learning-resources" aria-labelledby="learning-resources-title">
      <div className="learning-resources-intro">
        <div>
          <h3 id="learning-resources-title">学习资料与项目说明</h3>
          <p>从一个表单、一张表格开始，把单元里的知识放到自己的页面中验证。</p>
        </div>
        <div className="learning-resources-official" aria-label="Choerodon UI 官方资源">
          <ExternalLink href="https://open-hand.github.io/choerodon-ui/zh" className="learning-resources-primary">
            Choerodon UI 官网
          </ExternalLink>
          <ExternalLink href="https://github.com/open-hand/choerodon-ui">GitHub 源码</ExternalLink>
        </div>
      </div>
      <p className="learning-resources-version">
        本项目使用 Choerodon UI 1.6.7。官网可能展示更新版本，查阅 API 时请对照本地版本。
      </p>

      <details className="learning-resources-section">
        <summary>同类开源项目 <span>3 个参考 · 官网与源码</span></summary>
        <div className="learning-resources-projects">
          {relatedProjects.map((project) => (
            <article className="learning-resources-project" key={project.name}>
              <span className="learning-resources-category">{project.category}</span>
              <h4>{project.name}</h4>
              <p>{project.description}</p>
              <div className="learning-resources-links">
                <ExternalLink href={project.website}>{project.name} 官网</ExternalLink>
                <ExternalLink href={project.repository}>开源仓库</ExternalLink>
              </div>
            </article>
          ))}
        </div>
        <p className="learning-resources-note">可用同一个查询表单或编辑表格做对照练习。其他项目的运行环境请以各自文档为准。</p>
      </details>

      <details className="learning-resources-section">
        <summary>关于 Choerodon Learning Lab <span>项目目标与开发方式</span></summary>
        <div className="learning-resources-about">
          <p>
            这是一个围绕 Choerodon UI Pro 的实战学习工作台：先读样例，再完成 TODO 练习，
            通过入门、标准、挑战三档难度逐步理解 DataSet、表单、表格与业务交互。
            单元工作台提供 Monaco 编辑、保存与实时预览；自由练习区用于自行组合和验证所学内容。
          </p>
          <p>
            项目基于 React 16.14、MobX 4.15.7 和 Create React App 5，
            通过本地 Node 接口管理练习与备份，单元业务接口由本地 mock 提供。
            使用 yarn start 启动后，可以在单元工作台按 Ctrl/Cmd + S 保存练习。
          </p>
          <p>
            开发采用逐单元推进、AI 辅助实现与人工理解验收的方式。
            每次练习先明确需求，再阅读关键代码，最后用页面操作、请求结果和测试验证自己的判断。
          </p>
        </div>
      </details>
    </aside>
  );
}
