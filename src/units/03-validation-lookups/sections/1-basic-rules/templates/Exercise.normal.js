// 【练习】03-1 基础校验：给员工草稿加上校验规则和中文提示。
import React, { useMemo, useState } from 'react';
import { DataSet, Form, TextField, NumberField, Button } from 'choerodon-ui/pro';

function createEmployeeDataSet() {
  return new DataSet({
    autoCreate: true,
    fields: [
      // TODO 1：姓名必填，为空时提示「请输入姓名」
      { name: 'name', type: 'string', label: '姓名' },
      // TODO 2：员工编码必填，格式为 EMP 加 3 位数字（如 EMP001），格式不对时提示「编码格式为 EMP 加 3 位数字」
      { name: 'code', type: 'string', label: '员工编码' },
      // TODO 3：年龄必填，范围 18～60，超出范围时分别提示「不能小于 18」「不能大于 60」
      { name: 'age', type: 'number', label: '年龄' },
    ],
  });
}

export default function Exercise() {
  const employeeDS = useMemo(createEmployeeDataSet, []);
  const [result, setResult] = useState('尚未校验');
  const check = async () => setResult((await employeeDS.validate()) ? '校验通过' : '校验未通过，请看字段提示');
  return (
    <div>
      <Form dataSet={employeeDS} columns={1}>
        <TextField name="name" />
        <TextField name="code" />
        <NumberField name="age" />
      </Form>
      <Button onClick={check}>校验</Button>
      <p role="status">{result}</p>
    </div>
  );
}
