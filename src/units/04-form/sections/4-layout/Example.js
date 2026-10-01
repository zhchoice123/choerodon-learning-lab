// 【样例】04-4 表单布局：columns 决定一行放几个字段，colSpan 让某个字段跨列。
import React, { useMemo } from 'react';
import { DataSet, Form, TextField, NumberField } from 'choerodon-ui/pro';

function createRoleDataSet() {
  return new DataSet({
    data: [{ code: 'site-admin', name: '平台管理员', memberCount: 3, description: '拥有平台全部权限' }],
    fields: [
      { name: 'code', type: 'string', label: '角色编码' },
      { name: 'name', type: 'string', label: '角色名称' },
      { name: 'memberCount', type: 'number', label: '成员数' },
      { name: 'description', type: 'string', label: '描述' },
    ],
  });
}

export default function Example() {
  const roleDS = useMemo(createRoleDataSet, []);
  return (
    // 知识点 1：columns={2}：每行两个字段
    // 知识点 2：colSpan={2}：描述独占一整行
    <Form dataSet={roleDS} columns={2}>
      <TextField name="code" />
      <TextField name="name" />
      <NumberField name="memberCount" />
      <TextField name="description" colSpan={2} />
    </Form>
  );
}
