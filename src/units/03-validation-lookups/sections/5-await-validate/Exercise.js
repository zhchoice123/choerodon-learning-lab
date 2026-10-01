// 【练习】03-5 等待校验：现在填一个已存在的编码 EMP001 点「校验」，会先显示「校验通过」。找出原因并修好。
// 查重接口：GET /mock/s/03-5/employees/check-code（约 250ms 后应答）
import React, { useMemo, useState } from 'react';
import { DataSet, Form, TextField, Button } from 'choerodon-ui/pro';

const CODE_PATTERN = /^EMP\d{3}$/;

function createEmployeeDataSet() {
  return new DataSet({
    autoCreate: true,
    fields: [
      {
        name: 'code', type: 'string', label: '员工编码', required: true, pattern: CODE_PATTERN,
        validator: async (value) => {
          if (!value || !CODE_PATTERN.test(value)) return true;
          try {
            const response = await fetch(`/mock/s/03-5/employees/check-code?code=${encodeURIComponent(value)}`);
            if (!response.ok) return '编码校验暂不可用';
            return (await response.json()).available || '员工编码已存在';
          } catch (error) {
            return '编码校验暂不可用';
          }
        },
      },
    ],
  });
}

export default function Exercise() {
  const employeeDS = useMemo(createEmployeeDataSet, []);
  const [result, setResult] = useState('尚未校验');

  // TODO 1：这里有隐患：没有等待校验结果。修好它，并在提示里说明「尚未保存」
  // TODO 2：校验期间按钮显示加载状态、不能重复点击；结束后恢复（失败时也要恢复）
  const check = () => {
    const valid = employeeDS.validate();
    setResult(valid ? '校验通过' : '校验未通过，请看字段提示');
  };

  return (
    <div>
      <Form dataSet={employeeDS} columns={1}>
        <TextField name="code" />
      </Form>
      <Button onClick={check}>校验</Button>
      <p role="status">{result}</p>
    </div>
  );
}
