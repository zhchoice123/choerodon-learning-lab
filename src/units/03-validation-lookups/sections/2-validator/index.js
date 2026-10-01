import Example from './Example';
import Exercise from './Exercise';

const lesson = {
  key: 'unit-03-2',
  title: '03-2 自定义 validator：同步与异步',
  doc: 'src/units/03-validation-lookups/sections/2-validator/README.md',
  point: 'validator 返回 true 表示通过、返回字符串表示失败；可以是 async，异常也要返回失败提示',
  hints: [
    'TODO 1：空值交给 required，所以先写 !value || ...；只有空格时 value.trim() 是空字符串。',
    'TODO 2：照着样例写 async validator，fetch 的地址换成 employees/check-code。',
    '服务异常时 response.ok 是 false；网络失败会进入 catch。这两种都要返回「编码校验暂不可用」。',
  ],
  Example,
  Exercise,
};

export default lesson;
