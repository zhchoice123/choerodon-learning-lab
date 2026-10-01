import Example from './Example';
import Exercise from './Exercise';

const lesson = {
  key: 'unit-07-2',
  title: '07-2 子表查询参数：cascadeParams',
  doc: 'src/units/07-master-detail/sections/2-cascade-params/README.md',
  point: '子表默认用父主键名作参数；接口参数名不同时，用 cascadeParams(parent) 返回需要的参数',
  hints: [
    '先看 Network：切换员工时，技能请求的 employeeId 有没有变？',
    'cascadeParams 的参数就是父记录（当前员工），现在的写法把它忽略了。',
    '改成 (parent) => ({ employeeId: parent.get(\'id\') })。'
  ],
  Example,
  Exercise,
};

export default lesson;
