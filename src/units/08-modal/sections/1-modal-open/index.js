import Example from './Example';
import Exercise from './Exercise';

const lesson = {
  key: 'unit-08-1',
  title: '08-1 Modal.open：弹窗与抽屉',
  doc: 'src/units/08-modal/sections/1-modal-open/README.md',
  point: 'Modal.open 是函数，调用即打开并返回句柄；drawer: true 变成抽屉，其他写法相同',
  hints: [
    '先取当前员工：const record = employeeDS.current，没有就 return。',
    'Modal.open({ title, drawer: true, children: <Form record={record}>...</Form> })。',
    '只要一个确定按钮：okCancel: false。表单里用 Output 显示三个字段。',
  ],
  Example,
  Exercise,
};

export default lesson;
