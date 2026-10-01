// 【样例】07-1 主从 DataSet：头（角色）和行（权限）用 children 绑定，切换当前角色时权限自动加载。
// 接口：GET /mock/s/07-1/roles（2 个角色）、GET /mock/s/07-1/roles/permissions?roleId=101
import React, { useMemo } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';

function createRoleMaster() {
  // 知识点 1：先创建子 DataSet（行），它不自动查询，由头决定什么时候加载
  const permissionDS = new DataSet({
    primaryKey: 'id',
    autoQuery: false,
    pageSize: 50,
    dataKey: 'content',
    totalKey: 'totalElements',
    // 子表查询时带上父主键；参数名映射在下一节 07-2 专门讲
    cascadeParams: (parent) => ({ roleId: parent.get('id') }),
    transport: { read: { url: '/mock/s/07-1/roles/permissions', method: 'GET' } },
    fields: [
      { name: 'code', type: 'string', label: '权限编码' },
      { name: 'description', type: 'string', label: '权限说明' },
    ],
  });
  return new DataSet({
    primaryKey: 'id',
    autoQuery: true,
    pageSize: 2,
    dataKey: 'content',
    totalKey: 'totalElements',
    transport: { read: { url: '/mock/s/07-1/roles', method: 'GET' } },
    fields: [
      { name: 'code', type: 'string', label: '角色编码' },
      { name: 'name', type: 'string', label: '角色名称' },
    ],
    // 知识点 2：children 把子 DataSet 挂到头上；键名 permissions 以后也是提交时子数组的字段名
    children: { permissions: permissionDS },
  });
}

export default function Example() {
  const roleDS = useMemo(createRoleMaster, []);
  // 知识点 3：子 DataSet 通过 roleDS.children.permissions 取得
  return (
    <div>
      <p>点击上面的角色：下面的权限自动换成这个角色的。</p>
      <Table dataSet={roleDS} columns={[{ name: 'code' }, { name: 'name' }]} />
      <Table dataSet={roleDS.children.permissions} columns={[{ name: 'code' }, { name: 'description' }]} pagination={false} />
    </div>
  );
}
