import Example from './Example';
import Exercise from './Exercise';

const lesson = {
  key: 'unit-07-5',
  title: '07-5 原子提交失败：保留草稿重试',
  doc: 'src/units/07-master-detail/sections/5-atomic-failure/README.md',
  point: '主从一次请求要么全成功要么全不保存；失败时保留所有头和行的草稿，记下原因让用户修正重试',
  hints: [
    '和 05-5 一样：feedback.submitFailed 里用 error.response.data.message 记下原因。',
    '要在 feedback 里拿到头 DataSet，先 const employeeDS = new DataSet(...)，再 return employeeDS。',
    '去掉 catch 里的 query()；把 FAIL 改回正常编码再保存，应该一次成功。',
  ],
  Example,
  Exercise,
};

export default lesson;
