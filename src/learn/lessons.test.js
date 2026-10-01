import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { chapters, chapterOf, findLesson, lessonLabel, lessons, neighbors } from './lessons';
import HintsPanel from './workspace/HintsPanel';
import LessonNav from './workspace/LessonNav';

afterEach(() => {
  window.location.hash = '';
});

describe('lessons 课程目录', () => {
  test('学习顺序：每章先列小节，再列本章综合练习', () => {
    const keys = lessons.map((lesson) => lesson.key);
    const first = chapters[0];
    expect(keys.slice(0, first.sections.length + 1)).toEqual([...first.sections.map((section) => section.key), first.key]);
    expect(keys.indexOf('unit-01-1')).toBeLessThan(keys.indexOf('unit-01'));
    expect(keys.indexOf('unit-01')).toBeLessThan(keys.indexOf('unit-02-1'));
  });

  test('每章都有小节，小节都知道自己属于哪一章', () => {
    chapters.forEach((chapter) => {
      expect(chapter.sections.length).toBeGreaterThan(0);
      chapter.sections.forEach((section) => {
        expect(section.kind).toBe('section');
        expect(chapterOf(section).key).toBe(chapter.key);
        expect(section.key.startsWith(`${chapter.key}-`)).toBe(true);
      });
    });
    expect(chapterOf(findLesson('unit-03')).key).toBe('unit-03');
  });

  test('上一课 / 下一课跨越章节边界', () => {
    const lastSection = chapters[0].sections[chapters[0].sections.length - 1];
    expect(neighbors(lastSection.key).next.key).toBe('unit-01');
    expect(neighbors('unit-01').next.key).toBe('unit-02-1');
    expect(neighbors('unit-02-1').prev.key).toBe('unit-01');
    expect(neighbors(lessons[0].key).prev).toBeNull();
    expect(neighbors('unit-99')).toEqual({ prev: null, next: null });
  });

  test('课程短名称：小节用标题，章节显示为综合练习', () => {
    expect(lessonLabel(findLesson('unit-01-1'))).toBe(findLesson('unit-01-1').title);
    expect(lessonLabel(findLesson('unit-05'))).toBe('05 综合练习');
  });
});

describe('HintsPanel 逐级提示', () => {
  test('一条一条展开，可以收起', () => {
    render(<HintsPanel hints={['第一条', '第二条', '第三条']} />);
    expect(screen.queryByText('第一条')).not.toBeInTheDocument();
    expect(screen.getByText('0 / 3')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '查看提示 1' }));
    expect(screen.getByText('第一条')).toBeInTheDocument();
    expect(screen.queryByText('第二条')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '查看提示 2' }));
    fireEvent.click(screen.getByRole('button', { name: '查看提示 3' }));
    expect(screen.getByText('3 / 3')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /查看提示/ })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '收起' }));
    expect(screen.queryByText('第一条')).not.toBeInTheDocument();
  });

  test('没有提示时不渲染', () => {
    const { container } = render(<HintsPanel hints={[]} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe('LessonNav 上一课 / 下一课', () => {
  test('点击后跳转到相邻课程', () => {
    render(<LessonNav unitKey="unit-01" />);
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /下一课/ }));
    });
    expect(window.location.hash).toBe('#/unit-02-1');
  });
});
