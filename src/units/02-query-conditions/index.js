import Example from './Example';
import Exercise from './Exercise';

const unit02 = {
  key: 'unit-02',
  title: '02 查询条件',
  doc: 'src/units/02-query-conditions/README.md',
  points: [
    'queryFields 定义查询字段，queryDataSet 保存查询条件',
    'transport.read 中区分条件 data 和分页 params',
    '字段改名、去空白与空值处理',
    'Table 查询栏与 queryFieldsLimit',
    '程序设置条件、重新查询与恢复默认条件',
  ],
  Example,
  Exercise,
};

export default unit02;
