// 学习单元工具：只使用 Node 内置模块，不加载或执行练习代码。
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const difficulties = ['easy', 'normal', 'hard'];

function unitError(code, message) {
  return Object.assign(new Error(message), { code });
}

// 课程 id：'01' 是章节（综合练习），'01-2' 是章节下的第 2 小节。也接受 '1'、'1-2'。
const ID_PATTERN = /^(\d{1,2})(?:-(\d{1,2}))?$/;
const USAGE_HINT = '请提供单元号或小节号，例如：yarn unit:reset 2 normal、yarn unit:reset 01-3（也支持 02）。';

function parseLessonId(input) {
  const match = ID_PATTERN.exec(String(input ?? ''));
  if (!match || Number(match[1]) < 1 || (match[2] !== undefined && Number(match[2]) < 1)) return null;
  const chapter = Number(match[1]);
  const section = match[2] === undefined ? null : Number(match[2]);
  const id = `${String(chapter).padStart(2, '0')}${section === null ? '' : `-${section}`}`;
  return { chapter, section, id };
}

function createUnitTools({ rootDir = path.resolve(__dirname, '..') } = {}) {
  const root = fs.realpathSync(rootDir);
  const unitsRoot = path.join(root, 'src/units');

  // 请求不能借助磁盘上的符号链接越过项目边界（包括模板、练习和备份目录）。
  function assertLocalPath(file) {
    const relative = path.relative(root, file);
    if (relative.startsWith(`..${path.sep}`) || relative === '..' || path.isAbsolute(relative)) {
      throw unitError('BAD_REQUEST', '文件路径超出项目范围。');
    }
    let current = root;
    for (const part of relative.split(path.sep)) {
      current = path.join(current, part);
      try {
        if (fs.lstatSync(current).isSymbolicLink()) {
          throw unitError('BAD_REQUEST', '学习文件路径不能包含符号链接。');
        }
      } catch (error) {
        if (error.code !== 'ENOENT') throw error;
      }
    }
    return file;
  }

  function readUnits() {
    const units = new Map();
    // 未开放单元没有目录，从注册表读取静态 key / title；不执行 React 模块。
    const registry = fs.readFileSync(assertLocalPath(path.join(unitsRoot, 'index.js')), 'utf8');
    const pattern = /key:\s*['"]unit-(\d+)['"]\s*,\s*title:\s*['"]([^'"]+)['"]/g;
    for (const match of registry.matchAll(pattern)) {
      units.set(Number(match[1]), { number: Number(match[1]), title: match[2] });
    }
    for (const entry of fs.readdirSync(unitsRoot, { withFileTypes: true })) {
      const match = /^(\d+)-.+$/.exec(entry.name);
      if (!entry.isDirectory() || !match) continue;
      const number = Number(match[1]);
      if (units.get(number)?.directory) throw new Error(`单元 ${number} 存在多个目录，请先检查目录名称。`);
      const directory = path.join(unitsRoot, entry.name);
      const metaFile = assertLocalPath(path.join(directory, 'index.js'));
      const meta = fs.existsSync(metaFile) ? fs.readFileSync(metaFile, 'utf8') : '';
      const title = /title:\s*['"]([^'"]+)['"]/.exec(meta)?.[1] || entry.name;
      units.set(number, { number, title, directory, name: entry.name, sections: readSections(number, directory, entry.name) });
    }
    return [...units.values()]
      .map((unit) => ({ id: String(unit.number).padStart(2, '0'), kind: 'chapter', sections: [], ...unit }))
      .sort((a, b) => a.number - b.number);
  }

  // 小节目录：<章节目录>/sections/<序号>-<名称>/，结构与章节相同（index.js、Example.js、Exercise.js、templates/）
  function readSections(chapterNumber, chapterDirectory, chapterName) {
    const sectionsRoot = assertLocalPath(path.join(chapterDirectory, 'sections'));
    if (!fs.existsSync(sectionsRoot)) return [];
    const sections = [];
    for (const entry of fs.readdirSync(sectionsRoot, { withFileTypes: true })) {
      const match = /^(\d+)-.+$/.exec(entry.name);
      if (!entry.isDirectory() || !match) continue;
      const section = Number(match[1]);
      if (sections.some((item) => item.section === section)) {
        throw new Error(`单元 ${chapterNumber} 的小节 ${section} 存在多个目录，请先检查目录名称。`);
      }
      const directory = path.join(sectionsRoot, entry.name);
      const metaFile = assertLocalPath(path.join(directory, 'index.js'));
      const meta = fs.existsSync(metaFile) ? fs.readFileSync(metaFile, 'utf8') : '';
      const id = `${String(chapterNumber).padStart(2, '0')}-${section}`;
      sections.push({
        id,
        kind: 'section',
        number: chapterNumber,
        section,
        title: /title:\s*['"]([^'"]+)['"]/.exec(meta)?.[1] || id,
        directory,
        name: `${chapterName}/sections/${entry.name}`,
      });
    }
    return sections.sort((a, b) => a.section - b.section);
  }

  // 所有课程（章节和小节）按学习顺序展开：01-1、01-2 …、01、02-1 …
  function readLessons() {
    return readUnits().flatMap((unit) => [...unit.sections, unit]);
  }

  function findUnit(numberInput) {
    const parsed = parseLessonId(numberInput);
    if (!parsed) throw unitError('UNIT_NOT_FOUND', USAGE_HINT);
    const unit = readLessons().find((item) => item.id === parsed.id);
    if (!unit) throw unitError('UNIT_NOT_FOUND', `找不到单元 ${numberInput}，请先运行 yarn unit:list。`);
    return unit;
  }

  function requireOpenUnit(numberInput) {
    const unit = findUnit(numberInput);
    if (!unit.directory) throw unitError('UNIT_LOCKED', `单元 ${numberInput} 尚未开放，没有练习目录或模板。`);
    return unit;
  }

  function templatePath(unit, difficulty) {
    return assertLocalPath(path.join(unit.directory, 'templates', `Exercise.${difficulty}.js`));
  }

  function exercisePath(numberInput) {
    return assertLocalPath(path.join(requireOpenUnit(numberInput).directory, 'Exercise.js'));
  }

  function getUnitState(numberInput) {
    const unit = findUnit(numberInput);
    if (!unit.directory) return { state: 'locked', matched: null, difficulties: [], matches: [] };
    const available = difficulties.filter((difficulty) => fs.existsSync(templatePath(unit, difficulty)));
    const exercise = exercisePath(numberInput);
    const content = fs.existsSync(exercise) ? fs.readFileSync(exercise) : null;
    const matches = content === null ? [] : available.filter((difficulty) => content.equals(fs.readFileSync(templatePath(unit, difficulty))));
    return {
      state: matches.length ? 'not-started' : 'in-progress',
      matched: matches[0] || null,
      difficulties: available,
      matches,
    };
  }

  function stamp() {
    return `${new Date().toISOString().replace(/[:.]/g, '-')}-${process.pid}-${crypto.randomBytes(4).toString('hex')}`;
  }

  function writeAtomically(exercise, content) {
    const temporary = path.join(path.dirname(exercise), `.Exercise.${stamp()}.tmp`);
    try {
      fs.writeFileSync(temporary, content, { flag: 'wx' });
      // 同目录原子替换，避免写入中断留下半个练习文件。
      fs.renameSync(temporary, exercise);
    } finally {
      if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
    }
  }

  function saveExercise(numberInput, code) {
    const exercise = exercisePath(numberInput);
    const content = Buffer.from(code, 'utf8');
    if (!fs.existsSync(exercise) || !content.equals(fs.readFileSync(exercise))) {
      writeAtomically(exercise, content);
    }
    return getUnitState(numberInput);
  }

  function resetUnit(numberInput, difficulty = 'normal') {
    // 保持命令行参数错误的原有提示及默认难度。
    if (!parseLessonId(numberInput)) throw unitError('UNIT_NOT_FOUND', USAGE_HINT);
    if (!difficulties.includes(difficulty)) {
      throw unitError('BAD_DIFFICULTY', `未知难度「${difficulty}」，可用值：easy、normal、hard。`);
    }
    const unit = requireOpenUnit(numberInput);
    const template = templatePath(unit, difficulty);
    if (!fs.existsSync(template)) throw unitError('FILE_NOT_FOUND', `找不到 ${difficulty} 模板：${template}`);
    // 先读模板，避免模板不可读时已经产生覆盖操作。
    const content = fs.readFileSync(template);
    const exercise = exercisePath(numberInput);
    let backupPath = null;
    if (fs.existsSync(exercise)) {
      const backupDirectory = assertLocalPath(path.join(root, '.backup', unit.name));
      fs.mkdirSync(backupDirectory, { recursive: true });
      const backup = path.join(backupDirectory, `Exercise.${stamp()}.js`);
      // 备份失败会直接退出；绝不继续覆盖。EXCL 防止覆盖已有备份。
      fs.copyFileSync(exercise, backup, fs.constants.COPYFILE_EXCL);
      backupPath = path.relative(root, backup).split(path.sep).join('/');
    }
    writeAtomically(exercise, content);
    return { code: content.toString('utf8'), backupPath, exercisePath: exercise, ...getUnitState(numberInput) };
  }

  function describe(lesson) {
    const state = getUnitState(lesson.id);
    let status = 'Exercise.js 不存在';
    if (fs.existsSync(exercisePath(lesson.id))) {
      status = state.matches.length ? `与 ${state.matches.join(' / ')} 模板一致` : '已改动（与所有模板均不一致）';
      if (!state.difficulties.length) status = '暂无模板，无法比较';
    }
    return `可用难度：${state.difficulties.join(' / ') || '无'} ｜ ${status}`;
  }

  function listUnits() {
    for (const unit of readUnits()) {
      if (!unit.directory) {
        console.log(`${unit.title} ｜ 可用难度：无 ｜ 未开放`);
        continue;
      }
      console.log(`${unit.title} ｜ ${describe(unit)}`);
      for (const section of unit.sections) console.log(`  ${section.title} ｜ ${describe(section)}`);
    }
  }

  return { readUnits, readLessons, findUnit, getUnitState, resetUnit, saveExercise, exercisePath, assertLocalPath, listUnits };
}

// require 时只导出工具，不解析 process.argv，也不写入任何文件。
module.exports = { createUnitTools, parseLessonId };

if (require.main === module) {
  try {
    const tools = createUnitTools();
    const [command, ...args] = process.argv.slice(2);
    if (command === 'list' && args.length === 0) {
      tools.listUnits();
    } else if (command === 'reset' && args.length >= 1 && args.length <= 2) {
      const result = tools.resetUnit(...args);
      console.log(result.backupPath ? `已备份：${path.join(path.resolve(__dirname, '..'), result.backupPath)}` : 'Exercise.js 不存在，将从模板创建，无需备份。');
      console.log(`已重置：${result.exercisePath}（${args[1] || 'normal'}）`);
    } else {
      throw new Error('用法：yarn unit:list 或 yarn unit:reset <单元号或小节号> [easy|normal|hard]，例如 yarn unit:reset 01-3。');
    }
  } catch (error) {
    console.error(`单元工具错误：${error.message}`);
    process.exitCode = 1;
  }
}
