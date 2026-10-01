// 【练习】02-1 queryFields：给员工列表加上「姓名」「性别」两个查询条件。
// 接口：GET /mock/guide/user，支持 name（模糊匹配）和 sex（M / F）两个查询参数
import React, { useMemo } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';

function createEmployeeDataSet() {
  return new DataSet({
    autoQuery: true,
    pageSize: 5,
    transport: { read: { url: '/mock/guide/user', method: 'GET' } },
    dataKey: 'content',
    totalKey: 'totalElements',
    // TODO 1：定义两个查询字段：name（姓名）、sex（性别），类型都是 string
    fields: [
      { name: 'code', type: 'string', label: '员工编码' },
      { name: 'name', type: 'string', label: '姓名' },
      { name: 'sex', type: 'string', label: '性别' },
    ],
  });
}

export default function Exercise() {
  const employeeDS = useMemo(createEmployeeDataSet, []);
  // TODO 2：让表格显示查询栏
  return <Table dataSet={employeeDS} columns={[{ name: 'code' }, { name: 'name' }, { name: 'sex' }]} />;
}
