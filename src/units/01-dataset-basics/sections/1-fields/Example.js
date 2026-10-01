// 【样例】01-1 字段类型：同一份数据，type 决定它怎么显示。
// 本节只看 fields，数据直接写在 data 里，先不涉及接口（接口在 01-3 讲）。
import React, { useMemo } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';

function createRoleDataSet() {
  return new DataSet({
    // 本地数据：不发请求，页面一打开就有数据
    data: [
      { code: 'site-admin', name: '平台管理员', memberCount: 3, enabled: true, createdAt: '2023-01-15 09:30:00' },
      { code: 'tenant-admin', name: '租户管理员', memberCount: 8, enabled: true, createdAt: '2023-02-15 09:30:00' },
      { code: 'guest', name: '访客', memberCount: 120, enabled: false, createdAt: '2023-11-15 09:30:00' },
    ],
    // 知识点：每个字段一条描述。name 对应数据里的键，label 是列标题，type 决定显示方式
    fields: [
      { name: 'code', type: 'string', label: '角色编码' },
      { name: 'name', type: 'string', label: '角色名称' },
      { name: 'memberCount', type: 'number', label: '成员数' }, // number：右对齐，可做数字格式化
      { name: 'enabled', type: 'boolean', label: '启用' }, // boolean：显示成勾选框
      { name: 'createdAt', type: 'dateTime', label: '创建时间' }, // dateTime：日期 + 时间
    ],
  });
}

export default function Example() {
  const roleDS = useMemo(createRoleDataSet, []);
  // columns 的写法在下一节 01-2 讲，这里先照着写
  const columns = [{ name: 'code' }, { name: 'name' }, { name: 'memberCount' }, { name: 'enabled' }, { name: 'createdAt' }];
  return <Table dataSet={roleDS} columns={columns} />;
}
