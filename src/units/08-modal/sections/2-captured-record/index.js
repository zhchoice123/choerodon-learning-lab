import Example from './Example';
import Exercise from './Exercise';

const lesson = {
  key: 'unit-08-2',
  title: '08-2 绑定捕获的记录',
  doc: 'src/units/08-modal/sections/2-captured-record/README.md',
  point: '打开弹窗时捕获要编辑的记录，Form 用 record 绑定它；用 dataSet 绑定会跟着 current 变化',
  hints: [
    '在 Modal.open 之前写 const record = employeeDS.current，把记录「捕获」下来。',
    '标题用 record.get(\'name\')；Form 改成 <Form record={record}>。',
    '打开后点演示按钮：表格高亮行变了，但表单里还是原来那名员工，就对了。',
  ],
  Example,
  Exercise,
};

export default lesson;
