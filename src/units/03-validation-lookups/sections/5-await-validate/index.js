import Example from './Example';
import Exercise from './Exercise';

const lesson = {
  key: 'unit-03-5',
  title: '03-5 等待校验：validate() 与保存的区别',
  doc: 'src/units/03-validation-lookups/sections/5-await-validate/README.md',
  point: 'validate() 返回 Promise，必须 await 才能拿到结果；校验通过不代表已经保存',
  hints: [
    '不 await 时，valid 是一个 Promise 对象，Promise 对象永远是「真」，所以总显示「通过」。',
    '把 check 改成 async 函数，写 const valid = await employeeDS.validate()。',
    '加载状态：用 useState 记录 checking，Button 的 loading 绑定它；用 try / finally 保证一定会恢复。',
  ],
  Example,
  Exercise,
};

export default lesson;
