// 逐级提示：小节练习只有一档难度，卡住时一条一条展开提示，而不是直接给答案。
import React, { useState } from 'react';

export default function HintsPanel({ hints }) {
  const [shown, setShown] = useState(0);
  if (!hints || !hints.length) return null;
  const allShown = shown >= hints.length;

  return (
    <section className="workspace-hints" aria-label="逐级提示">
      <div className="workspace-hints-header">
        <span className="workspace-hints-title">卡住了？逐级查看提示</span>
        <span className="workspace-hints-count">
          {shown} / {hints.length}
        </span>
        {!allShown && (
          <button type="button" className="workspace-hints-next" onClick={() => setShown(shown + 1)}>
            {shown === 0 ? '查看提示 1' : `查看提示 ${shown + 1}`}
          </button>
        )}
        {shown > 0 && (
          <button type="button" className="workspace-hints-hide" onClick={() => setShown(0)}>
            收起
          </button>
        )}
      </div>
      {shown > 0 && (
        <ol className="workspace-hints-list">
          {hints.slice(0, shown).map((hint) => (
            <li key={hint}>{hint}</li>
          ))}
        </ol>
      )}
    </section>
  );
}
