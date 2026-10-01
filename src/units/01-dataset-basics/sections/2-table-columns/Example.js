// 【样例】01-2 Table 绑定：DataSet 管数据，Table 只管显示。
// columns 里只写 name 和布局属性，列标题、显示格式都来自 DataSet 的 fields。
import React, { useMemo } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';

function createRoleDataSet() {
  return new DataSet({
    data: [
      { id: 101, code: 'site-admin', name: '平台管理员', memberCount: 3, enabled: true },
      { id: 102, code: 'tenant-admin', name: '租户管理员', memberCount: 8, enabled: true },
      { id: 111, code: 'guest', name: '访客', memberCount: 120, enabled: false },
    ],
    fields: [
      { name: 'id', type: 'number', label: '角色 ID' },
      { name: 'code', type: 'string', label: '角色编码' },
      { name: 'name', type: 'string', label: '角色名称' },
      { name: 'memberCount', type: 'number', label: '成员数' },
      { name: 'enabled', type: 'boolean', label: '启用' },
    ],
  });
}

export default function Example() {
  const roleDS = useMemo(createRoleDataSet, []);
  // 知识点 1：列的顺序由 columns 决定；没写进 columns 的字段（这里的 id）不显示
  // 知识点 2：列上只写 name 和布局属性（width、align、lock……），不要写 type / label
  const columns = [
    { name: 'name', width: 140 },
    { name: 'code', width: 160 },
    { name: 'memberCount', width: 90 },
    { name: 'enabled', width: 80, align: 'center' },
  ];
  return <Table dataSet={roleDS} columns={columns} />;
}
