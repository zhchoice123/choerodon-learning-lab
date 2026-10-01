import Example from './Example';
import Exercise from './Exercise';

const lesson = {
  key: 'unit-01-4',
  title: '01-4 响应解析：dataKey / totalKey',
  doc: 'src/units/01-dataset-basics/sections/4-response-keys/README.md',
  point: 'dataKey 指向响应里的列表数组，totalKey 指向总条数，默认值是 rows / total',
  hints: [
    '先在 Network 面板里点开 /mock/guide/user 的响应，找到列表数组和总条数分别叫什么。',
    '列表对应 dataKey，总条数对应 totalKey，两个都是字符串。',
    '只配 dataKey 不配 totalKey：表格有数据，但分页器会显示几条？试一试就明白 totalKey 的作用。',
  ],
  Example,
  Exercise,
};

export default lesson;
