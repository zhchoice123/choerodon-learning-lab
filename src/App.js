import React from 'react';
import { units } from './units';
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

export default function App() {
  const route = useRoute();
  const activeUnit = route.page === 'unit' ? units.find((unit) => unit.key === route.key) : undefined;

  let page;
  if (route.page === 'playground') page = <Playground />;
  else if (activeUnit) page = <UnitWorkspace key={activeUnit.key} unit={activeUnit} />;
  else page = <HomePage units={units} />;

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
        {units.map((unit) => (
          <NavLink key={unit.key} route={unitRoute(unit.key)} active={unit === activeUnit}>
            <span>{unit.title}</span>
            {!unit.Example && <span className="app-nav-tag">{UNIT_STATE_LABELS.locked}</span>}
          </NavLink>
        ))}
        <div className="app-nav-divider" />
        <NavLink route={PLAYGROUND_ROUTE} active={route.page === 'playground'}>
          自由练习区
        </NavLink>
      </nav>
      <main className="app-main">{page}</main>
    </div>
  );
}
