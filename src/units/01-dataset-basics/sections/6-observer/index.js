import Example from './Example';
import Exercise from './Exercise';

const lesson = {
  key: 'unit-01-6',
  title: '01-6 observer：自动刷新',
  doc: 'src/units/01-dataset-basics/sections/6-observer/README.md',
  point: 'DataSet 是 MobX 可观察对象，observer 包裹的组件会在读取过的属性变化时自动重新渲染',
  hints: [
    '先写 TODO 2，再点击表格行：状态栏不变，说明只写内容还不够。',
    'observer(组件) 返回一个新组件；样例里的 ObservedStatus 就是这么定义的。',
    'dataSet.current 可能为空，先判断再用 .get(\'name\')；已选记录在 dataSet.selected 里。',
  ],
  Example,
  Exercise,
};

export default lesson;
