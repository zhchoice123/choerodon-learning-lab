// 所有小节的通用检查：注册表与目录一致、元数据完整、练习与模板一致、样例和未完成的练习都能渲染。
// 只替换 HTTP 层：请求被路由到真实的 mock 处理函数（mock/index.js），DataSet / Table / MobX 都是真实实现。
import React from 'react';
import { act, cleanup, render } from '@testing-library/react';
import { getConfig } from 'choerodon-ui';
import dataSetAxios from 'choerodon-ui/dataset/axios';
import localeContext from 'choerodon-ui/pro/lib/locale-context';
import zhCN from 'choerodon-ui/pro/lib/locale-context/zh_CN';
import { chapters } from '../learn/lessons';

const fs = require('fs');
const path = require('path');
const { createUnitTools } = require('../../scripts/unit');
const registerMock = require('../../mock');

// 值集请求在模块加载时就捕获了 axios 的 adapter，这里让它也转发给当前用例的 adapter（与 unit09.test.js 相同）
jest.mock('choerodon-ui/dataset/axios/cacheAdapterEnhancer', () => ({
  __esModule: true,
  default: () => (config) => global.__sectionsAdapter(config),
}));
jest.mock('choerodon-ui/dataset/axios/throttleAdapterEnhancer', () => ({
  __esModule: true,
  default: (adapter) => adapter,
}));

// 最小的 express 替身：支持 :param 路径；use() 只用于挂 express.json，这里请求体已是对象，直接忽略
function mockServer() {
  const routes = [];
  const add = (method) => (pattern, handler) => {
    const keys = [];
    const regex = new RegExp(`^${pattern.replace(/:(\w+)/g, (_, key) => { keys.push(key); return '([^/]+)'; })}$`);
    routes.push({ method, regex, keys, handler });
  };
  registerMock({ get: add('get'), post: add('post'), put: add('put'), delete: add('delete'), use() {} });
  return (method, url, query, body) => {
    const [pathname, search] = url.split('?');
    const allQuery = { ...Object.fromEntries(new URLSearchParams(search || '')), ...query };
    for (const route of routes) {
      const match = route.method === method && route.regex.exec(pathname);
      if (!match) continue;
      const params = Object.fromEntries(route.keys.map((key, i) => [key, decodeURIComponent(match[i + 1])]));
      // 有的 mock 会延迟应答（如编码校验 setTimeout 250ms），等到 res.json 被调用再返回
      return new Promise((resolve) => {
        const result = { status: 200 };
        const res = {
          status(code) { result.status = code; return res; },
          json(data) { result.data = JSON.parse(JSON.stringify(data)); resolve(result); },
        };
        route.handler({ query: allQuery, params, body }, res);
      });
    }
    return Promise.resolve({ status: 404, data: { message: `未注册的 mock：${method.toUpperCase()} ${pathname}` } });
  };
}

const KNOWN_LIBRARY_WARNINGS = /combineColumnFilter|forceClearActiveKey|React does not recognize|unique "key" prop|act\(\.\.\.\)/;
// 主从小节的子表查询有约 300ms 防抖：在本用例内等它完成，既能验证子表真的加载，也避免请求拖到下一个用例里才报错
const settleMs = (key) => (key.startsWith('unit-07') ? 450 : 0);
const CONFIG_KEYS = ['dataKey', 'totalKey', 'generatePageQuery', 'lookupUrl', 'lookupAxiosMethod'];
const configSnapshot = () => Object.fromEntries(CONFIG_KEYS.map((key) => [key, getConfig(key)]));

const sections = chapters.flatMap((chapter) => chapter.sections);
const discovered = createUnitTools().readUnits().flatMap((unit) => unit.sections);
const directoryOf = (key) => discovered.find((item) => `unit-${item.id}` === key)?.directory;

const originalAdapter = dataSetAxios.defaults.adapter;
const originalFetch = global.fetch;
let request;
let errors;
let baseline;

beforeEach(() => {
  request = mockServer();
  const adapter = async (config) => {
    // 与 axios 一致：值为 undefined / null 的参数不出现在请求里
    const query = Object.fromEntries(Object.entries(config.params || {}).filter(([, v]) => v !== undefined && v !== null).map(([k, v]) => [k, String(v)]));
    const body = typeof config.data === 'string' && config.data ? JSON.parse(config.data) : config.data;
    const result = await request((config.method || 'get').toLowerCase(), config.url, query, body);
    const response = { data: result.data, status: result.status, statusText: String(result.status), headers: {}, config };
    if (result.status >= 400) throw Object.assign(new Error(`Request failed with status code ${result.status}`), { response, config });
    return response;
  };
  dataSetAxios.defaults.adapter = adapter;
  global.__sectionsAdapter = adapter;
  global.fetch = async (url, options = {}) => {
    const result = await request((options.method || 'GET').toLowerCase(), String(url), {}, options.body ? JSON.parse(options.body) : undefined);
    return { ok: result.status < 400, status: result.status, json: async () => result.data };
  };
  errors = jest.spyOn(console, 'error').mockImplementation(() => {});
  baseline = configSnapshot();
  localeContext.setLocale(zhCN);
});

afterEach(() => {
  cleanup();
  dataSetAxios.defaults.adapter = originalAdapter;
  global.fetch = originalFetch;
  errors.mockRestore();
  // 小节里修改的全局配置（如第 09 章）离开后必须恢复
  expect(configSnapshot()).toEqual(baseline);
});

test('前端注册的小节与目录里的小节完全一致', () => {
  expect(sections.map((section) => section.key).sort()).toEqual(discovered.map((item) => `unit-${item.id}`).sort());
});

describe.each(sections.map((section) => [section.key, section]))('%s', (key, section) => {
  test('元数据完整，练习与模板逐字节一致', () => {
    const id = key.replace(/^unit-/, '');
    expect(section.title.startsWith(`${id} `)).toBe(true);
    expect(section.Example).toEqual(expect.any(Function));
    expect(section.Exercise).toEqual(expect.any(Function));
    expect(Array.isArray(section.hints) && section.hints.length >= 1 && section.hints.length <= 3).toBe(true);
    section.hints.forEach((hint) => expect(typeof hint === 'string' && hint.length > 5).toBe(true));
    const directory = directoryOf(key);
    expect(directory).toBeTruthy();
    expect(fs.existsSync(path.join(directory, 'README.md'))).toBe(true);
    const exercise = fs.readFileSync(path.join(directory, 'Exercise.js'));
    const template = fs.readFileSync(path.join(directory, 'templates/Exercise.normal.js'));
    expect(exercise.equals(template)).toBe(true);
  });

  test.each([['样例', 'Example'], ['未完成的练习', 'Exercise']])('%s能渲染且没有意外的报错', async (_, part) => {
    const Component = section[part];
    await act(async () => {
      render(<Component />);
      // 等待自动查询、值集等异步请求完成
      for (let i = 0; i < 5; i += 1) await new Promise((resolve) => setTimeout(resolve, 0));
      if (settleMs(key)) await new Promise((resolve) => setTimeout(resolve, settleMs(key)));
    });
    const unexpected = errors.mock.calls.map((args) => args.map(String).join(' ')).filter((message) => !KNOWN_LIBRARY_WARNINGS.test(message));
    expect(unexpected).toEqual([]);
  });
});
