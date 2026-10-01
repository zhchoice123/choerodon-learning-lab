import Example from './Example';
import Exercise from './Exercise';

const lesson = {
  key: 'unit-09-2',
  title: '09-2 generatePageQuery：翻译分页参数',
  doc: 'src/units/09-global-config/sections/2-page-query/README.md',
  point: 'generatePageQuery 收到 page（从 1 开始）和 pageSize，返回值整体替换默认的 page / pagesize 参数',
  hints: [
    '写法：generatePageQuery: ({ page, pageSize }) => ({ ... })。',
    'v2 的 current 也从 1 开始，所以不需要像样例那样减 1。',
    '在 Network 里确认请求是 current=1&limit=5，翻页后 current 变化，并且没有 page / pagesize。',
  ],
  exclusivePreview: true,
  Example,
  Exercise,
};

export default lesson;
