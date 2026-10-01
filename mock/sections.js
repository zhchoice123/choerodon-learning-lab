// 小节 mock：每个小节拿到所属章节 mock 的一份独立副本，路径前缀为 /mock/s/<小节 id>/。
// 例如小节 05-3 使用 /mock/s/05-3/roles、/mock/s/05-3/roles/create……
// 协议与章节综合练习完全相同，但内存数据互不影响：在小节里新增 / 删除，不会改动综合练习的数据。
// 小节列表从 src/units/<章节>/sections/ 目录发现；01、02 章只用只读的共享接口，不需要副本。
const { createUnitTools } = require('../scripts/unit');

const CHAPTER_MOCKS = {
  3: () => require('./unit03'),
  4: () => require('./unit04'),
  5: () => require('./unit05'),
  6: () => require('./unit06'),
  7: () => require('./unit07'),
  8: () => require('./unit08'),
  9: () => require('./unit09'),
};

// 把章节 mock 注册的路径 /mock/unit-05/... 改写成 /mock/s/05-3/...
function withPrefix(app, from, to) {
  const rewrite = (target) => (typeof target === 'string' && target.startsWith(from) ? to + target.slice(from.length) : target);
  const wrap = (method) => (target, ...handlers) => app[method](rewrite(target), ...handlers);
  return { get: wrap('get'), post: wrap('post'), put: wrap('put'), delete: wrap('delete'), use: wrap('use') };
}

function sectionIds(rootDir) {
  try {
    return createUnitTools(rootDir ? { rootDir } : undefined)
      .readUnits()
      .flatMap((unit) => unit.sections)
      .map((section) => ({ id: section.id, chapter: section.number }));
  } catch (error) {
    return [];
  }
}

module.exports = function registerSectionMocks(app, { rootDir } = {}) {
  for (const { id, chapter } of sectionIds(rootDir)) {
    const load = CHAPTER_MOCKS[chapter];
    if (!load) continue;
    const from = `/mock/unit-${String(chapter).padStart(2, '0')}`;
    load()(withPrefix(app, from, `/mock/s/${id}`));
  }
};

module.exports.withPrefix = withPrefix;
