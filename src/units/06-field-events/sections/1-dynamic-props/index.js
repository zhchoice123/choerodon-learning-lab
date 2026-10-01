import Example from './Example';
import Exercise from './Exercise';

const lesson = {
  key: 'unit-06-1',
  title: '06-1 动态属性：dynamicProps / computedProps',
  doc: 'src/units/06-field-events/sections/1-dynamic-props/README.md',
  point: 'dynamicProps / computedProps 按属性写函数，根据当前记录计算 required、disabled、label 等',
  hints: [
    '写成 dynamicProps: { required: ({ record }) => ..., disabled: ({ record }) => ... }。',
    '在职时必填：record.get(\'active\') === true；离职时禁用：!record.get(\'active\')。',
    'label 也可以动态计算；同一个属性不要在 dynamicProps 和 computedProps 里重复写。',
  ],
  Example,
  Exercise,
};

export default lesson;
