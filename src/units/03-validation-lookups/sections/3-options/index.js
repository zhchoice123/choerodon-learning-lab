import Example from './Example';
import Exercise from './Exercise';

const lesson = {
  key: 'unit-03-3',
  title: '03-3 options 下拉：显示与保存',
  doc: 'src/units/03-validation-lookups/sections/3-options/README.md',
  point: '字段的 options 指向一个选项 DataSet，textField 决定显示什么，valueField 决定保存什么',
  hints: [
    '选项 DataSet 只需要 data，每条形如 { value: \'M\', meaning: \'男\' }；样例里还写了 paging: false。',
    '字段上加三个属性：options、textField、valueField。',
    '选完后看状态栏：显示的是 M / F，说明记录保存的是 value；下拉框里看到的是 meaning。',
  ],
  Example,
  Exercise,
};

export default lesson;
