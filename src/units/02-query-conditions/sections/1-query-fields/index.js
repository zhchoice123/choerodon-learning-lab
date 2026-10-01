import Example from './Example';
import Exercise from './Exercise';

const lesson = {
  key: 'unit-02-1',
  title: '02-1 查询字段：queryFields',
  doc: 'src/units/02-query-conditions/sections/1-query-fields/README.md',
  point: 'queryFields 定义查询条件，DataSet 自动创建 queryDataSet，Table 据此生成查询栏',
  hints: [
    'queryFields 的写法和 fields 完全一样：{ name, type, label }。',
    '查询栏要在 Table 上打开，看样例 Table 多写了哪个属性。',
    '查询字段名和后端参数同名时，条件会直接作为查询参数发出：在 Network 里确认 name=、sex=。',
  ],
  Example,
  Exercise,
};

export default lesson;
