import Example from './Example';
import Exercise from './Exercise';

const lesson = {
  key: 'unit-09-1',
  title: '09-1 configure：全局配置与作用范围',
  doc: 'src/units/09-global-config/sections/1-configure-scope/README.md',
  point: 'configure 写一次对之后创建的所有 DataSet 生效，是全应用共享的单例；本项目用 LessonConfigScope 进入时应用、离开时恢复',
  hints: [
    '配置对象的键名和 DataSet 上的属性同名：{ dataKey: \'content\', totalKey: \'totalElements\' }。',
    '包一层：<LessonConfigScope config={config}><EmployeeList /></LessonConfigScope>。',
    'DataSet 要在配置生效之后才创建，所以要放在 LessonConfigScope 的子组件里（样例的 RoleList 就是这样）。',
  ],
  // 样例和练习各自修改全局配置：工作台只挂载当前标签的预览
  exclusivePreview: true,
  Example,
  Exercise,
};

export default lesson;
