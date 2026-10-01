// 课程目录：章节（units）+ 章节下的小节（chapter.sections），按学习顺序展开。
// 小节 key：unit-01-2；章节 key：unit-01（章节本身就是该章的综合练习，三档难度）。
import { units } from '../units';

function annotate(chapter) {
  const sections = (chapter.sections || []).map((section) => ({ ...section, kind: 'section', chapter }));
  return { ...chapter, kind: 'chapter', sections };
}

export const chapters = units.map(annotate);

// 学习顺序：01-1、01-2 …、01（综合练习）、02-1 …
export const lessons = chapters.flatMap((chapter) => [...chapter.sections, chapter]);

export function findLesson(key) {
  return lessons.find((lesson) => lesson.key === key);
}

export function chapterOf(lesson) {
  return lesson.kind === 'section' ? lesson.chapter : lesson;
}

// 上一课 / 下一课（只在已开放的课程之间跳转）
export function neighbors(key) {
  const open = lessons.filter((lesson) => lesson.Example || lesson.Exercise);
  const index = open.findIndex((lesson) => lesson.key === key);
  if (index < 0) return { prev: null, next: null };
  return { prev: open[index - 1] || null, next: open[index + 1] || null };
}

// 课程在导航和标题里的短名称：小节「01-2 transport.read」，章节「01 综合练习」
export function lessonLabel(lesson) {
  if (lesson.kind === 'section') return lesson.title;
  const number = /^(\d{2})/.exec(lesson.title)?.[1];
  return number ? `${number} 综合练习` : `${lesson.title} · 综合练习`;
}
