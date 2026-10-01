import Example from './Example';
import Exercise from './Exercise';

const lesson = {
  key: 'unit-04-2',
  title: '04-2 常用控件：与字段类型配合',
  doc: 'src/units/04-form/sections/2-controls/README.md',
  point: 'TextField / Select / NumberField / DatePicker / Switch 分别对应文字、选项、数字、日期、布尔',
  hints: [
    '看字段的 type 和有没有 options：有 options 的用 Select。',
    'number 用 NumberField，date 用 DatePicker，boolean 用 Switch。',
    '控件顺序就是表单里的顺序；每个控件只写 name。',
  ],
  Example,
  Exercise,
};

export default lesson;
