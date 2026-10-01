import React from 'react';
import { chapters, chapterOf, findLesson, lessonLabel } from './learn/lessons';
import Playground from './playground/Playground';
import HomePage from './learn/home/HomePage';
import UnitWorkspace from './learn/workspace/UnitWorkspace';
import { HOME_ROUTE, PLAYGROUND_ROUTE, navigate, toHash, unitRoute, useRoute } from './learn/router';
import { UNIT_STATE_LABELS } from './learn/constants';
import './App.css';

// 导航链接统一走 navigate()，这样工作台里「有未保存修改」的拦截对侧边栏也生效
function NavLink({ route, active, children }) {
  return (
    <a
      href={toHash(route)}
      className={active ? 'app-nav-item active' : 'app-nav-item'}
      onClick={(event) => {
        event.preventDefault();
        navigate(route);
      }}
    >
      {children}
    </a>
  );
}

// 章节入口：有小节时进入第一个小节，否则进入章节本身
const chapterEntry = (chapter) => (chapter.sections.length ? chapter.sections[0].key : chapter.key);

export default function App() {
  const route = useRoute();
  const activeUnit = route.page === 'unit' ? findLesson(route.key) : undefined;
  const activeChapter = activeUnit ? chapterOf(activeUnit) : undefined;

  let page;
  if (route.page === 'playground') page = <Playground />;
  else if (activeUnit) page = <UnitWorkspace key={activeUnit.key} unit={activeUnit} />;
  else page = <HomePage units={chapters} />;

  return (
    <div className="app">
      <nav className="app-nav">
        <div className="app-nav-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
          <span>Choerodon Learning Lab</span>
        </div>
        <NavLink route={HOME_ROUTE} active={!activeUnit && route.page !== 'playground'}>
          首页
        </NavLink>
        <div className="app-nav-divider" />
        {chapters.map((chapter) => {
          const expanded = activeChapter && activeChapter.key === chapter.key;
          return (
            <React.Fragment key={chapter.key}>
              <NavLink route={unitRoute(chapterEntry(chapter))} active={expanded && !chapter.sections.length}>
                <span>{chapter.title}</span>
                {!chapter.Example && <span className="app-nav-tag">{UNIT_STATE_LABELS.locked}</span>}
              </NavLink>
              {expanded && chapter.sections.length > 0 && (
                <div className="app-nav-sections">
                  {[...chapter.sections, chapter].map((lesson) => (
                    <NavLink key={lesson.key} route={unitRoute(lesson.key)} active={lesson.key === activeUnit.key}>
                      <span>{lessonLabel(lesson)}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </React.Fragment>
          );
        })}
        <div className="app-nav-divider" />
        <NavLink route={PLAYGROUND_ROUTE} active={route.page === 'playground'}>
          自由练习区
        </NavLink>
      </nav>
      <main className="app-main">{page}</main>
    </div>
  );
}
