import Example from './Example';
import Exercise from './Exercise';

const lesson = {
  key: 'unit-02-5',
  title: '02-5 用代码控制查询',
  doc: 'src/units/02-query-conditions/sections/5-program-conditions/README.md',
  point: '用 queryDataSet.current.set 修改条件、reset 恢复默认，修改后要主动 query(1)',
  hints: [
    '条件在 employeeDS.queryDataSet.current 上，用 set(\'sex\', \'F\') 修改单个条件。',
    '修改条件不会自动查询，要调用 query；从第 1 页开始，所以传 1。',
    '恢复默认用 reset()。先翻到第 3 页再点按钮，确认请求的 page=1。',
  ],
  Example,
  Exercise,
};

export default lesson;
