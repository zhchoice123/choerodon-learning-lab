import Example from './Example';
import Exercise from './Exercise';

const lesson = {
  key: 'unit-09-4',
  title: '09-4 全局值集：lookupUrl / lookupAxiosMethod',
  doc: 'src/units/09-global-config/sections/4-global-lookup/README.md',
  point: '全局 lookupUrl 生成值集地址、lookupAxiosMethod 指定请求方式；值集响应也用全局 dataKey 解析',
  hints: [
    'lookupUrl 是函数：参数是值集编码，返回 /mock/s/09-4/v2/lookups/ 加上编码（用模板字符串拼接）。',
    '值集默认是 POST，这个后端返回 405：lookupAxiosMethod 设为 \'get\'。',
    '字段上只需要加 lookupCode: \'EMP.SEX\'；值集响应外壳和列表一样，已有的 dataKey 能直接解析。',
  ],
  exclusivePreview: true,
  Example,
  Exercise,
};

export default lesson;
