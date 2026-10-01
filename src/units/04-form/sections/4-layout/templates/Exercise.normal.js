// 【练习】04-4 表单布局：员工资料排成每行 3 个字段，邮箱独占一行。
import React, { useMemo } from 'react';
import { DataSet, Form, TextField, NumberField } from 'choerodon-ui/pro';

function createEmployeeDataSet() {
  return new DataSet({
    data: [{ code: 'EMP005', name: '秦秀英', age: 55, email: 'emp005@example.com' }],
    fields: [
      { name: 'code', type: 'string', label: '员工编码' },
      { name: 'name', type: 'string', label: '姓名' },
      { name: 'age', type: 'number', label: '年龄' },
      { name: 'email', type: 'string', label: '邮箱' },
    ],
  });
}

export default function Exercise() {
  const employeeDS = useMemo(createEmployeeDataSet, []);
  // TODO 1：每行 3 个字段
  // TODO 2：邮箱独占一整行
  return (
    <Form dataSet={employeeDS}>
      <TextField name="code" />
      <TextField name="name" />
      <NumberField name="age" />
      <TextField name="email" />
    </Form>
  );
}
