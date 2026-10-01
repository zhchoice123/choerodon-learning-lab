import Example from './Example';
import Exercise from './Exercise';
import sections from './sections';

const unit04 = {
  key: 'unit-04',
  title: '04 Form 表单',
  doc: 'src/units/04-form/README.md',
  points: [
    'Form 绑定 dataSet / record，字段共享同一条记录',
    'TextField、Select、NumberField、DatePicker、Switch',
    'Output 只读展示与编辑 / 只读模式',
    'columns / colSpan 表单布局',
    'checkValidity 校验、表单 reset 事件与记录回滚',
  ],
  sections,
  Example,
  Exercise,
};

export default unit04;
