// 【练习】01-2 Table 绑定：fields 已经写好，完成 columns。
import React, { useMemo } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';

function createEmployeeDataSet() {
  return new DataSet({
    data: [
      { id: 1, code: 'EMP001', name: '宋江', age: 27, email: 'emp001@example.com', active: true },
      { id: 5, code: 'EMP005', name: '秦秀英', age: 55, email: 'emp005@example.com', active: true },
      { id: 12, code: 'EMP012', name: '吴用', age: 24, email: 'emp012@example.com', active: false },
    ],
    fields: [
      { name: 'id', type: 'number', label: '员工 ID' },
      { name: 'code', type: 'string', label: '员工编码' },
      { name: 'name', type: 'string', label: '姓名' },
      { name: 'age', type: 'number', label: '年龄' },
      { name: 'email', type: 'string', label: '邮箱' },
      { name: 'active', type: 'boolean', label: '在职' },
    ],
  });
}

export default function Exercise() {
  const employeeDS = useMemo(createEmployeeDataSet, []);
  // TODO 1：按顺序显示「姓名、员工编码、年龄、在职」四列，不显示 ID 和邮箱
  // TODO 2：「姓名」列宽 120，「在职」列居中
  const columns = [];
  return <Table dataSet={employeeDS} columns={columns} />;
}
