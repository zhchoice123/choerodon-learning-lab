// 【样例】07-2 子表查询参数：cascadeParams 把父记录映射成子表的查询参数。
// 接口要求 roleId：GET /mock/s/07-2/roles/permissions?roleId=101
import React, { useMemo } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';

function createRoleMaster() {
  const permissionDS = new DataSet({
    primaryKey: 'id',
    autoQuery: false,
    pageSize: 50,
    dataKey: 'content',
    totalKey: 'totalElements',
    // 知识点 1：默认参数名是父 DataSet 的主键名（这里会发 id=101），但接口要的是 roleId
    // 知识点 2：cascadeParams 收到父记录，返回子表查询要带的参数
    cascadeParams: (parent) => ({ roleId: parent.get('id') }),
    transport: { read: { url: '/mock/s/07-2/roles/permissions', method: 'GET' } },
    fields: [
      { name: 'roleId', type: 'number', label: '所属角色 ID' },
      { name: 'code', type: 'string', label: '权限编码' },
    ],
  });
  return new DataSet({
    primaryKey: 'id',
    autoQuery: true,
    pageSize: 2,
    dataKey: 'content',
    totalKey: 'totalElements',
    transport: { read: { url: '/mock/s/07-2/roles', method: 'GET' } },
    fields: [{ name: 'name', type: 'string', label: '角色名称' }],
    children: { permissions: permissionDS },
  });
}

export default function Example() {
  const roleDS = useMemo(createRoleMaster, []);
  return (
    <div>
      <Table dataSet={roleDS} columns={[{ name: 'name' }]} />
      <Table dataSet={roleDS.children.permissions} columns={[{ name: 'roleId' }, { name: 'code' }]} pagination={false} />
    </div>
  );
}
