import Example from './Example';
import Exercise from './Exercise';

const lesson = {
  key: 'unit-09-5',
  title: '09-5 优先级：DataSet 属性优先于全局',
  doc: 'src/units/09-global-config/sections/5-precedence/README.md',
  point: 'DataSet 自己写的属性优先于全局配置：特殊接口可以单独覆盖，但复制来的旧配置也会悄悄盖住全局',
  hints: [
    '全局的 dataKey 是 data.items，DataSet 上又写了 content。DataSet 最终用的是哪个？',
    'DataSet 自己的属性优先；v2 的响应里没有 content，所以整条响应被当成一条记录。',
    '删掉 DataSet 上的 dataKey / totalKey，让全局配置生效。',
  ],
  exclusivePreview: true,
  Example,
  Exercise,
};

export default lesson;
