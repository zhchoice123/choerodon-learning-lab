// 【练习】04-2 常用控件：给员工资料选对每个字段的控件。
import React, { useMemo } from 'react';
// eslint-disable-next-line no-unused-vars -- 完成 TODO 后会用到全部控件
import { DataSet, Form, TextField, Select, NumberField, DatePicker, Switch } from 'choerodon-ui/pro';

function createEmployeeDataSet() {
  const sexOptions = new DataSet({
    paging: false,
    data: [
      { value: 'M', meaning: '男' },
      { value: 'F', meaning: '女' },
    ],
  });
  return new DataSet({
    data: [{ name: '秦秀英', sex: 'F', age: 55, startDate: '2023-06-01', active: true }],
    fields: [
      { name: 'name', type: 'string', label: '姓名' },
      { name: 'sex', type: 'string', label: '性别', options: sexOptions, textField: 'meaning', valueField: 'value' },
      { name: 'age', type: 'number', label: '年龄', min: 18, max: 60 },
      { name: 'startDate', type: 'date', label: '入职日期' },
      { name: 'active', type: 'boolean', label: '在职' },
    ],
  });
}

export default function Exercise() {
  const employeeDS = useMemo(createEmployeeDataSet, []);
  return (
    <Form dataSet={employeeDS} columns={1}>
      <TextField name="name" />
      {/* TODO 1：为性别、年龄、入职日期、在职四个字段放上合适的控件 */}
    </Form>
  );
}
