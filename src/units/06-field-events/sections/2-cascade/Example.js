// 【样例】06-2 级联下拉：选了「权限范围」，「权限」下拉只显示这个范围的选项。
import React, { useMemo } from 'react';
import { DataSet, Form, Select } from 'choerodon-ui/pro';

function createRoleDataSet() {
  const scopeOptions = new DataSet({
    paging: false,
    data: [
      { value: 'site', meaning: '平台' },
      { value: 'project', meaning: '项目' },
    ],
  });
  const permissionOptions = new DataSet({
    paging: false,
    data: [
      { value: 'site.view', meaning: '平台查看', scopeCode: 'site' },
      { value: 'site.manage', meaning: '平台管理', scopeCode: 'site' },
      { value: 'project.view', meaning: '项目查看', scopeCode: 'project' },
      { value: 'project.edit', meaning: '项目编辑', scopeCode: 'project' },
    ],
  });
  return new DataSet({
    autoCreate: true,
    fields: [
      { name: 'scope', type: 'string', label: '权限范围', options: scopeOptions, textField: 'meaning', valueField: 'value' },
      {
        name: 'permission', type: 'string', label: '权限', options: permissionOptions, textField: 'meaning', valueField: 'value',
        // 知识点 1：cascadeMap 的左边是「选项里的字段」，右边是「当前记录的字段」
        //   这里表示：只显示 scopeCode 等于本条记录 scope 的选项
        // 知识点 2：父字段没选时，子下拉没有选项
        cascadeMap: { scopeCode: 'scope' },
      },
    ],
  });
}

export default function Example() {
  const roleDS = useMemo(createRoleDataSet, []);
  return (
    <Form dataSet={roleDS} columns={1}>
      <Select name="scope" />
      <Select name="permission" />
    </Form>
  );
}
