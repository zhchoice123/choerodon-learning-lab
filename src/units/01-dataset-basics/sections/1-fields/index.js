import Example from './Example';
import Exercise from './Exercise';

const lesson = {
  key: 'unit-01-1',
  title: '01-1 字段类型：fields',
  doc: 'src/units/01-dataset-basics/sections/1-fields/README.md',
  point: '用 fields 描述每个字段的 name / type / label，type 决定显示方式',
  hints: [
    'fields 是一个数组，每个元素形如 { name, type, label }，name 要和 data 里的键完全一致。',
    '文字用 string，数字用 number；true / false 用哪个 type？去样例里找「启用」那一列。',
    '样例的 createdAt 用了 dateTime，会显示时分秒；只要日期时，把 type 换成去掉 Time 的那个。',
  ],
  Example,
  Exercise,
};

export default lesson;
