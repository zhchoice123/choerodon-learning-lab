import Example from './Example';
import Exercise from './Exercise';

const lesson = {
  key: 'unit-02-2',
  title: '02-2 read 函数：data 与 params',
  doc: 'src/units/02-query-conditions/sections/2-read-function/README.md',
  point: 'transport.read 写成函数，参数里 data 是查询条件、params 是分页参数，返回 axios 请求配置',
  hints: [
    'read 写成函数后，形如 ({ data, params }) => ({ url, method, params: ... })。',
    '分页参数和查询条件都要保留：用展开运算符 { ...params, ...data } 合并。',
    '最后再加上 active: true。翻页、查询时都在 Network 里确认请求带着 active=true。',
  ],
  Example,
  Exercise,
};

export default lesson;
