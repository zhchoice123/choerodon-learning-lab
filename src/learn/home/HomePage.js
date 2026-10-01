// 首页：按单元选择难度（需求：docs/workspace/task-B-home.md；接口：CONTRACT.md 第 3 节）
import React, { useEffect, useRef, useState } from 'react';
import { Button, message } from 'choerodon-ui/pro';
import { learnApi } from '../api';
import { DIFFICULTIES, DIFFICULTY_LABELS, UNIT_STATE_LABELS } from '../constants';
import { navigate, unitRoute } from '../router';
import confirmRestart from './confirmRestart';
import { startUnit } from './startUnit';
import useUnitStatuses from './useUnitStatuses';
import './home.css';

const notify = {
  success: (content) => message.success(content),
  warning: (content) => message.warning(content),
  error: (content) => message.error(content),
};

const enter = (key) => navigate(unitRoute(key));

// 「01 DataSet 基础与 Table 绑定」→ ['01', 'DataSet 基础与 Table 绑定']
function splitTitle(title) {
  const match = /^(\d{2})\s+(.+)$/.exec(title);
  return match ? [match[1], match[2]] : ['', title];
}

function stateTag(unit, loadStatus, status) {
  if (!unit.Example || status?.state === 'locked') return { text: UNIT_STATE_LABELS.locked, tone: 'locked' };
  if (loadStatus === 'loading') return { text: '读取进度…', tone: 'muted' };
  if (!status) return { text: '接口不可用', tone: 'muted' };
  if (status.state === 'not-started') {
    const label = DIFFICULTY_LABELS[status.matched];
    return { text: label ? `${UNIT_STATE_LABELS['not-started']} · ${label}` : UNIT_STATE_LABELS['not-started'], tone: 'idle' };
  }
  return { text: UNIT_STATE_LABELS['in-progress'], tone: 'active' };
}

// 小节状态：只区分「未开始」和「进行中」（小节只有一档难度）
function sectionTag(loadStatus, status) {
  if (loadStatus !== 'ready' || !status) return null;
  return status.state === 'in-progress'
    ? { text: UNIT_STATE_LABELS['in-progress'], tone: 'active' }
    : { text: UNIT_STATE_LABELS['not-started'], tone: 'idle' };
}

function SectionList({ sections, loadStatus, byKey }) {
  return (
    <ol className="learn-home-sections" aria-label="小节">
      {sections.map((section) => {
        const tag = sectionTag(loadStatus, byKey.get(section.key));
        return (
          <li key={section.key}>
            <button type="button" className="learn-home-section" onClick={() => enter(section.key)}>
              <span className="learn-home-section-title">{section.title}</span>
              {tag && <span className={`learn-home-section-tag tone-${tag.tone}`}>{tag.text}</span>}
            </button>
          </li>
        );
      })}
    </ol>
  );
}

function UnitCard({ unit, loadStatus, status, busy, onSelect, byKey }) {
  const [number, name] = splitTitle(unit.title);
  const locked = !unit.Example || status?.state === 'locked';
  const tag = stateTag(unit, loadStatus, status);
  const current = status?.state === 'not-started' ? status.matched : null;

  return (
    <article className={`learn-home-card${locked ? ' is-locked' : ''}`} aria-label={unit.title}>
      <header className="learn-home-card-header">
        <span className="learn-home-card-number">{number}</span>
        <h3 className="learn-home-card-title">{name}</h3>
        <span className={`learn-home-tag tone-${tag.tone}`}>{tag.text}</span>
      </header>
      {unit.sections && unit.sections.length > 0 ? (
        <>
          <SectionList sections={unit.sections} loadStatus={loadStatus} byKey={byKey} />
          <div className="learn-home-capstone">本章综合练习 · 三档难度</div>
        </>
      ) : (
        <ul className="learn-home-card-points">
          {unit.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      )}
      <div className="learn-home-card-actions">
        {DIFFICULTIES.map(({ key, label }) => (
          <Button
            key={key}
            className={key === current ? 'learn-home-difficulty is-current' : 'learn-home-difficulty'}
            disabled={locked || loadStatus === 'loading' || (busy !== null && busy !== key)}
            loading={busy === key}
            onClick={() => onSelect(unit, key)}
          >
            {label}
          </Button>
        ))}
      </div>
    </article>
  );
}

export default function HomePage({ units }) {
  const { status: loadStatus, byKey, error, reload } = useUnitStatuses();
  const [busy, setBusy] = useState(null); // { key, difficulty }
  const busyRef = useRef(false); // 同步标记，防止同一帧内连续点击触发两次请求
  const mounted = useRef(true);

  useEffect(
    () => () => {
      mounted.current = false;
    },
    [],
  );

  const handleSelect = async (unit, difficulty) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy({ key: unit.key, difficulty });
    try {
      await startUnit({
        unit,
        difficulty,
        status: loadStatus === 'ready' ? byKey.get(unit.key) || null : null,
        api: learnApi,
        confirmRestart,
        notify,
        enter,
      });
    } finally {
      busyRef.current = false;
      // 进入单元后首页已卸载，不再更新状态
      if (mounted.current) setBusy(null);
    }
  };

  return (
    <div className="learn-home">
      <h2>Choerodon UI 学习路线</h2>
      <p className="learn-home-intro">
        每章先按小节逐个学习知识点：每个小节一个知识点、一个小练习，卡住时可以逐级查看提示。
        学完小节再做本章综合练习，综合练习可以选择难度：入门步骤更细，标准与说明一致，挑战只给需求并多一个额外任务。
      </p>

      {loadStatus === 'unavailable' && (
        <div className="learn-home-banner" role="status">
          本地接口不可用，无法读取进度，也无法切换难度。点击任意难度会直接进入单元，不会修改代码。
          请用 <code>yarn start</code> 启动项目后使用完整功能。
        </div>
      )}
      {loadStatus === 'error' && (
        <div className="learn-home-banner is-error" role="alert">
          读取进度失败：{error.message}。仍然可以直接进入单元。
          <Button funcType="flat" color="primary" onClick={reload}>
            重试
          </Button>
        </div>
      )}

      <div className="learn-home-grid">
        {units.map((unit) => (
          <UnitCard
            key={unit.key}
            unit={unit}
            loadStatus={loadStatus}
            status={loadStatus === 'ready' ? byKey.get(unit.key) || null : null}
            // 本卡片正在处理：对应难度；其他卡片正在处理：'other'（全部禁用）；空闲：null
            busy={busy ? (busy.key === unit.key ? busy.difficulty : 'other') : null}
            onSelect={handleSelect}
            byKey={byKey}
          />
        ))}
      </div>
    </div>
  );
}
