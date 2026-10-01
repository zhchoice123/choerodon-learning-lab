// 【练习】02-2 transport.read 函数：员工列表只显示在职员工（active 为 true），同时保留姓名查询。
// 接口：GET /mock/guide/user，支持 name、active 查询参数
import React, { useMemo } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';

function createEmployeeDataSet() {
  return new DataSet({
    autoQuery: true,
    pageSize: 5,
    dataKey: 'content',
    totalKey: 'totalElements',
    queryFields: [{ name: 'name', type: 'string', label: '姓名' }],
    transport: {
      // TODO 1：把 read 改成函数，从参数里取出 data 和 params
      // TODO 2：返回请求配置：分页参数、查询条件都要带上，再追加固定条件 active=true
      read: { url: '/mock/guide/user', method: 'GET' },
    },
    fields: [
      { name: 'code', type: 'string', label: '员工编码' },
      { name: 'name', type: 'string', label: '姓名' },
      { name: 'active', type: 'boolean', label: '在职' },
    ],
  });
}

export default function Exercise() {
  const employeeDS = useMemo(createEmployeeDataSet, []);
  return <Table dataSet={employeeDS} columns={[{ name: 'code' }, { name: 'name' }, { name: 'active' }]} queryBar="normal" />;
}
