import Example from './Example';
import Exercise from './Exercise';

const lesson = {
  key: 'unit-05-3',
  title: '05-3 写接口：记录数组协议',
  doc: 'src/units/05-table-submit/sections/3-write-transport/README.md',
  point: 'create / update / destroy 三个写接口分开配置，请求体都是带 __id、__status 的记录数组',
  hints: [
    '写法和 read 一样：create: { url: \'...\', method: \'POST\' }，update、destroy 同理。',
    '三个地址分别是 /mock/s/05-3/employees/create、/update、/destroy。',
    '保存后在 Network 里点开请求体：是一个数组，每条记录带 __id 和 __status。',
  ],
  Example,
  Exercise,
};

export default lesson;
