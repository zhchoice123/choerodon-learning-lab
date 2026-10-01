import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import HomePage from './HomePage';
import { LearnApiError, learnApi } from '../api';

// 任务 A 并行开发中：接口一律模拟，保留真实的 LearnApiError 等导出
jest.mock('../api', () => {
  const actual = jest.requireActual('../api');
  return { ...actual, learnApi: { listUnits: jest.fn(), resetExercise: jest.fn() } };
});

const Example = () => null;
const units = [
  { key: 'unit-01', title: '01 DataSet 基础与 Table 绑定', points: ['DataSet 基础配置'], Example },
  { key: 'unit-02', title: '02 查询条件', points: ['queryFields 查询字段'], Example },
  { key: 'unit-09', title: '09 全局配置与国际化', points: ['configure 全局配置'] },
];
const statuses = [
  { number: '01', key: 'unit-01', open: true, state: 'in-progress', matched: null },
  { number: '02', key: 'unit-02', open: true, state: 'not-started', matched: 'normal' },
  { number: '09', key: 'unit-09', open: false, state: 'locked', matched: null },
];

const card = (title) => screen.getByRole('article', { name: title });
const button = (title, label) => within(card(title)).getByRole('button', { name: label });

async function renderLoaded() {
  render(<HomePage units={units} />);
  await within(card('02 查询条件')).findByText('未开始 · 标准');
}

beforeEach(() => {
  window.location.hash = '#/';
  learnApi.listUnits.mockResolvedValue(statuses);
  learnApi.resetExercise.mockResolvedValue({ matched: 'hard', backupPath: '.backup/x/Exercise.1.js' });
});

afterEach(() => {
  jest.clearAllMocks();
  // 关闭可能残留的确认框
  document.querySelectorAll('.learn-home-confirm-footer button').forEach((node) => {
    if (node.textContent === '取消') fireEvent.click(node);
  });
});

test('shows one card per unit with its state, and locks unopened units', async () => {
  await renderLoaded();
  expect(within(card('01 DataSet 基础与 Table 绑定')).getByText('进行中')).toBeInTheDocument();
  expect(within(card('09 全局配置与国际化')).getByText('未开放')).toBeInTheDocument();
  ['入门', '标准', '挑战'].forEach((label) => {
    expect(button('09 全局配置与国际化', label)).toBeDisabled();
    expect(button('02 查询条件', label)).toBeEnabled();
  });
  // 当前模板对应的难度按钮高亮
  expect(button('02 查询条件', '标准')).toHaveClass('is-current');
});

test('not-started with the matching difficulty enters without resetting', async () => {
  await renderLoaded();
  fireEvent.click(button('02 查询条件', '标准'));
  await waitFor(() => expect(window.location.hash).toBe('#/unit-02'));
  expect(learnApi.resetExercise).not.toHaveBeenCalled();
});

test('not-started with another difficulty resets to it, then enters', async () => {
  await renderLoaded();
  fireEvent.click(button('02 查询条件', '挑战'));
  await waitFor(() => expect(window.location.hash).toBe('#/unit-02'));
  expect(learnApi.resetExercise).toHaveBeenCalledWith('02', 'hard');
});

describe('a unit with work in progress asks first', () => {
  async function openConfirm() {
    await renderLoaded();
    fireEvent.click(button('01 DataSet 基础与 Table 绑定', '入门'));
    return screen.findByText('继续上次的代码');
  }

  test('continue keeps the code', async () => {
    fireEvent.click(await openConfirm());
    await waitFor(() => expect(window.location.hash).toBe('#/unit-01'));
    expect(learnApi.resetExercise).not.toHaveBeenCalled();
  });

  test('restart resets to the chosen difficulty', async () => {
    await openConfirm();
    fireEvent.click(screen.getByText('以「入门」难度重新开始'));
    await waitFor(() => expect(window.location.hash).toBe('#/unit-01'));
    expect(learnApi.resetExercise).toHaveBeenCalledWith('01', 'easy');
  });

  test('cancel leaves everything as it was', async () => {
    await openConfirm();
    fireEvent.click(screen.getByText('取消'));
    await waitFor(() => expect(button('01 DataSet 基础与 Table 绑定', '入门')).toBeEnabled());
    expect(window.location.hash).toBe('#/');
    expect(learnApi.resetExercise).not.toHaveBeenCalled();
  });
});

test('repeated clicks while a reset is running only call the API once', async () => {
  let finish;
  learnApi.resetExercise.mockImplementation(() => new Promise((resolve) => (finish = resolve)));
  await renderLoaded();
  fireEvent.click(button('02 查询条件', '挑战'));
  fireEvent.click(button('02 查询条件', '挑战'));
  fireEvent.click(button('02 查询条件', '入门'));
  fireEvent.click(button('01 DataSet 基础与 Table 绑定', '标准'));
  expect(learnApi.resetExercise).toHaveBeenCalledTimes(1);
  // 处理期间其他按钮全部禁用
  expect(button('01 DataSet 基础与 Table 绑定', '标准')).toBeDisabled();
  finish({ matched: 'hard', backupPath: null });
  await waitFor(() => expect(window.location.hash).toBe('#/unit-02'));
});

test('when the API is unavailable the page explains it and still lets you enter', async () => {
  learnApi.listUnits.mockRejectedValue(new LearnApiError());
  render(<HomePage units={units} />);
  expect(await screen.findByRole('status')).toHaveTextContent('本地接口不可用');
  expect(within(card('02 查询条件')).getByText('接口不可用')).toBeInTheDocument();
  fireEvent.click(button('01 DataSet 基础与 Table 绑定', '挑战'));
  await waitFor(() => expect(window.location.hash).toBe('#/unit-01'));
  expect(learnApi.resetExercise).not.toHaveBeenCalled();
});

test('a failed progress request can be retried and does not block entering', async () => {
  learnApi.listUnits.mockRejectedValueOnce(new LearnApiError({ status: 500, code: 'INTERNAL', message: '服务器出错' }));
  render(<HomePage units={units} />);
  const alert = await screen.findByRole('alert');
  expect(alert).toHaveTextContent('服务器出错');

  fireEvent.click(within(alert).getByRole('button', { name: '重试' }));
  await within(card('02 查询条件')).findByText('未开始 · 标准');
  expect(learnApi.listUnits).toHaveBeenCalledTimes(2);
});

test('entering is still possible after a failed progress request', async () => {
  learnApi.listUnits.mockRejectedValue(new LearnApiError({ status: 500, code: 'INTERNAL', message: '服务器出错' }));
  render(<HomePage units={units} />);
  await screen.findByRole('alert');
  fireEvent.click(button('02 查询条件', '入门'));
  await waitFor(() => expect(window.location.hash).toBe('#/unit-02'));
  expect(learnApi.resetExercise).not.toHaveBeenCalled();
});

test('chapter cards list their sections with progress, and a section opens directly', async () => {
  const withSections = [
    {
      ...units[1],
      sections: [
        { key: 'unit-02-1', title: '02-1 查询字段：queryFields', kind: 'section' },
        { key: 'unit-02-2', title: '02-2 read 函数：data 与 params', kind: 'section' },
      ],
    },
  ];
  learnApi.listUnits.mockResolvedValue([
    { number: '02-1', key: 'unit-02-1', kind: 'section', state: 'in-progress', matched: null },
    { number: '02-2', key: 'unit-02-2', kind: 'section', state: 'not-started', matched: 'normal' },
    statuses[1],
  ]);
  render(<HomePage units={withSections} />);
  const chapter = card('02 查询条件');
  const first = await within(chapter).findByRole('button', { name: /02-1 查询字段/ });
  expect(first).toHaveTextContent('进行中');
  expect(within(chapter).getByRole('button', { name: /02-2 read 函数/ })).toHaveTextContent('未开始');
  // 综合练习的三档按钮仍在
  expect(within(chapter).getByText('本章综合练习 · 三档难度')).toBeInTheDocument();
  expect(button('02 查询条件', '挑战')).toBeEnabled();

  fireEvent.click(first);
  await waitFor(() => expect(window.location.hash).toBe('#/unit-02-1'));
  expect(learnApi.resetExercise).not.toHaveBeenCalled();
});
