// 【练习】03-2 自定义 validator：员工编码要查重。
// 查重接口：GET /mock/s/03-2/employees/check-code?code=EMP001 → { available: true | false }
//   编码 EMP503 模拟服务不可用（503）
import React, { useMemo, useState } from 'react';
import { DataSet, Form, TextField, Button } from 'choerodon-ui/pro';

const CODE_PATTERN = /^EMP\d{3}$/;

function createEmployeeDataSet() {
  return new DataSet({
    autoCreate: true,
    fields: [
      // TODO 1：姓名不能只包含空格：去掉空白后为空时提示「姓名不能只包含空格」
      { name: 'name', type: 'string', label: '姓名', required: true },
      {
        name: 'code', type: 'string', label: '员工编码', required: true, pattern: CODE_PATTERN,
        // TODO 2：异步查重：已存在提示「员工编码已存在」；接口异常或网络失败提示「编码校验暂不可用」
      },
    ],
  });
}

export default function Exercise() {
  const employeeDS = useMemo(createEmployeeDataSet, []);
  const [result, setResult] = useState('尚未校验');
  const check = async () => {
    setResult('正在校验……');
    setResult((await employeeDS.validate()) ? '校验通过' : '校验未通过，请看字段提示');
  };
  return (
    <div>
      <p>编码试试：EMP001（已存在）、EMP900（可用）、EMP503（服务异常）。</p>
      <Form dataSet={employeeDS} columns={1}>
        <TextField name="name" />
        <TextField name="code" />
      </Form>
      <Button onClick={check}>校验</Button>
      <p role="status">{result}</p>
    </div>
  );
}
