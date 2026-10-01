import Example from './Example';
import Exercise from './Exercise';

const lesson = {
  key: 'unit-01-7',
  title: '01-7 常用实例成员',
  doc: 'src/units/01-dataset-basics/sections/7-instance-api/README.md',
  point: 'query(page) 查询、currentPage 当前页、selected 勾选的记录、record.get 取值',
  hints: [
    'query() 不传参数会回到第 1 页；当前页码保存在 DataSet 的 currentPage 上。',
    'selected 是一个普通数组，可以用 map 取出每条记录的姓名，再用 join 拼成一句话。',
    '女性人数：先用 filter 挑出 record.get(\'sex\') === \'F\' 的记录，再取数组长度。',
  ],
  Example,
  Exercise,
};

export default lesson;
