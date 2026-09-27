import dataSetAxios from 'choerodon-ui/dataset/axios';

const originalAdapter = dataSetAxios.defaults.adapter;
const originalFetch = global.fetch;
let createRoleDataSet;
let lookupRequests;

beforeAll(() => {
  lookupRequests = [];
  // 在加载 Pro 的 LookupCodeStore 之前替换 HTTP 适配器，保留真实字段和解析逻辑。
  dataSetAxios.defaults.adapter = async (config) => {
    lookupRequests.push(config);
    return {
      config, status: 200, statusText: 'OK', headers: {},
      data: JSON.stringify({ content: [{ value: 'INTERNAL', meaning: '内部可见' }], totalElements: 1 }),
    };
  };
  ({ createRoleDataSet } = require('./Example'));
});

beforeEach(() => {
  global.fetch = jest.fn(async () => ({ ok: true, json: async () => ({ available: true }) }));
});

afterAll(() => {
  dataSetAxios.defaults.adapter = originalAdapter;
  global.fetch = originalFetch;
});

test('真实 options 与字段级 lookup 能解析显示文本，保留编码', async () => {
  const ds = createRoleDataSet();
  const field = ds.getField('visibility');
  await field.fetchLookup();
  expect(field.getLookupText('INTERNAL')).toBe('内部可见');
  expect(lookupRequests.some((config) => config.url.endsWith('/U03.ROLE_VISIBILITY') && config.method === 'get')).toBe(true);
  expect(ds.getField('level').get('options').get(2).get('value')).toBe('project');
  expect(global.fetch).not.toHaveBeenCalled();
});

test('必填、同步业务规则、格式与数值边界使用真实 1.6.7 校验', async () => {
  const ds = createRoleDataSet();
  const name = ds.getField('name');
  expect(await name.checkValidity(ds.current)).toBe(false);
  expect(name.getValidationMessage(ds.current)).toBe('请输入角色名称');
  ds.current.set('name', '角');
  expect(await name.checkValidity(ds.current)).toBe(false);
  expect(name.getValidationMessage(ds.current)).toBe('角色名称至少需要两个字符');
  ds.current.set('name', '学习角色');
  expect(await name.checkValidity(ds.current)).toBe(true);

  ds.current.set('code', 'Bad!');
  expect(await ds.getField('code').checkValidity(ds.current)).toBe(false);
  expect(global.fetch).not.toHaveBeenCalled();
  for (const [value, valid] of [[0, false], [101, false], [1, true], [100, true]]) {
    ds.current.set('memberLimit', value);
    expect(await ds.getField('memberLimit').checkValidity(ds.current)).toBe(valid);
  }
});

test('重复编码与 HTTP / 网络故障均校验失败，可用编码通过', async () => {
  const ds = createRoleDataSet();
  const validator = ds.getField('code').get('validator');
  global.fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ available: false }) });
  expect(await validator('site-admin')).toBe('角色编码已存在');
  global.fetch.mockResolvedValueOnce({ ok: false });
  expect(await validator('service-down')).toBe('编码校验服务暂不可用，请稍后重试');
  global.fetch.mockRejectedValueOnce(new Error('测试网络中断'));
  expect(await validator('learning-role')).toBe('编码校验请求失败，请检查本地服务');
  expect(await validator('learning-role')).toBe(true);
});

test('整表 validate 等待异步编码结果，返回布尔值', async () => {
  const ds = createRoleDataSet();
  ds.current.set({ name: '学习角色', code: 'learning-role', memberLimit: 10, level: 'project', visibility: 'INTERNAL' });
  let finishRequest;
  global.fetch.mockImplementation(() => new Promise((resolve) => { finishRequest = resolve; }));
  let settled = false;
  const validation = ds.validate().then((valid) => { settled = true; return valid; });
  // 等待 DataSet 准备字段和值集；不把是否返回 Promise 当作校验成功。
  for (let attempt = 0; !finishRequest && attempt < 50; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  expect(finishRequest).toBeDefined();
  expect(settled).toBe(false);
  finishRequest({ ok: true, json: async () => ({ available: true }) });
  expect(await validation).toBe(true);
});
