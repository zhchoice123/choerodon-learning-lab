import React from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Modal } from 'choerodon-ui/pro';
import dataSetAxios from 'choerodon-ui/dataset/axios';
import Example, { createRoleDataSet, openRoleEditor } from './08-modal/Example';
import Easy from './08-modal/templates/Exercise.easy';
import Normal from './08-modal/templates/Exercise.normal';
import Hard from './08-modal/templates/Exercise.hard';

const registerUnit08 = require('../../mock/unit08');
const roleSeeds = require('../../mock/data/roles');
const employeeSeeds = require('../../mock/data/users');
const originalAdapter = dataSetAxios.defaults.adapter;
let request;
let adapter;
let open;
let dialog;
let proxy;
let errors;
let sessions;
function mockRoutes() {
  const routes = new Map();
  registerUnit08({ use: () => {}, get: (url, fn) => routes.set(`get ${url}`, fn), post: (url, fn) => routes.set(`post ${url}`, fn) });
  return (method, url, body, query = {}) => {
    const result = { status: 200 };
    const res = { status(code) { result.status = code; return res; }, json(data) { result.data = JSON.parse(JSON.stringify(data)); } };
    const handler = routes.get(`${method} ${url}`);
    if (!handler) throw new Error(`未注册请求 ${method} ${url}`);
    handler({ body, query }, res);
    return result;
  };
}
const posts = () => adapter.mock.calls.map(([config]) => config).filter(config => config.method === 'post');
const backend = () => request('get', '/mock/unit-08/roles').data.content;
const draft = { code: 'modal-role', name: '弹窗角色', enabled: false };
async function load() { const ds = createRoleDataSet(false); await ds.query(); return ds; }
function editor(ds, record, options) {
  const session = openRoleEditor(ds, record, options);
  sessions.push(session);
  return session;
}

beforeEach(() => {
  errors = jest.spyOn(console, 'error');
  sessions = [];
  request = mockRoutes();
  adapter = jest.fn(async config => {
    const body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
    const query = Object.fromEntries(Object.entries(config.params || {}).map(([key, value]) => [key, String(value)]));
    const response = { ...request(config.method, config.url, body, query), config, statusText: 'OK', headers: {} };
    if (response.status !== 200) throw Object.assign(new Error(`Request failed with status code ${response.status}`), { response });
    return response;
  });
  dataSetAxios.defaults.adapter = adapter;
  proxy = { close: jest.fn(), update: jest.fn() };
  open = jest.spyOn(Modal, 'open').mockImplementation(props => { dialog = props; return proxy; });
});
afterEach(async () => {
  await act(async () => { sessions.forEach(session => session.dispose()); cleanup(); });
  dataSetAxios.defaults.adapter = originalAdapter;
  open.mockRestore();
  const calls = errors.mock.calls.slice();
  errors.mockRestore();
  // 同 05～07：pro/lib/table/Table.js 将 combineColumnFilter 透传 div；保留输出，只精确识别既有消息。
  const known = args => args.length === 4
    && args[0] === 'Warning: React does not recognize the `%s` prop on a DOM element. If you intentionally want it to appear in the DOM as a custom attribute, spell it as lowercase `%s` instead. If you accidentally passed it from a parent component, remove it from the DOM element.%s'
    && args[1] === 'combineColumnFilter' && args[2] === 'combinecolumnfilter' && args[3].includes('Table');
  expect(calls.filter(args => !known(args))).toEqual([]);
});

test.each([['样例', Example], ['入门', Easy], ['标准', Normal], ['挑战', Hard]])('%s 原始页面只查询一次且可安全打开编辑器', async (name, Component) => {
  const view = render(<Component />);
  await waitFor(() => expect(screen.getByText(/本页 3 条|已读取 3 位员工/)).toBeInTheDocument());
  const sample = name === '样例';
  fireEvent.click(screen.getByRole('button', { name: sample ? '编辑当前（抽屉）' : '编辑员工（抽屉）' }));
  expect(dialog.drawer).toBe(true);
  expect(open).toHaveBeenCalledTimes(1);
  if (!sample) {
    await act(async () => { expect(await dialog.onOk()).toBe(true); });
    expect(screen.getByRole('status')).toHaveTextContent('骨架提前允许关闭');
  }
  expect(posts()).toHaveLength(0);
  expect(adapter).toHaveBeenCalledTimes(1);
  expect(adapter.mock.calls[0][0]).toMatchObject({ method: 'get', params: { page: 1, pagesize: 5 } });
  view.unmount();
  expect(proxy.close).toHaveBeenCalledWith(true);
});

test('Form 固定绑定打开时记录，即使 current 改变也不编辑其他行；取消只回滚该记录', async () => {
  const ds = await load();
  const record = ds.current;
  editor(ds, record);
  const body = render(dialog.children);
  await act(async () => {
    ds.current = ds.get(1);
    ds.current.set('name', '另一条独立草稿');

  });
  const nameInput = screen.getByDisplayValue('平台管理员');
  await act(async () => { fireEvent.change(nameInput, { target: { value: '弹窗修改' } }); });
  await act(async () => { fireEvent.blur(nameInput); });
  expect(record.get('name')).toBe('弹窗修改');
  expect(ds.current.get('name')).toBe('另一条独立草稿');
  await act(async () => { expect(dialog.onCancel()).toBe(true); expect(dialog.onClose()).toBe(true); });
  expect(record.get('name')).toBe('平台管理员');
  expect(record.status).toBe('sync');
  expect(ds.current.get('name')).toBe('另一条独立草稿');
  expect(ds.dirty).toBe(true);
  expect(posts()).toHaveLength(0);
  body.unmount();
});

test('新增取消 reset 后必须 remove：无空行、无写请求、列表 dirty=false', async () => {
  const ds = await load();
  const row = ds.create(draft);
  editor(ds, row);
  expect(dialog.onCancel()).toBe(true);
  expect(dialog.onClose()).toBe(true);
  expect(ds.length).toBe(3);
  expect(ds.records).not.toContain(row);
  expect(ds.dirty).toBe(false);
  expect(posts()).toHaveLength(0);
});

test('新增确认回写 id / sync；成功关闭不再次 reset 或移除记录', async () => {
  const ds = await load();
  const row = ds.create(draft);
  const reset = jest.spyOn(row, 'reset');
  editor(ds, row);
  expect(await dialog.onOk()).toBe(true);
  expect(row.get('id')).toBe(104);
  expect(row.status).toBe('sync');
  expect(ds.dirty).toBe(false);
  expect(dialog.onClose()).toBe(true);
  expect(reset).not.toHaveBeenCalled();
  expect(ds.records).toContain(row);
  expect(JSON.parse(posts()[0].data)).toEqual([expect.objectContaining({ code: draft.code, enabled: false, __id: row.id, __status: 'add' })]);
  expect(backend()).toHaveLength(4);
});

test('校验失败返回 false 且无 POST；没有改动返回 true 且无 POST', async () => {
  const ds = await load();
  const row = ds.current;
  editor(ds, row);
  row.set('name', undefined);
  expect(await dialog.onOk()).toBe(false);
  expect(row.getState('dialogResult')).toContain('校验未通过');
  expect(posts()).toHaveLength(0);
  row.reset();
  expect(await dialog.onOk()).toBe(true);
  expect(posts()).toHaveLength(0);
});

test.each([false, true])('HTTP 失败留窗和草稿；修正后只提交捕获的记录（新增=%s）', async isNew => {
  const ds = await load();
  const row = isNew ? ds.create({ ...draft, name: 'FAIL' }) : ds.current;
  editor(ds, row, { drawer: true });
  row.set('name', 'FAIL');
  const other = ds.find(r => r !== row);
  other.set('name', '其他行未提交');
  expect(await dialog.onOk()).toBe(false);
  expect(row.get('name')).toBe('FAIL');
  expect(row.status).toBe(isNew ? 'add' : 'update');
  expect(ds.dirty).toBe(true);
  expect(row.getState('dialogResult')).toContain('单元 08 固定失败');
  expect(backend()).toHaveLength(3);
  expect(backend().some(r => r.name === 'FAIL')).toBe(false);
  row.set('name', '修正后成功');
  expect(await dialog.onOk()).toBe(true);
  expect(row.status).toBe('sync');
  expect(other.status).toBe('update');
  expect(ds.dirty).toBe(true);
  expect(backend().find(r => r.id === other.get('id')).name).not.toBe('其他行未提交');
  if (isNew) expect(row.get('id')).toBe(104);
});

test('编辑保存后再编辑并取消，恢复最近保存值；未产生额外请求', async () => {
  const ds = await load();
  const row = ds.current;
  editor(ds, row);
  row.set('name', '已保存名称');
  expect(await dialog.onOk()).toBe(true);
  expect(dialog.onClose()).toBe(true);
  editor(ds, row);
  row.set('name', '第二次草稿');
  expect(dialog.onCancel()).toBe(true);
  expect(row.get('name')).toBe('已保存名称');
  expect(ds.dirty).toBe(false);
  expect(posts()).toHaveLength(1);
});

test('保存进行中重复确认/取消/关闭被阻止，一次写请求', async () => {
  const ds = await load();
  const row = ds.current;
  row.set('name', '慢保存');
  editor(ds, row);
  let release;
  adapter.mockImplementationOnce(config => new Promise(resolve => { release = () => resolve({
    config, status: 200, headers: {}, data: { content: [{ ...row.toData(), __id: row.id }], totalElements: 3 },
  }); }));
  const pending = dialog.onOk();
  await waitFor(() => expect(release).toBeDefined());
  expect(await dialog.onOk()).toBe(false);
  expect(dialog.onCancel()).toBe(false);
  expect(dialog.onClose()).toBe(false);
  expect(row.getState('saving')).toBe(true);
  release();
  expect(await pending).toBe(true);
  expect(posts()).toHaveLength(1);
  expect(row.getState('saving')).toBe(false);
});

test('卸载只关闭自身句柄并回滚未保存新增，不调用全局 destroyAll', async () => {
  const ds = await load();
  const globalClose = jest.spyOn(Modal, 'destroyAll');
  const row = ds.create(draft);
  const report = jest.fn();
  const afterClose = jest.fn();
  const session = editor(ds, row, { onResult: report, afterClose });
  session.dispose();
  dialog.afterClose();
  expect(proxy.close).toHaveBeenCalledWith(true);
  expect(ds.records).not.toContain(row);
  expect(await dialog.onOk()).toBe(false);
  expect(report).not.toHaveBeenCalled();
  expect(afterClose).not.toHaveBeenCalled();
  expect(globalClose).not.toHaveBeenCalled();
  globalClose.mockRestore();
});

test.each([true, false])('保存中卸载：不提前回滚，不再通知卸载页面，后端结果仍可核对（成功=%s）', async success => {
  const ds = await load();
  const row = ds.current;
  row.set('name', success ? '离开后完成保存' : 'FAIL');
  const report = jest.fn();
  const session = editor(ds, row, { onResult: report });
  const perform = adapter.getMockImplementation();
  let release;
  adapter.mockImplementationOnce(config => new Promise((resolve, reject) => {
    release = () => perform(config).then(resolve, reject);
  }));
  const saving = dialog.onOk();
  await waitFor(() => expect(release).toBeDefined());
  session.dispose();
  expect(row.status).toBe('update');
  expect(dialog.onClose()).toBe(true);
  release();
  expect(await saving).toBe(success);
  expect(report).not.toHaveBeenCalled();
  expect(row.get('name')).toBe(success ? '离开后完成保存' : '平台管理员');
  expect(backend()[0].name).toBe(success ? '离开后完成保存' : '平台管理员');
  expect(ds.dirty).toBe(false);
});

test('真实 Modal portal：校验失败留窗，取消后关闭并回滚', async () => {
  open.mockRestore();
  const ds = await load();
  const row = ds.current;
  await act(async () => { editor(ds, row); });
  await screen.findByText('编辑角色（弹窗）');
  const nameInput = screen.getByDisplayValue('平台管理员');
  await act(async () => { fireEvent.change(nameInput, { target: { value: '' } }); });
  await act(async () => { fireEvent.blur(nameInput); });
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: '确认保存' })); });
  await screen.findByText('校验未通过，请检查必填与格式');
  expect(screen.getByText('编辑角色（弹窗）')).toBeInTheDocument();
  expect(posts()).toHaveLength(0);
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: '取消修改' })); });
  await waitFor(() => expect(screen.queryByText('编辑角色（弹窗）')).not.toBeInTheDocument());
  expect(row.get('name')).toBe('平台管理员');
  expect(ds.dirty).toBe(false);
});

test('mock 正常与错误请求：数组格式、状态、ID、重复编码、固定失败、查询参数', () => {
  const call = (body, operation = 'create') => request('post', `/mock/unit-08/roles/${operation}`, body);
  const row = { ...draft, __id: 1001, __status: 'add' };
  expect(call(row).status).toBe(400);
  expect(call([row, row]).status).toBe(400);
  expect(call([{ ...row, __status: 'sync' }]).status).toBe(400);
  expect(call([{ ...row, __id: 0 }]).status).toBe(400);
  expect(call([{ ...row, id: 8 }]).status).toBe(400);
  expect(call([{ ...row, name: 'FAIL' }]).status).toBe(400);
  expect(call([{ ...row, code: 'site-admin' }]).status).toBe(409);
  expect(call([{ ...row, enabled: 'false' }]).status).toBe(400);
  const saved = call([row]);
  expect(saved.status).toBe(200);
  expect(saved.data.content[0]).toMatchObject({ id: 104, __id: 1001, enabled: false });
  expect(call([{ ...row, id: 104, name: '已修改', __status: 'update' }], 'update').status).toBe(200);
  expect(backend().find(r => r.id === 104).name).toBe('已修改');
  expect(call([{ ...row, id: 999, __status: 'update' }], 'update').status).toBe(404);
  expect(request('get', '/mock/unit-08/roles', undefined, { page: '0' }).status).toBe(400);
  expect(request('get', '/mock/unit-08/roles', undefined, { page: '2', pagesize: '2' }).data).toMatchObject({ number: 1, size: 2, totalElements: 4 });
  expect(roleSeeds[0].name).toBe('平台管理员');
  expect(mockRoutes()('get', '/mock/unit-08/roles').data.totalElements).toBe(3);
});

test('员工 mock：已有编码不可改、在职邮箱必填、年龄整数、false 保留与独立集合', () => {
  const url = '/mock/unit-08/employees';
  const write = (value, op = 'create') => request('post', `${url}/${op}`, [value]);
  const row = { code: 'EMP888', name: '练习员工', age: 25, active: true, email: '', __id: 1001, __status: 'add' };
  expect(write(row).status).toBe(400);
  expect(write({ ...row, active: false, age: 25.5 }).status).toBe(400);
  expect(write({ ...row, active: false, email: 'bad' }).status).toBe(400);
  const saved = write({ ...row, active: false });
  expect(saved.data.content[0]).toMatchObject({ id: 4, active: false, email: '', __id: 1001 });
  expect(write({ ...saved.data.content[0], code: 'EMP889', __status: 'update' }, 'update').status).toBe(400);
  expect(request('get', url).data.content[3].code).toBe('EMP888');
  expect(backend()).toHaveLength(3);
  expect(employeeSeeds).toHaveLength(45);
});
