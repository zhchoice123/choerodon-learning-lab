import Example from './Example';
import Exercise from './Exercise';

const lesson = {
  key: 'unit-02-3',
  title: '02-3 条件转换：改名、去空白、空值',
  doc: 'src/units/02-query-conditions/sections/3-transform-conditions/README.md',
  point: '在 read 函数里把查询条件改名、去掉首尾空白、丢弃空值，再发给后端',
  hints: [
    '先处理 keyword：(data.keyword || \'\').trim()，有值时 conditions.q = 它。',
    'minAge 判断「有值」不能写 if (data.minAge)，因为 0 也是有效年龄；想想该和什么比较。',
    '返回值里已经写了 data: {}，这样 keyword 不会被原样带上。在 Network 里确认只有 q 和 minAge。',
  ],
  Example,
  Exercise,
};

export default lesson;
