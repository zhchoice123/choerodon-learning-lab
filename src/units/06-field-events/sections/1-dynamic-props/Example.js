// 【样例】06-1 动态属性：字段的 required / disabled / readOnly / label 可以根据当前记录计算。
import React, { useMemo } from 'react';
import { DataSet, Form, TextField, NumberField, Switch } from 'choerodon-ui/pro';

function createRoleDataSet() {
  return new DataSet({
    data: [{ name: '平台管理员', enabled: true, memberCount: 3, owner: '宋江' }],
    fields: [
      { name: 'name', type: 'string', label: '角色名称' },
      { name: 'enabled', type: 'boolean', label: '启用' },
      {
        name: 'owner', type: 'string', label: '负责人',
        // 知识点 1：dynamicProps 按属性写函数，参数里有 record；返回值就是这个属性的值
        dynamicProps: {
          required: ({ record }) => record.get('enabled') === true, // 启用时负责人必填
          disabled: ({ record }) => !record.get('enabled'), // 停用时不能编辑负责人
        },
      },
      {
        name: 'memberCount', type: 'number', label: '成员数',
        // 知识点 2：computedProps 写法相同，带缓存，适合计算量大或频繁读取的属性
        computedProps: {
          readOnly: ({ record }) => !record.get('enabled'),
          label: ({ record }) => (record.get('enabled') ? '成员数' : '成员数（已停用，只读）'),
        },
      },
    ],
  });
}

export default function Example() {
  const roleDS = useMemo(createRoleDataSet, []);
  // 知识点 3：动态属性只影响界面和校验；程序调用 record.set 仍然可以改值
  return (
    <div>
      <p>关闭「启用」：负责人变为禁用、不再必填，成员数变为只读，标签也变了。</p>
      <Form dataSet={roleDS} columns={1}>
        <TextField name="name" />
        <Switch name="enabled" />
        <TextField name="owner" />
        <NumberField name="memberCount" />
      </Form>
    </div>
  );
}
