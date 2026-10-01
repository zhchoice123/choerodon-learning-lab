import Example from './Example';
import Exercise from './Exercise';

const lesson = {
  key: 'unit-07-3',
  title: '07-3 子表快照：切换头保留草稿',
  doc: 'src/units/07-master-detail/sections/3-child-snapshot/README.md',
  point: '切换头只需改 current，框架自动加载新头的行、恢复旧头的快照；手动 query 子表会覆盖草稿',
  hints: [
    '复现：改等级 → 切换 → 切回来。打开 Network，看切回来时有没有多出一次技能请求。',
    '框架在切换 current 时已经负责加载和恢复，手动 skillDS.query() 会用后端数据覆盖草稿。',
    '只保留 employeeDS.current = employeeDS.get(index) 这一行。',
  ],
  Example,
  Exercise,
};

export default lesson;
