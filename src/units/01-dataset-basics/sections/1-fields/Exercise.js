// 【练习】01-1 字段类型：给员工数据补上 fields，让每一列按正确的方式显示。
// 数据里：age 是数字，active 是 true / false，startDate 只关心日期。
import React, { useMemo } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';

function createEmployeeDataSet() {
  return new DataSet({
    data: [
      { code: 'EMP001', name: '宋江', age: 27, active: true, startDate: '2019-02-01 00:00:00' },
      { code: 'EMP005', name: '秦秀英', age: 55, active: true, startDate: '2023-06-01 00:00:00' },
      { code: 'EMP012', name: '吴用', age: 24, active: false, startDate: '2024-04-01 00:00:00' },
    ],
    // TODO 1：为 5 个字段写上 name / type / label，列标题用中文：员工编码、姓名、年龄、在职、入职日期
    // TODO 2：选对 active 和 startDate 的 type：「在职」显示成勾选框，「入职日期」只显示日期
    fields: [],
  });
}

export default function Exercise() {
  const employeeDS = useMemo(createEmployeeDataSet, []);
  const columns = [{ name: 'code' }, { name: 'name' }, { name: 'age' }, { name: 'active' }, { name: 'startDate' }];
  return <Table dataSet={employeeDS} columns={columns} />;
}
