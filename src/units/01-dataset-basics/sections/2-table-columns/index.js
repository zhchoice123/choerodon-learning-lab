import Example from './Example';
import Exercise from './Exercise';

const lesson = {
  key: 'unit-01-2',
  title: '01-2 Table 绑定：columns 只写 name',
  doc: 'src/units/01-dataset-basics/sections/2-table-columns/README.md',
  point: 'Table 通过 dataSet 属性绑定数据；columns 决定显示哪些列、什么顺序，标题和格式来自 fields',
  hints: [
    'columns 是一个数组，每一项至少要有 name，name 对应 fields 里的字段名。',
    '不想显示的字段，就不要写进 columns；数组的顺序就是列的顺序。',
    '宽度用 width，对齐用 align（\'left\' / \'center\' / \'right\'），样例的「启用」列就是这么写的。',
  ],
  Example,
  Exercise,
};

export default lesson;
