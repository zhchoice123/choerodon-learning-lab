// 只分析注册表的静态结构，不 require 前端模块，更不执行学习者的代码。
const fs = require('fs');
const path = require('path');
const { parse } = require('@babel/parser');

module.exports = function readRegisteredUnits(rootDir, tools) {
  const unitsRoot = path.resolve(rootDir, 'src/units');
  const registry = tools.assertLocalPath(path.join(unitsRoot, 'index.js'));
  const statements = parse(fs.readFileSync(registry, 'utf8'), { sourceType: 'module', plugins: ['jsx'] }).program.body;
  const imports = new Map();
  for (const statement of statements) {
    if (statement.type !== 'ImportDeclaration' || !statement.source.value.startsWith('./')) continue;
    for (const specifier of statement.specifiers) {
      if (specifier.type === 'ImportDefaultSpecifier') {
        imports.set(specifier.local.name, path.resolve(unitsRoot, statement.source.value).replace(/\/index\.js$/, ''));
      }
    }
  }
  const declaration = statements.find((statement) => statement.type === 'ExportNamedDeclaration'
    && statement.declaration?.type === 'VariableDeclaration'
    && statement.declaration.declarations.some((item) => item.id.name === 'units'));
  const entries = declaration?.declaration.declarations.find((item) => item.id.name === 'units')?.init;
  if (entries?.type !== 'ArrayExpression') throw new Error('学习路线注册表缺少静态 units 数组。');
  const discovered = tools.readUnits();
  return entries.elements.map((entry) => {
    if (entry?.type === 'Identifier') {
      const directory = imports.get(entry.name);
      const unit = discovered.find((item) => item.directory === directory);
      if (!unit) throw new Error(`注册单元 ${entry.name} 的目录不存在。`);
      return unit;
    }
    if (entry?.type === 'ObjectExpression') {
      const value = (key) => entry.properties.find((item) => item.type === 'ObjectProperty'
        && (item.key.name || item.key.value) === key)?.value.value;
      const match = /^unit-(\d{2})$/.exec(value('key'));
      if (match && typeof value('title') === 'string') return { number: Number(match[1]), title: value('title') };
    }
    throw new Error('学习路线注册表包含不支持的单元声明。');
  });
};
