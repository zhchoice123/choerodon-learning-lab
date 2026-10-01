// 【样例】04-5 表单校验与重置：1.6.7 的 Form 用 checkValidity()，重置用 type="reset" 的按钮。
import React, { useMemo, useRef, useState } from 'react';
import { DataSet, Form, TextField, NumberField, Button } from 'choerodon-ui/pro';

function createRoleDataSet() {
  return new DataSet({
    data: [{ name: '平台管理员', memberCount: 3 }],
    fields: [
      { name: 'name', type: 'string', label: '角色名称', required: true },
      { name: 'memberCount', type: 'number', label: '成员数', min: 0, max: 200 },
    ],
  });
}

export default function Example() {
  const roleDS = useMemo(createRoleDataSet, []);
  const formRef = useRef(null);
  const [result, setResult] = useState('尚未校验');

  // 知识点 1：1.6.7 的 Form 没有 validate()，用 checkValidity()，它返回 Promise<boolean>
  const check = async () => {
    const valid = await formRef.current.checkValidity();
    setResult(valid ? '校验通过（尚未保存）' : '校验未通过');
  };

  return (
    <div>
      {/* 知识点 2：type="reset" 的按钮触发表单重置，把记录恢复到初始值（不发请求）
          知识点 3：onReset 在重置时调用 */}
      <Form ref={formRef} dataSet={roleDS} columns={1} onReset={() => setResult('已恢复初始值')}>
        <TextField name="name" />
        <NumberField name="memberCount" />
        <div>
          <Button onClick={check}>校验</Button>
          <Button type="reset">恢复初始值</Button>
        </div>
      </Form>
      <p role="status">{result}</p>
    </div>
  );
}
