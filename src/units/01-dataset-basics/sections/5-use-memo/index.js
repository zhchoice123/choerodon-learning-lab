import Example from './Example';
import Exercise from './Exercise';

const lesson = {
  key: 'unit-01-5',
  title: '01-5 useMemo：DataSet 只创建一次',
  doc: 'src/units/01-dataset-basics/sections/5-use-memo/README.md',
  point: '函数组件每次渲染都会重新执行函数体，用 useMemo(工厂, []) 让 DataSet 只创建一次',
  hints: [
    '先复现问题：勾选两行，点「重新渲染」，看勾选还在不在。',
    '看样例里 memoDS 那一行：useMemo 接收一个「返回 DataSet 的函数」和一个依赖数组。',
    'useMemo(createEmployeeDataSet, []) 和 useMemo(() => createEmployeeDataSet(), []) 效果一样。',
  ],
  Example,
  Exercise,
};

export default lesson;
