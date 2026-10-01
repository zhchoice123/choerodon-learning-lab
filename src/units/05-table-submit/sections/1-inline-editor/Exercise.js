// 【练习】05-1 行内编辑：让员工的姓名、年龄、在职三列可以编辑，编码不能编辑。
// 接口：GET /mock/s/05-1/employees
import React, { useMemo } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';

function createEmployeeDataSet() {
  return new DataSet({
    primaryKey: 'id',
    autoQuery: true,
    pageSize: 5,
    transport: { read: { url: '/mock/s/05-1/employees', method: 'GET' } },
    dataKey: 'content',
    totalKey: 'totalElements',
    fields: [
      { name: 'code', type: 'string', label: '员工编码' },
      // TODO 1：姓名必填；年龄 18～60
      { name: 'name', type: 'string', label: '姓名' },
      { name: 'age', type: 'number', label: '年龄' },
      { name: 'active', type: 'boolean', label: '在职' },
    ],
  });
}

export default function Exercise() {
  const employeeDS = useMemo(createEmployeeDataSet, []);
  // TODO 2：姓名、年龄、在职三列可编辑
  const columns = [{ name: 'code', width: 140 }, { name: 'name', width: 140 }, { name: 'age', width: 100 }, { name: 'active', width: 80 }];
  return <Table dataSet={employeeDS} columns={columns} />;
}
