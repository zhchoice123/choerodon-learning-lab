// 【练习】05-2 表格按钮：给员工表格加上「新增、保存、删除、重置」按钮。
// 接口：/mock/s/05-2/employees（transport 已配好）。编码格式 EMP 加 3 位数字，年龄 18～60
import React, { useMemo } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';

function createEmployeeDataSet() {
  return new DataSet({
    primaryKey: 'id',
    autoQuery: true,
    pageSize: 5,
    strictPageSize: false,
    dataKey: 'content',
    totalKey: 'totalElements',
    transport: {
      read: { url: '/mock/s/05-2/employees', method: 'GET' },
      create: { url: '/mock/s/05-2/employees/create', method: 'POST' },
      update: { url: '/mock/s/05-2/employees/update', method: 'POST' },
      destroy: { url: '/mock/s/05-2/employees/destroy', method: 'POST' },
    },
    fields: [
      { name: 'code', type: 'string', label: '员工编码', required: true, pattern: /^EMP\d{3}$/ },
      { name: 'name', type: 'string', label: '姓名', required: true },
      { name: 'age', type: 'number', label: '年龄', required: true, min: 18, max: 60, defaultValue: 18 },
      { name: 'active', type: 'boolean', label: '在职', defaultValue: false },
    ],
  });
}

export default function Exercise() {
  const employeeDS = useMemo(createEmployeeDataSet, []);
  const columns = [
    { name: 'code', width: 140, editor: true },
    { name: 'name', width: 140, editor: true },
    { name: 'age', width: 100, editor: true },
    { name: 'active', width: 80, editor: true },
  ];
  // TODO 1：加上新增、保存、删除、重置四个内置按钮
  return <Table dataSet={employeeDS} columns={columns} />;
}
