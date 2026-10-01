import Example from './Example';
import Exercise from './Exercise';

const lesson = {
  key: 'unit-04-1',
  title: '04-1 Form 绑定 dataSet：编辑当前行',
  doc: 'src/units/04-form/sections/1-bind-current/README.md',
  point: 'Form 的 dataSet 属性默认绑定 current，子控件只写 name；表格和表单编辑的是同一条记录',
  hints: [
    '照着样例写 <Form dataSet={...} columns={1}>，里面放三个控件。',
    '文字用 TextField，数字用 NumberField，每个控件只写 name。',
    '在表单里改姓名，左边表格同一行立刻变化：它们编辑的是同一条记录。',
  ],
  Example,
  Exercise,
};

export default lesson;
