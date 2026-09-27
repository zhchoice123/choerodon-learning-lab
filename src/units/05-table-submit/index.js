import Example from './Example';
import Exercise from './Exercise';

const unit05 = {
  key: 'unit-05',
  title: '05 表格编辑与提交',
  doc: 'src/units/05-table-submit/README.md',
  points: [
    'editor 行内编辑，校验规则仍写在 fields',
    'Table buttons：add / save / delete / reset',
    'transport create / update / destroy 的记录数组协议',
    'submit 与 id 回写、record.status、dataSet.dirty',
    '提交失败保留草稿，区分删除失败与新增 / 修改失败',
  ],
  Example,
  Exercise,
};

export default unit05;
