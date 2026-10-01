import Example from './Example';
import Exercise from './Exercise';

const lesson = {
  key: 'unit-05-4',
  title: '05-4 提交结果：submit 的三种返回值',
  doc: 'src/units/05-table-submit/sections/4-submit-result/README.md',
  point: 'submit() 先校验：false 表示校验失败、undefined 表示没有请求、其他是后端响应；成功后回写 id 并置为 sync',
  hints: [
    '先用 employeeDS.dirty 判断有没有修改。',
    'const response = await employeeDS.submit(); 然后分三种情况：response === false、response 为真、其他。',
    '请求失败会抛异常：用 try / catch 包住 submit，在 catch 里显示 error.message。',
  ],
  Example,
  Exercise,
};

export default lesson;
