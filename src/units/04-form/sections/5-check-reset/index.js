import Example from './Example';
import Exercise from './Exercise';

const lesson = {
  key: 'unit-04-5',
  title: '04-5 表单校验与重置',
  doc: 'src/units/04-form/sections/5-check-reset/README.md',
  point: '1.6.7 的 Form 用 checkValidity() 校验（返回 Promise）；type="reset" 的按钮恢复初始值，onReset 收到通知',
  hints: [
    '点「校验」时打开浏览器控制台，看报的是什么错：formRef.current 上没有 validate。',
    '1.6.7 的 Form 提供的是 checkValidity()，同样返回 Promise<boolean>，要 await。',
    '重置按钮：<Button type="reset">（Pro 的 Button 用 type，不是 htmlType）；提示写在 Form 的 onReset 里。',
  ],
  Example,
  Exercise,
};

export default lesson;
