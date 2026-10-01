// 【练习】06-1 动态属性：在职员工必须填写邮箱；离职员工的邮箱不能编辑。
import React, { useMemo } from 'react';
import { DataSet, Form, TextField, Switch } from 'choerodon-ui/pro';

function createEmployeeDataSet() {
  return new DataSet({
    data: [{ name: '宋江', active: true, email: '' }],
    fields: [
      { name: 'name', type: 'string', label: '姓名' },
      { name: 'active', type: 'boolean', label: '在职' },
      {
        name: 'email', type: 'string', label: '邮箱',
        // TODO 1：在职时必填；离职时禁用
        // TODO 2：离职时标签显示「邮箱（已离职）」
      },
    ],
  });
}

export default function Exercise() {
  const employeeDS = useMemo(createEmployeeDataSet, []);
  return (
    <Form dataSet={employeeDS} columns={1}>
      <TextField name="name" />
      <Switch name="active" />
      <TextField name="email" />
    </Form>
  );
}
