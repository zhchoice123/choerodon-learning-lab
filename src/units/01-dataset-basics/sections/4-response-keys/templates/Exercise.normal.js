// 【练习】01-4 响应解析：现在表格只有一行空白记录，分页器显示 1 条。修好它。
// 接口：GET /mock/guide/user → { content: [...], totalElements: 45, ... }
import React, { useMemo } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';

function createEmployeeDataSet() {
  return new DataSet({
    autoQuery: true,
    pageSize: 5,
    transport: { read: { url: '/mock/guide/user', method: 'GET' } },
    // TODO 1：告诉 DataSet 员工列表在响应的哪个字段
    // TODO 2：告诉 DataSet 总条数在响应的哪个字段，让分页器显示 45
    fields: [
      { name: 'code', type: 'string', label: '员工编码' },
      { name: 'name', type: 'string', label: '姓名' },
    ],
  });
}

export default function Exercise() {
  const employeeDS = useMemo(createEmployeeDataSet, []);
  return <Table dataSet={employeeDS} columns={[{ name: 'code' }, { name: 'name' }]} />;
}
