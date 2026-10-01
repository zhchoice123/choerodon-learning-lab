import Example from './Example';
import Exercise from './Exercise';

const lesson = {
  key: 'unit-05-5',
  title: '05-5 提交失败：保留草稿',
  doc: 'src/units/05-table-submit/sections/5-submit-failure/README.md',
  point: '提交失败时新增 / 修改的草稿保留，用 feedback.submitFailed 记下后端原因；不要在失败时 reset',
  hints: [
    '先复现：姓名改成 FAIL 保存，看看改动去哪了。罪魁祸首就是 catch 里的那一行。',
    'DataSet 配置里加 feedback: { submitFailed: (error) => ... }，error.response.data.message 就是后端原因。',
    '要在 feedback 里拿到 DataSet 本身，先用 const dataSet = new DataSet({...}) 保存起来，再 return dataSet，样例就是这么写的。',
  ],
  Example,
  Exercise,
};

export default lesson;
