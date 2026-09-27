import React from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import dataSetAxios from 'choerodon-ui/dataset/axios';
import { getConfig } from 'choerodon-ui';
import Example, { createRoleMaster } from './07-master-detail/Example';
import Easy from './07-master-detail/templates/Exercise.easy';
import Normal from './07-master-detail/templates/Exercise.normal';
import Hard from './07-master-detail/templates/Exercise.hard';

const registerUnit07 = require('../../mock/unit07');
const roleSeeds = require('../../mock/data/roles');
const employeeSeeds = require('../../mock/data/users');
const originalAdapter = dataSetAxios.defaults.adapter;
let request;
let adapter;
let errors;

function mockRoutes() {
  const routes = new Map();
  registerUnit07({
    use: () => {},
    get: (url, handler) => routes.set(`get ${url}`, handler),
    post: (url, handler) => routes.set(`post ${url}`, handler),
  });
  return (method, url, body, query = {}) => {
    const result = { status: 200 };
    const res = {
      status(code) { result.status = code; return res; },
      json(data) { result.data = JSON.parse(JSON.stringify(data)); },
    };
    const route = routes.get(`${method} ${url}`);
    if (!route) throw new Error(`未注册的请求：${method} ${url}`);
    route({ body, query }, res);
    return result;
  };
}

beforeEach(() => {
  errors = jest.spyOn(console, 'error');
  request = mockRoutes();
  adapter = jest.fn(async (config) => {
    const body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
    const query = Object.fromEntries(Object.entries(config.params || {}).map(([key, value]) => [key, String(value)]));
    const response = { ...request(config.method, config.url, body, query), config, statusText: 'OK', headers: {} };
    if (response.status !== 200) throw Object.assign(new Error(`Request failed with status code ${response.status}`), { response });
    return response;
  });
  dataSetAxios.defaults.adapter = adapter;
});

afterEach(() => {
  cleanup();
  dataSetAxios.defaults.adapter = originalAdapter;
  const calls = errors.mock.calls.slice();
  errors.mockRestore();
  // 同 05：固定版本 pro/lib/table/Table.js 将 combineColumnFilter 透传 div。
  // 保留输出，仅匹配完整消息和属性名；其他错误、act 警告、异常不放行。
  const knownTableWarning = (args) => args.length === 4
    && args[0] === 'Warning: React does not recognize the `%s` prop on a DOM element. If you intentionally want it to appear in the DOM as a custom attribute, spell it as lowercase `%s` instead. If you accidentally passed it from a parent component, remove it from the DOM element.%s'
    && args[1] === 'combineColumnFilter' && args[2] === 'combinecolumnfilter' && args[3].includes('Table');
  expect(calls.filter((args) => !knownTableWarning(args))).toEqual([]);
});

const posts = () => adapter.mock.calls.map(([config]) => config).filter(config => config.method === 'post');
const lines = (roleId) => request('get', '/mock/unit-07/roles/permissions', undefined, { roleId: String(roleId) }).data.content;
const draft = { code: 'learning-permission', description: '学习权限', enabled: false };
async function loadMaster() {
  const ds = createRoleMaster(false);
  await ds.query();
  await waitFor(() => expect(ds.current.getState('permissionsLoaded')).toBe(true));
  return ds;
}
async function switchTo(ds, index) {
  ds.current = ds.get(index);
  await waitFor(() => expect(ds.current.getState('permissionsLoaded')).toBe(true));
}

test.each([
  ['样例', Example, '/mock/unit-07/roles'],
  ['入门', Easy, '/mock/unit-07/employees'],
  ['标准', Normal, '/mock/unit-07/employees'],
  ['挑战', Hard, '/mock/unit-07/employees'],
])('07 %s 原始代码可渲染，没有未配置请求或新增控制台错误', async (_, Component, url) => {
  render(<Component />);
  if (url.endsWith('roles')) {
    expect(screen.getByRole('button', { name: '新增权限行' })).toBeDisabled();
    await waitFor(() => expect(screen.getByRole('button', { name: '新增权限行' })).toBeEnabled());
    expect(adapter).toHaveBeenCalledTimes(2);
    expect(adapter.mock.calls[1][0]).toMatchObject({ url: `${url}/permissions`, method: 'get', params: { page: 1, pagesize: 50, roleId: 101 } });
  } else {
    await screen.findByText(/已读取 2 位员工/);
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: '保存全部员工主从' })); });
    expect(screen.getByRole('status')).toHaveTextContent('请先完成 skills 关联与头提交接口');
    expect(adapter).toHaveBeenCalledTimes(1);
  }
  expect(adapter.mock.calls[0][0]).toMatchObject({ url, method: 'get', params: { page: 1, pagesize: 2 } });
});

test('children 关系、父参数与自动加载；切回头恢复原子表草稿，不重复查询', async () => {
  const globalStrictPageSize = getConfig('strictPageSize');
  const ds = await loadMaster();
  expect(ds.context.getConfig('strictPageSize')).toBe(false);
  expect(getConfig('strictPageSize')).toBe(globalStrictPageSize);
  expect(ds.context.getConfig('dataKey')).toBe(getConfig('dataKey'));
  const child = ds.children.permissions;
  expect(child.parent).toBe(ds);
  expect(child.parentName).toBe('permissions');
  expect(child.map(record => record.get('roleId'))).toEqual([101, 101]);
  const record = child.get(0);
  record.set('description', '第一位草稿');
  await switchTo(ds, 1);
  expect(child.map(row => row.get('roleId'))).toEqual([102, 102]);
  expect(child.dirty).toBe(false);
  expect(ds.dirty).toBe(true);
  const count = adapter.mock.calls.length;
  await switchTo(ds, 0);
  expect(child.get(0)).toBe(record);
  expect(child.get(0).get('description')).toBe('第一位草稿');
  expect(adapter.mock.calls.length).toBe(count);
  expect(count).toBe(3);
});

test('只改子行也提交 sync 头；头 status 与主从 dirty 不相同', async () => {
  const ds = await loadMaster();
  const head = ds.current;
  const row = ds.children.permissions.get(0);
  row.set('enabled', false);
  expect(head.status).toBe('sync');
  expect(ds.dirty).toBe(true);
  await ds.submit();
  expect(posts()).toHaveLength(1);
  const body = JSON.parse(posts()[0].data);
  expect(body[0]).toMatchObject({ id: 101, __id: head.id, __status: 'update' });
  expect(body[0].permissions).toHaveLength(1);
  expect(body[0].permissions[0]).toMatchObject({ id: 1011, __id: row.id, __status: 'update', enabled: false });
  expect(lines(101)[0].enabled).toBe(false);
  expect(ds.dirty).toBe(false);
  expect(row.status).toBe('sync');
  expect(adapter).toHaveBeenCalledTimes(3);
});

test('一次合并保存两头与非当前头的新增/修改/删除行，递归回写 id 且没有补查', async () => {
  const ds = await loadMaster();
  const child = ds.children.permissions;
  ds.current.set('name', '新的平台管理员');
  child.get(0).set('description', '改后的权限');
  const removed = child.get(1);
  child.remove(removed);
  const created = child.create({ ...draft, roleId: 101 });
  await switchTo(ds, 1);
  ds.current.set('name', '新的租户管理员');
  child.get(0).set('description', '第二位权限草稿');
  const before = adapter.mock.calls.length;
  const result = await ds.submit();
  expect(posts()).toHaveLength(1);
  expect(JSON.parse(posts()[0].data)).toHaveLength(2);
  expect(result.content[0].permissions).toEqual(expect.arrayContaining([expect.objectContaining({ id: 1023, roleId: 101, __id: created.id })]));
  expect(created.get('id')).toBe(1023);
  expect(created.get('enabled')).toBe(false);
  expect(created.status).toBe('sync');
  expect(ds.dirty).toBe(false);
  expect(lines(101).map(row => row.id)).toEqual([1011, 1023]);
  expect(lines(102)[0].description).toBe('第二位权限草稿');
  await switchTo(ds, 0);
  expect(child.get(0).get('description')).toBe('改后的权限');
  expect(child.find(row => row.get('id') === 1023)).toBe(created);
  expect(child.dirty).toBe(false);
  expect(adapter.mock.calls.length).toBe(before + 1);
});

test('级联校验包含非当前头的非法行，不发送写请求', async () => {
  const ds = await loadMaster();
  ds.children.permissions.get(0).set('description', undefined);
  await switchTo(ds, 1);
  expect(await ds.submit()).toBe(false);
  expect(posts()).toHaveLength(0);
  expect(ds.dirty).toBe(true);
});

test('整份请求失败不部分落库，头行和新增/待删草稿保留，修正后可重试', async () => {
  const ds = await loadMaster();
  const child = ds.children.permissions;
  const updated = child.get(0);
  updated.set('description', '不应提前落库');
  const removed = child.get(1);
  child.remove(removed);
  const created = child.create({ ...draft, roleId: 101 });
  await switchTo(ds, 1);
  ds.current.set('name', 'FAIL');
  await expect(ds.submit()).rejects.toThrow('400');
  expect(ds.getState('submitError')).toContain('整份主从请求均未保存');
  expect(lines(101)).toHaveLength(2);
  expect(lines(101)[0].description).toBe('平台管理员权限1');
  expect(updated.get('description')).toBe('不应提前落库');
  expect(updated.status).toBe('update');
  expect(removed.status).toBe('delete');
  expect(created.status).toBe('add');
  expect(created.get('id')).toBeUndefined();
  expect(ds.current.get('name')).toBe('FAIL');
  expect(ds.dirty).toBe(true);
  expect(ds.status).toBe('ready');
  ds.current.set('name', '修正后的角色');
  await ds.submit();
  expect(created.get('id')).toBe(1023);
  expect(ds.dirty).toBe(false);
  expect(lines(101)[0].description).toBe('不应提前落库');
});

test('只改头仍能保存，未变的子行保留，空行增量不会导致额外查询', async () => {
  const ds = await loadMaster();
  ds.current.set('name', '只改头');
  await switchTo(ds, 1);
  const count = adapter.mock.calls.length;
  await ds.submit();
  expect(JSON.parse(posts()[0].data)[0].permissions).toEqual([]);
  expect(ds.dirty).toBe(false);
  await switchTo(ds, 0);
  expect(ds.current.get('name')).toBe('只改头');
  expect(ds.children.permissions.length).toBe(2);
  expect(adapter.mock.calls.length).toBe(count + 1);
});

test('真实 submitRecord 只提交指定角色主从，另一位草稿与后端旧值保留（角色范围 API 验证）', async () => {
  const ds = await loadMaster();
  ds.children.permissions.get(0).set('description', '第一位未保存');
  await switchTo(ds, 1);
  ds.children.permissions.get(0).set('description', '第二位已保存');
  await ds.submitRecord(ds.current);
  expect(JSON.parse(posts()[0].data).map(head => head.id)).toEqual([102]);
  expect(ds.dirty).toBe(true);
  expect(lines(101)[0].description).toBe('平台管理员权限1');
  expect(lines(102)[0].description).toBe('第二位已保存');
  await switchTo(ds, 0);
  expect(ds.children.permissions.get(0).get('description')).toBe('第一位未保存');
});

test.each([
  ['roles', 'permissions', 'roleId', 101],
  ['employees', 'skills', 'employeeId', 1],
])('mock %s 查询契约、错误请求与主从归属', (kind, childName, foreignKey, id) => {
  const base = `/mock/unit-07/${kind}`;
  const headPage = request('get', base).data;
  expect(headPage).toMatchObject({ totalElements: 2, number: 0, numberOfElements: 2, empty: false });
  expect(headPage.content[0][childName]).toBeUndefined();
  const childPage = request('get', `${base}/${childName}`, undefined, { [foreignKey]: String(id) }).data;
  expect(childPage.content).toHaveLength(2);
  expect(childPage.content.every(row => row[foreignKey] === id)).toBe(true);
  expect(request('get', base, undefined, { page: '0' }).status).toBe(400);
  expect(request('get', base, undefined, { pagesize: '51' }).status).toBe(400);
  expect(request('get', `${base}/${childName}`).status).toBe(400);
  expect(request('get', `${base}/${childName}`, undefined, { [foreignKey]: '999' }).status).toBe(404);
  for (const body of [{}, [], [null], [{ id, __id: 10, __status: 'add', [childName]: [] }],
    [{ id, __id: 10, __status: 'update', [childName]: {} }]]) {
    expect(request('post', `${base}/submit`, body)).toMatchObject({ status: 400, data: { message: expect.any(String) } });
  }
});

test('mock 拒绝跨头子行、重复编码、全删和错误布尔值；错误不改变任何集合', () => {
  const base = '/mock/unit-07/roles/submit';
  const head = { id: 101, __id: 50, __status: 'update' };
  const before = lines(101);
  const cases = [
    [[{ id: 1021, __id: 51, __status: 'update', description: '越界' }], 404],
    [[{ id: 1011, roleId: 102, __id: 51, __status: 'update' }], 400],
    [[{ ...draft, code: 'permission-1', __id: 51, __status: 'add' }], 409],
    [[{ id: 1011, __id: 51, __status: 'delete' }, { id: 1012, __id: 52, __status: 'delete' }], 400],
    [[{ id: 1011, enabled: 'false', __id: 51, __status: 'update' }], 400],
    [[{ ...draft, __id: 50, __status: 'add' }], 400],
  ];
  cases.forEach(([permissions, status]) => {
    expect(request('post', base, [{ ...head, name: '不应保存', permissions }]).status).toBe(status);
    expect(lines(101)).toEqual(before);
    expect(request('get', '/mock/unit-07/roles').data.content[0].name).toBe('平台管理员');
  });
});

test('员工 mock 接受嵌套新增与 ID 回写；拒绝小数等级、离职新增；集合和种子独立', () => {
  const original = JSON.stringify([roleSeeds, employeeSeeds]);
  const base = '/mock/unit-07/employees';
  const head = { id: 1, __id: 60, __status: 'update' };
  const skill = { skillCode: 'LEARNING', level: 1, certified: false, __id: 61, __status: 'add' };
  expect(request('post', `${base}/submit`, [{ ...head, skills: [{ ...skill, level: 1.2 }] }]).status).toBe(400);
  expect(request('post', `${base}/submit`, [{ ...head, active: false, skills: [skill] }]).status).toBe(400);
  const response = request('post', `${base}/submit`, [{ ...head, name: '学习员工', skills: [skill] }]);
  expect(response.status).toBe(200);
  expect(response.data.content[0].skills).toEqual(expect.arrayContaining([expect.objectContaining({ id: 23, employeeId: 1, __id: 61, certified: false })]));
  const stored = request('get', `${base}/skills`, undefined, { employeeId: '1' }).data.content;
  expect(stored).toHaveLength(3);
  expect(stored.every(row => row.__id === undefined && row.__status === undefined)).toBe(true);
  expect(mockRoutes()('get', `${base}/skills`, undefined, { employeeId: '1' }).data.content).toHaveLength(2);
  expect(request('get', '/mock/unit-07/roles').data.content[0].name).toBe('平台管理员');
  expect(JSON.stringify([roleSeeds, employeeSeeds])).toBe(original);
});
