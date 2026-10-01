import Example from './Example';
import Exercise from './Exercise';

const lesson = {
  key: 'unit-06-2',
  title: '06-2 级联下拉：cascadeMap',
  doc: 'src/units/06-field-events/sections/2-cascade/README.md',
  point: 'cascadeMap: { 选项字段: 记录字段 } 让子下拉只显示与父字段匹配的选项',
  hints: [
    'cascadeMap 写在子字段（小组）上，是一个对象。',
    '左边是选项数据里的字段名（departmentCode），右边是当前记录的字段名（department）。',
    '写反了（{ department: \'departmentCode\' }）会怎样？试一下，然后对照样例的注释。',
  ],
  Example,
  Exercise,
};

export default lesson;
