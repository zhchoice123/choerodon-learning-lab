import { DataSet } from 'choerodon-ui/pro';
import dataSetAxios from 'choerodon-ui/dataset/axios';

const express = require('express');
const registerPlayground = require('../../mock/playground');
const originalAdapter = dataSetAxios.defaults.adapter;
let server;
let origin;

beforeAll(async () => {
  const app = express();
  registerPlayground(app);
  server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  origin = `http://127.0.0.1:${server.address().port}`;
});

beforeEach(() => {
  // 真实 DataSet 序列化 + 真实 HTTP mock；仅替换 jsdom 的 HTTP 适配器。
  dataSetAxios.defaults.adapter = async (config) => {
    const payload = config.data ? (typeof config.data === 'string' ? config.data : JSON.stringify(config.data)) : '';
    const result = await new Promise((resolve, reject) => {
      const req = require('http').request(`${origin}${config.url}`, {
        method: config.method,
        headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) },
      }, (res) => {
        let body = '';
        res.on('data', (part) => { body += part; });
        res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(body), headers: {}, config }));
      });
      req.on('error', reject);
      if (payload) req.write(payload);
      req.end();
    });
    if (result.status >= 400) throw Object.assign(new Error(`HTTP ${result.status}`), { response: result });
    return result;
  };
});
afterEach(() => { dataSetAxios.defaults.adapter = originalAdapter; });
afterAll(() => new Promise((resolve) => { server.close(resolve); server.closeAllConnections(); }));

test('自由练习区协议：真实 DataSet 主从提交回写 ID，失败保留修改，修正后可删除', async () => {
  const addresses = new DataSet({ primaryKey: 'id', fields: [
    { name: 'id', type: 'number' }, { name: 'city', type: 'string' },
    { name: 'detail', type: 'string' }, { name: 'phone', type: 'string' },
    { name: 'isDefault', type: 'boolean' },
  ] });
  const ds = new DataSet({
    primaryKey: 'id', dataKey: 'content', totalKey: 'totalElements',
    feedback: { submitSuccess: () => {}, submitFailed: () => {} },
    children: { addresses },
    fields: [{ name: 'id', type: 'number' }, { name: 'name', type: 'string' }, { name: 'code', type: 'string' }],
    transport: {
      create: { url: '/mock/playground/users', method: 'POST' },
      update: { url: '/mock/playground/users', method: 'PUT' },
      destroy: { url: '/mock/playground/users', method: 'DELETE' },
    },
  });
  const row = ds.create({ name: '协议测试', code: 'EMP900' });
  const line = addresses.create({ city: '上海', detail: '测试地址', phone: '13812345678', isDefault: false });
  await ds.submit();
  expect(row.get('id')).toBe(46);
  expect(line.get('id')).toBe(1);
  expect(row.status).toBe('sync');
  expect(line.status).toBe('sync');
  expect(ds.dirty).toBe(false);
  line.set('city', '杭州');
  await ds.submit();
  expect(line.get('city')).toBe('杭州');
  expect(ds.dirty).toBe(false);
  addresses.remove(line);
  await ds.submit();
  expect(addresses.length).toBe(0);
  expect(ds.dirty).toBe(false);
  row.set('name', 'FAIL');
  await expect(ds.submit()).rejects.toThrow('400');
  expect(row.get('name')).toBe('FAIL');
  expect(row.status).toBe('update');
  expect(ds.dirty).toBe(true);
  row.set('name', '已修正');
  await ds.submit();
  expect(ds.dirty).toBe(false);
  ds.remove(row);
  await ds.submit();
  expect(ds.length).toBe(0);
  expect(ds.dirty).toBe(false);
});
