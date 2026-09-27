import Example from './Example';
import Exercise from './Exercise';

const unit01 = {
  key: 'unit-01',
  title: '01 DataSet 基础与 Table 绑定',
  doc: 'src/units/01-dataset-basics/README.md',
  points: [
    'DataSet 基础配置：primaryKey、autoQuery、pageSize',
    'transport.read 与响应解析：dataKey、totalKey',
    'fields 字段类型：string / number / boolean / date / dateTime',
    'Table 绑定 DataSet，columns 只写 name',
    'useMemo 创建 DataSet 的原因',
    'DataSet 是 MobX 可观察对象：observer 自动刷新',
    '常用实例成员：query()、current、selected、totalCount、record.get()',
  ],
  Example,
  Exercise,
};

export default unit01;
