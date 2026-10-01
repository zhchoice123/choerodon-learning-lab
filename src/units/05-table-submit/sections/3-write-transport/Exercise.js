// 【练习】05-3 写接口协议：员工表格能编辑，但点「保存」没有任何请求。配好三个写接口。
// 接口：POST /mock/s/05-3/employees/create、/update、/destroy（请求体都是记录数组）
//   编码格式 EMP 加 3 位数字，年龄 18～60；在职员工不能删除
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
      read: { url: '/mock/s/05-3/employees', method: 'GET' },
      // TODO 1：配置 create、update、destroy 三个写接口（都是 POST）
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
  return <Table dataSet={employeeDS} columns={columns} buttons={['add', 'save', 'delete']} />;
}
