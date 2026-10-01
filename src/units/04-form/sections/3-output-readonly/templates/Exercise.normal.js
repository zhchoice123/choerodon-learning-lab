// 【练习】04-3 只读：给员工表单加上「只读 / 编辑」切换，并在下方做一个预览。
import React, { useMemo } from 'react';
// eslint-disable-next-line no-unused-vars -- 完成 TODO 后会用到
import { DataSet, Form, TextField, NumberField, Output, Button } from 'choerodon-ui/pro';

function createEmployeeDataSet() {
  return new DataSet({
    data: [{ name: '秦秀英', age: 55 }],
    fields: [
      { name: 'name', type: 'string', label: '姓名' },
      { name: 'age', type: 'number', label: '年龄' },
    ],
  });
}

export default function Exercise() {
  const employeeDS = useMemo(createEmployeeDataSet, []);
  // TODO 1：用一个状态和一个按钮，在「只读」和「编辑」之间切换下面这张表单
  return (
    <div>
      <Form dataSet={employeeDS} columns={1}>
        <TextField name="name" />
        <NumberField name="age" />
      </Form>
      {/* TODO 2：下方再放一个预览：显式绑定当前记录，用 Output 显示姓名和年龄 */}
    </div>
  );
}
