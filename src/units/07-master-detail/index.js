import Example from './Example';
import Exercise from './Exercise';

const unit07 = {
  key: 'unit-07',
  title: '07 主从 DataSet',
  doc: 'src/units/07-master-detail/README.md',
  points: [
    'children 绑定头与行，名称决定嵌套提交字段',
    'cascadeParams 传递父主键，切换 current 自动加载子表',
    '子表快照保留各头的草稿，避免切换时手动重查',
    '从头 DataSet 一次提交主从，递归校验和 ID 回写',
    '整份请求原子校验，失败保留草稿并修正重试',
  ],
  Example,
  Exercise,
};

export default unit07;
