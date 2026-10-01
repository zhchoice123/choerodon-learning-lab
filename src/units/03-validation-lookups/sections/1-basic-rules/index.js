import Example from './Example';
import Exercise from './Exercise';

const lesson = {
  key: 'unit-03-1',
  title: '03-1 基础校验：required / pattern / min / max',
  doc: 'src/units/03-validation-lookups/sections/1-basic-rules/README.md',
  point: '校验规则写在 fields 上；提示文案用 defaultValidationMessages，键名与规则对应',
  hints: [
    '规则是字段上的属性：required: true、pattern: /正则/、min / max。',
    '提示的键名不是规则名：必填 → valueMissing，正则 → patternMismatch，范围 → rangeUnderflow / rangeOverflow。',
    'EMP 加 3 位数字的正则：/^EMP\\d{3}$/。^ 和 $ 保证整个值都要匹配，不能只是包含。',
  ],
  Example,
  Exercise,
};

export default lesson;
