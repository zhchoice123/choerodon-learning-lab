const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const registerMock = require('../mock');

async function fixture(t) {
  const app = express();
  registerMock(app);
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  t.after(() => new Promise((resolve) => { server.close(resolve); server.closeAllConnections(); }));
  const base = `http://127.0.0.1:${server.address().port}`;
  return async (path = '/mock/playground/users', method = 'GET', body, raw = false) => {
    const response = await fetch(`${base}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : raw ? body : JSON.stringify(body),
    });
    return { status: response.status, data: await response.json() };
  };
}
const path = '/mock/playground/users';
const employee = (code = 'EMP900') => ({ name: '开源测试员工', code, sex: 'M', age: 30, __id: 901, __status: 'add' });
const address = { city: '上海', detail: '测试地址', phone: '13812345678', isDefault: false, __id: 902, __status: 'add' };

test('自由练习区真实 HTTP：CRUD、分页、关联标识和主从增量保存', async (t) => {
  const request = await fixture(t);
  const original = await request();
  assert.equal(original.data.totalElements, 45);
  assert.equal(original.data.content.length, 10);
  assert.deepEqual(original.data.content[0].addresses, []);
  const created = await request(path, 'POST', [{ ...employee(), addresses: [address] }]);
  assert.equal(created.status, 200);
  const row = created.data.content[0];
  assert.equal(row.id, 46);
  assert.equal(row.__id, 901);
  assert.equal(row.addresses[0].__id, 902);
  assert.equal(row.addresses[0].id, 1);
  const updated = await request(path, 'PUT', [{ id: row.id, __status: 'update', name: '已修改', addresses: [
    { ...address, __id: 903 },
  ] }]);
  assert.equal(updated.status, 200);
  assert.equal(updated.data.content[0].addresses.length, 2);
  await request(path, 'PUT', [{ id: row.id, addresses: [
    { id: 1, __status: 'update', city: '杭州' },
    { id: 2, __status: 'delete' },
  ] }]);
  const queried = await request(`${path}?code=EMP900&page=1&pagesize=5`);
  assert.equal(queried.data.content[0].name, '已修改');
  assert.equal(queried.data.content[0].addresses.length, 1);
  assert.equal(queried.data.content[0].addresses[0].city, '杭州');
  assert.equal(queried.data.content[0].__id, undefined);
  assert.equal(queried.data.content[0].addresses[0].__id, undefined);
  const removed = await request(path, 'DELETE', [{ id: row.id, __id: 901, __status: 'delete' }]);
  assert.equal(removed.status, 200);
  assert.equal(removed.data.content[0].__id, 901);
  assert.equal((await request(`${path}?code=EMP900`)).data.totalElements, 0);
});

test('失败请求不部分提交，不消耗 ID，不污染其他单元或共享种子', async (t) => {
  const request = await fixture(t);
  const failed = await request(path, 'POST', [employee(), { ...employee('EMP901'), name: 'FAIL' }]);
  assert.equal(failed.status, 400);
  assert.match(failed.data.message, /FAIL/);
  assert.equal((await request()).data.totalElements, 45);
  const created = await request(path, 'POST', [employee()]);
  assert.equal(created.data.content[0].id, 46);
  const invalidUpdate = await request(path, 'PUT', [{ id: 46, name: 'FAIL' }]);
  assert.equal(invalidUpdate.status, 400);
  assert.equal((await request(`${path}?code=EMP900`)).data.content[0].name, '开源测试员工');
  assert.equal((await request('/mock/guide/user')).data.totalElements, 45);
  assert.equal((await request('/mock/unit-05/employees')).data.totalElements, 45);
  const restarted = await fixture(t);
  assert.equal((await restarted()).data.totalElements, 45);
});

test('错误请求：JSON、数组、字段、分页、唯一性、地址归属及请求体大小', async (t) => {
  const request = await fixture(t);
  for (const body of [{}, [], [null], [{ ...employee(), age: 101 }], [{ ...employee(), code: 'bad' }]]) {
    assert.equal((await request(path, 'POST', body)).status, 400);
  }
  assert.equal((await request(path, 'POST', '{', true)).status, 400);
  assert.equal((await request(path, 'POST', [{ ...employee(), code: 'EMP001' }])).status, 409);
  assert.equal((await request(path, 'PUT', [{ id: 999 }])).status, 404);
  assert.equal((await request(`${path}?page=0`)).status, 400);
  assert.equal((await request(`${path}?pagesize=101`)).status, 400);
  assert.equal((await request(path, 'POST', [{ ...employee(), name: 'a'.repeat(140 * 1024) }])).status, 413);
  assert.equal((await request(path, 'PUT', [{ id: 1, addresses: [{ id: 123, __status: 'delete' }] }])).status, 404);
  assert.equal((await request()).data.totalElements, 45);
});
