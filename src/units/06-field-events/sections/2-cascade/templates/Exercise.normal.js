// 【练习】06-2 级联下拉：选了部门，小组下拉只显示这个部门的小组。
import React, { useMemo } from 'react';
import { DataSet, Form, Select } from 'choerodon-ui/pro';

function createEmployeeDataSet() {
  const departmentOptions = new DataSet({
    paging: false,
    data: [
      { value: 'RD', meaning: '研发部' },
      { value: 'OPS', meaning: '运维部' },
    ],
  });
  const teamOptions = new DataSet({
    paging: false,
    data: [
      { value: 'RD-FE', meaning: '前端组', departmentCode: 'RD' },
      { value: 'RD-BE', meaning: '后端组', departmentCode: 'RD' },
      { value: 'OPS-NET', meaning: '网络组', departmentCode: 'OPS' },
    ],
  });
  return new DataSet({
    autoCreate: true,
    fields: [
      { name: 'department', type: 'string', label: '部门', options: departmentOptions, textField: 'meaning', valueField: 'value' },
      {
        name: 'team', type: 'string', label: '小组', options: teamOptions, textField: 'meaning', valueField: 'value',
        // TODO 1：配置级联：小组选项的 departmentCode 要等于本条记录的 department
      },
    ],
  });
}

export default function Exercise() {
  const employeeDS = useMemo(createEmployeeDataSet, []);
  return (
    <Form dataSet={employeeDS} columns={1}>
      <Select name="department" />
      <Select name="team" />
    </Form>
  );
}
