import React from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { DataSet } from 'choerodon-ui/pro';
import { getConfig } from 'choerodon-ui';
import dataSetAxios from 'choerodon-ui/dataset/axios';
import localeContext from 'choerodon-ui/pro/lib/locale-context';
import zhCN from 'choerodon-ui/pro/lib/locale-context/zh_CN';
import enUS from 'choerodon-ui/pro/lib/locale-context/en_US';
import LessonConfigScope, { enterConfigScope } from './09-global-config/LessonConfigScope';
import Example, { legacyV1Config } from './09-global-config/Example';
import Easy from './09-global-config/templates/Exercise.easy';
import Normal from './09-global-config/templates/Exercise.normal';
import Hard from './09-global-config/templates/Exercise.hard';

// 1.6.7 的 LookupCodeStore 在模块加载时就捕获了 axios 的默认 adapter（再包一层缓存 / 节流），
// 之后替换 dataSetAxios.defaults.adapter 影响不到值集请求。这里让这两层包装转发给当前用例的 adapter。
jest.mock('choerodon-ui/dataset/axios/cacheAdapterEnhancer', () => ({
  __esModule: true,
  default: () => (config) => global.__unit09Adapter(config),
}));
jest.mock('choerodon-ui/dataset/axios/throttleAdapterEnhancer', () => ({
  __esModule: true,
  default: (adapter) => adapter,
}));

const registerUnit09 = require('../../mock/unit09');

const KEYS = ['dataKey', 'totalKey', 'generatePageQuery', 'lookupUrl', 'lookupAxiosMethod'];
const snapshot = () => Object.fromEntries(KEYS.map((key) => [key, getConfig(key)]));

// 把 DataSet 的真实请求路由到 mock/unit09.js 的处理函数（只替换 HTTP 层）
function mockRoutes() {
  const routes = [];
  const add = (method) => (pattern, handler) => {
    const keys = [];
    const regex = new RegExp(`^${pattern.replace(/:(\w+)/g, (_, key) => { keys.push(key); return '([^/]+)'; })}$`);
    routes.push({ method, regex, keys, handler });
  };
  registerUnit09({ get: add('get'), post: add('post') });
  return (method, url, query = {}) => {
    for (const route of routes) {
      const match = route.method === method && route.regex.exec(url);
      if (match) {
        const params = Object.fromEntries(route.keys.map((key, index) => [key, decodeURIComponent(match[index + 1])]));
        const result = { status: 200 };
        const res = { status(code) { result.status = code; return res; }, json(data) { result.data = JSON.parse(JSON.stringify(data)); } };
        route.handler({ query, params }, res);
        return result;
      }
    }
    throw new Error(`未注册请求 ${method} ${url}`);
  };
}

const originalAdapter = dataSetAxios.defaults.adapter;
let request;
let adapter;
let baseline;
const calls = (path) => adapter.mock.calls.map(([config]) => config).filter((config) => config.url.includes(path));

beforeEach(() => {
  baseline = snapshot();
  request = mockRoutes();
  adapter = jest.fn(async (config) => {
    const query = Object.fromEntries(Object.entries(config.params || {}).map(([key, value]) => [key, String(value)]));
    const result = request(config.method, config.url, query);
    const response = { data: result.data, status: result.status, statusText: 'OK', headers: {}, config };
    if (result.status >= 400) throw Object.assign(new Error(`Request failed with status code ${result.status}`), { response, config });
    return response;
  });
  dataSetAxios.defaults.adapter = adapter;
  global.__unit09Adapter = adapter;
  localeContext.setLocale(zhCN);
});

afterEach(() => {
  cleanup();
  dataSetAxios.defaults.adapter = originalAdapter;
  // 每个用例结束后，全局配置和语言都必须回到进入前的样子
  expect(snapshot()).toEqual(baseline);
  expect(localeContext.locale.lang).toBe('zh_CN');
});

describe('mock/unit09.js', () => {
  test('v1 roles: pageNo starts at 0 and the envelope is result.records / result.totalCount', () => {
    const { status, data } = request('get', '/mock/unit-09/v1/roles', { pageNo: '1', pageSize: '5' });
    expect(status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.result.totalCount).toBe(12);
    expect(data.result.records.map((role) => role.id)).toEqual([106, 107, 108, 109, 110]);
  });

  test('v2 employees: current starts at 1, defaults to 1/10, and sorts on the server', () => {
    expect(request('get', '/mock/unit-09/v2/employees', {}).data.data.items).toHaveLength(10);
    const page2 = request('get', '/mock/unit-09/v2/employees', { current: '2', limit: '5' }).data;
    expect(page2).toMatchObject({ code: 0, data: { total: 45 } });
    expect(page2.data.items.map((user) => user.id)).toEqual([6, 7, 8, 9, 10]);
    const desc = request('get', '/mock/unit-09/v2/employees', { current: '1', limit: '5', orderBy: 'age:desc' }).data.data.items;
    expect(desc.map((user) => user.age)).toEqual([59, 58, 57, 56, 55]);
    const asc = request('get', '/mock/unit-09/v2/employees', { current: '1', limit: '5', orderBy: 'age:asc' }).data.data.items;
    expect(asc.map((user) => user.name)).toEqual(['李清照', '小乔', '孔秀兰', '黄忠', '吴用']);
  });

  test.each([
    ['v2', { current: '0' }],
    ['v2', { limit: '101' }],
    ['v2', { orderBy: 'age' }],
    ['v2', { orderBy: 'salary:asc' }],
    ['v1', { pageNo: '-1' }],
  ])('%s rejects %p with 400', (version, query) => {
    const url = version === 'v1' ? '/mock/unit-09/v1/roles' : '/mock/unit-09/v2/employees';
    expect(request('get', url, query).status).toBe(400);
  });

  test('lookups use the same envelope as the list, reject POST and unknown codes', () => {
    expect(request('get', '/mock/unit-09/v1/lookups/ROLE.LEVEL', {}).data.result.records).toHaveLength(3);
    expect(request('get', '/mock/unit-09/v2/lookups/EMP.SEX', {}).data.data.items).toEqual([
      { value: 'M', meaning: '男' },
      { value: 'F', meaning: '女' },
    ]);
    expect(request('post', '/mock/unit-09/v2/lookups/EMP.SEX', {}).status).toBe(405);
    expect(request('get', '/mock/unit-09/v1/lookups/NOPE', {}).status).toBe(404);
  });
});

describe('LessonConfigScope', () => {
  test('applies the config and restores it exactly, including the locale', () => {
    const leave = enterConfigScope(legacyV1Config);
    expect(getConfig('dataKey')).toBe('result.records');
    expect(getConfig('lookupAxiosMethod')).toBe('get');
    localeContext.setLocale(enUS);
    leave();
    expect(snapshot()).toEqual(baseline);
    expect(localeContext.locale.lang).toBe('zh_CN');
  });

  test('overlapping scopes restore the baseline only when the last one leaves, in any order', () => {
    const leaveA = enterConfigScope({ dataKey: 'a.rows', totalKey: 'a.total' });
    const leaveB = enterConfigScope({ dataKey: 'b.rows' });
    expect(getConfig('dataKey')).toBe('b.rows');
    leaveA();
    // A 离开后，B 仍然生效；A 独有的 totalKey 回到基线
    expect(getConfig('dataKey')).toBe('b.rows');
    expect(getConfig('totalKey')).toBe(baseline.totalKey);
    leaveB();
    leaveB(); // 重复调用无副作用
    expect(snapshot()).toEqual(baseline);
  });

  test('children render only after the config is applied, so their DataSets see it', () => {
    let seen;
    function Probe() {
      seen = new DataSet({}).dataKey;
      return null;
    }
    const { unmount } = render(
      <LessonConfigScope config={{ dataKey: 'scoped.rows' }}>
        <Probe />
      </LessonConfigScope>,
    );
    expect(seen).toBe('scoped.rows');
    unmount();
    expect(new DataSet({}).dataKey).toBe(baseline.dataKey);
  });
});

describe('Example（旧系统 v1）', () => {
  test('queries with pageNo / pageSize, parses the nested envelope and resolves the lookup', async () => {
    await act(async () => { render(<Example />); });
    await waitFor(() => expect(screen.getByText(/共 12 个角色/)).toBeInTheDocument());
    expect(screen.getByText(/第 1\/3 页/)).toBeInTheDocument();

    const [list] = calls('/v1/roles');
    expect(list.params).toEqual({ pageNo: 0, pageSize: 5 });
    await waitFor(() => expect(screen.getAllByText('平台层').length).toBeGreaterThan(0));
    const [lookup] = calls('/v1/lookups/ROLE.LEVEL');
    expect(lookup.method).toBe('get');
    expect(screen.getByText('result.records')).toBeInTheDocument();
  });

  test('switches the locale and restores everything after unmount', async () => {
    let view;
    await act(async () => { view = render(<Example />); });
    await waitFor(() => expect(screen.getByText(/当前语言：中文/)).toBeInTheDocument());
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Switch to English' })); });
    expect(localeContext.locale.lang).toBe('en_US');
    expect(screen.getByText(/当前语言：English/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '切换为中文' })).toBeInTheDocument();
    view.unmount();
    // afterEach 断言：配置和语言都已恢复
  });
});

describe('练习模板（未完成 TODO）', () => {
  test.each([
    ['easy', Easy],
    ['normal', Normal],
    ['hard', Hard],
  ])('%s renders without errors and shows the symptom of the missing TODOs', async (_, Exercise) => {
    const errors = jest.spyOn(console, 'error');
    try {
      await act(async () => { render(<Exercise />); });
      await waitFor(() => expect(calls('/v2/employees')).toHaveLength(1));
      // 还没翻译分页参数：normal / hard 发出默认的 page / pagesize；easy 的骨架 generatePageQuery 返回空对象
      const params = calls('/v2/employees')[0].params || {};
      if (Exercise === Easy) expect(params).toEqual({});
      else expect(params).toMatchObject({ page: 1, pagesize: 5 });
      expect(params).not.toHaveProperty('current');
      // 遗留的 dataKey 'content' 指向不存在的路径：整条响应被当成一条记录
      await waitFor(() => expect(document.querySelectorAll('.c7n-pro-table-tbody .c7n-pro-table-row')).toHaveLength(1));
      expect(calls('/lookups/')).toHaveLength(0);
      const unexpected = errors.mock.calls.filter(([message]) => !/combineColumnFilter|React does not recognize/.test(String(message)));
      expect(unexpected).toEqual([]);
    } finally {
      errors.mockRestore();
    }
  });
});

test('leaving unit 09 restores the defaults other units rely on', async () => {
  let view;
  await act(async () => { view = render(<Example />); });
  await waitFor(() => expect(screen.getByText(/共 12 个角色/)).toBeInTheDocument());
  view.unmount();

  // 相当于单元 02 之后新建的 DataSet：分页参数和响应解析都回到默认
  adapter.mockImplementationOnce(async (config) => ({ data: { rows: [{ id: 1 }], total: 1 }, status: 200, statusText: 'OK', headers: {}, config }));
  const ds = new DataSet({ pageSize: 5, transport: { read: { url: '/anything', method: 'GET' } } });
  await ds.query();
  const last = adapter.mock.calls[adapter.mock.calls.length - 1][0];
  expect(last.params).toMatchObject({ page: 1, pagesize: 5 });
  expect(last.params).not.toHaveProperty('pageNo');
  expect(ds.length).toBe(1);
});
