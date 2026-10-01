// 【样例】03-1 基础校验：规则写在 fields 上，提示文案用 defaultValidationMessages。
// 本节只校验、不提交；Form 只是现成的容器（第 04 章专门讲）。
import React, { useMemo, useState } from 'react';
import { DataSet, Form, TextField, NumberField, Button } from 'choerodon-ui/pro';

function createRoleDataSet() {
  return new DataSet({
    autoCreate: true, // 自动创建一条空记录，给表单编辑
    fields: [
      {
        name: 'name', type: 'string', label: '角色名称',
        // 知识点 1：required 必填；对应提示的键是 valueMissing（不是 required）
        required: true,
        defaultValidationMessages: { valueMissing: '请输入角色名称' },
      },
      {
        name: 'code', type: 'string', label: '角色编码', required: true,
        // 知识点 2：pattern 是正则，约束整个值；不要加 g 标志
        pattern: /^[a-z][a-z0-9-]{2,19}$/,
        defaultValidationMessages: {
          valueMissing: '请输入角色编码',
          patternMismatch: '3～20 位，小写字母开头，只能有小写字母、数字和短横线',
        },
      },
      {
        name: 'memberLimit', type: 'number', label: '成员上限', required: true,
        // 知识点 3：number 的 min / max 是数值范围
        min: 1, max: 100,
        defaultValidationMessages: { rangeUnderflow: '不能小于 1', rangeOverflow: '不能大于 100' },
      },
    ],
  });
}

export default function Example() {
  const roleDS = useMemo(createRoleDataSet, []);
  const [result, setResult] = useState('尚未校验');
  const check = async () => setResult((await roleDS.validate()) ? '校验通过' : '校验未通过，请看字段提示');
  return (
    <div>
      <Form dataSet={roleDS} columns={1}>
        <TextField name="name" />
        <TextField name="code" />
        <NumberField name="memberLimit" />
      </Form>
      <Button onClick={check}>校验</Button>
      <p role="status">{result}</p>
    </div>
  );
}
