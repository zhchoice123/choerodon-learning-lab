import Example from './Example';
import Exercise from './Exercise';

const lesson = {
  key: 'unit-08-5',
  title: '08-5 稳健的弹窗：失败、重复点击、卸载',
  doc: 'src/units/08-modal/sections/5-robust-modal/README.md',
  point: '失败留窗并提示原因；保存期间用标志位忽略重复点击；组件卸载时只关闭自己打开的弹窗',
  hints: [
    '失败提示：Modal.error({ title: \'保存失败\', children: employeeDS.getState(\'submitError\') })。',
    '防重复：在 Modal.open 之前声明 let pending = false；onOk 开头 if (pending) return false，并在 finally 里复位。',
    '卸载清理：useEffect(() => () => modalRef.current && modalRef.current.close(), [])，记得引入 useEffect。',
  ],
  Example,
  Exercise,
};

export default lesson;
