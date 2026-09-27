import { mockRequest } from './CloudPreview';

test('预览消息桥只允许 mock，不代理学习 API、外站和路径穿越', () => {
  expect(mockRequest({ url: '/mock/unit-05/roles?page=1&pagesize=5', method: 'GET' }).url).toContain('/mock/');
  expect(mockRequest({ url: '/mock/unit-09/v1/lookups/ROLE.LEVEL' })).not.toBeNull();
  for (const url of ['/__learn/api/units', 'https://evil.test/mock/x', '//evil.test/mock/x', '/mock/../__learn/api', '/mock/%2e%2e/api', '/mock/\\evil']) {
    expect(mockRequest({ url })).toBeNull();
  }
  expect(mockRequest({ url: '/mock/roles', method: 'CONNECT' })).toBeNull();
  expect(mockRequest({ url: '/mock/roles', body: 'x'.repeat(205000) })).toBeNull();
});
