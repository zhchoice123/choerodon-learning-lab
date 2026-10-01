// 【练习】01-3 从接口加载：让员工列表从接口分页加载。
// 接口：GET /mock/guide/user?page=1&pagesize=3（共 45 人）
import React, { useMemo } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';

function createEmployeeDataSet() {
  return new DataSet({
    // TODO 1：主键是 id；每页 3 条；创建后自动查询
    // TODO 2：配置 transport.read，查询 /mock/guide/user
    dataKey: 'content',
    totalKey: 'totalElements',
    fields: [
      { name: 'code', type: 'string', label: '员工编码' },
      { name: 'name', type: 'string', label: '姓名' },
      { name: 'age', type: 'number', label: '年龄' },
    ],
  });
}

export default function Exercise() {
  const employeeDS = useMemo(createEmployeeDataSet, []);
  return <Table dataSet={employeeDS} columns={[{ name: 'code' }, { name: 'name' }, { name: 'age' }]} />;
}
