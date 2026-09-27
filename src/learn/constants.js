// 在线学习工作台的共享常量（契约：docs/workspace/CONTRACT.md）

export const DIFFICULTIES = [
  { key: 'easy', label: '入门' },
  { key: 'normal', label: '标准' },
  { key: 'hard', label: '挑战' },
];

export const DIFFICULTY_LABELS = Object.fromEntries(DIFFICULTIES.map(({ key, label }) => [key, label]));

// 单元状态：locked 未开放 / not-started 与某个模板一致 / in-progress 已改动
export const UNIT_STATE_LABELS = {
  locked: '未开放',
  'not-started': '未开始',
  'in-progress': '进行中',
};
