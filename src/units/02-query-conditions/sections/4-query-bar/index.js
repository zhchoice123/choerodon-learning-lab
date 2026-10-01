import Example from './Example';
import Exercise from './Exercise';

const lesson = {
  key: 'unit-02-4',
  title: '02-4 查询栏：queryFieldsLimit',
  doc: 'src/units/02-query-conditions/sections/4-query-bar/README.md',
  point: 'queryBar 打开查询栏，queryFieldsLimit 控制直接显示的条件个数，其余收进「更多」',
  hints: [
    '两个属性都写在 Table 上，不是 DataSet 上。',
    '看样例的 Table：一个控制「显示查询栏」，一个控制「直接显示几个」。',
    '显示顺序就是 queryFields 的顺序，所以「姓名」「员工编码」会直接显示。',
  ],
  Example,
  Exercise,
};

export default lesson;
