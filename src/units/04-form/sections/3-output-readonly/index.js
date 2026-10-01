import Example from './Example';
import Exercise from './Exercise';

const lesson = {
  key: 'unit-04-3',
  title: '04-3 只读：readOnly 与 Output',
  doc: 'src/units/04-form/sections/3-output-readonly/README.md',
  point: 'Form 的 readOnly 切换整张表单的只读状态；Output 永远只读，record 属性显式绑定一条记录',
  hints: [
    '切换需要一个布尔状态：const [readOnly, setReadOnly] = useState(false)，记得引入 useState。',
    '把 readOnly 传给 Form；按钮 onClick 里取反。',
    '预览用 <Form record={employeeDS.current}>，里面放 Output，只写 name。',
  ],
  Example,
  Exercise,
};

export default lesson;
