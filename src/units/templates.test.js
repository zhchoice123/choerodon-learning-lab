import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import dataSetAxios from 'choerodon-ui/dataset/axios';
import Unit01Easy from './01-dataset-basics/templates/Exercise.easy';
import Unit01Normal from './01-dataset-basics/templates/Exercise.normal';
import Unit01Hard from './01-dataset-basics/templates/Exercise.hard';
import Unit02Easy from './02-query-conditions/templates/Exercise.easy';
import Unit02Normal from './02-query-conditions/templates/Exercise.normal';
import Unit02Hard from './02-query-conditions/templates/Exercise.hard';
import Unit03Easy from './03-validation-lookups/templates/Exercise.easy';
import Unit03Normal from './03-validation-lookups/templates/Exercise.normal';
import Unit03Hard from './03-validation-lookups/templates/Exercise.hard';

const originalAdapter = dataSetAxios.defaults.adapter;
let adapter;

beforeEach(() => {
  // 只替换 HTTP 层，DataSet / Table / MobX 与模板均使用真实实现。
  adapter = jest.fn(async (config) => ({
    config,
    status: 200,
    statusText: 'OK',
    headers: {},
    data: { content: [], totalElements: 0, totalPages: 0, size: 5, number: 0, numberOfElements: 0, empty: true },
  }));
  dataSetAxios.defaults.adapter = adapter;
});

afterEach(() => {
  dataSetAxios.defaults.adapter = originalAdapter;
});

test.each([
  ['01 easy', Unit01Easy],
  ['01 normal', Unit01Normal],
  ['01 hard', Unit01Hard],
])('%s：未完成 TODO 时可以渲染且不意外查询', async (_, Exercise) => {
  await act(async () => { render(<Exercise />); });
  expect(screen.getByRole('button', { name: '查看选中' })).toBeInTheDocument();
  expect(adapter).not.toHaveBeenCalled();
});

test.each([
  ['02 easy', Unit02Easy],
  ['02 normal', Unit02Normal],
  ['02 hard', Unit02Hard],
])('%s：未完成 TODO 时可以渲染，初始仅查询一次第一页', async (_, Exercise) => {
  render(<Exercise />);
  expect(screen.getByRole('button', { name: '仅离职（年龄不限）' })).toBeInTheDocument();
  await waitFor(() => expect(adapter).toHaveBeenCalledTimes(1));
  const config = adapter.mock.calls[0][0];
  expect(config.url).toBe('/mock/guide/user/search');
  expect(config.method).toBe('get');
  expect(config.params).toEqual({ page: 1, pagesize: 5 });
});

test.each([
  ['03 easy', Unit03Easy],
  ['03 normal', Unit03Normal],
  ['03 hard', Unit03Hard],
])('%s：原始模板可渲染和点击，且不发未配置的请求', async (_, Exercise) => {
  const errors = jest.spyOn(console, 'error');
  try {
    render(<Exercise />);
    const button = screen.getByRole('button', { name: '校验员工草稿' });
    await act(async () => { button.click(); });
    expect(screen.getByRole('status')).toHaveTextContent('骨架提前显示通过');
    expect(adapter).not.toHaveBeenCalled();
    expect(errors).not.toHaveBeenCalled();
  } finally {
    errors.mockRestore();
  }
});
