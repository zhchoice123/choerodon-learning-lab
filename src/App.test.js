import { act, render, screen, waitFor } from '@testing-library/react';
import dataSetAxios from 'choerodon-ui/dataset/axios';
import App from './App';
import { units } from './units';

// 打开单元会挂载练习预览，里面的 DataSet 会发请求。jsdom 没有服务器：
// 真实请求会在本文件结束后才失败，失败提示再去操作已销毁的 document，
// 在 --runInBand（CI 的运行方式）下会让整个 Node 进程崩溃。所以这里只替换 HTTP 层，立即返回空列表。
const originalAdapter = dataSetAxios.defaults.adapter;
let adapter;

beforeEach(() => {
  adapter = jest.fn(async (config) => ({
    config,
    status: 200,
    statusText: 'OK',
    headers: {},
    data: { content: [], totalElements: 0 },
  }));
  dataSetAxios.defaults.adapter = adapter;
});

afterEach(() => {
  dataSetAxios.defaults.adapter = originalAdapter;
  window.location.hash = '';
});

test('the home page lists every unit of the roadmap', () => {
  render(<App />);
  units.forEach((unit) => {
    expect(screen.getAllByText(unit.title).length).toBeGreaterThan(0);
  });
  expect(screen.getByText('首页')).toHaveClass('active');
  expect(screen.getByText('自由练习区')).toBeInTheDocument();
});

test('a unit hash opens that unit, an unknown hash falls back to home', async () => {
  window.location.hash = '#/unit-09';
  render(<App />);
  expect(screen.getByRole('heading', { name: '09 全局配置与国际化' })).toBeInTheDocument();
  // 等练习预览的查询在本用例内完成，不留下悬空的请求
  await waitFor(() => expect(adapter).toHaveBeenCalled());

  act(() => {
    window.location.hash = '#/unit-99';
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  });
  expect(screen.getByText('首页')).toHaveClass('active');
});
