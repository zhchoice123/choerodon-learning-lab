// 上一课 / 下一课。跳转走 navigate()，所以「有未保存修改」的提醒同样生效。
import React from 'react';
import { lessonLabel, neighbors } from '../lessons';
import { navigate, unitRoute } from '../router';

export default function LessonNav({ unitKey }) {
  const { prev, next } = neighbors(unitKey);
  if (!prev && !next) return null;
  return (
    <nav className="workspace-lesson-nav" aria-label="课程导航">
      {prev ? (
        <button type="button" className="workspace-lesson-link" onClick={() => navigate(unitRoute(prev.key))}>
          ← 上一课：{lessonLabel(prev)}
        </button>
      ) : (
        <span />
      )}
      {next && (
        <button type="button" className="workspace-lesson-link is-next" onClick={() => navigate(unitRoute(next.key))}>
          下一课：{lessonLabel(next)} →
        </button>
      )}
    </nav>
  );
}
