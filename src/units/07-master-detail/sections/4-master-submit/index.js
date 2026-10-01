import Example from './Example';
import Exercise from './Exercise';

const lesson = {
  key: 'unit-07-4',
  title: '07-4 主从一起提交：头的 transport.submit',
  doc: 'src/units/07-master-detail/sections/4-master-submit/README.md',
  point: '只在头上配置 transport.submit，一次请求提交所有头和它们修改过的行；子表不单独提交',
  hints: [
    '头的 transport 里加 submit: { url: \'/mock/s/07-4/employees/submit\', method: \'POST\' }。',
    '子表不需要任何写接口；保存时只调用 employeeDS.submit()，不要再调 skillDS.submit()。',
    '按 05-4 的方式判断返回值：false 校验未通过，有响应则成功，异常用 try / catch。',
  ],
  Example,
  Exercise,
};

export default lesson;
