// 【样例】01-4 响应解析：dataKey / totalKey 告诉 DataSet 数据和总数在响应的哪里。
// 同一个接口，左边没配、右边配了，对比两边的表格和分页器。
// 接口响应：{ content: [...], totalElements: 12, totalPages, size, number, ... }
import React, { useMemo } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';

const fields = [
  { name: 'code', type: 'string', label: '角色编码' },
  { name: 'name', type: 'string', label: '角色名称' },
];

function createRoleDataSet(keys) {
  return new DataSet({
    autoQuery: true,
    pageSize: 5,
    transport: { read: { url: '/mock/roles', method: 'GET' } },
    ...keys,
    fields,
  });
}

export default function Example() {
  // 知识点 1：没配时，默认找 rows / total，响应里没有 → 整条响应被当成一条记录
  const wrongDS = useMemo(() => createRoleDataSet({}), []);
  // 知识点 2：dataKey 指向列表数组，totalKey 指向总条数
  const rightDS = useMemo(() => createRoleDataSet({ dataKey: 'content', totalKey: 'totalElements' }), []);
  const columns = [{ name: 'code' }, { name: 'name' }];
  return (
    <div style={{ display: 'flex', gap: 16 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p>没配 dataKey / totalKey</p>
        <Table dataSet={wrongDS} columns={columns} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p>dataKey: &apos;content&apos;，totalKey: &apos;totalElements&apos;</p>
        <Table dataSet={rightDS} columns={columns} />
      </div>
    </div>
  );
}
