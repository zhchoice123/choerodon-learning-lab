import React from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Select } from 'choerodon-ui/pro';
import dataSetAxios from 'choerodon-ui/dataset/axios';
import Example, { createRoleDataSet } from './06-field-events/Example';
import Easy from './06-field-events/templates/Exercise.easy';
import Normal from './06-field-events/templates/Exercise.normal';
import Hard from './06-field-events/templates/Exercise.hard';

const registerUnit06 = require('../../mock/unit06');
const roleSeeds = require('../../mock/data/roles');
const employeeSeeds = require('../../mock/data/users');
const originalAdapter = dataSetAxios.defaults.adapter;
let request;
let adapter;
let errors;

function mockRoutes() {
  const routes = new Map();
  registerUnit06({ get: (url, handler) => routes.set(url, handler) });
  return (url, query = {}) => {
    const result = { status: 200 };
    const res = {
      status(code) { result.status = code; return res; },
      json(body) { result.data = body; },
    };
    const handler = routes.get(url);
    if (!handler) throw new Error(`未注册的请求：${url}`);
    handler({ query }, res);
    return result;
  };
}

beforeEach(() => {
  // 保留真实 console 输出；本单元初始渲染和以下交互要求严格零 console.error，不设白名单。
  errors = jest.spyOn(console, 'error');
  request = mockRoutes();
  adapter = jest.fn(async (config) => {
    const query = Object.fromEntries(Object.entries(config.params || {}).map(([key, value]) => [key, String(value)]));
    const result = request(config.url, query);
    const response = { ...result, config, statusText: 'OK', headers: {} };
    if (result.status !== 200) throw Object.assign(new Error(result.data.message), { response });
    return response;
  });
  dataSetAxios.defaults.adapter = adapter;
});

afterEach(() => {
  cleanup();
  dataSetAxios.defaults.adapter = originalAdapter;
  const calls = errors.mock.calls.slice();
  errors.mockRestore();
  expect(calls).toEqual([]);
});

test.each([
  ['样例', Example, '/mock/unit-06/roles'],
  ['入门', Easy, '/mock/unit-06/employees'],
  ['标准', Normal, '/mock/unit-06/employees'],
  ['挑战', Hard, '/mock/unit-06/employees'],
])('06 %s 初次渲染无错误，只读一次第一页', async (_, Component, url) => {
  render(<Component />);
  await waitFor(() => expect(adapter).toHaveBeenCalledTimes(1));
  expect(adapter.mock.calls[0][0]).toMatchObject({ url, method: 'get', params: { page: 1, pagesize: 2 } });
  if (url.endsWith('employees')) {
    await screen.findByText(/已读取 2 位员工/);
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: '校验员工联动' })); });
    expect(screen.getByRole('status')).toHaveTextContent('联动校验待完成');
    expect(adapter).toHaveBeenCalledTimes(1);
  } else {
    await screen.findByText('平台管理员');
    expect(screen.getByText(/dirty：false/)).toHaveTextContent('load：1 / update：0 / select：0');
  }
});

test('load 只记状态日志，不改业务字段、不制造初始 dirty，重复读取各触发一次', async () => {
  const ds = createRoleDataSet(false);
  await ds.query();
  expect(ds.length).toBe(2);
  expect(ds.dirty).toBe(false);
  expect(ds.current.status).toBe('sync');
  expect(ds.getState('eventLog')).toHaveLength(1);
  expect(ds.getState('eventLog')[0]).toContain('load：读取 2 条角色');
  await ds.query();
  expect(ds.getState('loadCount')).toBe(2);
  expect(ds.getState('updateCount')).toBeUndefined();
  expect(ds.dirty).toBe(false);
  expect(adapter).toHaveBeenCalledTimes(2);
});

test('dynamicProps / computedProps 按各自记录求值；反复读取属性不写业务数据', async () => {
  const ds = createRoleDataSet(false);
  await ds.query();
  const [first, second] = ds.records;
  const field = ds.getField('permissionCode');
  for (let i = 0; i < 3; i += 1) {
    expect(field.get('label', first)).toBe('平台权限');
    expect(field.get('label', second)).toBe('租户权限');
    expect(field.get('required', first)).toBe(true);
    expect(field.get('disabled', first)).toBe(false);
  }
  expect(ds.dirty).toBe(false);
  expect(ds.getState('updateCount')).toBeUndefined();
  first.set('enabled', false);
  expect(field.get('required', first)).toBe(false);
  expect(field.get('disabled', first)).toBe(true);
  expect(ds.getField('memberCount').get('readOnly', first)).toBe(true);
  expect(first.get('permissionCode')).toBe('site.view');
  expect(field.get('required', second)).toBe(true);
  expect(ds.getState('updateCount')).toBe(1);
  expect(adapter).toHaveBeenCalledTimes(1);
});

test('无 Select 挂载时联动也正确：父字段清子值，程序更新非当前行不污染当前行', async () => {
  const ds = createRoleDataSet(false);
  await ds.query();
  const [first, second] = ds.records;
  const firstBefore = first.toData();
  second.set('scope', 'project');
  expect(ds.current).toBe(first);
  expect(first.toData()).toEqual(firstBefore);
  expect(first.status).toBe('sync');
  expect(second.get('permissionCode')).toBeUndefined();
  expect(second.get('permissionSummary')).toBe('');
  expect(ds.getState('updateCount')).toBe(3);
  expect(ds.getState('eventLog').some(text => text.includes('102.scope，organization → project'))).toBe(true);
  second.set('permissionCode', 'project.edit');
  expect(second.get('permissionSummary')).toBe('项目编辑');
  const count = ds.getState('updateCount');
  second.set('permissionCode', 'project.edit');
  expect(ds.getState('updateCount')).toBe(count);
  expect(adapter).toHaveBeenCalledTimes(1);
});

test('级联使用真实 Select 的选项过滤；父值为空时也清旧值，没有额外查询', async () => {
  const ds = createRoleDataSet(false);
  await ds.query();
  const ref = React.createRef();
  render(<Select ref={ref} dataSet={ds} name="permissionCode" />);
  // 这里只读取源码已核实的 Select.cascadeOptions，未替换 Select 的过滤逻辑。
  expect(ref.current.cascadeOptions.map(record => record.get('value'))).toEqual(['site.view', 'site.manage']);
  await act(async () => { ds.current.set('scope', 'project'); });
  expect(ref.current.cascadeOptions.map(record => record.get('value'))).toEqual(['project.view', 'project.edit']);
  await act(async () => { ds.current.set('permissionCode', 'project.edit'); });
  expect(ds.current.get('permissionSummary')).toBe('项目编辑');
  await act(async () => { ds.current.set('scope', undefined); });
  expect(ref.current.cascadeOptions).toHaveLength(0);
  expect(ds.current.get('permissionCode')).toBeUndefined();
  expect(ds.current.get('permissionSummary')).toBe('');
  expect(adapter).toHaveBeenCalledTimes(1);
});

test('动态 required 参与真实校验，禁用和只读元信息不阻止程序 set', async () => {
  const ds = createRoleDataSet(false);
  await ds.query();
  const record = ds.current;
  record.set('scope', 'project');
  expect(await ds.validate()).toBe(false);
  record.set('enabled', false);
  expect(await ds.validate()).toBe(true);
  record.set('memberCount', 99);
  expect(record.get('memberCount')).toBe(99);
  record.set('enabled', true);
  record.set('permissionCode', 'project.view');
  expect(await ds.validate()).toBe(true);
  expect(adapter).toHaveBeenCalledTimes(1);
});

test('select 参数、单选 previous、重复选择与 current 区别；日志最多八条', async () => {
  const ds = createRoleDataSet(false);
  await ds.query();
  const selections = [];
  ds.addEventListener('select', event => selections.push(event));
  ds.current = ds.get(1);
  expect(ds.selected).toHaveLength(0);
  expect(ds.getState('selectCount')).toBeUndefined();
  ds.select(0);
  ds.select(1);
  ds.select(1);
  expect(selections).toHaveLength(2);
  expect(selections[1]).toMatchObject({ dataSet: ds, record: ds.get(1), previous: ds.get(0) });
  expect(ds.current).toBe(ds.get(1));
  expect(ds.selected).toEqual([ds.get(1)]);
  expect(ds.getState('selectCount')).toBe(2);
  for (let i = 0; i < 12; i += 1) ds.current.set('memberCount', 20 + i);
  expect(ds.getState('eventLog')).toHaveLength(8);
  expect(ds.getState('updateCount')).toBe(12);
  expect(adapter).toHaveBeenCalledTimes(1);
});

test('样例按钮真实切换与后台记录更新：当前第一条不受影响，关闭启用锁定输入', async () => {
  const { container } = render(<Example />);
  await screen.findByText('平台管理员');
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: '将第二位角色切到项目' })); });
  expect(screen.getByText(/当前 ID：/)).toHaveTextContent('当前 ID：101');
  expect(screen.getByText(/权限编码：/)).toHaveTextContent('权限编码：site.view');
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: '选择第二位角色' })); });
  expect(screen.getByText(/当前 ID：/)).toHaveTextContent('当前 ID：102');
  expect(screen.getByText(/权限编码：/)).toHaveTextContent('权限编码：空');
  expect(screen.getByText(/当前 ID：/)).toHaveTextContent('select：1');
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: '选择第二位角色' })); });
  expect(screen.getByText(/当前 ID：/)).toHaveTextContent('select：1');
  await act(async () => { fireEvent.click(screen.getByRole('checkbox')); });
  expect(container.querySelector('input[name="memberCount"]')).toHaveAttribute('readonly');
  // Select 的 name 位于隐藏的提交输入；禁用状态属于同一表单单元格里的可见输入。
  const permissionCell = container.querySelector('input[name="permissionCode"]').closest('td');
  expect(permissionCell.querySelector('input:not([type="hidden"])')).toBeDisabled();
  expect(adapter).toHaveBeenCalledTimes(1);
});

test.each(['/mock/unit-06/roles', '/mock/unit-06/employees'])('mock %s：Spring Page、过滤、空结果和错误请求', (url) => {
  const total = url.endsWith('roles') ? 12 : 45;
  const response = request(url);
  expect(response.status).toBe(200);
  expect(response.data).toMatchObject({ totalElements: total, totalPages: Math.ceil(total / 2), size: 2, number: 0, numberOfElements: 2, empty: false });
  expect(request(url, { page: '2', pagesize: '2' }).data.content[0].id).not.toBe(response.data.content[0].id);
  expect(request(url, { code: 'not-found' }).data).toMatchObject({ content: [], totalElements: 0, empty: true });
  expect(request(url, { empty: 'true' }).data.content).toEqual([]);
  for (const query of [{ page: '0' }, { page: '-1' }, { page: '1.5' }, { page: ['1'] }, { pagesize: '51' }, { pagesize: 'NaN' }, { empty: 'yes' }]) {
    expect(request(url, query)).toMatchObject({ status: 400, data: { message: expect.any(String) } });
  }
});

test('mock 响应和注册均独立，不改变旧种子；扩展字段与教学约定一致', () => {
  const seedsBefore = JSON.stringify([roleSeeds, employeeSeeds]);
  const roles = request('/mock/unit-06/roles').data.content;
  expect(roles[0]).toMatchObject({ id: 101, scope: 'site', permissionCode: 'site.view', permissionSummary: '平台查看' });
  roles[0].permissionSummary = '篡改响应';
  expect(request('/mock/unit-06/roles').data.content[0].permissionSummary).toBe('平台查看');
  const employees = request('/mock/unit-06/employees').data.content;
  expect(employees[0]).toMatchObject({ departmentCode: 'RD', positionCode: 'rd.fe', positionLabel: '前端研发', mentor: '李导师' });
  expect(employees[1]).toMatchObject({ departmentCode: 'HR', positionCode: 'hr.recruit', mentor: '' });
  expect(mockRoutes()('/mock/unit-06/roles').data.content[0].permissionSummary).toBe('平台查看');
  expect(JSON.stringify([roleSeeds, employeeSeeds])).toBe(seedsBefore);
});
