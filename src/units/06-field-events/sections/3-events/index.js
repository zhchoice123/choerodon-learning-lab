import Example from './Example';
import Exercise from './Exercise';

const lesson = {
  key: 'unit-06-3',
  title: '06-3 DataSet 事件：load / update / select',
  doc: 'src/units/06-field-events/sections/3-events/README.md',
  point: 'events 在创建时注册：load 只有 dataSet，update 有 record/name/value/oldValue，select 有 record/previous',
  hints: [
    'DataSet 配置里加 events: { load: (参数) => ..., update: ..., select: ... }。',
    '每个回调的参数是一个对象，用解构取：load 用 ({ dataSet })，update 用 ({ dataSet, record, name, value, oldValue })。',
    '翻一页 load 加 1；把年龄改成别的数字 update 加 1；改回原值不会再触发吗？试一下。',
  ],
  Example,
  Exercise,
};

export default lesson;
