import Example from './Example';
import Exercise from './Exercise';

const lesson = {
  key: 'unit-05-1',
  title: '05-1 行内编辑：editor',
  doc: 'src/units/05-table-submit/sections/1-inline-editor/README.md',
  point: '列上写 editor: true 打开单元格编辑，控件按字段类型自动选择；规则仍然写在 fields',
  hints: [
    '规则写在字段上：required: true；min: 18、max: 60。',
    '列的编辑开关是 editor: true（不是 edit）。编码那一列不要写。',
    '把姓名清空、年龄改成 70：单元格会标红，这就是 fields 上的规则在生效。',
  ],
  Example,
  Exercise,
};

export default lesson;
