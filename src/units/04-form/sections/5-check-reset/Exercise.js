// 【练习】04-5 表单校验与重置：清空姓名后点「校验」会报错。找出原因、修好，并加上「恢复初始值」。
import React, { useMemo, useRef, useState } from 'react';
import { DataSet, Form, TextField, NumberField, Button } from 'choerodon-ui/pro';

function createEmployeeDataSet() {
  return new DataSet({
    data: [{ name: '秦秀英', age: 55 }],
    fields: [
      { name: 'name', type: 'string', label: '姓名', required: true },
      { name: 'age', type: 'number', label: '年龄', min: 18, max: 60 },
    ],
  });
}

export default function Exercise() {
  const employeeDS = useMemo(createEmployeeDataSet, []);
  const formRef = useRef(null);
  const [result, setResult] = useState('尚未校验');

  // TODO 1：这里有隐患：1.6.7 的 Form 没有这个方法。改成正确的方法，并等待结果
  const check = async () => {
    const valid = await formRef.current.validate();
    setResult(valid ? '校验通过（尚未保存）' : '校验未通过');
  };

  return (
    <div>
      {/* TODO 2：加一个「恢复初始值」按钮，点击后表单恢复初始值，并显示「已恢复初始值」 */}
      <Form ref={formRef} dataSet={employeeDS} columns={1}>
        <TextField name="name" />
        <NumberField name="age" />
        <div>
          <Button onClick={check}>校验</Button>
        </div>
      </Form>
      <p role="status">{result}</p>
    </div>
  );
}
