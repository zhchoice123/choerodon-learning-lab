import Example from './Example';
import Exercise from './Exercise';

const lesson = {
  key: 'unit-06-5',
  title: '06-5 事件记录与当前记录',
  doc: 'src/units/06-field-events/sections/5-event-record/README.md',
  point: 'update 事件的 record 是触发事件的那一条，不一定是 current；勾选也不会改变 current',
  hints: [
    '复现：保持第一行是当前行，点按钮。被清空的是哪一行？按钮改的又是哪一行？',
    'update 的参数里有 record，就是值发生变化的那一条，用它代替 dataSet.current。',
    '勾选和当前行是两回事：在 select 事件里写 dataSet.current = record。',
  ],
  Example,
  Exercise,
};

export default lesson;
