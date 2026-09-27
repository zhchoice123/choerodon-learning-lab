import React from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import dataSetAxios from 'choerodon-ui/dataset/axios';
import Example, { createRoleDataSet } from './05-table-submit/Example';
import Easy from './05-table-submit/templates/Exercise.easy';
import Normal from './05-table-submit/templates/Exercise.normal';
import Hard from './05-table-submit/templates/Exercise.hard';

const registerUnit05 = require('../../mock/unit05');
const roleSeeds = require('../../mock/data/roles');
const employeeSeeds = require('../../mock/data/users');
const originalAdapter = dataSetAxios.defaults.adapter;
let request;
let adapter;
let errors;

function createMockApp() {
  const routes = new Map();
  registerUnit05({
    // 假 app 接收解析后的 req.body；JSON 中间件另由真实 HTTP 验证覆盖。
    use: () => {},
    get: (url, handler) => routes.set(`get ${url}`, handler),
    post: (url, handler) => routes.set(`post ${url}`, handler),
  });
  return (method, url, body, query = {}) => {
    const response = { status: 200 };
    const res = {
      status(code) { response.status = code; return res; },
      json(data) { response.data = JSON.parse(JSON.stringify(data)); },
    };
    const handler = routes.get(`${method} ${url}`);
    if (!handler) throw new Error(`未注册的请求：${method} ${url}`);
    handler({ body, query }, res);
    return response;
  };
}

beforeEach(() => {
  errors = jest.spyOn(console, 'error');
  request = createMockApp();
  adapter = jest.fn(async (config) => {
    const body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
    const query = Object.fromEntries(Object.entries(config.params || {}).map(([key, value]) => [key, String(value)]));
    const result = request(config.method, config.url, body, query);
    const response = { ...result, config, headers: {}, statusText: result.status === 200 ? 'OK' : 'Error' };
    if (result.status >= 400) {
      // Axios 真实适配器会拒绝非 2xx；不能 resolve 一个 400 响应导致 DataSet 假成功。
      throw Object.assign(new Error(`Request failed with status code ${result.status}`), { response, config, isAxiosError: true });
    }
    return response;
  });
  dataSetAxios.defaults.adapter = adapter;
});

afterEach(() => {
  cleanup();
  dataSetAxios.defaults.adapter = originalAdapter;
  const calls = errors.mock.calls.slice();
  errors.mockRestore();
  // 既有 1.6.7 Table.defaultProps 的 combineColumnFilter 透传到 div，React 16 打印此警告。
  // 依据 node_modules/choerodon-ui/pro/lib/table/Table.js；保留输出，只匹配这一条属性消息。
  // 不允许网络异常、未处理 Promise、其他属性警告或 act 警告混入。
  const knownTableWarning = (args) => args.length === 4
    && args[0] === 'Warning: React does not recognize the `%s` prop on a DOM element. If you intentionally want it to appear in the DOM as a custom attribute, spell it as lowercase `%s` instead. If you accidentally passed it from a parent component, remove it from the DOM element.%s'
    && args[1] === 'combineColumnFilter' && args[2] === 'combinecolumnfilter'
    && args[3].includes('Table');
  expect(calls.filter((args) => !knownTableWarning(args))).toEqual([]);
});

const roleDraft = (code = 'test-role') => ({ code, name: '测试角色', memberCount: 0, enabled: false });

test.each([
  ['样例', Example, '/mock/unit-05/roles'],
  ['入门', Easy, '/mock/unit-05/employees'],
  ['标准', Normal, '/mock/unit-05/employees'],
  ['挑战', Hard, '/mock/unit-05/employees'],
])('05 %s 初始可渲染、只查询一次、没有新增 console.error', async (_, Component, url) => {
  render(<Component />);
  await waitFor(() => expect(adapter).toHaveBeenCalledTimes(1));
  expect(adapter.mock.calls[0][0]).toMatchObject({ url, method: 'get', params: { page: 1, pagesize: 5 } });
  if (url.endsWith('/employees')) {
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: '保存员工（待完成）' })); });
    expect(screen.getByRole('status')).toHaveTextContent('请先完成三个员工写接口');
    expect(adapter).toHaveBeenCalledTimes(1);
  } else {
    await screen.findByText('平台管理员');
    expect(screen.getByRole('button', { name: '暂存删除（观察 delete）' })).toBeDisabled();
  }
});

test('真实 DataSet 新建提交：默认记录数组、__id 匹配、后端 id 回写、sync / dirty=false，无补查', async () => {
  const ds = createRoleDataSet(false);
  const record = ds.create(roleDraft());
  expect(record.status).toBe('add');
  expect(ds.dirty).toBe(true);
  expect(record.get('id')).toBeUndefined();
  const result = await ds.submit();
  const config = adapter.mock.calls[0][0];
  const body = JSON.parse(config.data);
  expect(config.url).toBe('/mock/unit-05/roles/create');
  expect(body).toHaveLength(1);
  expect(body[0]).toMatchObject({ ...roleDraft(), __id: record.id, __status: 'add' });
  expect(record.get('id')).toBe(113);
  expect(result.content[0]).toMatchObject({ id: 113, __id: record.id });
  expect(ds.current).toBe(record);
  expect(record.status).toBe('sync');
  expect(record.dirty).toBe(false);
  expect(ds.dirty).toBe(false);
  expect(adapter).toHaveBeenCalledTimes(1);
  expect(request('get', '/mock/unit-05/roles', undefined, { code: 'test-role' }).data.content[0])
    .toMatchObject({ id: 113, memberCount: 0, enabled: false });
});

test('真实 DataSet 修改、暂存删除再 submit：mock 真正变化，destroy 是完整记录数组', async () => {
  const ds = createRoleDataSet(false);
  await ds.query();
  const record = ds.get(1);
  record.set({ name: '修改后的租户管理员', memberCount: 0, enabled: false });
  expect(record.status).toBe('update');
  await ds.submit();
  expect(record.status).toBe('sync');
  expect(ds.dirty).toBe(false);
  expect(request('get', '/mock/unit-05/roles', undefined, { code: 'tenant-admin' }).data.content[0])
    .toMatchObject({ name: '修改后的租户管理员', memberCount: 0, enabled: false });
  ds.remove(record);
  expect(record.status).toBe('delete');
  expect(ds.destroyed).toContain(record);
  expect(ds.dirty).toBe(true);
  await ds.submit();
  const config = adapter.mock.calls.find(([item]) => item.url.endsWith('/destroy'))[0];
  expect(JSON.parse(config.data)).toEqual([expect.objectContaining({ id: 102, code: 'tenant-admin', __id: record.id, __status: 'delete' })]);
  expect(ds.records).not.toContain(record);
  expect(ds.dirty).toBe(false);
  expect(request('get', '/mock/unit-05/roles', undefined, { code: 'tenant-admin' }).data.content).toEqual([]);
});

test.each(['add', 'update'])('真实 %s 提交遇到 HTTP 400 保留状态、dirty 和修改；修正后可重试', async (status) => {
  const ds = createRoleDataSet(false);
  let record;
  if (status === 'add') record = ds.create(roleDraft('retry-role'));
  else { await ds.query(); record = ds.current; }
  record.set({ name: 'FAIL', memberCount: 7, enabled: false });
  await expect(ds.submit()).rejects.toThrow('400');
  expect(record.status).toBe(status);
  expect(record.get('name')).toBe('FAIL');
  expect(record.get('memberCount')).toBe(7);
  expect(record.get('enabled')).toBe(false);
  expect(ds.dirty).toBe(true);
  expect(ds.status).toBe('ready');
  expect(ds.getState('submitError')).toContain('名称 FAIL');
  const saved = request('get', '/mock/unit-05/roles', undefined, { code: record.get('code') }).data.content;
  if (status === 'add') expect(saved).toEqual([]);
  else expect(saved[0].name).toBe('平台管理员');
  record.set('name', '修正后成功');
  await ds.submit();
  expect(record.status).toBe('sync');
  expect(ds.dirty).toBe(false);
  expect(record.get('id')).toBe(status === 'add' ? 113 : 101);
  expect(request('get', '/mock/unit-05/roles', undefined, { code: record.get('code') }).data.content[0].name).toBe('修正后成功');
});

test('submit 自带校验：缺少名称返回 false，不发写请求也不丢失新行', async () => {
  const ds = createRoleDataSet(false);
  const record = ds.create({ code: 'missing-name' });
  expect(await ds.submit()).toBe(false);
  expect(adapter).not.toHaveBeenCalled();
  expect(record.status).toBe('add');
  expect(ds.dirty).toBe(true);
});

test('真实 delete 会立即提交；删除失败按 1.6.7 恢复 sync / 选中，而不是保留 delete', async () => {
  const ds = createRoleDataSet(false);
  await ds.query();
  const deletable = ds.get(1);
  await ds.delete(deletable, false);
  expect(ds.records).not.toContain(deletable);
  expect(request('get', '/mock/unit-05/roles', undefined, { code: 'tenant-admin' }).data.content).toEqual([]);
  const protectedRole = ds.records.find((record) => record.get('id') === 101);
  protectedRole.set('name', '删除前尚未保存的草稿');
  await expect(ds.delete(protectedRole, false)).rejects.toThrow('400');
  expect(protectedRole.status).toBe('sync');
  expect(protectedRole.get('name')).toBe('平台管理员');
  expect(protectedRole.isSelected).toBe(true);
  expect(ds.dirty).toBe(false);
  expect(ds.records).toContain(protectedRole);
});

test('reset 撤销本地新增 / 修改 / 删除，不撤销已经保存的内容，不发请求', async () => {
  const ds = createRoleDataSet(false);
  await ds.query();
  const first = ds.current;
  first.set('name', '已保存名称');
  await ds.submit();
  first.set('name', '未保存名称');
  const removed = ds.get(1);
  ds.remove(removed);
  const added = ds.create(roleDraft());
  const calls = adapter.mock.calls.length;
  ds.reset();
  expect(first.get('name')).toBe('已保存名称');
  expect(removed.status).toBe('sync');
  expect(ds.records).toContain(removed);
  expect(ds.records).not.toContain(added);
  expect(ds.dirty).toBe(false);
  expect(adapter).toHaveBeenCalledTimes(calls);
});

test('混合 create / update 不是跨请求事务：一个失败不能推断另一个未落库', async () => {
  const ds = createRoleDataSet(false);
  await ds.query();
  ds.current.set('name', 'FAIL');
  const added = ds.create(roleDraft('mixed-role'));
  await expect(ds.submit()).rejects.toThrow('400');
  // DataSet.write 使用 Promise.all：成功的 create 已写后端，但整组未进入 commitData。
  // 这是固定版本的边界，不能把“本地仍 dirty”解释为“后端全部回滚”，也不能自动重试。
  expect(request('get', '/mock/unit-05/roles', undefined, { code: 'mixed-role' }).data.content).toHaveLength(1);
  expect(added.status).toBe('add');
  expect(added.get('id')).toBeUndefined();
  expect(ds.dirty).toBe(true);
});

test.each([
  ['roles', roleSeeds, { code: 'mock-role', name: 'Mock 角色', memberCount: 0, enabled: false }, 113],
  ['employees', employeeSeeds, { code: 'EMP900', name: 'Mock 员工', age: 18, active: false }, 46],
])('mock %s 正常 CRUD：数组响应、id 分配、元数据不落库、查询后真正更新和删除', (kind, seeds, draft, id) => {
  const base = `/mock/unit-05/${kind}`;
  const initial = request('get', base, undefined, { page: '2', pagesize: '2' });
  expect(initial).toMatchObject({ status: 200, data: { content: seeds.slice(2, 4), number: 1, size: 2, totalElements: seeds.length } });
  const created = request('post', `${base}/create`, [{ ...draft, __id: 9999, __status: 'add' }]);
  expect(created.status).toBe(200);
  expect(created.data.content[0]).toMatchObject({ ...draft, id, __id: 9999 });
  const saved = request('get', base, undefined, { code: draft.code }).data.content[0];
  expect(saved.__id).toBeUndefined();
  expect(saved.__status).toBeUndefined();
  expect(request('post', `${base}/update`, [{ id, name: '已修改' }]).status).toBe(200);
  expect(request('get', base, undefined, { code: draft.code }).data.content[0].name).toBe('已修改');
  expect(request('post', `${base}/destroy`, [{ id }]).status).toBe(200);
  expect(request('get', base, undefined, { code: draft.code }).data.content).toEqual([]);
});

test.each(['roles', 'employees'])('mock %s 错误请求：非法分页、非数组、错误 id、格式 / 类型 / 状态错误、重复编码', (kind) => {
  const base = `/mock/unit-05/${kind}`;
  const id = kind === 'roles' ? 102 : 4;
  const valid = kind === 'roles' ? roleDraft('valid-role') : { code: 'EMP900', name: '测试', age: 18, active: false };
  for (const query of [{ page: '0' }, { page: ['1', '2'] }, { pagesize: '101' }]) expect(request('get', base, undefined, query).status).toBe(400);
  for (const operation of ['create', 'update', 'destroy']) {
    for (const body of [undefined, {}, [], [null], [123], [[{ id }]]]) expect(request('post', `${base}/${operation}`, body).status).toBe(400);
  }
  for (const operation of ['update', 'destroy']) {
    expect(request('post', `${base}/${operation}`, [{ id: 'bad' }]).status).toBe(400);
    expect(request('post', `${base}/${operation}`, [{ id: 999999 }]).status).toBe(404);
  }
  for (const patch of [{ name: '' }, { name: 'FAIL' }, { code: '!' }, { __id: 'not-number' }, { __status: 'update' }, { id: 888 },
    kind === 'roles' ? { memberCount: -1 } : { age: 61 }, kind === 'roles' ? { enabled: 'false' } : { active: 'false' }]) {
    expect(request('post', `${base}/create`, [{ ...valid, ...patch }]).status).toBe(400);
  }
  expect(request('post', `${base}/create`, [{ ...valid, code: kind === 'roles' ? 'site-admin' : 'EMP001' }]).status).toBe(409);
});

test('mock 请求批次原子性：create / update / destroy 某条失败时整批不写入、不消耗新 ID', () => {
  const base = '/mock/unit-05/roles';
  expect(request('post', `${base}/create`, [roleDraft('first-role'), { ...roleDraft('fail-role'), name: 'FAIL' }]).status).toBe(400);
  expect(request('get', base).data.totalElements).toBe(12);
  expect(request('post', `${base}/create`, [roleDraft('ok-role')]).data.content[0].id).toBe(113);
  expect(request('post', `${base}/update`, [{ id: 102, name: '不应落库' }, { id: 103, name: 'FAIL' }]).status).toBe(400);
  expect(request('get', base, undefined, { code: 'tenant-admin' }).data.content[0].name).toBe('租户管理员');
  expect(request('post', `${base}/destroy`, [{ id: 102 }, { id: 101 }]).status).toBe(400);
  expect(request('get', base, undefined, { code: 'tenant-admin' }).data.content).toHaveLength(1);
});

test('员工在职禁止删除；离职状态必须先保存；重新注册恢复种子且不污染已有集合', () => {
  const base = '/mock/unit-05/employees';
  expect(request('post', `${base}/destroy`, [{ id: 1, active: false }]).status).toBe(400);
  expect(request('post', `${base}/update`, [{ id: 1, active: false }]).status).toBe(200);
  expect(request('post', `${base}/destroy`, [{ id: 1 }]).status).toBe(200);
  const second = createMockApp();
  expect(second('get', base).data.totalElements).toBe(45);
  expect(request('get', base).data.totalElements).toBe(44);
  expect(employeeSeeds[0].active).toBe(true);
  expect(roleSeeds[0].name).toBe('平台管理员');
});
