// 【练习】06-4 联动赋值：换部门时清空小组和组长；选了小组时带出组长。
import React, { useMemo } from 'react';
import { DataSet, Form, Select, Output } from 'choerodon-ui/pro';

function createEmployeeDataSet() {
  const departmentOptions = new DataSet({ paging: false, data: [{ value: 'RD', meaning: '研发部' }, { value: 'OPS', meaning: '运维部' }] });
  const teamOptions = new DataSet({
    paging: false,
    data: [
      { value: 'RD-FE', meaning: '前端组', departmentCode: 'RD', leader: '诸葛亮' },
      { value: 'RD-BE', meaning: '后端组', departmentCode: 'RD', leader: '司马懿' },
      { value: 'OPS-NET', meaning: '网络组', departmentCode: 'OPS', leader: '周瑜' },
    ],
  });
  return new DataSet({
    autoCreate: true,
    fields: [
      { name: 'department', type: 'string', label: '部门', options: departmentOptions, textField: 'meaning', valueField: 'value' },
      { name: 'team', type: 'string', label: '小组', options: teamOptions, textField: 'meaning', valueField: 'value', cascadeMap: { departmentCode: 'department' } },
      { name: 'leader', type: 'string', label: '组长' },
    ],
    // TODO 1：部门变化时，清空小组和组长
    // TODO 2：小组变化时，从 teamOptions 里找到这个小组，把它的组长写到 leader；清空小组时组长也清空
  });
}

export default function Exercise() {
  const employeeDS = useMemo(createEmployeeDataSet, []);
  return (
    <Form dataSet={employeeDS} columns={1}>
      <Select name="department" />
      <Select name="team" />
      <Output name="leader" />
    </Form>
  );
}
