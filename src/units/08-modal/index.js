import Example from './Example';
import Exercise from './Exercise';

const unit08 = {
  key: 'unit-08',
  title: '08 Modal 弹窗与抽屉',
  doc: 'src/units/08-modal/README.md',
  points: [
    'Modal.open 与 drawer 共用新增 / 编辑表单',
    'Form 绑定打开时捕获的 record，不依赖之后的 current',
    'onOk 等待校验与提交，返回 true / false 控制关闭',
    'onCancel 用 record.reset 回滚，取消新增移除草稿',
    '失败留窗、保存期间防重复与组件卸载清理',
  ],
  Example,
  Exercise,
};
export default unit08;
