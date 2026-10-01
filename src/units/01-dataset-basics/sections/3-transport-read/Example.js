// 【样例】01-3 从接口加载：transport.read + autoQuery + pageSize。
// 请求：GET /mock/roles?page=1&pagesize=5（共 12 个角色）
import React, { useMemo } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';

function createRoleDataSet() {
  return new DataSet({
    primaryKey: 'id', // 知识点 1：记录的唯一标识，DataSet 靠它区分记录
    autoQuery: true, // 知识点 2：创建后立即查询第 1 页
    pageSize: 5, // 知识点 3：每页条数，作为 pagesize 参数发给后端
    // 知识点 4：transport.read 描述「怎么查询」；DataSet 会自动带上 page / pagesize
    transport: {
      read: { url: '/mock/roles', method: 'GET' },
    },
    // 下面两行告诉 DataSet 响应里数据在哪，下一节 01-4 专门讲
    dataKey: 'content',
    totalKey: 'totalElements',
    fields: [
      { name: 'code', type: 'string', label: '角色编码' },
      { name: 'name', type: 'string', label: '角色名称' },
      { name: 'memberCount', type: 'number', label: '成员数' },
    ],
  });
}

export default function Example() {
  const roleDS = useMemo(createRoleDataSet, []);
  return <Table dataSet={roleDS} columns={[{ name: 'code' }, { name: 'name' }, { name: 'memberCount' }]} />;
}
