import React from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import dataSetAxios from 'choerodon-ui/dataset/axios';
import Example from './04-form/Example';
import Easy from './04-form/templates/Exercise.easy';
import Normal from './04-form/templates/Exercise.normal';
import Hard from './04-form/templates/Exercise.hard';

const registerUnit04 = require('../../mock/unit04');
const roleSeeds = require('../../mock/data/roles');
const employeeSeeds = require('../../mock/data/users');
const originalAdapter = dataSetAxios.defaults.adapter;
let adapter;
let errors;

function mockRoutes() {
  const routes = new Map();
  registerUnit04({ get: (url, handler) => routes.set(url, handler) });
  return (url, query = {}) => {
    const result = { status: 200 };
    const res = {
      status(code) { result.status = code; return res; },
      json(body) { result.body = body; },
    };
    routes.get(url)({ query }, res);
    return result;
  };
}

async function enterText(input, value) {
  // 模拟浏览器分开的焦点 / 输入 / 失焦事件，不能把它们压在一个 React 批处理中；
  // TextField 在失焦时读取已渲染的输入值，批处理会读到上一个值。
  await act(async () => { fireEvent.focus(input); });
  await act(async () => { fireEvent.change(input, { target: { value } }); });
  await act(async () => { fireEvent.blur(input); });
}

beforeEach(() => {
  errors = jest.spyOn(console, 'error');
  // 不替换组件、DataSet 或 Form 的行为，只把 HTTP 交给真实的本单元 mock 路由。
  const request = mockRoutes();
  adapter = jest.fn(async (config) => {
    const query = Object.fromEntries(Object.entries(config.params || {}).map(([key, value]) => [key, String(value)]));
    const response = request(config.url, query);
    if (response.status !== 200) throw new Error(response.body.message);
    return { config, status: 200, statusText: 'OK', headers: {}, data: JSON.parse(JSON.stringify(response.body)) };
  });
  dataSetAxios.defaults.adapter = adapter;
});

afterEach(() => {
  cleanup();
  dataSetAxios.defaults.adapter = originalAdapter;
  // 保留原始输出。唯一白名单：1.6.7 DatePicker.setText -> toMoment 在键盘输入字符串时
  // 先报 not moment 再解析；依据 node_modules/choerodon-ui/pro/lib/date-picker/DatePicker.js。
  // 仅放行这一条完整消息，其他 console.error（包括异常、未知属性、act 警告）全部失败。
  const calls = errors.mock.calls.slice();
  errors.mockRestore();
  expect(calls.filter((args) => args.length !== 1
    || args[0] !== 'Warning: DatePicker: The value of DatePicker is not moment.')).toEqual([]);
});

test.each([
  ['样例', Example, '/mock/unit-04/roles', 1],
  ['入门模板', Easy, '/mock/unit-04/employees', 2],
  ['标准模板', Normal, '/mock/unit-04/employees', 2],
  ['挑战模板', Hard, '/mock/unit-04/employees', 2],
])('04 %s 正常渲染，只读取一次初始数据，无新增 console.error', async (_, Component, url, pageSize) => {
  render(<Component />);
  await screen.findByRole('button', { name: url.endsWith('/roles') ? '校验角色表单' : '校验员工表单' });
  if (url.endsWith('/employees')) await screen.findByText(/已读取 2 位员工/);
  expect(adapter).toHaveBeenCalledTimes(1);
  expect(adapter.mock.calls[0][0]).toMatchObject({ url, method: 'get', params: { page: 1, pagesize: pageSize } });
  // 首次渲染严格为零，不使用交互时的白名单。
  expect(errors).not.toHaveBeenCalled();
});

test('04 样例真实 Form：编辑与 Output 同步，只读保留草稿，reset 还原类型和值且不发请求', async () => {
  const { container } = render(<Example />);
  const name = await screen.findByDisplayValue('平台管理员');
  const editForm = container.querySelector('form');
  expect(editForm.querySelector('input[name="id"]')).toBeNull();
  expect(editForm.querySelector('input[name="code"]')).toBeNull();
  // columns=2 对应标签+控件四个单元格；跨两列的输入区 colspan 为 3。
  expect(name.closest('td')).toHaveAttribute('colspan', '3');
  await act(async () => {
    fireEvent.change(name, { target: { value: '本地角色草稿' } });
    fireEvent.blur(name);
    const count = screen.getByDisplayValue('3');
    fireEvent.change(count, { target: { value: '9' } });
    fireEvent.blur(count);
    const date = screen.getByDisplayValue('2023-01-15');
    fireEvent.change(date, { target: { value: '2024-06-01' } });
    fireEvent.blur(date);
    fireEvent.click(within(editForm).getByRole('checkbox'));
  });
  await screen.findByText('本地角色草稿');
  expect(screen.getByText(/已修改：是/)).toBeInTheDocument();
  expect(screen.getByDisplayValue('9')).toBeInTheDocument();
  expect(screen.getByDisplayValue('2024-06-01')).toBeInTheDocument();
  expect(within(editForm).getByRole('checkbox')).not.toBeChecked();
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: '切换为只读' })); });
  expect(name).toHaveAttribute('readonly');
  expect(screen.getByRole('button', { name: '恢复初始角色资料' })).toBeDisabled();
  expect(screen.getByRole('button', { name: '校验角色表单' })).toBeDisabled();
  expect(name).toHaveValue('本地角色草稿');
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: '切换为编辑' }));
  });
  await waitFor(() => expect(screen.getByRole('button', { name: '恢复初始角色资料' })).not.toBeDisabled());
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: '恢复初始角色资料' }));
  });
  expect(screen.getByDisplayValue('平台管理员')).toBeInTheDocument();
  expect(screen.getByDisplayValue('3')).toBeInTheDocument();
  expect(screen.getByDisplayValue('2023-01-15')).toBeInTheDocument();
  expect(within(editForm).getByRole('checkbox')).toBeChecked();
  expect(screen.getByRole('status')).toHaveTextContent('已恢复初始角色资料');
  expect(screen.getByText(/已修改：否/)).toBeInTheDocument();
  expect(adapter).toHaveBeenCalledTimes(1);
});

test('04 样例真实 checkValidity 等待校验，空名称失败，修正后通过且没有保存请求', async () => {
  render(<Example />);
  const name = await screen.findByDisplayValue('平台管理员');
  await enterText(name, '');
  await waitFor(() => expect(screen.queryByText('平台管理员')).not.toBeInTheDocument());
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: '校验角色表单' }));
  });
  await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('校验未通过'));
  await enterText(screen.getByDisplayValue(''), '已修正角色');
  await screen.findByText('已修正角色');
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: '校验角色表单' }));
  });
  await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('校验通过（尚未保存）'));
  expect(adapter).toHaveBeenCalledTimes(1);
});

test.each([
  ['/mock/unit-04/roles', roleSeeds, 12],
  ['/mock/unit-04/employees', employeeSeeds, 45],
])('04 mock %s：分页、过滤、空结果和非法输入', (url, seeds, total) => {
  const request = mockRoutes();
  expect(request(url, { page: '2', pagesize: '2' })).toEqual({
    status: 200,
    body: { content: seeds.slice(2, 4), totalElements: total, totalPages: Math.ceil(total / 2),
      size: 2, number: 1, numberOfElements: 2, empty: false },
  });
  expect(request(url, { code: seeds[0].code }).body.content).toEqual([seeds[0]]);
  expect(request(url, { empty: 'true' }).body).toMatchObject({ content: [], totalElements: 0, empty: true });
  expect(request(url, { empty: 'false' }).body.totalElements).toBe(total);
  for (const query of [{ page: '0' }, { page: '-1' }, { page: '1.5' }, { page: ['1', '2'] },
    { page: '9007199254740992' }, { pagesize: '0' }, { pagesize: '51' }, { pagesize: 'bad' }, { empty: 'yes' }]) {
    const response = request(url, query);
    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/page|empty/);
  }
});

test('04 mock 的两次注册独立深拷贝，不改变种子或其他注册的数据', () => {
  const first = mockRoutes();
  const second = mockRoutes();
  for (const [url, seeds] of [['/mock/unit-04/roles', roleSeeds], ['/mock/unit-04/employees', employeeSeeds]]) {
    const row = first(url).body.content[0];
    expect(row).not.toBe(seeds[0]);
    row.name = '仅修改这份内存副本';
    expect(second(url).body.content[0].name).toBe(seeds[0].name);
    expect(seeds[0].name).not.toBe('仅修改这份内存副本');
  }
});
