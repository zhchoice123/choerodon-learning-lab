import Example from './Example';
import Exercise from './Exercise';

const lesson = {
  key: 'unit-01-3',
  title: '01-3 从接口加载：transport.read',
  doc: 'src/units/01-dataset-basics/sections/3-transport-read/README.md',
  point: 'transport.read 描述查询接口，autoQuery 自动查询，pageSize 控制每页条数',
  hints: [
    '先对照样例写出三个开关：primaryKey、autoQuery、pageSize，注意本题每页是 3 条。',
    'transport 是一个对象，read 里至少要有 url 和 method。',
    '打开浏览器 Network 面板，看请求地址里的 page 和 pagesize 参数是不是你预期的值。',
  ],
  Example,
  Exercise,
};

export default lesson;
