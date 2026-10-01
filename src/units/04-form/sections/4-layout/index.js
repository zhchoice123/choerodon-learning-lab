import Example from './Example';
import Exercise from './Exercise';

const lesson = {
  key: 'unit-04-4',
  title: '04-4 表单布局：columns / colSpan',
  doc: 'src/units/04-form/sections/4-layout/README.md',
  point: 'Form 的 columns 决定每行字段数，子控件的 colSpan 决定跨几列',
  hints: [
    'columns 写在 Form 上，colSpan 写在控件上。',
    '一行 3 个字段：columns={3}。',
    '邮箱要独占一行，colSpan 应该等于 columns 的值。',
  ],
  Example,
  Exercise,
};

export default lesson;
