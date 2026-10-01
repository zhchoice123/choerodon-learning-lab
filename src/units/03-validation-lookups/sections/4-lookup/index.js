import Example from './Example';
import Exercise from './Exercise';

const lesson = {
  key: 'unit-03-4',
  title: '03-4 值集：lookupCode',
  doc: 'src/units/03-validation-lookups/sections/4-lookup/README.md',
  point: '字段写 lookupCode 和 lookupUrl，选项从后端值集读取；lookupAxiosConfig 调整请求方式和响应解析',
  hints: [
    'lookupCode 写编码字符串；lookupUrl 是函数 (code) => 地址，记得 encodeURIComponent。',
    '1.6.7 的值集默认用 POST，本接口只支持 GET：在 lookupAxiosConfig 里写 method。',
    '响应是 { content: [...] }，照抄样例的 transformResponse，并且 lookupAxiosConfig 要写成返回对象的函数。',
  ],
  Example,
  Exercise,
};

export default lesson;
