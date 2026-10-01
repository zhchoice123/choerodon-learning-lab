import Example from './Example';
import Exercise from './Exercise';

const lesson = {
  key: 'unit-06-4',
  title: '06-4 联动赋值：record.set',
  doc: 'src/units/06-field-events/sections/4-linked-values/README.md',
  point: '在 update 事件里用 record.set 清空失效的子值、带出关联值；联动保持单向，避免循环',
  hints: [
    '在 events.update 里按 name 区分：name === \'department\' 时清空，name === \'team\' 时带出组长。',
    '一次改多个字段：record.set({ team: undefined, leader: \'\' })。',
    '找组长：teamOptions.find((item) => item.get(\'value\') === value)，找不到（清空小组）时把 leader 设为空。',
  ],
  Example,
  Exercise,
};

export default lesson;
