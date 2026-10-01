import Example from './Example';
import Exercise from './Exercise';

const lesson = {
  key: 'unit-07-1',
  title: '07-1 主从 DataSet：children',
  doc: 'src/units/07-master-detail/sections/1-children/README.md',
  point: '头 DataSet 用 children 绑定子 DataSet；切换头的当前记录时，子表自动加载对应的行',
  hints: [
    '在员工 DataSet 配置里加 children: { skills: skillDS }。',
    '子 DataSet 从头上取：employeeDS.children.skills。',
    '技能表格加 pagination={false}；点击第二名员工，Network 里应该出现 employeeId=2 的请求。',
  ],
  Example,
  Exercise,
};

export default lesson;
