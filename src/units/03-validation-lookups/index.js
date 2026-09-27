import Example from './Example';
import Exercise from './Exercise';

const unit03 = {
  key: 'unit-03',
  title: '03 字段校验与值集',
  doc: 'src/units/03-validation-lookups/README.md',
  points: [
    'required、pattern、min / max 与 defaultValidationMessages',
    '同步和异步 validator：返回值与异常处理',
    'options 下拉 DataSet：显示文本与实际值',
    'lookupCode 与字段级 lookupAxiosConfig',
    '等待 validate()，区分校验通过与保存成功',
  ],
  Example,
  Exercise,
};

export default unit03;
