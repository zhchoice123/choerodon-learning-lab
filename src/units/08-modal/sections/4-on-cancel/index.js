import Example from './Example';
import Exercise from './Exercise';

const lesson = {
  key: 'unit-08-4',
  title: '08-4 取消：回滚与移除草稿',
  doc: 'src/units/08-modal/sections/4-on-cancel/README.md',
  point: 'onCancel 里 record.reset() 回滚编辑；新增记录 reset 后仍在列表里，要再 remove',
  hints: [
    'Modal.open 加一个 onCancel: () => { ...; return true; }。',
    '撤销修改：record.reset()。先在打开时记下 const isNew = record.status === \'add\'。',
    '新增时还要 employeeDS.remove(record)，否则列表里留一行空白草稿。',
  ],
  Example,
  Exercise,
};

export default lesson;
