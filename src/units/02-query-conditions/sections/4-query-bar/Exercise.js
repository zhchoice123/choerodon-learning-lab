// 【练习】02-4 查询栏：员工有 4 个查询条件，直接显示 2 个，其余收进「更多」。
// 接口：GET /mock/guide/user，支持 name、code、sex、active 查询参数
import React, { useMemo } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';

function createEmployeeDataSet() {
  return new DataSet({
    autoQuery: true,
    pageSize: 5,
    transport: { read: { url: '/mock/guide/user', method: 'GET' } },
    dataKey: 'content',
    totalKey: 'totalElements',
    queryFields: [
      { name: 'name', type: 'string', label: '姓名' },
      { name: 'code', type: 'string', label: '员工编码' },
      { name: 'sex', type: 'string', label: '性别' },
      { name: 'active', type: 'string', label: '在职（true / false）' },
    ],
    fields: [
      { name: 'code', type: 'string', label: '员工编码' },
      { name: 'name', type: 'string', label: '姓名' },
    ],
  });
}

export default function Exercise() {
  const employeeDS = useMemo(createEmployeeDataSet, []);
  // TODO 1：显示查询栏，只直接显示前 2 个条件
  return <Table dataSet={employeeDS} columns={[{ name: 'code' }, { name: 'name' }]} />;
}
