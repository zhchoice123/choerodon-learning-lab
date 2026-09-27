import Example from './Example';
import Exercise from './Exercise';

const unit06 = {
  key: 'unit-06',
  title: '06 字段联动与事件',
  doc: 'src/units/06-field-events/README.md',
  points: [
    'dynamicProps / computedProps：根据当前记录计算字段属性',
    'cascadeMap：选项父键与当前记录字段的映射',
    'events：load / update / select 的参数与触发时机',
    'record.set 联动赋值、清理失效子值与防止递归',
    '当前记录与事件记录的区别，选中与定位的区别',
  ],
  Example,
  Exercise,
};

export default unit06;
