import Example from './Example';
import Exercise from './Exercise';

const lesson = {
  key: 'unit-05-2',
  title: '05-2 表格按钮：add / save / delete / reset',
  doc: 'src/units/05-table-submit/sections/2-table-buttons/README.md',
  point: 'Table 的 buttons 写内置按钮名即可：add 新增、save 提交、delete 立即删除、reset 撤销本地修改',
  hints: [
    'buttons 是 Table 的属性，值是一个数组。',
    '内置按钮只需写名字字符串：\'add\'、\'save\'、\'delete\'、\'reset\'。',
    '新增一行：编码填 EMP900、姓名随便填，点保存，Network 里会有一次 create 请求。',
  ],
  Example,
  Exercise,
};

export default lesson;
