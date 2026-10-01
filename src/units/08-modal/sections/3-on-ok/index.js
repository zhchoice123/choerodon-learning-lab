import Example from './Example';
import Exercise from './Exercise';

const lesson = {
  key: 'unit-08-3',
  title: '08-3 onOk：校验、保存与关闭',
  doc: 'src/units/08-modal/sections/3-on-ok/README.md',
  point: 'onOk 可以是 async，返回 false 不关闭、true 关闭、undefined 也会关闭；保存用 submitRecord 只提交这一条',
  hints: [
    '把 onOk 改成 async 函数，先 if (!(await record.validate())) return false。',
    '保存这一条：await employeeDS.submitRecord(record)，有返回值才算成功，返回 Boolean(结果)。',
    '用 try / catch 包住保存，catch 里 return false。每条路径都要明确返回 true 或 false。',
  ],
  Example,
  Exercise,
};

export default lesson;
